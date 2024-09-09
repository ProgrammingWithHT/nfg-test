// const crypto = require("crypto");
// const fetch = require("node-fetch");
// const jwt = require("jsonwebtoken");

// const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
// const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;

// exports.generateSumsubToken = async (req, res) => {
//     // const fetch = (await import("node-fetch")).default;
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ success: false, message: 'No token provided' });
//     }
//   try {
//     const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
//     const userId = decodedToken.id;
//     console.log("🚀 ~ exports.generateSumsubToken= ~ userId:", userId)
//     const externalUserId = userId;
//     const method = "POST";
//     const uri =
//       "/resources/sdkIntegrations/levels/basic-kyc-level/websdkLink?externalUserId=" +
//       encodeURIComponent(externalUserId) +
//       "&ttlInSecs=1800";

//     const timestamp = Math.floor(Date.now() / 1000).toString();
//     const message = timestamp + method + uri;
//     const signature = crypto
//       .createHmac("sha256", SUMSUB_SECRET_KEY)
//       .update(message)
//       .digest("hex");

//     const url = `https://api.sumsub.com${uri}`;
//     const options = {
//       method: "POST",
//       headers: {
//         "X-App-Token": SUMSUB_APP_TOKEN,
//         "X-App-Access-Sig": signature,
//         "X-App-Access-Ts": timestamp,
//       },
//     };

//     const response = await fetch(url, options);
//     const json = await response.json();

//     res.json({
//       data: json,
//     });
//   } catch (err) {
//     console.error("error:" + err);
//     res.status(500).json({ error: "An error occurred" });
//   }
// };


// const crypto = require("crypto");
// const fetch = require("node-fetch");
// const jwt = require("jsonwebtoken");
// const SumsubEvent = require('../models/sumsub');  // Adjust the path if necessary

// const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
// const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;

// exports.generateSumsubToken = async (req, res) => {
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//       return res.status(401).json({ success: false, message: 'No token provided' });
//     }

//     try {
//         const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
//         const userId = decodedToken.id;

//         const externalUserId = userId;
//         const method = "POST";
//         const uri =
//             "/resources/sdkIntegrations/levels/basic-kyc-level/websdkLink?externalUserId=" +
//             encodeURIComponent(externalUserId) +
//             "&ttlInSecs=1800";

//         const timestamp = Math.floor(Date.now() / 1000).toString();
//         const message = timestamp + method + uri;
//         const signature = crypto
//             .createHmac("sha256", SUMSUB_SECRET_KEY)
//             .update(message)
//             .digest("hex");

//         const url = `https://api.sumsub.com${uri}`;
//         const options = {
//             method: "POST",
//             headers: {
//                 "X-App-Token": SUMSUB_APP_TOKEN,
//                 "X-App-Access-Sig": signature,
//                 "X-App-Access-Ts": timestamp,
//             },
//         };

//         const response = await fetch(url, options);
//         const json = await response.json();

//         res.json({ data: json });

//         // Handle Sumsub webhook events
//         if (json.type) {
//             const event = {
//                 userId,
//                 applicantId: json.applicantId,
//                 inspectionId: json.inspectionId,
//                 correlationId: json.correlationId,
//                 levelName: json.levelName,
//                 externalUserId: json.externalUserId,
//                 type: json.type,
//                 sandboxMode: json.sandboxMode,
//                 reviewStatus: json.reviewStatus,
//                 createdAtMs: json.createdAtMs,
//                 clientId: json.clientId
//             };

//             // Save or update the event in MongoDB
//             await SumsubEvent.findOneAndUpdate(
//                 { applicantId: event.applicantId },
//                 event,
//                 { upsert: true, new: true }
//             );
//         }

//     } catch (err) {
//         console.error("error:" + err);
//         res.status(500).json({ error: "An error occurred" });
//     }
// };


// exports.handleSumsubWebhook = async (req, res) => {
//     const event = req.body;

//     try {
//         switch (event.type) {
//             case 'applicantCreated':
//                 handleApplicantCreated(event);
//                 break;
//             case 'applicantPending':
//                 handleApplicantPending(event);
//                 break;
//             case 'applicantActivated':
//                 handleApplicantActivated(event);
//                 break;
//             case 'applicantDeleted':
//                 handleApplicantDeleted(event);
//                 break;
//             default:
//                 console.log(`Unhandled event type: ${event.type}`);
//         }
//         res.status(200).send({ success: true });
//     } catch (error) {
//         console.error('Error processing webhook:', error);
//         res.status(500).send({ success: false });
//     }
// };

// function handleApplicantCreated(event) {
//     console.log('Applicant Created:', event);
//     // Add logic to handle 'applicantCreated' event
// }

// function handleApplicantPending(event) {
//     console.log('Applicant Pending:', event);
//     // Add logic to handle 'applicantPending' event
// }

// function handleApplicantActivated(event) {
//     console.log('Applicant Activated:', event);
//     // Add logic to handle 'applicantActivated' event
// }

