import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Navbar from './Navbar';
import Footer from './Footer';
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';
import { UseDispatch, useDispatch } from 'react-redux';
import { addQna } from './qnaSlice';
import './WordReader.css';

// Initialize PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const genAI = new GoogleGenerativeAI('AIzaSyBYudmp684uxXB5ib0gnOTvSfYHF6uq9Ls')
const PdfReader = () => {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);
  const inputRef = useRef();
  const navigate = useNavigate();
  const geminiAPIKey = process.env.REACT_APP_GEMINI_API_KEY;
  const [pdfText, setPdfText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [Answers, setAnswers] = useState([]);

  // Function to handle PDF file upload
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    readPdfFile(uploadedFile);
  };

  const readPdfFile = async (pdfFile) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const pdfData = new Uint8Array(reader.result);
      const text = await convertPdfToText(pdfData);
      setPdfText(text);
      runGeminiAI(text);
    };
    reader.readAsArrayBuffer(pdfFile);
  };

  const convertPdfToText = async (pdfData) => {
    try {
      const pdf = await pdfjs.getDocument(pdfData).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const pageText = await page.getTextContent();
        pageText.items.forEach(item => {
          text += item.str + ' ';
        });
      }
      return text;
    } catch (error) {
      console.error('Error converting PDF to text:', error);
      return '';
    }
  };

  const runGeminiAI = async (text) => {
    try {
      console.log("Generating questions using Gemini AI...");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Please generate multiple-choice questions in the below format:
      [question_number]. [question]?
      A) [option_1]
      B) [option_2]
      C) [option_3]
      D) [option_4]
      Answer : [Answer for above mcq i.e. A or B or C or D]
      and generate like this until questions and options are not left in the given passage and dont write extra info .
      The following passage: `;
  
      const result = await model.generateContent([prompt, ...text]);
      const response = await result.response;
      const generatedText = response.text();
      console.log("Questions generated successfully:", generatedText);
      setPdfText(generatedText);
      parseQuestionsAndOptions(generatedText);
    } catch (error) {
      console.error('Error generating questions using Gemini AI:', error);
    }
  };
  
  const parseQuestionsAndOptions = (textItems) => {
    const lines = textItems.split('\n');
    let currentQuestion = "";
    let options = [];
    let questions = [];
    let answers = []; // Ensure answers is defined

    lines.forEach((text, index) => {
        let text1 = text.replace(/_/g, '').trim();
        const regex = /^\s*[A-D]\)\s+.+$/; // Match lines starting with A), B), C), or D) followed by option text
        const answerRegex = /^Answer\s*:\s*([A-D])/i; // Match lines starting with "Answer: " followed by A, B, C, or D (case insensitive)
        if (text1) {
            if (/^\d+\.\s+.+$/.test(text1)) {
                if (currentQuestion && options.length > 0) {
                    questions.push({
                        question: currentQuestion.replace(/^\d+\.\s+/, "").trim(),
                        options: options
                    });
                    options = []; // Reset options array for the next question
                }
                currentQuestion = text1.replace(/^\d+\.\s+/, "").trim();
            } else if (regex.test(text1)) {
                options.push(text1.trim());
            } else if (answerRegex.test(text1)) {
                const match = text1.match(answerRegex);
                if (match && match[1]) {
                    answers.push(match[1]);
                }
            }
        }
    });

    if (currentQuestion && options.length > 0) {
        questions.push({
            question: currentQuestion.replace(/^\d+\.\s+/, "").trim(),
            options: options
        });
    }
    setQuestions(questions);
    setAnswers(answers);
};






  const handleUpload = () => {
    const formData = new FormData();
    formData.append("Files", file);
    // Upload logic using axios or other methods
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFile(event.dataTransfer.files[0]);
    readPdfFile(event.dataTransfer.files[0]);
  };
  const addQnaHandler = () => {
    console.log({ questions, Answers });
    dispatch(addQna({ questions, Answers }));
    navigate('/testfinal');
  }
  return (
    <div>
      {/* <Navbar fluid /> */}
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center' }}>
        {!file && (
          <div
            className="dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <h1>Drag and Drop Files to Upload</h1>
            <h1>(OR)</h1>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              hidden
              accept="application/pdf"
              ref={inputRef}
            />
            <button className='select-button' onClick={() => inputRef.current.click()}>+ Select PDF File</button>
          </div>
        )}
        {file && !questions.length && (
          <Loading />
        )}
        <div>
        {file && questions.length > 0 && addQnaHandler()}
        </div>

      </div>
    </div>
  );
};

export default PdfReader;
