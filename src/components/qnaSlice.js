import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = {
    questions: [],
    answers: []
};

export const qnaSlice = createSlice({
    name: 'qna',
    initialState,
    reducers: {
        addQna: (state, action) => {
            const { questions, Answers } = action.payload;
            for (let i = 0; i < questions.length; i++) {
                const { question, options } = questions[i];
                const answer = Answers[i];
                // Assuming you want to push both question and options into the state
                state.questions.push({ question, options });
                state.answers.push(answer); 
            }
        },
        removeQna: (state, action) => {
            state.questions = [];
            state.answers = [];
        }
    }
});

export const { addQna, removeQna } = qnaSlice.actions;

export default qnaSlice.reducer;
