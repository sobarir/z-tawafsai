import type { ColumnDef } from '@tanstack/react-table';
import { RowActionsCell } from '@/components/shared/row-actions-cell';

interface ActionsColumnOptions<TData> {
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (row: TData) => void;
  onDelete: (row: TData) => void;
  /** Optional leading action (e.g. a "view"/"manage" drill-in). */
  viewLabel?: string;
  onView?: (row: TData) => void;
}

export function actionsColumn<TData>({
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  viewLabel,
  onView,
}: ActionsColumnOptions<TData>): ColumnDef<TData> {
  return {
    id: 'actions',
    header: actionsLabel,
    cell: ({ row }) => (
      <RowActionsCell
        openMenuLabel={openMenuLabel}
        actions={[
          ...(viewLabel && onView
            ? [{ label: viewLabel, onClick: () => onView(row.original) }]
            : []),
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
