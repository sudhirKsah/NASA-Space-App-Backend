
// const express = require('express');
// const axios = require('axios');
// const bodyParser = require('body-parser');
// const dotenv = require('dotenv');
// const cors = require('cors');

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 4000;

// app.use(bodyParser.json());
// app.use(express.static('public'));
// app.use(cors());


// // Function to fetch crop image
// async function fetchCropImage(cropName) {
//     try {
//         const response = await axios.get(`https://api.pexels.com/v1/search?query=${cropName}`, {
//             headers: {
//                 Authorization: process.env.PEXELS_API_KEY
//             }
//         });
//         const imageUrl = response.data.photos[0]?.src?.medium || null; // Get the first image URL or null if not found
//         return imageUrl;
//     } catch (error) {
//         console.error('Error fetching image from Pexels:', error);
//         return null;
//     }
// }

// // Route to get crop image
// app.get('/crop-image/:cropName', async (req, res) => {
//     const cropName = `${req.params.cropName} crop field`;
//     const imageUrl = await fetchCropImage(cropName);

//     if (imageUrl) {
//         // res.send(imageUrl);
//         res.json({imageUrl})
//     } else {
//         res.status(404).send('Image not found');
//     }
// });


// // Route to fetch weather data from OpenWeatherMap
// app.post('/weather', async (req, res) => {
//     const { latitude, longitude } = req.body;

//     const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
//     //   https://api.openweathermap.org/data/3.0/onecall?
//     try {
//         console.log("latitude", latitude, longitude);
//         const weatherResponse = await axios.get(weatherUrl);
//         const weatherData = weatherResponse.data;
//         console.log(weatherData);
//         res.json(weatherData);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching weather data', error });
//     }
// });

// // Route to send prompt to OpenAI for crop suggestions
// // app.post('/suggest-crops', async (req, res) => {
// //     const { weather, date } = req.body;

// //     // Prepare the content text based on the input weather data and date
// //     const contentText = `Suggest suitable crops for the location with weather data: ${JSON.stringify(weather)} on ${date}`;

// //     // Prepare the payload for the Azure OpenAI API request
// //     const payload = {
// //         messages: [
// //             {
// //                 role: "system",
// //                 content: [
// //                     {
// //                         type: "text",
// //                         text: "You are a farming expert with extensive experience in agriculture. You provide knowledgeable advice on suitable crops based on climate, soil conditions, and seasonal factors. You communicate in a clear and professional manner, helping users make informed decisions about their farming practices. If you do not know the answer to a question, respond by saying \"I do not know the answer to your question.\""
// //                     }
// //                 ]
// //             },
// //             {
// //                 role: "user",
// //                 content: contentText
// //             }
// //         ],
// //         temperature: 0.7,
// //         top_p: 0.95,
// //         max_tokens: 4096
// //     };

// //     try {
// //         const response = await axios.post(
// //             "https://bhadwa.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview",
// //             payload,
// //             {
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                     'api-key': process.env.AZURE_OPENAI_API_KEY // Make sure to set your Azure API key in your environment variables
// //                 },
// //             }
// //         );

// //         // Log the entire response to see its structure
// //         console.log("Response from Azure OpenAI:", JSON.stringify(response.data, null, 2));

// //         // Extract the text from the response
// //         const suggestionsParts = response.data.choices[0].message.content; // Adjusted to match Azure API response

// //         if (suggestionsParts) {
// //             console.log("Extracted suggestions:", suggestionsParts);

// //             // Return the suggestions text
// //             res.json({ suggestions: suggestionsParts });
// //         } else {
// //             res.status(500).json({ message: 'No suggestions found in the response.' });
// //         }
// //     } catch (error) {
// //         console.error('Error fetching crop suggestions:', error.response ? error.response.data : error.message);
// //         res.status(500).json({ message: 'Error fetching crop suggestions', error });
// //     }
// // });

// // Route to send prompt to Google Gemini API for crop suggestions
// app.post('/suggest-crops', async (req, res) => {
//     const { weather, date } = req.body;

//     const contentText = `Suggest suitable crops for the location with weather data: ${JSON.stringify(weather)} on ${date}`;

//     const requestBody = {
//         contents: [
//             {
//                 parts: [
//                     {
//                         text: contentText,
//                     },
//                 ],
//             },
//         ],
//     };

//     try {
//         const response = await axios.post(
//             `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
//             requestBody,
//             {
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//             }
//         );

//         // Log the entire response to see its structure
//         console.log("Response from Gemini API:", JSON.stringify(response.data, null, 2));

//         // Extract the text from the content object
//         const suggestionsParts = response.data.candidates[0].content.parts;
        
//         // Ensure there are parts to extract
//         if (suggestionsParts && suggestionsParts.length > 0) {
//             const suggestionsText = suggestionsParts.map(part => part.text).join(''); // Join all parts if necessary
//             // const suggestionsText = suggestionsParts.text;
//             console.log("Extracted suggestions:", suggestionsText);

