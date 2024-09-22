const User = require('../models/auth'); // User model for MongoDB
const Transaction = require("../models/transaction");
const Package = require('../models/packages'); // Package model
const DecryptedPayment = require("../models/decryptedPayment")
const { CpaySDK } = require('cpay-node-api-sdk');
const axios = require('axios');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const Decimal = require('decimal.js');
require('dotenv').config();

// https://napi.nfg-crypto.io​/api​/checkout-client​/66db3f33e3142b2fe704da39/charge
// https://napi.nfg-crypto.io/api/checkout-client/66db3f33e3142b2fe704da39/charge
// "systemStatus": "Partial",
const NFG_API_BASE_URL = process.env.NFG_API_BASE_URL;

const publicKey = process.env.NFG_PUBLIC_KEY;
const privateKey = process.env.NFG_PRIVATE_KEY;

// Decrypt function for callback
const decrypt = (encryptedSecret, salt) => {
    const bytes = CryptoJS.AES.decrypt(encryptedSecret, salt);
    return bytes.toString(CryptoJS.enc.Utf8);
};

// Parse JWT function
const parseJwt = (bearerToken) => {
    if (!bearerToken.startsWith('Bearer ')) {
        console.error('Invalid authorization format');
        return { error: 'Invalid authorization format' };
    }

    const token = bearerToken.slice(7);
    try {
        const decodedToken = jwt.decode(token);
        return decodedToken;
    } catch (error) {
        console.error('Error decoding the token:', error.message);
        return { error: 'Token is not valid' };
    }
};

const currencies = [
    "5edf2767c9ca4d5a342bf8ac", //BTC
    "60ebfe8ffe376807f22943ef", //BNB
    // "63244c58ca5405284b42ebec",
    "648867f0636df554e46ed797",
    // "61641091597bd03988be5c62", TRX
    // "65424b0af09885097db346e8",
    // "65018f161386136ebe548527",
    // "645ce93c9616396652b05cbd",
    // "5edf278ac9ca4d5a342bf8ad", //Etherium
    // "62e7c3669c167b624bd84f37",
    // "655ca20edaab7c7612a8e0ad",
    // "65325c146b2e181aa5a34ddd",
    // "6606dc5b6073014fcfe25324",
    // "65e71f4189052b5888de3981",
    // "6368e4b8636df554e43087c8",


    // "5edf27a3c9ca4d5a342bf8ae",  //USDT (ERC-20)
    // "6336da3bca5405284b73d9ae",  //USDC (ERC-20)
    // "650059631386136ebe548515",  //TrueUSD (ERC-20)
    // "60eee72676d1ef1761cf916c",  //BUSD (BEP-20)
    "60fa7e50db89fd7b3b94b293",  //USDT (BEP-20)
    "61010e313cd67801573f46ed",  //BTC (BEP-20)  replenishMinimumValue: 0
    // "6336d0e0ca5405284b73be5c",  //USDC (BEP-20)
    // "65005a601386136ebe548516",  //TrueUSD (BEP-20)
    // "6336d1a6ca5405284b73c080",  //ADA (BEP-20)
    // "6336d289ca5405284b73c323",  //DOGE (BEP-20)
    // "6336d35cca5405284b73c597",  //SHIB (BEP-20)
    // "6336d3f2ca5405284b73c731",  //EOS (BEP-20)
    // "61767935597bd03988be5d0c",
    // "65005aba1386136ebe548517","6336d950ca5405284b73d70b",
    // "647c3b4c8268113f59a7197d","647c3c108268113f59a7197e","65005c981386136ebe54851b","64674bc046195eaa29a64dc2","64674b1946195eaa29a64dc0",
    // "64674e5ca8943ee095086b8d","65005c3a1386136ebe54851a","64886e09636df554e46f142e","65005b831386136ebe548519","653621140b4afe0330d6bfff",
    // "65424d51f09885097db346e9","65018f6c1386136ebe548528","65018fcb1386136ebe548529","655cb15fdaab7c7612a8e0b5",
    // "665096c562f3e76f1d2a9566",
    "64886d20636df554e46f049d",   //USDT (Arbitrum)
    // "64886b6f636df554e46ef1ca"   //USDC (Arbitrum)
]

