'use client';

import { Input } from '@/components/ui/input';

interface OffsetDateTimeFieldProps {
  value: string | undefined;
  onChange: (value: string) => void;
  disabled?: boolean;
  offsetPlaceholder?: string;
}

/**
 * Schedules are authored in local airport time with an explicit UTC offset
 * (offsetDateTimeSchema), not UTC — no native browser input captures both, so
 * this pairs a plain datetime-local picker with a text offset field and
 * composes them into a single ISO string like '2026-06-01T10:45:00+09:00'.
 */
function splitValue(value?: string): { local: string; offset: string } {
  if (!value) return { local: '', offset: '+00:00' };
  const match = value.match(/^(.*?)(Z|[+-]\d{2}:\d{2})$/);
  if (!match) return { local: value.slice(0, 16), offset: '+00:00' };
  const [, isoPart = '', offset = '+00:00'] = match;
  return {
    local: isoPart.slice(0, 16),
    offset: offset === 'Z' ? '+00:00' : offset,
  };
}

export function OffsetDateTimeField({
  value,
  onChange,
  disabled,
  offsetPlaceholder = '+09:00',
}: OffsetDateTimeFieldProps) {
  const { local, offset } = splitValue(value);

  const emit = (nextLocal: string, nextOffset: string) => {
    onChange(nextLocal ? `${nextLocal}:00${nextOffset}` : '');
  };

  return (
    <div className="flex gap-2">
      <Input
        type="datetime-local"
        value={local}
        disabled={disabled}
        onChange={(e) => emit(e.target.value, offset)}
        className="flex-1"
      />
      <Input
        value={offset}
        disabled={disabled}
        placeholder={offsetPlaceholder}
        onChange={(e) => emit(local, e.target.value)}
        className="w-24"
      />
    </div>
  );
}
