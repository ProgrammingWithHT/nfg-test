const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const sumsubController = require('./controllers/sumsubController');
const packagesRoutes = require('./routes/packages'); // Import the packages routes
const waitlistRoutes = require('./routes/waitlist'); // Import the waitlist routes
const bybitRoutes = require('./routes/bybitRoutes');

const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());


// Route Imports
const authRoutes = require('./routes/auth');
app.use('/waitlist', waitlistRoutes);
const payment = require('./routes/paymentRoute');


app.use('/auth', authRoutes);
app.use('/api', packagesRoutes);  // Use the packages routes
app.post('/sumsub/token', sumsubController.generateSumsubToken);
app.post('/sumsub/webhook', sumsubController.handleSumsubWebhook);
app.use('/api/bybit', bybitRoutes);
app.use('/api/nfg', payment);




mongoose.connect(process.env.CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.log('Mongodb error : ', error));
db.once('open', () => {
  console.log('Mongodb connected successfully!');
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});

// const express = require('express');
// const axios = require('axios');
// const app = express();
// const port = 3000;

// // Middleware to parse JSON request bodies
// app.use(express.json());

// // Replace with your Sumsub credentials
// const API_URL = 'https://api.sumsub.com';
// const API_KEY = 'your-api-key';
// const API_SECRET = 'SsJyeMRfesvWTvUfXtRKHBgFtrNGUkYc'; // Use only if you are using basic auth
// const BEARER_TOKEN = 'prd:IrgdRGuN0ocAAiBMm9MUj7TF.LslIl6ROgaS9KLrT1MHVIYHfdim92JXg'; // Use only if bearer token is required

// app.post('/verify-id', async (req, res) => {
//   const { userId, documentType, documentImage } = req.body;

//   try {
//     const response = await axios.post(`${API_URL}/id-verification`, {
//       userId,
//       documentType,
//       documentImage
//     }, {
//       headers: {
//         // Use Bearer token if required
//         'Authorization': `Bearer ${BEARER_TOKEN}`,

//         // If you are using basic auth, uncomment the line below and comment out the Bearer token line
//         // 'Authorization': `Basic ${Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64')}`
//       }
//     });

//     res.json(response.data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });

// const express = require("express");
// const axios = require("axios");
// const crypto = require("crypto");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const APP_TOKEN = 'prd:IrgdRGuN0ocAAiBMm9MUj7TF.LslIl6ROgaS9KLrT1MHVIYHfdim92JXg';
// const SECRET_KEY = 'SsJyeMRfesvWTvUfXtRKHBgFtrNGUkYc';

// Test APi token with faisal
// const APP_TOKEN =
//   "sbx:a6HNwepOnsyfCUYPEPEp4ACM.W9HCn5XCF8xFTJT9waaoQnHgXdD9fkVh";
// const SECRET_KEY = "9ypVqQr4Ss9J3krJgNDhqayZyoHll3kn";

// app.post('/sumsub/token', async (req, res) => {
//     const userId = req.body.userId; // unique user identifier

//     const ts = Math.floor(Date.now() / 1000); // current timestamp
//     const signature = crypto.createHmac('sha256', SECRET_KEY)
//         .update(ts + userId)
//         .digest('hex');

//     try {
//         const response = await axios.post(`https://api.sumsub.com/resources/accessTokens?userId=${userId}`, {}, {
//             headers: {
//                 'X-App-Token': APP_TOKEN,
//                 'X-App-Access-Sig': signature,
//                 'X-App-Access-Ts': ts,
//             }
//         });

//         res.json(response.data);
//     } catch (error) {
//         console.error('API Error:', error.response ? error.response.data : error.message);
//         res.status(500).json({ error: 'Failed to generate access token' });
//     }
// });

// app.post("/sumsub/token", async (req, res) => {
//   // const userId = req.body.userId; // unique user identifier
//   const userId = "sha256"
// console.log('userId', userId)
//   try {
//     const kyc_level = "basic-kyc-level";
//     const url = `https://api.sumsub.com/resources/sdkIntegrations/levels/${kyc_level}/websdkLink?externalUserId=${userId}&ttlInSecs=1800`;

//     const options = {
//       method: "POST",
//       url,
//       headers: {
//         "X-App-Token": APP_TOKEN,
//       },
//     };

