const mongoose = require('mongoose');

const { Schema } = mongoose;

const QuizSchema = new Schema({
  teacherEmail: {
    type: String,
    required: true
  },
  quizTitle: {
    type: String,
    required: true
  },
  quizTime: {
    type: Number,
    required: true
  },
  posMark: {
    type: Number,
    required: true
  },
  negMark: {
    type: Number,
    required: true
  },
  questions: [
    {
      question: {
        type: String,
        required: true
      },
      options: [
        {
          type: String,
          required: true
        }
      ],
      answer: {
        type: String,
        required: true
      }
    }
  ],
  uniqueCode: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Quiz', QuizSchema);
