'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

function toLocalInputValue(iso?: string): string {
  if (!iso) return '';
  return iso.slice(0, 16);
}

interface DateTimeFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
}

/**
 * A plain UTC instant (z.iso.datetime(), no offset) — distinct from flights'
 * OffsetDateTimeField, which pairs local time with an explicit UTC offset.
 */
export function DateTimeFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: DateTimeFormFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="datetime-local"
              value={toLocalInputValue(field.value)}
              onChange={(e) =>
                field.onChange(
                  e.target.value ? `${e.target.value}:00.000Z` : '',
                )
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
