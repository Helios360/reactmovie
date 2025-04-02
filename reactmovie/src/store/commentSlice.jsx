import { createSlice } from '@reduxjs/toolkit';

const commentSlice = createSlice({
  name: 'comments',
  initialState: [],
  reducers: {
    addComment: (state, action) => {
      state.push(action.payload);
    },
    deleteComment: (state, action) => {
      return state.filter(comment => comment.id !== action.payload);
    }
  }
});

export const { addComment, deleteComment } = commentSlice.actions;
export default commentSlice.reducer;