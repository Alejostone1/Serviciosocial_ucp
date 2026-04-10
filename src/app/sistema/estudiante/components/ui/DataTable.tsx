import React from 'react';
import { EmptyState } from './EmptyState';
import { Inbox } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    emptyState?: {
        icon?: any;
        title: string;
        description: string;
    };
    onRowClick?: (item: T) => void;
}

export function DataTable<T extends { id?: string | number }>({
    columns,
    data,
    emptyState,
    onRowClick
}: DataTableProps<T>) {

    if (!data || data.length === 0) {
        return (
            <EmptyState
                icon={emptyState?.icon || Inbox}
                title={emptyState?.title || "No hay datos"}
                description={emptyState?.description || "Aún no se ha registrado información en esta sección."}
            />
        );
    }

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm hide-scrollbar">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium tracking-wide">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={twMerge(clsx("px-6 py-4 whitespace-nowrap", col.className))}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.map((item, rowIndex) => (
                        <tr
                            key={item.id || rowIndex}
                            className={twMerge(clsx(
                                "bg-white transition-colors duration-200",
                                onRowClick ? "cursor-pointer hover:bg-slate-50/80 hover:shadow-sm" : "hover:bg-slate-50/50"
                            ))}
                            onClick={() => onRowClick && onRowClick(item)}
                        >
                            {columns.map((col, colIndex) => (
                                <td
                                    key={colIndex}
                                    className={twMerge(clsx("px-6 py-4", col.className))}
                                >
                                    {col.cell
                                        ? col.cell(item)
                                        : (col.accessorKey ? String(item[col.accessorKey]) : null)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