//             // const cropImages = processGeminiResponse(response.data);
//             // res.json({ suggestions: suggestionsText, cropImages });

//             // Return the suggestions text
//             res.json({ suggestions: suggestionsText })
//         } else {
//             res.status(500).json({ message: 'No suggestions found in the response.' });
//         }
//     } catch (error) {
//         console.error('Error fetching crop suggestions:', error.response ? error.response.data : error.message);
//         res.status(500).json({ message: 'Error fetching crop suggestions', error });
//     }
// });


// // async function processGeminiResponse(response) {
// //     const suggestionsText = response.candidates[0].content.parts[0].text;
// //     const crops = extractCrops(suggestionsText); // Extract crop names
// //     const cropImages = await fetchCropImages(crops); // Fetch images for the crops

// //     console.log('Crops:', crops);
// //     console.log('Crop Images:', cropImages);
    
// //     return cropImages;
// // };


// // Function to extract crop names
// // Function to extract crop names
// // function extractCrops(text) {
// //     // Regex to find crop names in the format of '* **X:**'
// //     const cropRegex = /\*\s*\*\s*([^:]+):/g; // This regex captures crop names before the colon
// //     let crops = [];
// //     let match;

// //     // Loop through matches
// //     while ((match = cropRegex.exec(text)) !== null) {
// //         crops.push(match[1].trim()); // Push the crop name to the array
// //     }

// //     return crops;
// // }


// // Function to fetch crop images from Pexels API
// // async function fetchCropImages(crops) {
// //     const cropImages = {};

// //     for (let crop of crops) {
// //         try {
// //             const response = await axios.get(`https://api.pexels.com/v1/search?query=${crop} plant field`, {
// //                 headers: {
// //                     Authorization: process.env.PEXELS_API_KEY
// //                 }
// //             });

// //             if (response.data.photos.length > 0) {
// //                 cropImages[crop] = response.data.photos[0].src.medium; // Store the first image URL for each crop
// //             } else {
// //                 cropImages[crop] = 'No image found';
// //             }
// //         } catch (error) {
// //             console.error(`Error fetching image for ${crop}:`, error);
// //             cropImages[crop] = 'Error fetching image';
// //         }
// //     }

// //     return cropImages;
// // }




// // Serve the frontend
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/index.html');
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });



// ---------------------------------------------------------------------------------





const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { google } = require('googleapis');
const stream = require('stream');
// const { GoogleAIFileManager, GoogleGenerativeAI } = require('@google/generative-ai'); // Google AI SDK for generative models

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

let weatherData = null;  // Store weather data globally to be used in different tasks
let locationPromptSent = false;  // To check if location information has been sent to Gemini

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
            // Send the location information to Gemini API only once
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

    // ContentText logic depending on city availability
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
        const suggestionsText = suggestionsParts.map(part => part.text).join(''); // Extract all parts

        console.log("Crop suggestions from Gemini:", suggestionsText);

        res.json({ cropSuggestions: suggestionsText });
    } catch (error) {
        console.error("Error fetching crop suggestions from Gemini:", error);
        res.status(500).json({ message: 'Error fetching crop suggestions', error });
    }
});



const upload = multer({ dest: 'uploads/' });

// Gemini API details
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
    // Check if the image is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded.' });
    }

    imagePath = req.file.path; // Get the uploaded file path
    const fileMimeType = req.file.mimetype; // Get the MIME type of the uploaded file

    // Read the file content to send it in the API request
    const fileContent = fs.readFileSync(imagePath, { encoding: 'base64' });

    // Construct the prompt to analyze the plant image
    const promptText = `
      Analyze the health of the plant based on the uploaded image.
      - Identify potential diseases or unhealthy conditions.
      - Provide suggestions for preventive measures and treatment.
    `;

    // Call the function to get plant health analysis
    const plantHealthSuggestions = await getPlantHealthAnalysis(promptText, fileContent, fileMimeType);

    // Log and return the suggestions
    console.log("Plant health suggestions from Gemini:", plantHealthSuggestions);
    res.json({ plantHealthSuggestions });
  } catch (error) {
    console.error("Error fetching plant health suggestions from Gemini:", error);
    res.status(500).json({ message: 'Error fetching plant health suggestions', error });
  } finally {
    // Optionally, clean up the uploaded file after processing
    if (imagePath) {
      fs.unlinkSync(imagePath); // Delete the file if it exists
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
        const suggestionsText = suggestionsParts.map(part => part.text).join(''); // Extract all parts

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

    // Add the user message to the chat history
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
        
        // Add the assistant's message to the chat history
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
    chatHistory = [];  // Clear the chat history
    res.json({ message: 'Chat history reset.' });
});

// Serve the frontend
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

