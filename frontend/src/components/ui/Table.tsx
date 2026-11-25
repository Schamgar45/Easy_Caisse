import React from "react";

interface TableProps {
  columns: string[];
  data: Record<string, any>[];
  rowKey?: string;
  renderCell?: (value: any, column: string, row: any) => React.ReactNode;
  className?: string;
}

const Table: React.FC<TableProps> = ({ columns, data, rowKey = "id", renderCell, className }) => {
  return (
    <div className={`overflow-x-auto ${className || ""}`}>
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th key={col} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {col}
              </th>
            ))}
            <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.map((row) => (
            <tr key={row[rowKey]} className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => {
                const value = row[col];
                return (
                  <td key={col} className="px-6 py-4 text-sm text-slate-700">
                    {renderCell ? renderCell(value, col, row) : value}
                  </td>
                );
              })}
              <td className="px-6 py-4 text-right">
                <button className="text-slate-400 hover:text-emerald-600 p-1.5 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                </button>
                <button className="ml-2 text-slate-400 hover:text-emerald-600 p-1.5 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export { Table };