// Route to authenticate merchant
exports.loginMerchant = async (req, res) => {
    console.log(NFG_API_BASE_URL)
    console.log(privateKey)

    try {
        const response = await axios.post(`${NFG_API_BASE_URL}/api/public/auth`, {
            publicKey,
            privateKey,
        });
        // console.log("token: ",response)

        const user = await User.findByIdAndUpdate(
            req.user.id,
            {
                $set: {
                    nfgToken: response?.data?.token,
                }
            },
            { new: true }
        );
        // console.log(user)

        res.status(200).json({ "success": true });
    } catch (error) {
        res.status(400).json({ error: 'Authentication failed' });
    }
};

// Route to create a checkout session (sale)
exports.paymentCheckout = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const { productName, description, price, fiatCurrency, userId, planId } = req.body;
    const nfgToken = user.nfgToken;
    // console.log(req.body)
    try {
        const response = await axios.post(`${NFG_API_BASE_URL}/api/public/checkout/sale`, {
            expireTime: 60,
            currencies: currencies, // example currencies
            collectName: "false",
            collectEmail: "true",
            productName,
            description,
            price: String(price),
            fiatCurrency,
            metadata: { userId, planId },
            // linkSite: "https://threearrowstech.com/"
        },
            { headers: { Authorization: `Bearer ${nfgToken}` }, }
        );

        const checkoutUrl = `https://checkouts.nfg-crypto.io/checkout/${response?.data?.data?.identifier}`
        // console.log(checkoutUrl)
        // console.log(checkoutUrl)
        return res.status(200).json({ checkoutUrl });
    } catch (error) {
        console.log(error)
        res.status(400).json({ error: 'Failed to create checkout session' });
    }
};

