import { useState } from 'react';
import viteLogo from '/vite.svg';
import reactLogo from './assets/react.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-4">
        <div className="flex justify-center gap-8 mb-8">
          <a
            href="https://vite.dev"
            target="_blank"
            className="transition-transform hover:scale-110"
            rel="noreferrer"
          >
            <img src={viteLogo} className="h-24 w-24" alt="Vite logo" />
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            className="transition-transform hover:scale-110"
            rel="noreferrer"
          >
            <img src={reactLogo} className="h-24 w-24" alt="React logo" />
          </a>
        </div>

        <h1 className="text-5xl font-bold mb-8 text-gray-900">UGC Agency Platform</h1>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <button onClick={() => setCount((count) => count + 1)} className="btn btn-primary mb-4">
            count is {count}
          </button>
          <p className="text-gray-600">
            Edit <code className="bg-gray-100 px-2 py-1 rounded">src/App.tsx</code> and save to test
            HMR
          </p>
        </div>

        <p className="text-gray-500">Click on the Vite and React logos to learn more</p>
      </div>
    </div>
  );
}

export default App;
