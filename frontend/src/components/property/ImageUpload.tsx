"use client";
/**
 * FILE:    frontend/src/components/property/ImageUpload.tsx
 * PURPOSE: Drag-and-drop image upload zone with previews and remove button.
 *          Accepts File[] and calls onChange. Upload to API happens after
 *          property is created/saved in PropertyForm.
 */
import { useRef, useState } from "react";
import { UploadCloud, X, ImageIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  files:     File[];
  onChange:  (files: File[]) => void;
  maxFiles?: number;
}

export function ImageUpload({ files, onChange, maxFiles = 10 }: ImageUploadProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) => f.type.startsWith("image/"));
    const merged = [...files, ...valid].slice(0, maxFiles);
    onChange(merged);
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 text-center",
          "cursor-pointer transition-all duration-200",
          dragging
            ? "border-brand-400 bg-brand-50"
            : "border-gray-200 hover:border-brand-300 hover:bg-gray-50/60",
          files.length >= maxFiles && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
            dragging ? "bg-brand-100 text-brand-600" : "bg-gray-100 text-gray-400"
          )}>
            <UploadCloud size={22} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {dragging ? "Drop images here" : "Click to upload or drag & drop"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              PNG, JPG, WEBP — up to {maxFiles} images
            </p>
          </div>
        </div>
        {files.length > 0 && (
          <p className="mt-3 text-xs text-brand-600 font-medium">
            {files.length} / {maxFiles} images selected
          </p>
        )}
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {files.map((file, i) => {
            const url = URL.createObjectURL(file);
            return (
              <div key={i} className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={file.name} className="w-full h-full object-cover" />

                {/* Primary badge on first image */}
                {i === 0 && (
                  <div className="absolute bottom-1 left-1 flex items-center gap-1
                                  px-1.5 py-0.5 rounded-md bg-amber-400/90 text-amber-900 text-xs font-medium">
                    <Star size={9} className="fill-current" /> Primary
                  </div>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60
                             text-white flex items-center justify-center
                             opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={11} />
                </button>

                {/* Index */}
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full
                                bg-black/50 text-white text-xs flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
            );
          })}

          {/* Add more slot */}
          {files.length < maxFiles && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-200
                         flex flex-col items-center justify-center gap-1
                         text-gray-400 hover:border-brand-300 hover:text-brand-500
                         transition-colors"
            >
              <ImageIcon size={18} />
              <span className="text-xs">Add more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}