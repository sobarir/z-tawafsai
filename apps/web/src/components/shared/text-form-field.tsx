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

interface TextFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  uppercase?: boolean;
  /** When true, an empty input becomes `undefined` instead of an empty string. */
  optional?: boolean;
}

export function TextFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  uppercase = false,
  optional = false,
}: TextFormFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ''}
              disabled={disabled}
              placeholder={placeholder}
              onChange={(e) => {
                const raw = uppercase
                  ? e.target.value.toUpperCase()
                  : e.target.value;
                field.onChange(optional ? raw || undefined : raw);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
