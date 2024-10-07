
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
const stream = require('stream');

const axios = require('axios');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

let weatherData = null; 
let locationPromptSent = false;  

// Function to fetch weather data from OpenWeatherMap
async function fetchWeatherData(latitude, longitude) {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
    const weatherResponse = await axios.get(weatherUrl);
    return weatherResponse.data;
}

// Function to send initial prompt to Gemini (location and weather info)
async function sendLocationToGemini(weather) {
    const locationPrompt = `
    Suppose You are a virtual farming assistant named Mega.
    Respone with a greeting messege  in local language and English. 
    Help the user with farming advice and crop suggestions based on the weather data from their farm.
    Here is the location and weather data for the user's farm:
    
    - Location: ${weather.name}
    - Temperature: ${weather.main.temp}°C
    - Humidity: ${weather.main.humidity}%
    - Weather description: ${weather.weather[0].description}

    This location information will be used for crop suggestions, plant health monitoring, and water level monitoring.
    remember the conversation for future interactions.
    `;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: locationPrompt,
                    },
                ],
            },
        ],
    };

    const geminiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
        requestBody,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    console.log("Location information sent to Gemini:", geminiResponse.data.candidates[0].content.parts);
}

// Initial route to fetch weather and send location to Gemini
app.post('/init', async (req, res) => {
    const { latitude, longitude } = req.body;

    try {
        weatherData = await fetchWeatherData(latitude, longitude);
        console.log("Weather data fetched:", weatherData);

        if (!locationPromptSent) {
            await sendLocationToGemini(weatherData);
            locationPromptSent = true;
        }

        res.json({ message: "Location and weather data initialized.", weatherData });
    } catch (error) {
        console.error("Error initializing location and weather data:", error);
        res.status(500).json({ message: 'Error initializing location and weather data', error });
    }
});

// Crop suggestion route (limit to 3 crops)
app.post('/crop-suggestion', async (req, res) => {
    const { cropType, startDate, endDate, city } = req.body;

    let contentText = `
        If ${cropType.length > 0 ? cropType.join(", ") : "local crop"} crops are planted 
        between ${startDate || "unspecified date"} and ${endDate || "unspecified date"} 
        in ${city || weatherData.name},
        Suggest 3 suitable crops that are best for this location. 
       provide the suggestion in local language and English in proper order of name description and also predict the demand and price according to the place.
       Make sure everything is properly formatted and easy to understand with minimum content.
    `;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: contentText,
                    },
                ],
            },
        ],
    };

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const suggestionsParts = response.data.candidates[0].content.parts;
        const suggestionsText = suggestionsParts.map(part => part.text).join(''); 
        console.log("Crop suggestions from Gemini:", suggestionsText);

        res.json({ cropSuggestions: suggestionsText });
    } catch (error) {
        console.error("Error fetching crop suggestions from Gemini:", error);
        res.status(500).json({ message: 'Error fetching crop suggestions', error });
    }
});



const upload = multer({ dest: 'uploads/' });

const model = "gemini-1.5-pro-latest";
const GENAI_DISCOVERY_URL = `https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta&key=${process.env.GEMINI_API_KEY}`;

async function getPlantHealthAnalysis(prompt, imageBase64, fileType) {
  const genaiService = await google.discoverAPI({ url: GENAI_DISCOVERY_URL });
  const auth = new google.auth.GoogleAuth().fromAPIKey(process.env.GEMINI_API_KEY);

  let file_data = null;
  
  if (imageBase64) {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(Buffer.from(imageBase64, "base64"));
    const media = {
      mimeType: fileType,
      body: bufferStream,
    };

    let body = { file: { displayName: "Uploaded Plant Image" } };

    const createFileResponse = await genaiService.media.upload({
      media: media,
      auth: auth,
      requestBody: body,
    });

    const file = createFileResponse.data.file;
    file_data = { file_uri: file.uri, mime_type: file.mimeType };
  }

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, file_data && { file_data }],
      },
    ],
    generation_config: {
      maxOutputTokens: 4096,
      temperature: 0.5,
      topP: 0.8,
    },
  };

  const generateContentResponse = await genaiService.models.generateContent({
    model: `models/${model}`,
    requestBody: requestBody,
    auth: auth,
  });

  return generateContentResponse?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
}

app.post('/plant-health', upload.single('plantImage'), async (req, res) => {
  let imagePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    imagePath = req.file.path; 
    const fileMimeType = req.file.mimetype; 

    const fileContent = fs.readFileSync(imagePath, { encoding: 'base64' });

    const promptText = `
      Analyze the health of the plant based on the uploaded image.
      - Identify potential diseases or unhealthy conditions.
      - Provide suggestions for preventive measures and treatment.
    `;

    const plantHealthSuggestions = await getPlantHealthAnalysis(promptText, fileContent, fileMimeType);

    console.log("Plant health suggestions from Gemini:", plantHealthSuggestions);
    res.json({ plantHealthSuggestions });
  } catch (error) {
    console.error("Error fetching plant health suggestions from Gemini:", error);
    res.status(500).json({ message: 'Error fetching plant health suggestions', error });
  } finally {
    if (imagePath) {
      fs.unlinkSync(imagePath); 
    }
  }
});
  
  

// Water level monitoring route
app.post('/water-level', async (req, res) => {
    const contentText = `
    Based on the weather data from ${weatherData.name}:
    - Temperature: ${weatherData.main.temp}°C
    - Humidity: ${weatherData.main.humidity}%

    Provide recommendations for water level management and irrigation practices for this farm.
    `;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: contentText,
                    },
                ],
            },
        ],
    };

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const suggestionsParts = response.data.candidates[0].content.parts;
        const suggestionsText = suggestionsParts.map(part => part.text).join(''); 

        console.log("Water level suggestions from Gemini:", suggestionsText);

        res.json({ waterLevelSuggestions: suggestionsText });
    } catch (error) {
        console.error("Error fetching water level suggestions from Gemini:", error);
        res.status(500).json({ message: 'Error fetching water level suggestions', error });
    }
});

