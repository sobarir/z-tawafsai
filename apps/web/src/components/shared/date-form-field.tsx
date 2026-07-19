'use client';

import { CalendarIcon } from 'lucide-react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/libs/utils';

interface DateFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
}

/** A date-only value (z.iso.date(), 'YYYY-MM-DD') — no time component. */
export function DateFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
}: DateFormFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={'outline'}
                  className={cn(
                    'h-9 w-full pl-3 text-left font-normal bg-transparent dark:bg-input/30',
                    !field.value && 'text-muted-foreground',
                  )}
                >
                  <span className="truncate">
                    {field.value ? (
                      new Date(field.value).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </span>
                  <CalendarIcon className="ml-auto size-4 opacity-50 shrink-0" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  if (date) {
                    const offset = date.getTimezoneOffset();
                    const localDate = new Date(
                      date.getTime() - offset * 60 * 1000,
                    );
                    field.onChange(localDate.toISOString().split('T')[0]);
                  } else {
                    field.onChange(undefined);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
