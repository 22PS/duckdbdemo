import React from 'react';

const SQLResult = ({ result }) => {
  const { rows } = result;
  const isEmpty = rows && rows.length === 0;

  return (
    <div>
      {isEmpty ? (
        <p className="text-center text-gray-700font-medium">
          No results found.
        </p>
      ) : (
        <div className="max-h-[28vh] overflow-y-auto rounded-lg border border-gray-200">
          <table className="min-w-full table-auto bg-white">
            <thead className="sticky top-0 bg-gray-100 border-b z-10">
              <tr>
                {Object.keys(rows[0]).map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  {Object.values(row).map((value, i) => (
                    <td
                      key={i}
                      className="px-6 py-4 text-sm text-gray-700 border-t"
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SQLResult;
