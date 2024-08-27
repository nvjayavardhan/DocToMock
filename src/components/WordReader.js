import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { pdfjs } from 'react-pdf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Navbar from './Navbar';
import Footer from './Footer';
import Loading from './Loading';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addQna } from './qnaSlice';
import './WordReader.css'; // Import the CSS file

// Initialize PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const genAI = new GoogleGenerativeAI('AIzaSyBCbJeM25etheVhmXiyJo7JFg4MK5ro01A');

const WordReader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [pdfText, setPdfText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [Answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef();
  const [file, setFile] = useState(null);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    setIsLoading(true);
    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = async (e) => {
      const contents = e.target.result;
      setPdfText(contents);
      await run(contents);
    };
    reader.readAsText(uploadedFile);
  };

  const run = async (pdfData) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Please generate multiple-choice questions in the below format:
      [question_number]. [question]?
      A) [option_1]
      B) [option_2]
      C) [option_3]
      D) [option_4]
      Answer: [Answer for above mcq i.e. A or B or C or D]
      Do not provide any additional information or context. Use the following passage:`;

      const result = await model.generateContent([`${prompt} ${pdfData}`]);
      const response = await result.response;
      const text = await response.text();
      parseQuestionsAndOptions(text);
    } catch (error) {
      console.error("Error generating questions:", error);
      setErrorMessage('Failed to generate questions. Please ensure the content is safe and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseQuestionsAndOptions = (textItems) => {
    const lines = textItems.split('\n');
    let currentQuestion = "";
    let options = [];
    let questionsAndAnswers = [];
    let Answers1 = [];

    lines.forEach((text, index) => {
      let text1 = text.replace(/_/g, '').trim();
      const regex = /^\s*[A-D]\)\s+.+$/;
      const answerRegex = /^Answer\s*:\s*([A-D])/i;

      text1 = text1.replace(/[^\x20-\x7E]/g, '');

      if (text1) {
        if (/^\d+\.\s+.+$/.test(text1)) {
          if (currentQuestion && options.length > 0) {
            questionsAndAnswers.push({
              question: currentQuestion.replace(/^\d+\.\s+/, "").trim(),
              options: options
            });
            options = [];
          }
          currentQuestion = text1.replace(/^\d+\.\s+/, "").trim();
        } else if (regex.test(text1)) {
          options.push(text1.trim());
        } else if (answerRegex.test(text1)) {
          const match = text1.match(answerRegex);
          if (match && match[1]) {
            Answers1.push(match[1]);
          }
        }
      }
    });

    if (currentQuestion && options.length > 0) {
      questionsAndAnswers.push({
        question: currentQuestion.replace(/^\d+\.\s+/, "").trim(),
        options: options
      });
    }
    setQuestions(questionsAndAnswers);
    setAnswers(Answers1);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setFile(event.dataTransfer.files[0]);
    handleFileUpload(event);
  };

  const addQnaHandler = () => {
    dispatch(addQna({ questions, Answers }));
    navigate('/testfinal');
  };

  useEffect(() => {
    if (questions.length > 0 && Answers.length > 0) {
      addQnaHandler();
    }
  }, [questions, Answers]);

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
              onChange={handleFileUpload}
              hidden
              accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/msword"
              ref={inputRef}
            />
            <button className="select-button" onClick={() => inputRef.current.click()} >+ Select Word File</button>
          </div>
        )}
        {file && isLoading && (
          <Loading />
        )}
        {errorMessage && (
          <p style={{ color: 'red' }}>{errorMessage}</p>
        )}
        <div>
          {file && !isLoading && questions.length > 0 && (
            <p>Questions and answers generated successfully!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordReader;
