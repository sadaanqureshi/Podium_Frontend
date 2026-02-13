'use client';
import React from 'react';
import { Loader2, Edit, Trash2, Eye, User } from 'lucide-react';

interface ColumnConfig {
    header: string;
    key: string;
    render?: (item: any) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
}

interface UserManagementTableProps {
    data: any[];
    loading: boolean;
    columnConfig: ColumnConfig[];
    onEdit?: (item: any) => void;
    onDelete?: (id: number, name: string) => void;
    onView?: (id: number) => void;
    type: string;
    visibleActions?: ('edit' | 'delete' | 'view')[];
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
    data, loading, columnConfig, onEdit, onDelete, onView, type, visibleActions = []
}) => {

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 bg-card-bg">
                <Loader2 className="animate-spin text-accent-blue mb-2" size={40} />
                <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[10px]">Syncing {type} Intel...</p>
            </div>
        );
    }

    const showActionsColumn = (visibleActions || []).length > 0;

    return (
        <div className="overflow-x-auto rounded-[2rem]">
            <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                    {/* # DYNAMIC HEADER: Light Blue in Light Mode, Navy in Dark Mode */}
                    <tr className="bg-table-header-bg text-table-header-text">
                        {columnConfig.map((col, index) => (
                            <th
                                key={index}
                                className={`px-8 py-6 first:rounded-tl-[2rem] font-black uppercase text-[10px] tracking-[0.2em] border-b border-border-subtle ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                        {showActionsColumn && (
                            <th className="px-8 py-6 text-right rounded-tr-[2rem] font-black uppercase text-[10px] tracking-[0.2em] border-b border-border-subtle">
                                Control
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody className="bg-card-bg">
                    {(data || []).length > 0 ? (
                        data.map((item, idx) => (
                            <tr
                                key={item.id || idx}
                                className="group hover:bg-sidebar-to/20 transition-all duration-300"
                            >
                                {columnConfig.map((col, colIdx) => (
                                    <td
                                        key={col.key || colIdx}
                                        className={`px-8 py-5 border-b border-border-subtle whitespace-nowrap text-sm font-medium text-text-main ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                                    >
                                        {/* # SMART AUTO-UI (Avatar Logic) */}
                                        {col.key === 'firstName' ? (
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-app-bg border-2 border-card-bg shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                    {item.profilePicture || item.coverImg ? (
                                                        <img src={item.profilePicture || item.coverImg} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-accent-blue font-black text-xs">{(item.firstName?.[0] || item.courseName?.[0] || 'U').toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <p className="font-black text-text-main tracking-tight text-sm uppercase italic">
                                                    {item.firstName ? `${item.firstName} ${item.lastName || ''}` : item.courseName}
                                                </p>
                                            </div>
                                        ) : col.render ? (
                                            col.render(item)
                                        ) : (
                                            <span className={item[col.key] ? "text-text-main" : "text-text-muted italic text-[11px]"}>
                                                {item[col.key] || 'N/A'}
                                            </span>
                                        )}
                                    </td>
                                ))}

                                {showActionsColumn && (
                                    <td className="px-8 py-5 border-b border-border-subtle text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-70 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
                                            {visibleActions.includes('view') && (
                                                <button onClick={() => onView?.(item.id)} className="p-2.5 bg-sidebar-to/50 text-accent-blue rounded-xl hover:bg-accent-blue hover:text-white shadow-sm">
                                                    <Eye size={16} strokeWidth={2.5} />
                                                </button>
                                            )}
                                            {visibleActions.includes('edit') && (
                                                <button onClick={() => onEdit?.(item)} className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm">
                                                    <Edit size={16} strokeWidth={2.5} />
                                                </button>
                                            )}
                                            {visibleActions.includes('delete') && (
                                                <button
                                                    onClick={() => onDelete?.(item.id, item.firstName || item.courseName || item.studentName)}
                                                    className="p-2.5 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} strokeWidth={2.5} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columnConfig.length + 1} className="text-center py-32 text-text-muted font-black uppercase text-[10px] tracking-[0.3em]">
                                Terminal: No Records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementTable;