// const mongoose = require('mongoose');

// const sumsubSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, required: true },
//     applicantId: { type: String },
//     inspectionId: { type: String },
//     correlationId: { type: String },
//     levelName: { type: String },
//     externalUserId: { type: String },
//     type: { type: String, required: true },
//     sandboxMode: { type: String },
//     reviewStatus: { type: String },
//     createdAtMs: { type: String },
//     clientId: { type: String }
// }, { timestamps: true });

// const SumsubEvent = mongoose.model('SumsubEvent', sumsubSchema);

// module.exports = SumsubEvent;



const mongoose = require('mongoose');

const sumsubEventSchema = new mongoose.Schema({
    applicantId: { type: String, unique: true },
    type: String,
    inspectionId: String,
    applicantType: String,
    correlationId: String,
    levelName: String,
    externalUserId: String,
    sandboxMode: String,
    reviewStatus: String,
    createdAtMs: String,
    clientId: String,
    // Make userId optional if it's not always provided
    userId: { type: String, required: false },
}, { timestamps: true });

module.exports = mongoose.model('SumsubEvent', sumsubEventSchema);
