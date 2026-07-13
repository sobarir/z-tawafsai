'use client';

import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';

interface LabeledComboboxProps {
  label: string;
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
}

export function LabeledCombobox({
  label,
  options,
  value,
  onChange,
}: LabeledComboboxProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      <Combobox options={options} value={value} onChange={onChange} />
    </div>
  );
}
