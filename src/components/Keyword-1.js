import React, { useEffect, useState } from 'react';
import Loading from './Loading';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addQna } from './qnaSlice';
import { TextField, Button, Container, Box, Typography } from '@mui/material';
import useOpenAiMcqGenerator from '../composables/useOpenAiMcqGenerator';

const Keyword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { generateMcqs } = useOpenAiMcqGenerator();
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [questions, setQuestions] = useState([]);
  const [Answers, setAnswers] = useState([]);

  const handleSearchInputChange = (event) => {
    setKeyword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (keyword.trim() !== '') {
      runOpenAi(keyword);
      setLoading(true);
    }
  };

  const runOpenAi = async (text) => {
    try {
      const result = await generateMcqs(text, 'keyword');
      setQuestions(result.questions);
      setAnswers(result.Answers);
    } catch (error) {
      console.error('Error generating questions using OpenAI:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || questions.length === 0 || Answers.length === 0) {
      return;
    }

    dispatch(addQna({ questions, Answers }));
    navigate('/testfinal');
  }, [loading, questions, Answers, dispatch, navigate]);

  return (
    <div>
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
      </Container>
    </div>
  );
};

export default Keyword;
