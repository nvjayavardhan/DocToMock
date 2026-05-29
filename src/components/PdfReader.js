import React, { useEffect, useRef, useState } from 'react';
import { pdfjs } from 'react-pdf';
import Loading from './Loading';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addQna } from './qnaSlice';
import './WordReader.css';
import useOpenAiMcqGenerator from '../composables/useOpenAiMcqGenerator';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfReader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { generateMcqs } = useOpenAiMcqGenerator();
  const [file, setFile] = useState(null);
  const inputRef = useRef();
  const [questions, setQuestions] = useState([]);
  const [Answers, setAnswers] = useState([]);

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
      runOpenAi(text);
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
        text += `${pageText.items.map((item) => item.str).join(' ')} `;
      }

      return text;
    } catch (error) {
      console.error('Error converting PDF to text:', error);
      return '';
    }
  };

  const runOpenAi = async (text) => {
    try {
      const result = await generateMcqs(text);
      setQuestions(result.questions);
      setAnswers(result.Answers);
    } catch (error) {
      console.error('Error generating questions using OpenAI:', error);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    setFile(droppedFile);
    readPdfFile(droppedFile);
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
              multiple
              onChange={handleFileUpload}
              hidden
              accept="application/pdf"
              ref={inputRef}
            />
            <button className="select-button" onClick={() => inputRef.current.click()}>+ Select PDF File</button>
          </div>
        )}
        {file && !questions.length && <Loading />}
      </div>
    </div>
  );
};

export default PdfReader;
