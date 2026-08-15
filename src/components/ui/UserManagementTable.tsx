'use client';
import React from 'react';
import { Loader2, Edit, Trash2, Eye } from 'lucide-react';

interface ColumnConfig {
    header: string;
    key: string;
    render?: (item: any) => React.ReactNode;
    align?: 'left' | 'center' | 'right';
    /** Optional width class for table-fixed layouts (e.g. w-[28%], w-20) */
    widthClass?: string;
    /** Hide this column in the desktop table on small tablets; still shown in mobile cards */
    hideOnMobile?: boolean;
}

interface UserManagementTableProps {
    data: any[];
    loading: boolean;
    columnConfig: ColumnConfig[];
    onEdit?: (item: any) => void;
    onDelete?: (id: number, name: string) => void;
    onView?: (id: number) => void;
    /** Makes entire row clickable (e.g. open profile) */
    onRowClick?: (item: any) => void;
    type: string;
    visibleActions?: ('edit' | 'delete' | 'view')[];
    /** Parent already provides card chrome — avoid nested border/scroll */
    embedded?: boolean;
}

function cellContent(col: ColumnConfig, item: any) {
    if (col.render) return col.render(item);
    if (col.key === 'firstName') {
        return (
            <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-app-bg border border-border-subtle flex items-center justify-center overflow-hidden shrink-0">
                    {item.profilePicture || item.coverImg ? (
                        <img
                            src={item.profilePicture || item.coverImg}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="text-accent-blue font-bold text-sm">
                            {(item.firstName?.[0] || item.courseName?.[0] || 'U').toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="font-semibold text-text-main text-sm truncate">
                        {item.firstName
                            ? `${item.firstName} ${item.lastName || ''}`
                            : item.courseName}
                    </p>
                </div>
            </div>
        );
    }
    return (
        <span
            className={`block truncate ${item[col.key] ? 'text-text-main' : 'text-text-muted italic text-xs'}`}
        >
            {item[col.key] || 'N/A'}
        </span>
    );
}

const ActionButtons = ({
    item,
    visibleActions,
    onView,
    onEdit,
    onDelete,
}: {
    item: any;
    visibleActions: ('edit' | 'delete' | 'view')[];
    onView?: (id: number) => void;
    onEdit?: (item: any) => void;
    onDelete?: (id: number, name: string) => void;
}) => (
    <div className="flex items-center gap-1.5">
        {visibleActions.includes('view') && (
            <button
                type="button"
                onClick={() => onView?.(item.uuid ?? item.id)}
                className="p-2.5 min-w-10 min-h-10 text-accent-blue hover:bg-accent-blue/10 rounded-lg"
                title="View"
            >
                <Eye size={18} strokeWidth={2} />
            </button>
        )}
        {visibleActions.includes('edit') && (
            <button
                type="button"
                onClick={() => onEdit?.(item)}
                className="p-2.5 min-w-10 min-h-10 text-amber-600 hover:bg-amber-500/10 rounded-lg"
                title="Edit"
            >
                <Edit size={18} strokeWidth={2} />
            </button>
        )}
        {visibleActions.includes('delete') && (
            <button
                type="button"
                onClick={() =>
                    onDelete?.(
                        item.id,
                        item.firstName || item.courseName || item.studentName
                    )
                }
                className="p-2.5 min-w-10 min-h-10 text-red-500 hover:bg-red-500/10 rounded-lg"
                title="Delete"
            >
                <Trash2 size={18} strokeWidth={2} />
            </button>
        )}
    </div>
);

const UserManagementTable: React.FC<UserManagementTableProps> = ({
    data,
    loading,
    columnConfig,
    onEdit,
    onDelete,
    onView,
    onRowClick,
    type,
    visibleActions = [],
    embedded = false,
}) => {
    const showActionsColumn = (visibleActions || []).length > 0;
    const chrome = embedded ? '' : 'rounded-xl border border-border-subtle bg-card-bg shadow-sm';

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center py-20 bg-card-bg ${chrome}`}>
                <Loader2 className="animate-spin text-accent-blue mb-3" size={32} />
                <p className="text-text-muted font-medium text-sm">Loading {type}s...</p>
            </div>
        );
    }

    const rows = data || [];

    return (
        <div className={`w-full max-w-full min-w-0 ${chrome}`}>
            {/* Mobile: stacked cards so columns never crush */}
            <div className="md:hidden divide-y divide-border-subtle">
                {rows.length === 0 ? (
                    <p className="text-center py-16 text-text-muted text-sm px-4">
                        No {type.toLowerCase()}s found.
                    </p>
                ) : (
                    rows.map((item, idx) => (
                        <div
                            key={item.uuid || item.id || idx}
                            onClick={() => onRowClick?.(item)}
                            className={`p-4 space-y-3 ${onRowClick ? 'cursor-pointer active:bg-sidebar-to/10' : ''}`}
                        >
                            {columnConfig.map((col, colIdx) => (
                                <div
                                    key={col.key || colIdx}
                                    className={
                                        colIdx === 0
                                            ? 'min-w-0'
                                            : 'flex items-start justify-between gap-3'
                                    }
                                >
                                    {colIdx !== 0 && (
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted shrink-0 pt-0.5">
                                            {col.header}
                                        </span>
                                    )}
                                    <div
                                        className={`min-w-0 ${colIdx === 0 ? '' : 'text-right text-sm font-medium text-text-main'}`}
                                    >
                                        {cellContent(col, item)}
                                    </div>
                                </div>
                            ))}
                            {showActionsColumn && (
                                <div
                                    className="flex justify-end pt-1"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ActionButtons
                                        item={item}
                                        visibleActions={visibleActions}
                                        onView={onView}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Desktop / tablet: horizontal scroll instead of squashing columns */}
            <div className="hidden md:block w-full overflow-x-auto">
                <table className="w-full min-w-[720px] text-left border-collapse">
                    <thead>
                        <tr className="bg-table-header-bg">
                            {columnConfig.map((col, index) => (
                                <th
                                    key={index}
                                    className={`px-3 md:px-4 py-4 text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle ${
                                        col.widthClass || ''
                                    } ${
                                        col.align === 'center'
                                            ? 'text-center'
                                            : col.align === 'right'
                                              ? 'text-right'
                                              : ''
                                    }`}
                                >
                                    {col.header}
                                </th>
                            ))}
                            {showActionsColumn && (
                                <th className="w-[108px] px-3 md:px-4 py-4 text-xs font-bold uppercase tracking-wider text-text-muted border-b border-border-subtle text-right">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle">
                        {rows.length > 0 ? (
                            rows.map((item, idx) => (
                                <tr
                                    key={item.uuid || item.id || idx}
                                    onClick={() => onRowClick?.(item)}
                                    className={`group hover:bg-sidebar-to/10 ${
                                        onRowClick ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {columnConfig.map((col, colIdx) => (
                                        <td
                                            key={col.key || colIdx}
                                            className={`px-3 md:px-4 py-4 text-sm font-medium text-text-main overflow-hidden ${
                                                col.align === 'center'
                                                    ? 'text-center'
                                                    : col.align === 'right'
                                                      ? 'text-right'
                                                      : ''
                                            }`}
                                        >
                                            {cellContent(col, item)}
                                        </td>
                                    ))}
                                    {showActionsColumn && (
                                        <td
                                            className="px-3 md:px-4 py-4 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="flex items-center justify-end opacity-80 group-hover:opacity-100">
                                                <ActionButtons
                                                    item={item}
                                                    visibleActions={visibleActions}
                                                    onView={onView}
                                                    onEdit={onEdit}
                                                    onDelete={onDelete}
                                                />
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columnConfig.length + (showActionsColumn ? 1 : 0)}
                                    className="text-center py-16 text-text-muted text-sm"
                                >
                                    No {type.toLowerCase()}s found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementTable;
