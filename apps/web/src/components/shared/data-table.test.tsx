import type { ColumnDef } from '@tanstack/react-table';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DataTable } from './data-table';

interface Row {
  code: string;
  name: string;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: 'code', header: 'Code' },
  { accessorKey: 'name', header: 'Name' },
];

const data: Row[] = [
  { code: 'JFK', name: 'John F. Kennedy International' },
  { code: 'LAX', name: 'Los Angeles International' },
];

const baseProps = {
  columns,
  searchPlaceholder: 'Search...',
  emptyMessage: 'No results found.',
  previousLabel: 'Previous',
  nextLabel: 'Next',
  pageLabel: (current: number, total: number) => `Page ${current} of ${total}`,
};

describe('DataTable', () => {
  it('renders rows for the given data', () => {
    render(<DataTable {...baseProps} data={data} />);
    expect(screen.getByText('JFK')).toBeInTheDocument();
    expect(screen.getByText('LAX')).toBeInTheDocument();
  });

  it('shows the empty message when there is no data', () => {
    render(<DataTable {...baseProps} data={[]} />);
    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });

  it('shows the loading message while loading', () => {
    render(
      <DataTable
        {...baseProps}
        data={[]}
        isLoading
        loadingMessage="Loading..."
      />,
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('filters rows via the global search input', () => {
    render(<DataTable {...baseProps} data={data} />);

    fireEvent.change(screen.getByPlaceholderText('Search...'), {
      target: { value: 'LAX' },
    });

    expect(screen.queryByText('JFK')).not.toBeInTheDocument();
    expect(screen.getByText('LAX')).toBeInTheDocument();
  });
});
