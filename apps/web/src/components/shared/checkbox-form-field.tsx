'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';

interface CheckboxFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  id: string;
}

export function CheckboxFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  id,
}: CheckboxFormFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormControl>
              <Checkbox
                id={id}
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            </FormControl>
            <Label htmlFor={id}>{label}</Label>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
