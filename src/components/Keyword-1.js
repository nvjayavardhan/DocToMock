import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Navbar from './Navbar';
import Footer from './Footer';
import Loading from './Loading';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addQna } from './qnaSlice';
import { TextField, Button, Container, Box, Typography } from '@mui/material';

// Initialize PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
const genAI = new GoogleGenerativeAI('AIzaSyBYudmp684uxXB5ib0gnOTvSfYHF6uq9Ls');

const Keyword = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const inputRef = useRef();
    const [questions, setQuestions] = useState([]);
    const [Answers, setAnswers] = useState([]);

    const handleSearchInputChange = (event) => {
        setKeyword(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (keyword.trim() !== '') {
            runGeminiAI(keyword);
            setLoading(true);
        }
    };

    const runGeminiAI = async (text) => {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const prompt = `Please generate multiple-choice questions in the below format:
            [question_number]. [question]?
            A) [option_1]
            B) [option_2]
            C) [option_3]
            D) [option_4]
            Answer : [Answer for above mcq i.e. A or B or C or D]
            and generate like this until based on the following keyword  : ${text}`;

            const result = await model.generateContent([prompt]);
            const response = await result.response;
            const generatedText = response.text();
            parseQuestionsAndOptions(generatedText);
        } catch (error) {
            console.error('Error generating questions using Gemini AI:', error);
        }
    };

    const parseQuestionsAndOptions = (textItems) => {
        const lines = textItems.split('\n');
        let currentQuestion = "";
        let options = [];
        let questionsAndAnswers = [];
        let Answers1 = [];

        lines.forEach((text) => {
            let text1 = text.replace(/_/g, '').trim();
            const regex = /^\s*[A-D]\)\s+.+$/;
            const answerRegex = /^Answer\s*:\s*([A-D])/i;

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
        setLoading(false);
    };

    const addQnaHandler = () => {
        // Calculate the middle index to get the first half of the arrays
        const middleIndex = Math.ceil(questions.length / 2);
    
        // Take only the first half of questions and Answers
        const firstHalfQuestions = questions.slice(0, middleIndex);
        const firstHalfAnswers = Answers.slice(0, middleIndex);
    
        // Dispatch the first half (since the second half is a repeat)
        dispatch(addQna({ questions: firstHalfQuestions, Answers: firstHalfAnswers }));
    
        // Navigate to the next page
        navigate('/testfinal');
    };
    

    return (
        <div>
            {/* <Navbar fluid /> */}
            <Container maxWidth="sm" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', alignItems: 'center' }}>
                <Box mt={5} width="100%">
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Enter keyword
                    </Typography>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                        <TextField
                            variant="outlined"
                            label="Keyword"
                            value={keyword}
                            onChange={handleSearchInputChange}
                            fullWidth
                        />
                        <Button variant="contained" color="primary" type="submit">
                            Search
                        </Button>
                    </form>
                </Box>
                {loading && !questions.length && <Loading />}
                {!loading && questions.length > 0 && addQnaHandler()}
            </Container>
        </div>
    );
};

export default Keyword;
