"use client";
/**
 * FILE:    DataTable.tsx
 * PURPOSE: Generic typed data table — column definitions, empty + loading states
 */
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/Spinner";

export interface Column<T> {
  key:     string;
  header:  string;
  width?:  string;
  render:  (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns:       Column<T>[];
  data:          T[];
  isLoading?:    boolean;
  emptyMessage?: string;
  rowKey:        (row: T) => string;
  onRowClick?:   (row: T) => void;
}

export function DataTable<T>({
  columns, data, isLoading,
  emptyMessage = "No data found.",
  rowKey, onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              {columns.map((col) => (
                <th key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-gray-500",
                    "uppercase tracking-wide whitespace-nowrap",
                    col.width
                  )}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <Spinner className="mx-auto" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}
                  className="py-16 text-center text-sm text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={rowKey(row)}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-colors",
                    onRowClick && "cursor-pointer hover:bg-gray-50/80"
                  )}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-gray-700">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}