// function handleApplicantDeleted(event) {
//     console.log('Applicant Deleted:', event);
//     // Add logic to handle 'applicantDeleted' event
// }



const crypto = require("crypto");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const SumsubEvent = require('../models/sumsub');  // Ensure path is correct
const User = require("../models/auth");

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;

exports.generateSumsubToken = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decodedToken.id;
        const externalUserId = userId;
        const method = "POST";
        const uri =
            "/resources/sdkIntegrations/levels/basic-kyc-level/websdkLink?externalUserId=" +
            encodeURIComponent(externalUserId) +
            "&ttlInSecs=1800";

        const timestamp = Math.floor(Date.now() / 1000).toString();
        const message = timestamp + method + uri;
        const signature = crypto
            .createHmac("sha256", SUMSUB_SECRET_KEY)
            .update(message)
            .digest("hex");

        const url = `https://api.sumsub.com${uri}`;
        const options = {
            method: "POST",
            headers: {
                "X-App-Token": SUMSUB_APP_TOKEN,
                "X-App-Access-Sig": signature,
                "X-App-Access-Ts": timestamp,
            },
        };

        const response = await fetch(url, options);
        const json = await response.json();

        res.json({ data: json });
    } catch (err) {
        console.error("error:" + err);
        res.status(500).json({ error: "An error occurred" });
    }
};

// exports.handleSumsubWebhook = async (req, res) => {
//     const event = req.body;

//     try {
//         // Save or update the event in MongoDB
//         await SumsubEvent.findOneAndUpdate(
//             { applicantId: event.applicantId },
//             event,
//             { upsert: true, new: true }
//         );

//         // Call appropriate handler based on event type
//         switch (event.type) {
//             case 'applicantCreated':
//                 handleApplicantCreated(event);
//                 break;
//             case 'applicantPending':
//                 handleApplicantPending(event);
//                 break;
//             case 'applicantActivated':
//                 handleApplicantActivated(event);
//                 break;
//             case 'applicantDeleted':
//                 handleApplicantDeleted(event);
//                 break;
//             default:
//                 console.log(`Unhandled event type: ${event.type}`);
//         }

//         res.status(200).send({ success: true });
//     } catch (error) {
//         console.error('Error processing webhook:', error);
//         res.status(500).send({ success: false });
//     }
// };

// function handleApplicantCreated(event) {
//     console.log('Applicant Created:', event);
//     // Add additional logic if needed
// }

// function handleApplicantPending(event) {
//     console.log('Applicant Pending:', event);
//     // Add additional logic if needed
// }

// function handleApplicantActivated(event) {
//     console.log('Applicant Activated:', event);
//     // Add additional logic if needed
// }

// function handleApplicantDeleted(event) {
//     console.log('Applicant Deleted:', event);
//     // Add additional logic if needed
// }





// exports.handleSumsubWebhook = async (req, res) => {
//     const event = req.body;

//     try {
//         if (!event.applicantId || !event.type) {
//             return res.status(400).send({ success: false, message: 'Invalid event data' });
//         }

//         await SumsubEvent.findOneAndUpdate(
//             { applicantId: event.applicantId },
//             event,
//             { upsert: true, new: true }
//         );

//         switch (event.type) {
//             case 'applicantCreated':
//                 handleApplicantCreated(event);
//                 break;
//             case 'applicantPending':
//                 handleApplicantPending(event);
//                 break;
//             case 'applicantActivated':
//                 handleApplicantActivated(event);
//                 break;
//             case 'applicantDeleted':
//                 handleApplicantDeleted(event);
//                 break;
//             default:
//                 console.log(`Unhandled event type: ${event.type}`);
//         }

//         res.status(200).send({ success: true });
//     } catch (error) {
//         console.error('Error processing webhook:', error);
//         res.status(500).send({ success: false });
//     }
// };

// function handleApplicantCreated(event) {
//     console.log('Applicant Created:', event);
//     // Add additional logic if needed
// }

// function handleApplicantPending(event) {
//     console.log('Applicant Pending:', event);
//     // Add additional logic if needed
// }

// function handleApplicantActivated(event) {
//     console.log('Applicant Activated:', event);
//     // Add additional logic if needed
// }

// function handleApplicantDeleted(event) {
//     console.log('Applicant Deleted:', event);
//     // Add additional logic if needed
// }

