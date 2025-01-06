import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ setSchema, setData }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) {
      return alert('Please select a CSV file');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(
        'https://duckdbdemo-backend.vercel.app/api/upload',
        formData
      );
      setSchema(res.data.schema);
      alert(res.data.message);

      const response = await axios.post('https://duckdbdemo-backend.vercel.app/api/get-data');
      setData({ rows: response.data.result });
    } catch (err) {
      alert('File upload failed!');
    }
  };

  return (
    <div className="pt-2 pb-1 px-5 bg-white rounded-md shadow-md max-w-2xl mx-auto mb-6">
      <h2 className="text-xl text-center font-semibold mb-4 text-gray-700">
        Upload a CSV File
      </h2>
      <div className="flex flex-col items-center justify-center mb-4">
        <label
          htmlFor="fileInput"
          className="bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 cursor-pointer hover:bg-gray-200 w-[50%] text-center mb-4 mt-2"
        >
          {file ? file.name : 'Choose File'}
        </label>
        <input
          id="fileInput"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleUpload}
          className="w-[50%] bg-gray-700 hover:bg-gray-900 text-white font-medium  py-2 px-4 rounded-lg transition-colors"
        >
          Upload
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
