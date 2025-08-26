"use client";

import { XIcon } from "lucide-react";
import { UploadDropzone } from "../lib/uploadthing";

interface ImageUploadProps {
  onChange: (url: string) => void;
  value: string;
  endpoint: "postImage";
}

function ImageUpload({ endpoint, onChange, value }: ImageUploadProps) {
  if (value) {
    return (
      <div className="relative size-40">
        <img
          src={value}
          alt="Upload"
          className="rounded-md size-40 object-cover"
        />
        <button
          className="absolute top-0 right-0 bg-red-400 p-1 rounded-full shadow-sm"
          type="button"
          onClick={() => onChange("")}
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        onChange(res?.[0].url!);
      }}
      onUploadError={(error: Error) => {
        console.log("Upload failed:", error);
      }}
    />
  );
}

export default ImageUpload;
