import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  receiverId: '', // Add receiverId to the state
};

const receiverSlice = createSlice({
  name: 'receiver',
  initialState,
  reducers: {
    setReceiverId: (state, action) => {
      state.receiverId = action.payload; // Update the receiverId
    },
    clearReceiverId: (state) => {
      state.receiverId = ''; // Reset the receiverId
    },
  },
});

// Export actions and reducer
export const { setReceiverId, clearReceiverId } = receiverSlice.actions;
export default receiverSlice.reducer;
