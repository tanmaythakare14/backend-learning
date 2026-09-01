import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  secureLocalStorage,
  secureSessionStorage,
} from '../utils/secureStorage';
import { logger } from '../utils/logger';


function App() {
  const [localCount, setLocalCount] = useState(0);
  const dispatch = useAppDispatch();
  const reduxCount = useAppSelector((state) => state.sample.count);

  const handleSecureStorageExample = () => {
    // Example: Store data securely
    secureLocalStorage.setItem('test-key', 'test-value');
    secureSessionStorage.setItemObject('session-data', {
      userId: '123',
      sessionId: 'abc',
    });

    // Retrieve data
    const value = secureLocalStorage.getItem('test-key');
    const sessionData = secureSessionStorage.getItemObject<{
      userId: string;
      sessionId: string;
    }>('session-data');

    logger.info('Secure storage example', { value, sessionData });
  };

  const handleLoggerExample = () => {
    // Example with PHI data (will be redacted in production)
    const patientData = {
      name: 'John Doe',
      ssn: '123-45-6789',
      email: 'john@example.com',
      phone: '555-1234',
      dateOfBirth: '01/15/1990',
    };

    logger.debug('Debug message', { data: 'This only shows in development' });
    logger.info('Info message', patientData);
    logger.warn('Warning message', { remaining: 10 });
  };

  const handleIncrementRedux = () => {
    dispatch({ type: 'increment' });
    logger.info('Redux state updated', { count: reduxCount + 1 });
  };

  const handleDecrementRedux = () => {
    dispatch({ type: 'decrement' });
    logger.info('Redux state updated', { count: reduxCount - 1 });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              React 19 Security Boilerplate
            </h1>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md">
                Tailwind Active
              </span>
              <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                Secure
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tailwind CSS Test Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tailwind CSS Test
            </h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Tailwind CSS is configured and working! Below are examples of
            Tailwind utilities.
          </p>

          {/* Tailwind Utilities Demo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-purple-50 rounded-md border border-purple-200">
              <h3 className="text-sm font-medium text-purple-900 mb-2">
                Colors
              </h3>
              <div className="flex gap-1.5">
                <div className="w-6 h-6 bg-red-500 rounded"></div>
                <div className="w-6 h-6 bg-yellow-500 rounded"></div>
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
            </div>
            <div className="p-3 bg-cyan-50 rounded-md border border-cyan-200">
              <h3 className="text-sm font-medium text-cyan-900 mb-2">
                Typography
              </h3>
              <p className="text-xs text-gray-600">Small</p>
              <p className="text-sm text-gray-700">Base</p>
              <p className="text-base font-bold text-gray-800">Bold</p>
            </div>
            <div className="p-3 bg-green-50 rounded-md border border-green-200">
              <h3 className="text-sm font-medium text-green-900 mb-2">
                Effects
              </h3>
              <div className="flex gap-1.5">
                <div className="w-8 h-8 bg-white rounded shadow-sm"></div>
                <div className="w-8 h-8 bg-white rounded shadow"></div>
                <div className="w-8 h-8 bg-white rounded shadow-md"></div>
              </div>
            </div>
          </div>
        </div>

        {/* State Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Local State Card */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Local State
              </h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                useState
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocalCount((c) => c + 1)}
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-md active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Increment
              </button>
              <div className="flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-2xl font-bold text-blue-600">
                  {localCount}
                </span>
              </div>
            </div>
          </div>

          {/* Redux State Card */}
          <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Redux State (Encrypted)
              </h2>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                Redux Toolkit
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={handleDecrementRedux}
                className="w-10 h-10 bg-red-600 text-white font-semibold rounded-lg shadow-sm hover:bg-red-700 hover:shadow-md active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center"
              >
                −
              </button>
              <div className="flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg border border-green-200">
                <span className="text-2xl font-bold text-green-600">
                  {reduxCount}
                </span>
              </div>
              <button
                onClick={handleIncrementRedux}
                className="w-10 h-10 bg-green-600 text-white font-semibold rounded-lg shadow-sm hover:bg-green-700 hover:shadow-md active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center justify-center"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Encrypted & persisted to localStorage
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Secure Storage Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-indigo-100 rounded flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                Secure Storage
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              All data is encrypted using AES encryption before storing in
              localStorage or sessionStorage.
            </p>
            <button
              onClick={handleSecureStorageExample}
              className="w-full px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 hover:shadow-md active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Test Secure Storage
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Check console for encrypted data logs
            </p>
          </div>

          {/* Logger Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="text-base font-semibold text-gray-900">
                PHI Logger
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Automatic redaction of Protected Health Information (PHI) for
              HIPAA compliance. PHI is always redacted by default.
            </p>
            <button
              onClick={handleLoggerExample}
              className="w-full px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-purple-700 hover:shadow-md active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Test Logger
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Check console - PHI will show as [REDACTED]
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>All data encrypted</span>
              <span>•</span>
              <span>PHI redaction enabled</span>
              <span>•</span>
              <span>Secure storage</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;
