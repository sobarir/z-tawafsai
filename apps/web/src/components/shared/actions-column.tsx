import type { ColumnDef } from '@tanstack/react-table';
import { RowActionsCell } from '@/components/shared/row-actions-cell';

interface ActionsColumnOptions<TData> {
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (row: TData) => void;
  onDelete: (row: TData) => void;
}

export function actionsColumn<TData>({
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: ActionsColumnOptions<TData>): ColumnDef<TData> {
  return {
    id: 'actions',
    header: actionsLabel,
    cell: ({ row }) => (
      <RowActionsCell
        openMenuLabel={openMenuLabel}
        actions={[
          { label: editLabel, onClick: () => onEdit(row.original) },
          {
            label: deleteLabel,
            onClick: () => onDelete(row.original),
            destructive: true,
          },
        ]}
      />
    ),
  };
}