// General farming assistant route (Mega assistant)
let chatHistory = [];

app.post('/generate-plan-report', async (req, res) => {
    const weatherDetails = `
    Location: ${weatherData.name}, ${weatherData.sys.country}
    - Temperature: ${weatherData.main.temp}°C
    - Feels Like: ${weatherData.main.feels_like}°C
    - Humidity: ${weatherData.main.humidity}%
    - Rain (1 hour): ${weatherData.rain ? weatherData.rain['1h'] + ' mm' : 'No recent rain'}
    - Wind: ${weatherData.wind.speed} m/s, direction ${weatherData.wind.deg}°
    - General Weather: ${weatherData.weather[0].description}
    - Cloud Coverage: ${weatherData.clouds.all}%
    - Pressure: ${weatherData.main.pressure} hPa
    - Visibility: ${weatherData.visibility / 1000} km
    `;
    
    const contentText = `
    You are an agricultural expert specializing in precision farming. Your task is to generate an **accurate and specific farming report** for the user's farm located in ${weatherData.name}, ${weatherData.sys.country}. The report should avoid any vague or generalized suggestions. Every recommendation should be directly relevant to the provided weather data and regional conditions.
    
    ### **Precise Weather Data Analysis:**
    ${weatherDetails}
    
    ### **Targeted Crop Recommendations:**
    - Based on the weather data and soil conditions in ${weatherData.name}, ${weatherData.sys.country}, provide specific crops (including fruits, vegetables, and herbs) that can be cultivated in this region.
    - List exact crop varieties that have been proven to thrive under similar weather conditions and that are in **high demand** in the local and national markets.
    - Include yield projections based on **local farm data** and **weather patterns**.
    
    ### **Irrigation and Soil Health:**
    - Recommend the most **efficient irrigation systems** for the current weather and soil type in ${weatherData.name}. Avoid broad recommendations like "drip irrigation" without explanation. Specify systems that best suit the rainfall patterns and water availability here.
    - Provide a **precise soil type analysis** for ${weatherData.name} and recommend specific soil treatments, fertilizers, or amendments that can optimize productivity.
    - Give exact steps to maintain soil health, such as **recommended pH adjustments**, and identify nutrients that are most likely to be deficient in the local soil.
    
    ### **Accurate Market Analysis and Business Plan:**
    - Conduct a **data-driven market analysis** for the recommended crops, avoiding generalized market trends. Focus on specific market opportunities in ${weatherData.name} and ${weatherData.sys.country}.
    - Provide a **clear financial breakdown** for cultivating these crops, including detailed costs (seeds, fertilizers, labor, irrigation) and projected profits. Ensure this is specific to the farm size and regional costs.
    - **Specify the current market price** for each crop in the region and project future prices based on **concrete market trends** and **demand forecasts**.
    - Suggest **specific buyers and sellers** in the local agricultural markets. Include contact details of local markets, wholesalers, and potential partners who deal with these crops.
    
    ### **Risk Mitigation and Action Plan:**
    - Identify the **exact risks** (e.g., specific pests, diseases, or climate risks) associated with farming in ${weatherData.name}, and provide clear steps to mitigate each risk.
    - Avoid vague recommendations like "monitor crops" or "use pest control". Instead, specify **which pests or diseases** are most likely to occur and recommend **particular pesticides, biological controls**, or **monitoring techniques** relevant to the farm.
    
    ### **Conclusion and Next Steps:**
    - Provide a concise summary with clear **actionable steps**. Each step should be practical, easily implementable, and based on the data provided.
    - Ensure that the entire report is structured as a professional farming assessment, ready to be implemented without further clarification.
    - Provide the report in both **English** and the **local language** of ${weatherData.name}.
    `;

    
    
    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: contentText,
                    },
                ],
            },
        ],
    };

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const planReport = response.data.candidates[0].content.parts.map(part => part.text).join('');
        console.log("Plan report from Gemini:", planReport);

        res.json({ planReport });
        console.log("Plan report from Gemini:", planReport);
    }
    catch (error) {
        console.error("Error fetching plan report from Gemini:", error);
        res.status(500).json({ message: 'Error fetching plan report', error });
    }


})

app.post('/mega-assistant', async (req, res) => {
    const userMessage = req.body.message;

    chatHistory.push({ role: 'user', text: userMessage });

    const chatContext = chatHistory.map(entry => ({
        role: entry.role === 'user' ? 'user' : 'assistant',
        content: entry.text,
    }));

    const contentText = `
    Act as Mega, a virtual farming assistant. Respond to the user's messages and provide farming advice or general assistance based on previous conversations.
    Here is the conversation so far:
    ${chatContext.map(entry => `${entry.role === 'user' ? 'User' : 'Assistant'}: ${entry.content}`).join('\n')}
    `;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: contentText,
                    },
                ],
            },
        ],
    };

    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const assistantMessage = response.data.candidates[0].content.parts.map(part => part.text).join('');
        
        chatHistory.push({ role: 'assistant', text: assistantMessage });

        console.log("Mega assistant response from Gemini:", assistantMessage);

        res.json({ assistantMessage });
    } catch (error) {
        console.error("Error fetching Mega assistant response from Gemini:", error);
        res.status(500).json({ message: 'Error fetching Mega assistant response', error });
    }
});

// Optional route to reset chat history
app.post('/reset-chat', (req, res) => {
    chatHistory = [];  
    res.json({ message: 'Chat history reset.' });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

