import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';

const testStore = configureStore({ reducer: { sample: (s = { count: 0 }) => s } });

describe('App', () => {
  it('renders without crashing', () => {
    render(
      <Provider store={testStore}>
        <App />
      </Provider>,
    );
    expect(screen.getByText(/React 19 Security Boilerplate/i)).toBeInTheDocument();
  });
});
