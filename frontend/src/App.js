import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import QueryInput from './components/QueryInput';
import SQLResult from './components/SQLResult';

const App = () => {
  const [data, setData] = useState(null);
  const [schema, setSchema] = useState(null);
  return (
    <div className="p-3">
      <h1 className="text-[42px] font-bold text-center my-[12px] text-gray-950">
        DuckDB Demonstration
      </h1>
      <FileUpload setSchema={setSchema} setData={setData} />
      {data && <SQLResult result={data} />}
      <QueryInput schema={schema} />
    </div>
  );
};

export default App;
