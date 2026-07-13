'use client';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

interface FormDialogActionsProps {
  cancelLabel: string;
  saveLabel: string;
  onCancel: () => void;
  submitting: boolean;
}

export function FormDialogActions({
  cancelLabel,
  saveLabel,
  onCancel,
  submitting,
}: FormDialogActionsProps) {
  return (
    <DialogFooter>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCancel}
        disabled={submitting}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" size="sm" loading={submitting}>
        {saveLabel}
      </Button>
    </DialogFooter>
  );
}
