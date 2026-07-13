'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface RowAction {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface RowActionsCellProps {
  openMenuLabel: string;
  actions: RowAction[];
}

export function RowActionsCell({
  openMenuLabel,
  actions,
}: RowActionsCellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={openMenuLabel}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            variant={action.destructive ? 'destructive' : 'default'}
            onClick={action.onClick}
          >
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
