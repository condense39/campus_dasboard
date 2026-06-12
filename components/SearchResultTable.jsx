import { Info } from 'lucide-react';

export default function SearchResultTable({ result }) {
  if (!result) return null;
  const { tableTitle, columns, rows, note } = result;
  
  return (
    <div className="mt-8 max-w-4xl mx-auto w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {tableTitle && <h2 className="text-xl font-bold text-gray-900">{tableTitle}</h2>}
      
      {note && (
        <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-600" />
          <p className="text-sm font-medium">{note}</p>
        </div>
      )}

      {columns && rows && rows.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500 font-medium">No results found.</p>
        </div>
      )}

      {columns && rows && rows.length > 0 && columns.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-green-600 text-white">
                  {columns.map((col, idx) => (
                    <th key={idx} className="py-3 px-4 text-sm font-medium whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="py-3 px-4 text-sm text-gray-700 border-b border-gray-100">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {rows && rows.length > 0 && (
        <p className="text-xs text-gray-500 mt-2 text-right">Showing {rows.length} result{rows.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  );
}