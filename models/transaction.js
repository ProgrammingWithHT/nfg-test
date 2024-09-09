const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    paymentId: { type: String, required: true }, // Charge ID from the NFG response
    systemStatus: { type: String, required: true }, // Status of the transaction (e.g. "Done","Pending")
    chargeStatus: { type: String, required: true }, // Status of the transaction (e.g. "Done","Partial")
    senderId: { type: String, required: true }, // User ID who made the transaction
    receiverId: {type: String, default: ''},
    paymentcurrency: { type: String, required: true }, // Currency used for the payment
    paidAmount: { type: Number, required: true }, // Amount paid in cryptocurrency (e.g. BNB)
    paidAmountUSD: { type: Number, required: true }, // Equivalent amount in USD
    
    pkgid: { type: String, required: true }, // Package ID that selected from packages table
    typeTransaction: { type: String, required: true }, // Transaction type (e.g., Sale, Replenishment, etc.)
    
    //For partial payment handling
    totalAmountFiat: {type: Number, default: null},  
    totalAmountCurrency: {type: Number, default: null},
    payExtra: {type: Number, default: null},
    paidPartialAmount: { type: Number, default: 0 }, // Partial Amount Paid
    paidPartialAmountUSD: { type: Number, default: 0}, // Partial Amount Paid USD
    
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Optional: Indexing for faster search queries if needed
transactionSchema.index({ paymentId: 1, senderId: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