// Route to handle payment callback
exports.handlePaymentCallback = async (req, res) => {
    try {
        const { body, headers } = req;

        if (headers && headers.authorization && body.data) {
            // Parse JWT token from the authorization header
            const decryptedJwtAuthorization = parseJwt(headers.authorization);
            const { id: walletId, salt, exp } = decryptedJwtAuthorization;

            if (!walletId || !salt || !exp) {
                console.error({ status: 'ERROR', message: 'Token is not valid' });
                return res.status(400).json({ status: 'ERROR', message: 'Invalid token or missing data' });
            }

            try {
                // Decrypt salt using walletId and body data using finalSalt
                const finalSalt = decrypt(salt, walletId);
                const decryptedBody = JSON.parse(decrypt(body.data, finalSalt));

                // Store the entire decrypted body in MongoDB
                const decryptedPayment = new DecryptedPayment({ decryptedData: decryptedBody });
                await decryptedPayment.save();

                const {
                    orderId, typeTransaction, chargeId,
                    checkoutMetadata: { userId, planId },
                    systemStatus, chargeStatus, amount, amountUSD, currency,
                    payExtra, totalAmountCurrency, totalAmountFiat, blockchain
                } = decryptedBody;

                // Convert string values to Decimal for high precision
                const paidAmount = new Decimal(amount);
                const paidAmountUSD = new Decimal(amountUSD);


                if (typeTransaction === "Replenishment") {
                    // Check if paymentId (chargeId) already exists in the Transaction table
                    let transaction = await Transaction.findOne({ paymentId: chargeId });

                    if (transaction) {

                        if (systemStatus === "Done" && chargeStatus === "Done" && transaction?.payExtra) {
                            console.log('done done and payextra calling')
                            // If paymentId exists, update the systemStatus
                            transaction.systemStatus = systemStatus;
                            transaction.chargeStatus = chargeStatus;
                            transaction.paidAmount = new Decimal(transaction.paidAmount).plus(paidAmount).toString(); // Sum of paidAmount
                            transaction.paidAmountUSD = new Decimal(transaction.paidAmountUSD).plus(paidAmountUSD).toString(); // Sum of paidAmountUSD

                            await transaction.save();
                            await User.findByIdAndUpdate(
                                userId,
                                {
                                    $set: {
                                        systemStatus: systemStatus,
                                        chargeStatus: chargeStatus,
                                        pkgid: planId
                                    }
                                },
                                { new: true }
                            );
                        }
                        else if (systemStatus === "Done" && chargeStatus === "Done") {
                            console.log('done done calling')
                            transaction.systemStatus = systemStatus;
                            transaction.chargeStatus = chargeStatus;
                            transaction.paidAmount = paidAmount.toString();
                            transaction.paidAmountUSD = paidAmountUSD.toString();
                            

                            await transaction.save();
                            await User.findByIdAndUpdate(
                                userId,
                                {
                                    $set: {
                                        systemStatus: systemStatus,
                                        chargeStatus: chargeStatus,
                                        pkgid: planId
                                    }
                                },
                                { new: true }
                            );
                        } else if (systemStatus === "Done" && chargeStatus === "Partial") {
                            console.log('done partial calling..')
                            transaction.systemStatus = systemStatus;
                            transaction.chargeStatus = chargeStatus;
                            transaction.paidAmount = new Decimal(transaction.paidAmount).plus(paidAmount).toString(); // Sum of paidAmount
                            transaction.paidAmountUSD = new Decimal(transaction.paidAmountUSD).plus(paidAmountUSD).toString(); // Sum of paidAmountUSD
                            transaction.totalAmountCurrency = totalAmountCurrency;
                            transaction.payExtra = payExtra;
                            await transaction.save();

                            await User.findByIdAndUpdate(
                                userId,
                                {
                                    $set: {
                                        systemStatus: systemStatus,
                                        chargeStatus: chargeStatus
                                    }
                                },
                                { new: true }
                            );
                        }

                    } else {
                        console.log('pending else calling')

                        if (chargeStatus === "Done") {
                            console.log('first at pending done')
                            const transactionData = {
                                orderId: orderId,
                                paymentId: chargeId,
                                senderId: userId,
                                paymentcurrency: currency,  // BNB, BTC, etc.
                                paidAmount: paidAmount.toString(),
                                paidAmountUSD: paidAmountUSD.toString(),
                                pkgid: planId,
                                systemStatus: systemStatus,
                                chargeStatus: chargeStatus,
                                typeTransaction: typeTransaction,
                                chain: blockchain,
                            };
                            transaction = new Transaction(transactionData);
                            await transaction.save();
                            await User.findByIdAndUpdate(
                                userId,
                                {
                                    $set: {
                                        systemStatus: systemStatus,
                                        chargeStatus: chargeStatus,
                                    }
                                },
                                { new: true }
                            );
                        }
                        else if (chargeStatus === "Partial") {
                            console.log('first pending partial calling')
                            const transactionData = {
                                orderId: orderId,
                                paymentId: chargeId,
                                senderId: userId,
                                paymentcurrency: currency,
                                pkgid: planId,
                                systemStatus: systemStatus,
                                chargeStatus: chargeStatus,
                                typeTransaction: typeTransaction,
                                totalAmountFiat: totalAmountFiat,
                                totalAmountCurrency: totalAmountCurrency,
                                payExtra: payExtra,
                                chain: blockchain,
                            };
                            transaction = new Transaction(transactionData);
                            await transaction.save();

                            await User.findByIdAndUpdate(
                                userId,
                                {
                                    $set: {
                                        systemStatus: systemStatus,
                                        chargeStatus: chargeStatus,
                                    }
                                },
                                { new: true }
                            );
                        }
                    }
                }

                return res.status(200).json({
                    status: 'SUCCESS',
                    message: `The payment with status "${chargeStatus}" has been processed as a ${typeTransaction} transaction.`,
                });


            } catch (error) {
                console.error('Error decrypting data or processing transaction:', error.message);
                return res.status(500).json({ status: 'ERROR', message: error.message });
            }
        } else {
            return res.status(400).json({ status: 'ERROR', message: 'Missing authorization or body data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error processing callback' });
    }
};

//Route to Create a checkout of fiat Payment
exports.fiatPaymentCheckout = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    try {
        const { customId, fiatAmount, fiatCurrency, colorCode, screenTitle, pkgid } = req.body;

        // Constructing REST API URL
        const baseUrl = "https://us-central1-nfgdatabasedemo.cloudfunctions.net/app/api/invoice_external";
        const fiatCheckoutUrl = `${baseUrl}?apiKey=${process.env.NFG_FIAT_API_KEY}&customId=${customId}&onRampProvider=transak&defaultFiatCurrency=${fiatCurrency}&defaultFiatAmount=${fiatAmount}&colorCode=${colorCode}&screenTitle=${screenTitle}&pkgid=${pkgid}`;

        res.json({ fiatCheckoutUrl });
    } catch (error) {
        res.status(400).json({ success: false, error: 'Failed to create fiat checkout session' });
    }
};


