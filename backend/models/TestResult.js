const mongoose = require('mongoose');
const { Schema } = mongoose;


const testResultSchema = new Schema({
    studentName: { type: String, required: true },
    title: {type: String, required: true},
    uniqueCode: { type: String, required: true },
    score: { type: Number, required: true },
    totalScore: { type: Number, required: true },
    submissionDate: { type: Date, default: Date.now }
});


module.exports = mongoose.model('TestResult', testResultSchema);;
