import React, { useEffect, useRef, useState } from 'react';
import Tesseract from 'tesseract.js';
import Loading from './Loading';
import { useDispatch } from 'react-redux';
import { addQna } from './qnaSlice';
import { useNavigate } from 'react-router-dom';
import './WordReader.css';
import useOpenAiMcqGenerator from '../composables/useOpenAiMcqGenerator';

const OCRComponent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { generateMcqs } = useOpenAiMcqGenerator();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [Answers, setAnswers] = useState([]);
  const inputRef = useRef();

  const handleImageChange = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
    processImage(uploadedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
    processImage(droppedFile);
  };

  const processImage = (imageFile) => {
    setLoading(true);
    Tesseract.recognize(
      imageFile,
      'eng',
      { logger: (message) => console.log(message) }
    ).then(({ data: { text } }) => {
      const formattedText = formatText(text);
      runOpenAi(formattedText);
    }).catch((error) => {
      console.error('Error processing image:', error);
      setLoading(false);
    });
  };

  const formatText = (text) => {
    return text.replace(/([.!?])\s*(?=[A-Z])/g, '$1\n\n');
  };

  const runOpenAi = async (text) => {
    try {
      const result = await generateMcqs(text);
      setQuestions(result.questions);
      setAnswers(result.Answers);
    } catch (error) {
      console.error('Error generating questions using OpenAI:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questions.length > 0 && Answers.length > 0) {
      dispatch(addQna({ questions, Answers }));
      navigate('/testfinal');
    }
  }, [questions, Answers, dispatch, navigate]);

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center' }}>
        {!file && (
          <div
            className="dropzone"
            onDragOver={(event) => event.preventDefault()}
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
            <button className="select-button" onClick={() => inputRef.current.click()}>+ Select Image</button>
          </div>
        )}
        {loading ? <Loading /> : null}
      </div>
    </div>
  );
};

export default OCRComponent;
