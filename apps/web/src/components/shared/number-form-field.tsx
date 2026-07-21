'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface NumberFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  step?: string;
  /** When true, an empty input becomes `undefined` instead of a required 0. */
  optional?: boolean;
  description?: React.ReactNode;
}

export function NumberFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  step,
  optional = false,
  description,
}: NumberFormFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              step={step}
              value={field.value ?? ''}
              onChange={(e) => {
                if (e.target.value === '') {
                  field.onChange(optional ? undefined : 0);
                  return;
                }
                field.onChange(Number(e.target.value));
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
