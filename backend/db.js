 // db.js
const mongoose = require('mongoose');
const mongoURI = 'mongodb+srv://user_team7:user_team7@cluster1.wli3dyw.mongodb.net/pdfReader?retryWrites=true&w=majority&appName=Cluster1';

module.exports = async function () {
    try {
      await mongoose.connect(mongoURI);
      console.log("Connected to MongoDB");
      const quizData = mongoose.connection.db.collection("quizzes");
      const resultData = mongoose.connection.db.collection("testresults");
    const quiz = await quizData.find({}).toArray(); // Corrected variable name
    const results = await resultData.find({}).toArray(); // Corrected variable name

    // Combining data from different collections
    const allData = {
      quiz : quiz, // Corrected variable name
      results : results
    };
  
      return allData;
    } catch (error) {
      console.error("Errorconnecting to MongoDB:", error);
      throw error;
    }
  };