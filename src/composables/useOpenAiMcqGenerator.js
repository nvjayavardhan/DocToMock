import { useCallback, useMemo } from 'react';
import OpenAI from 'openai';

const DEFAULT_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

const apiKey = process.env.GROQ_API_KEY;
const baseURL = process.env.REACT_APP_OPENAI_BASE_URL || DEFAULT_BASE_URL;

const openAiClient = apiKey
  ? new OpenAI({
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: true
    })
  : null;

export const buildMcqPrompt = (content, sourceType = 'passage') => {
  const sourceLabel = sourceType === 'keyword' ? 'keyword' : 'passage';
  console.log(
  "API KEY PREFIX:",
  process.env.GROQ_API_KEY?.slice(0, 6)
);
  return `Please generate 10 multiple-choice questions in the below format:
[question_number]. [question]?
A) [option_1]
B) [option_2]
C) [option_3]
D) [option_4]
Answer : [Answer for above mcq i.e. A or B or C or D]

Do not provide any additional information or context.
Generate questions based on the following ${sourceLabel}:
${content}`;
};

export const parseMcqResponse = (textItems) => {
  const lines = textItems.split('\n');
  let currentQuestion = '';
  let options = [];
  const questions = [];
  const answers = [];

  const questionRegex = /^\d+[.)]\s*(.+)$/;
  const optionRegex = /^[A-D][).]\s*(.+)$/i;
  const answerRegex = /^Answer\s*:\s*([A-D])/i;

  const pushQuestion = () => {
    if (currentQuestion && options.length === 4) {
      questions.push({
        question: currentQuestion,
        options: [...options]
      });
    }
  };

  lines.forEach((line) => {
    const text = line.replace(/_/g, '').replace(/[^\x20-\x7E]/g, '').trim();

    if (!text) return;

    const questionMatch = text.match(questionRegex);
    if (questionMatch) {
      pushQuestion();
      currentQuestion = questionMatch[1].trim();
      options = [];
      return;
    }

    if (optionRegex.test(text)) {
      options.push(text);
      return;
    }

    const answerMatch = text.match(answerRegex);
    if (answerMatch) {
      answers.push(answerMatch[1].toUpperCase());
    }
  });

  pushQuestion();

  return { questions, Answers: answers };
};

const useOpenAiMcqGenerator = (options = {}) => {
  const model = options.model || process.env.REACT_APP_OPENAI_MODEL || DEFAULT_MODEL;
  const client = useMemo(() => openAiClient, []);

  const generateMcqs = useCallback(
    async (content, sourceType = 'passage') => {
      if (!client) {
        throw new Error('Missing REACT_APP_OPENAI_API_KEY or REACT_APP_GROQ_API_KEY.');
      }

      const prompt = buildMcqPrompt(content, sourceType);
      const chat = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: 'You are an MCQ generator.' },
          { role: 'user', content: prompt }
        ]
      });

      const generatedText = chat.choices?.[0]?.message?.content || '';
      return parseMcqResponse(generatedText);
    },
    [client, model]
  );

  return { generateMcqs };
};

export default useOpenAiMcqGenerator;