// Route to handle payment callback
exports.fiatHandlePaymentCallback = async (req, res) => {
    console.log('calling... fiat callback')
    try {
        const paymentData = req.body;
        const paymentDataHeaders = req.headers;
        // Store the entire decrypted body in MongoDB
        const decryptedPayment = new DecryptedPayment({ decryptedData: paymentData });
        const decryptedPayment1 = new DecryptedPayment({ decryptedData: paymentDataHeaders });
        await decryptedPayment.save();
        await decryptedPayment1.save();
            
        
        if (headers && headers.authorization && paymentData) {

            const secretToken = process.env.NFG_FIAT_SECRET_KEY
            const token = headers.authorization;
            if(token === secretToken){
                // Map the fields from the paymentData to the transactionSchema

                    // Find the package ID based on the transferred amount
                const package = await Package.findOne({ amount: paymentData.transferedAmount });

                const newTransaction = new Transaction({
                    orderId: paymentData.customerID, // Assuming customerID is used as orderId
                    paymentId: paymentData.blockchainTxId, // Transaction ID from the blockchain
                    systemStatus: "Done", // Based on your requirement; could be dynamic
                    chargeStatus: "Done", // Could vary depending on the transaction success/failure
                    senderId: paymentData?.customerID, // Enduser's ID (email or another identifier)
                    receiverId: paymentData?.accountEDTO, // Wallet that received the funds
                    paymentcurrency: paymentData?.currency, // Currency (e.g., USDT)
                    paidAmount: paymentData?.transferedAmount, // Net amount received
                    paidAmountUSD: "", // If you want to track equivalent in USD
                    pkgid: package ? package?._id : '', // Fetch the actual package ID if applicable
                    typeTransaction: "Deposite",
                    chain: paymentData.chain, // Blockchain (e.g., MATIC)
                });
        
                // Save the new transaction to the MongoDB database
                await newTransaction.save();
            }
        }


        res.status(200).json({ message: "Payment processed" });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Error Processing Fiat Payment' });
    }
};

//Route to Get User Transaction List
exports.getUserTransactionsList = async (req, res) => {
    try {
        const { userId } = req.body;

        // Validate if userId is provided
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Find all transactions where senderId matches the userId
        const transactions = await Transaction.find({ senderId: userId });

        if (!transactions.length) {
            return res.status(404).json({
                success: false,
                message: "No transactions found for this user"
            });
        }

        // Find all unique package IDs from the transactions
        const packageIds = [...new Set(transactions.map(transaction => transaction.pkgid))];

        // Fetch all package details that match the package IDs
        const packages = await Package.find({ _id: { $in: packageIds } });

        // Create a package lookup map
        const packageMap = packages.reduce((map, pkg) => {
            map[pkg._id] = pkg;
            return map;
        }, {});

        // Merge package details into transactions
        const mergedTransactions = transactions.map(transaction => {
            return {
                ...transaction.toObject(),
                package: packageMap[transaction.pkgid] || null
            };
        });

        // Send the response with merged transactions
        res.status(200).json({
            success: true,
            data: mergedTransactions
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};