//     const response = await axios.request(options);
//     // console.log(response.data);
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error(
//       "API Error:",
//       error.response ? error.response.data : error.message
//     );
//     res.status(500).json({ error: "Failed to generate access token" });
//   }
// });

// app.listen(3000, () => {
//   console.log("Server running on port 3000");
// });

// const axios = require('axios');
// const crypto = require('crypto');
// const fs = require('fs');
// const FormData = require('form-data');
// require('dotenv').config();

// // Environment variables
// const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
// const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
// const SUMSUB_BASE_URL = 'https://api.sumsub.com';

// // Create Axios instance
// const axiosInstance = axios.create({
//   baseURL: SUMSUB_BASE_URL,
//   headers: {
//     'Accept': 'application/json',
//   },
// });

// // Create signature for the request
// function createSignature(config) {
//   console.log('Creating a signature for the request...');

//   const ts = Math.floor(Date.now() / 1000);
//   const signature = crypto.createHmac('sha256', SUMSUB_SECRET_KEY);
//   signature.update(ts + config.method.toUpperCase() + config.url);

//   if (config.data instanceof FormData) {
//     signature.update(config.data.getBuffer());
//   } else if (config.data) {
//     signature.update(config.data);
//   }

//   config.headers['X-App-Access-Ts'] = ts;
//   config.headers['X-App-Access-Sig'] = signature.digest('hex');

//   return config;
// }

// // Create an applicant
// async function createApplicant(externalUserId, levelName) {
//   console.log("Creating an applicant...");

//   const url = `/resources/applicants?levelName=${encodeURIComponent(levelName)}`;
//   const body = {
//     externalUserId: externalUserId
//   };

//   try {
//     const response = await axiosInstance.post(url, body, {
//       headers: {
//         'X-App-Token': SUMSUB_APP_TOKEN,
//       },
//     });
//     console.log("Applicant Created:", response.data);
//     return response.data.id;
//   } catch (error) {
//     console.error("Error creating applicant:", error.response ? error.response.data : error.message);
//     throw error;
//   }
// }

// // Add a document to the applicant
// async function addDocument(applicantId) {
//   console.log("Adding document to the applicant...");

//   const url = `/resources/applicants/${applicantId}/info/idDoc`;
//   const filePath = 'resources/sumsub-logo.png'; // Ensure this file exists in the specified path

//   const metadata = {
//     idDocType: 'PASSPORT',
//     country: 'GBR'
//   };

//   const form = new FormData();
//   form.append('metadata', JSON.stringify(metadata));

//   const content = fs.readFileSync(filePath);
//   form.append('content', content, filePath);

//   try {
//     const response = await axiosInstance.post(url, form, {
//       headers: {
//         'X-App-Token': SUMSUB_APP_TOKEN,
//         ...form.getHeaders(),
//       },
//     });
//     console.log("Document Added:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error adding document:", error.response ? error.response.data : error.message);
//     throw error;
//   }
// }

// // Get applicant status
// async function getApplicantStatus(applicantId) {
//   console.log("Getting the applicant status...");

//   const url = `/resources/applicants/${applicantId}/status`;

//   try {
//     const response = await axiosInstance.get(url, {
//       headers: {
//         'X-App-Token': SUMSUB_APP_TOKEN,
//       },
//     });
//     console.log("Applicant Status:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error getting applicant status:", error.response ? error.response.data : error.message);
//     throw error;
//   }
// }

// // Create an access token for initializing SDK
// async function createAccessToken(externalUserId, levelName = 'basic-kyc-level', ttlInSecs = 600) {
//   console.log("Creating an access token for initializing SDK...");

//   const url = `/resources/accessTokens?userId=${encodeURIComponent(externalUserId)}&ttlInSecs=${ttlInSecs}&levelName=${encodeURIComponent(levelName)}`;

//   try {
//     const response = await axiosInstance.post(url, null, {
//       headers: {
//         'X-App-Token': SUMSUB_APP_TOKEN,
//       },
//     });
//     console.log("Access Token Created:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error creating access token:", error.response ? error.response.data : error.message);
//     throw error;
//   }
// }

// // Main function to run the workflow
// async function main() {
//   const externalUserId = `random-JSToken-${Math.random().toString(36).substr(2, 9)}`;
//   const levelName = 'basic-kyc-level';
//   console.log("External UserID: ", externalUserId);

//   try {
//     const applicantId = await createApplicant(externalUserId, levelName);
//     console.log("ApplicantID: ", applicantId);

//     await addDocument(applicantId);
//     await getApplicantStatus(applicantId);
//     await createAccessToken(externalUserId, levelName, 1200);
//   } catch (error) {
//     console.error("An error occurred during the process:", error.message);
//   }
// }

// main();
