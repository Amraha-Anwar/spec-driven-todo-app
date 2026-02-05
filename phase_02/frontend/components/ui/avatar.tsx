"use client";

import { useState, useEffect } from "react";
import { User, Upload } from "lucide-react";

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  onImageChange?: (file: File) => void;
}

export function Avatar({ name, imageUrl, size = "md", editable = false, onImageChange }: AvatarProps) {
  const [preview, setPreview] = useState<string | null>(imageUrl || null);

  // Update preview when imageUrl prop changes (for global avatar updates)
  useEffect(() => {
    if (imageUrl !== undefined) {
      setPreview(imageUrl);
    }
  }, [imageUrl]);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-lg",
    lg: "w-20 h-20 text-2xl",
  };

  const initial = name?.charAt(0).toUpperCase() || "?";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageChange?.(file);
    }
  };

  return (
    <div className="relative group">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold glassmorphic border-2 border-pink-red/30 overflow-hidden`}
      >
        {preview ? (
          <img src={preview} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="glow-text">{initial}</span>
        )}
      </div>
      
      {editable && (
        <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
          <Upload className="w-4 h-4 text-white" />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      )}
    </div>
  );
}