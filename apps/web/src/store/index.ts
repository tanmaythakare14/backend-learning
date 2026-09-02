import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import { secureLocalStorage } from '../utils/secureStorage';
import authReducer from './slices/authSlice';

/**
 * Secure storage adapter for redux-persist
 * All state is AES-encrypted before writing to localStorage
 */
const secureStorage = {
  getItem: (key: string): Promise<string | null> => {
    try {
      return Promise.resolve(secureLocalStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem: (key: string, value: string): Promise<void> => {
    try {
      secureLocalStorage.setItem(key, value);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  },
  removeItem: (key: string): Promise<void> => {
    secureLocalStorage.removeItem(key);
    return Promise.resolve();
  },
};

const persistConfig = {
  key: 'root',
  storage: secureStorage,
  ...(import.meta.env.MODE !== 'test' ? {} : { blacklist: [] }),
};

/**
 * Sample reducer — replace or extend with your own slices.
 * State is automatically persisted and AES-encrypted via secureStorage.
 */
const sampleReducer = (state = { count: 0 }, action: { type: string; payload?: unknown }) => {
  switch (action.type) {
    case 'increment':
      return { ...state, count: (state.count as number) + 1 };
    case 'decrement':
      return { ...state, count: (state.count as number) - 1 };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  // Add your feature slices here
  sample: sampleReducer,
  auth: authReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
