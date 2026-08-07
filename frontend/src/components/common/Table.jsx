import React from 'react';
import EmptyState from './EmptyState';
import { Database } from 'lucide-react';

const Table = ({ columns, data, keyField = 'id', emptyMessage = 'No data available.', emptyAction, onRowClick }) => {
    if (!data || data.length === 0) {
        return (
            <div className="table-container">
                <EmptyState icon={Database} title="No Records" message={emptyMessage} action={emptyAction} />
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr 
                            key={row[keyField] || rowIndex} 
                            onClick={(e) => onRowClick && onRowClick(row, e)}
                            className={onRowClick ? 'clickable-row' : ''}
                        >
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
