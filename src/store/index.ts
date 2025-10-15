import { configureStore } from '@reduxjs/toolkit';
import orchestrationReducer from './orchestrationSlice';
import proposalReducer from './proposalSlice';

export const store = configureStore({
  reducer: {
    orchestration: orchestrationReducer,
    proposals: proposalReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;