'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Header,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/libs/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder: string;
  emptyMessage: string;
  previousLabel: string;
  nextLabel: string;
  pageLabel: (page: number, pageCount: number) => string;
  toolbar?: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  className?: string;
}

function SortableHeader<TData, TValue>({
  header,
}: {
  header: Header<TData, TValue>;
}) {
  if (header.isPlaceholder) return null;

  const content = flexRender(
    header.column.columnDef.header,
    header.getContext(),
  );
  if (!header.column.getCanSort()) return content;

  const sortDirection = header.column.getIsSorted();

  return (
    <button
      type="button"
      className="flex cursor-pointer items-center gap-1.5 select-none"
      onClick={header.column.getToggleSortingHandler()}
    >
      {content}
      {sortDirection === 'asc' ? (
        <ArrowUp className="size-3.5" />
      ) : sortDirection === 'desc' ? (
        <ArrowDown className="size-3.5" />
      ) : (
        <ArrowUpDown className="size-3.5 opacity-40" />
      )}
    </button>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder,
  emptyMessage,
  previousLabel,
  nextLabel,
  pageLabel,
  toolbar,
  isLoading,
  loadingMessage,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className={cn('flex w-full min-w-0 flex-col gap-4', className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder={searchPlaceholder}
          className="sm:max-w-xs"
        />
        {toolbar ? (
          <div className="flex shrink-0 items-center gap-2">{toolbar}</div>
        ) : null}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    <SortableHeader header={header} />
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {loadingMessage}
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {table.getPageCount() > 1 ? (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {pageLabel(
              table.getState().pagination.pageIndex + 1,
              table.getPageCount(),
            )}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {previousLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {nextLabel}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
