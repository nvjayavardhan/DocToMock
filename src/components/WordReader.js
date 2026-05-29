import React, { useEffect, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import Loading from './Loading';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addQna } from './qnaSlice';
import './WordReader.css';
import useOpenAiMcqGenerator from '../composables/useOpenAiMcqGenerator';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const WordReader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { generateMcqs } = useOpenAiMcqGenerator();
  const [questions, setQuestions] = useState([]);
  const [Answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef();
  const [file, setFile] = useState(null);

  const readTextFile = async (uploadedFile) => {
    setFile(uploadedFile);
    setIsLoading(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = async (event) => {
      const contents = event.target.result;
      await runOpenAi(contents);
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    readTextFile(uploadedFile);
  };

  const runOpenAi = async (text) => {
    try {
      const result = await generateMcqs(text);
      setQuestions(result.questions);
      setAnswers(result.Answers);
    } catch (error) {
      console.error('Error generating questions:', error);
      setErrorMessage('Failed to generate questions. Please ensure the content is safe and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    readTextFile(event.dataTransfer.files[0]);
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
            <button className="select-button" onClick={() => inputRef.current.click()}>+ Select Word File</button>
          </div>
        )}
        {file && isLoading && <Loading />}
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
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
