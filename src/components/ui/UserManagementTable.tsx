'use client';
import React from 'react';
import { Loader2, Edit, Trash2, Eye } from 'lucide-react';

interface ColumnConfig {
    header: string;
    key: string;
    render?: (item: any) => React.ReactNode; // Custom UI ke liye (badges, etc.)
    align?: 'left' | 'center' | 'right';
}

interface UserManagementTableProps {
    data: any[];
    loading: boolean;
    columnConfig: ColumnConfig[]; // Parent se column definitions
    onEdit?: (item: any) => void;
    onDelete?: (id: number) => void;
    onView?: (id: number) => void;
    type: string;
    visibleActions?: ('edit' | 'delete' | 'view')[];
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
    data, loading, columnConfig, onEdit, onDelete, onView, type, visibleActions = []
}) => {

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
                <p className="text-gray-500 font-medium text-sm">Loading {type}s...</p>
            </div>
        );
    }
    console.log('data:', data);
    const showActionsColumn = visibleActions.length > 0;

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100 font-bold text-gray-400 uppercase text-[11px] tracking-widest">
                        {columnConfig.map((col, index) => (
                            <th key={index} className={`px-6 py-5 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}>
                                {col.header}
                            </th>
                        ))}
                        {showActionsColumn && <th className="px-6 py-5 text-right">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {data.length > 0 ? (
                        // Humne yahan 'index' (idx) add kiya hai fallback ke liye
                        data.map((item, idx) => (
                            <tr
                                // Agar item.id missing ho toh index (idx) use hoga
                                key={item.id || idx}
                                className="hover:bg-blue-50/20 transition-colors group"
                            >
                                {columnConfig.map((col, colIdx) => (
                                    <td
                                        // Column ke liye bhi col.key ya index use karein
                                        key={col.key || colIdx}
                                        className={`px-6 py-4 whitespace-nowrap text-sm ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                                    >
                                        {col.render ? col.render(item) : (item[col.key] || 'N/A')}
                                    </td>
                                ))}

                                {showActionsColumn && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex items-center justify-end gap-1 text-gray-400">
                                            {visibleActions.includes('view') && (
                                                <button onClick={() => onView?.(item.id)} className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                    <Eye size={18} />
                                                </button>
                                            )}
                                            {visibleActions.includes('edit') && (
                                                <button onClick={() => onEdit?.(item)} className="p-2 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all">
                                                    <Edit size={18} />
                                                </button>
                                            )}
                                            {visibleActions.includes('delete') && (
                                                <button onClick={() => onDelete?.(item.id)} className="p-2 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columnConfig.length + (showActionsColumn ? 1 : 0)} className="text-center py-20 text-gray-400 font-medium">
                                No {type} records found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementTable;