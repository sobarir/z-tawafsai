'use client';

import { UploadCloud, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { uploadFlyer } from '@/libs/api/generated/endpoints';
import { ApiError } from '@/libs/api/mutator';

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif)$/i;
const DEFAULT_ACCEPT = 'image/png,image/jpeg,image/webp,application/pdf';

interface FileUploadFormFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  accept?: string;
}

/**
 * Uploads a file to the API (POST /api/uploads/flyer) and stores the returned
 * URL in the form field. Goes through the generated `uploadFlyer` client, so it
 * inherits the session cookie + ApiError handling — no hand-written fetch.
 */
export function FileUploadFormField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  accept = DEFAULT_ACCEPT,
}: FileUploadFormFieldProps<TFieldValues>) {
  const t = useTranslations('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = field.value as string | undefined;
        const isImage = value ? IMAGE_EXT.test(value) : false;
        return (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="flex flex-col gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    // Reset so selecting the same file again re-fires onChange.
                    e.target.value = '';
                    if (!file) return;
                    setError(null);
                    setUploading(true);
                    try {
                      const body = new FormData();
                      body.append('file', file);
                      const result = await uploadFlyer({ body });
                      field.onChange(result.url);
                    } catch (err) {
                      setError(
                        err instanceof ApiError
                          ? err.message
                          : t('uploadError'),
                      );
                    } finally {
                      setUploading(false);
                    }
                  }}
                />

                {value ? (
                  <div className="flex items-center gap-3 rounded-md border p-2">
                    {isImage ? (
                      // Uploaded files live on the API origin; a plain img avoids
                      // next/image remote-host config for user-supplied URLs.
                      // biome-ignore lint/performance/noImgElement: dynamic external upload URL
                      <img
                        src={value}
                        alt=""
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm underline"
                      >
                        {value.split('/').pop()}
                      </a>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="ml-auto"
                      aria-label={t('remove')}
                      onClick={() => field.onChange(undefined)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit"
                  disabled={uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  <UploadCloud className="h-4 w-4" />
                  {uploading ? t('uploading') : t('uploadFile')}
                </Button>

                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
