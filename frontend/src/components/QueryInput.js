import React, { useState, useRef } from 'react';
import axios from 'axios';
import { AiOutlineSend } from 'react-icons/ai';
import SQLResult from './SQLResult';

const QueryInput = ({ schema }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  const handleGenerateSQL = async (e) => {
    if (!query) return alert('Please enter a query');
    try {
      const response = await axios.post(
        'https://duckdbdemo-backend.vercel.app/api/generate-sql',
        {
          query,
          schema,
        }
      );
      const sql = response.data.sql;
      const res = await axios.post('https://duckdbdemo-backend.vercel.app/api/execute-query', {
        sql,
      });
      setResult({ rows: res.data.result });
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.log(err);
      alert('Failed to generate query');
    }
  };

  return (
    <>
      <div className="pt-1 pb-1 px-5 mt-4 bg-white rounded-md shadow-md max-w-2xl mx-auto mb-6">
        <h2 className="text-xl text-center font-semibold mb-3 text-gray-700">
          Enter Your Query
        </h2>

        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your query in natural language..."
            className="border border-gray-300 rounded-lg p-3 w-full h-32 focus:outline-none focus:ring-1 focus:ring-gray-700 resize-none"
          />
          <button
            onClick={handleGenerateSQL}
            className="absolute bottom-2 right-2 w-lg flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-lg transition-colors scroll-m-3"
          >
            <AiOutlineSend className="text-xl" />
            Fetch Data
          </button>
        </div>
      </div>
      <div ref={resultRef}>{result && <SQLResult result={result} />}</div>
    </>
  );
};

export default QueryInput;
