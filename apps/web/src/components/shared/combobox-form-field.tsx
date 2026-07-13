'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface ComboboxFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  options: ComboboxOption[];
  disabled?: boolean;
  searchPlaceholder?: string;
}

export function ComboboxFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  disabled,
  searchPlaceholder,
}: ComboboxFormFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Combobox
              options={options}
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              searchPlaceholder={searchPlaceholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
