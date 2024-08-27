import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Navbar from './Navbar';
import Footer from './Footer';
import Loading from './Loading';
import { UploadFile } from '@mui/icons-material';
import { UseDispatch, useDispatch } from 'react-redux';
import { addQna } from './qnaSlice';
import { useNavigate } from 'react-router-dom';
import './WordReader.css'

const OCRComponent = () => {
    const navigate=useNavigate();
    const dispatch=useDispatch();
    const genAI = new GoogleGenerativeAI('AIzaSyBYudmp684uxXB5ib0gnOTvSfYHF6uq9Ls');
    const [image, setImage] = useState(null);
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [Answers,setAnswers]= useState([]);
    const inputRef = useRef();
  
    const handleImageChange = (e) => {
      const uploadedFile = e.target.files[0];
      setFile(uploadedFile);
      processImage(uploadedFile);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        processImage(droppedFile);
      };

      const processImage = (file) => {
        setImage(file);
        setLoading(true);
        Tesseract.recognize(
          file,
          'eng',
          { logger: (m) => console.log(m) }
        ).then(({ data: { text } }) => {
          const formattedText = formatText(text);
          setText(formattedText);
          run(formattedText);
        }).catch(error => {
          console.error('Error processing image:', error);
        });
      };

  const formatText = (text) => {
    return text.replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n');
  };

  async function run(pdfData) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Generate multiple-choice questions in the format:
    [question_number]. [question]?
    A) [option_1]
    B) [option_2]
    C) [option_3]
    D) [option_4]
    Answer : [Answer for above mcq i.e. A or B or C or D]
    Continue generating questions in this format until all questions and options are exhausted from the provided passage. Avoid repetitive language and aim for originality in the generated content.
    
    The passage is as follows:`;

    const result = await model.generateContent([prompt, ...pdfData]);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    parseQuestionsAndOptions(text);
  }

  const parseQuestionsAndOptions = (textItems) => {
    const lines = textItems.split('\n');
    let currentQuestion = "";
    let options = [];
    let questionsAndAnswers = [];
    let Answers1 = []; // Ensure Answers1 is defined
  
    lines.forEach((text, index) => {
        let text1 = text.replace(/_/g, '').trim();
        const regex = /^\s*[A-D]\)\s+.+$/; // Match lines starting with A), B), C), or D) followed by option text
        const answerRegex = /^Answer\s*:\s*([A-D])/i; // Match lines starting with "Answer: " followed by A, B, C, or D (case insensitive)
        if (text1) {
            if (/^\d+\.\s+.+$/.test(text1)) {
                if (currentQuestion && options.length > 0) {
                    questionsAndAnswers.push({ 
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
    setLoading(false);
};
const addQnaHandler = () => {
  console.log({ questions, Answers });
  dispatch(addQna({ questions, Answers }));
  navigate('/testfinal');
}

  return (
    <div>
        {/* <Navbar fluid /> */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' ,alignItems:'center' }}>
        {!file && (
      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <h1>Drag and Drop Image to Upload</h1>
        <h1>(OR)</h1>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
          ref={inputRef}
        />
        <button className='select-button' onClick={() => inputRef.current.click()}>+ Select Image</button>
      </div>
        )}
      {loading ? <Loading /> : null}
      {questions.length > 0 && addQnaHandler()}
    </div>
    </div>
  );
};

export default OCRComponent;