exports.handleSumsubWebhook = async (req, res) => {
    const event = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
        const userId = decodedToken.id;
        
        if (!event.applicantId || !event.type) {
            return res.status(400).send({ success: false, message: 'Invalid event data' });
        }

        // Add userId to event object
        event.userId = userId;

        // Find document by applicantId and userId
        const existingEvent = await SumsubEvent.findOne({ userId: event.userId, userId });

        if (existingEvent) {
            // If document exists, update it
            await SumsubEvent.findOneAndUpdate(
                { userId: event.userId, userId },
                event,
                { new: true }  // This will return the updated document
            );
        } else {
            // If document does not exist, create a new one with userId
            await SumsubEvent.create(event);
        }

        const user = await User.findById(userId);
        if (user) {
            user.type = event.type; // Update the type field with the event type
            await user.save();
        }


        // Handle event based on its type
        switch (event.type) {
            case 'applicantCreated':
                handleApplicantCreated(event);
                break;
            case 'applicantPending':
                handleApplicantPending(event);
                break;
            case 'applicantActivated':
                handleApplicantActivated(event);
                break;
            case 'applicantDeleted':
                handleApplicantDeleted(event);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).send({ success: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send({ success: false });
    }
};

function handleApplicantCreated(event) {
    console.log('Applicant Created:', event);
    // Add additional logic if needed
}

function handleApplicantPending(event) {
    console.log('Applicant Pending:', event);
    // Add additional logic if needed
}

function handleApplicantActivated(event) {
    console.log('Applicant Activated:', event);
    // Add additional logic if needed
}

function handleApplicantDeleted(event) {
    console.log('Applicant Deleted:', event);
    // Add additional logic if needed
}



// exports.handleSumsubWebhook = async (req, res) => {
//     const event = req.body;
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ success: false, message: 'No token provided' });
//     }
//     try {
//         const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
//         const userId = decodedToken.id;
        
//         if (!event.applicantId || !event.type) {
//             return res.status(400).send({ success: false, message: 'Invalid event data' });
//         }
//         // Find document by applicantId
//         const existingEvent = await SumsubEvent.findOne({ userId : event.userId });
        
//         if (existingEvent) {
//             // If document exists, update it
//             await SumsubEvent.findOneAndUpdate(
//                 { userId:event.userId },
//                 event,
//                 { new: true }  // This will return the updated document
//             );
//         } else {
//             // If document does not exist, create a new one
//             await SumsubEvent.create(event ,userId);
//         }

//         // Handle event based on its type
//         switch (event.type) {
//             case 'applicantCreated':
//                 handleApplicantCreated(event);
//                 break;
//             case 'applicantPending':
//                 handleApplicantPending(event);
//                 break;
//             case 'applicantActivated':
//                 handleApplicantActivated(event);
//                 break;
//             case 'applicantDeleted':
//                 handleApplicantDeleted(event);
//                 break;
//             default:
//                 console.log(`Unhandled event type: ${event.type}`);
//         }

//         res.status(200).send({ success: true });
//     } catch (error) {
//         console.error('Error processing webhook:', error);
//         res.status(500).send({ success: false });
//     }
// };

// function handleApplicantCreated(event) {
//     console.log('Applicant Created:', event);
//     // Add additional logic if needed
// }

// function handleApplicantPending(event) {
//     console.log('Applicant Pending:', event);
//     // Add additional logic if needed
// }

// function handleApplicantActivated(event) {
//     console.log('Applicant Activated:', event);
//     // Add additional logic if needed
// }

// function handleApplicantDeleted(event) {
//     console.log('Applicant Deleted:', event);
//     // Add additional logic if needed
// }



// exports.handleSumsubWebhook = async (req, res) => {
//     const event = req.body;
//     const token = req.headers.authorization?.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ success: false, message: 'No token provided' });
//     }

//     try {
//         const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
//         const userId = decodedToken.id;
//         if (!event.applicantId || !event.type) {
//             return res.status(400).send({ success: false, message: 'Invalid event data' });
//         }

//         // Find document by userId and update if exists, otherwise create new document
//         const existingEvent = await SumsubEvent.findOne({ userId });

//         if (existingEvent) {
//             // If document exists, update it
//             await SumsubEvent.findOneAndUpdate(
//                 { userId },  // Using userId for matching
//                 event,
//                 { new: true }  // This will return the updated document
//             );
//         } else {
//             // If document does not exist, create a new one
//             await SumsubEvent.create({ ...event, userId });  // Include userId in the new document
//         }

//         // Handle event based on its type
//         switch (event.type) {
//             case 'applicantCreated':
//                 handleApplicantCreated(event);
//                 break;
//             case 'applicantPending':
//                 handleApplicantPending(event);
//                 break;
//             case 'applicantActivated':
//                 handleApplicantActivated(event);
//                 break;
//             case 'applicantDeleted':
//                 handleApplicantDeleted(event);
//                 break;
//             default:
//                 console.log(`Unhandled event type: ${event.type}`);
//         }

//         res.status(200).send({ success: true });
//     } catch (error) {
//         console.error('Error processing webhook:', error);
//         res.status(500).send({ success: false });
//     }
// };

// function handleApplicantCreated(event) {
//     console.log('Applicant Created:', event);
//     // Add additional logic if needed
// }

// function handleApplicantPending(event) {
//     console.log('Applicant Pending:', event);
//     // Add additional logic if needed
// }

// function handleApplicantActivated(event) {
//     console.log('Applicant Activated:', event);
//     // Add additional logic if needed
// }

// function handleApplicantDeleted(event) {
//     console.log('Applicant Deleted:', event);
//     // Add additional logic if needed
// }
