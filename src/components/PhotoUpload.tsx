"use client";

import { useRef, useState } from "react";

export default function PhotoUpload({
  value,
  onChange,
  required,
}: {
  value: string;
  onChange: (url: string) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/photo", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="label">
        Your photo {required && <span className="text-red-600">*</span>}
        <span className="ml-1 font-normal text-gray-400">आपकी फोटो</span>
      </label>
      <div className="mt-1 flex items-center gap-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-blue-400"
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl text-gray-300">
              📷
            </span>
          )}
        </button>
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-md border border-blue-300 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : value ? "Change photo" : "Upload photo"}
          </button>
          <p className="mt-1 text-xs text-gray-400">JPG, PNG or WEBP, up to 5MB</p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
