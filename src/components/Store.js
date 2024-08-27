import { configureStore } from '@reduxjs/toolkit';
import qnaReducer from './qnaSlice';

const store = configureStore({
    reducer: {
        qna: qnaReducer // Assuming qnaReducer handles the qnaSlice state
    }
});

export default store;
