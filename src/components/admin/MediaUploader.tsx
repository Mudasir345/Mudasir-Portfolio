"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, Loader2, Image as ImageIcon, Video, Trash2 } from "lucide-react";
import { uploadFile, deleteFile } from "@/actions/upload";

interface MediaUploaderProps {
    currentFile?: string;
    folder: string;
    onUploadComplete: (path: string, type: "image" | "video") => void;
    onRemove: () => void;
}

const MediaUploader = ({ currentFile, folder, onUploadComplete, onRemove }: MediaUploaderProps) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isVideo = currentFile?.endsWith(".mp4") || currentFile?.endsWith(".webm");

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const file = files[0];
        setUploading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Delete old file if exists and is an upload (not default asset)
            if (currentFile && currentFile.includes("/uploads/")) {
                await deleteFile(currentFile);
            }

            const result = await uploadFile(formData, folder);

            if (result.success && result.filePath) {
                onUploadComplete(result.filePath, result.mediaType as "image" | "video");
            } else {
                setError(result.error || "Upload failed");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setUploading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleRemove = async () => {
        if (!currentFile) return;

        if (confirm("Are you sure you want to remove this file?")) {
            if (currentFile.includes("/uploads/")) {
                await deleteFile(currentFile);
            }
            onRemove();
        }
    };

    return (
        <div className="w-full">
            {currentFile ? (
                <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-black/20">
                    {isVideo ? (
                        <video
                            src={currentFile}
                            className="w-full h-48 object-cover"
                            controls
                        />
                    ) : (
                        <div className="relative w-full h-48">
                            <img
                                src={currentFile}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            title="Replace"
                        >
                            <UploadCloud size={20} />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-500 transition-colors"
                            title="Remove"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging
                            ? "border-cyan-500 bg-cyan-500/10"
                            : "border-white/10 hover:border-white/30 hover:bg-white/5"
                        }`}
                >
                    {uploading ? (
                        <Loader2 className="animate-spin text-cyan-500 mb-2" size={32} />
                    ) : (
                        <UploadCloud className="text-gray-400 mb-2" size={32} />
                    )}
                    <p className="text-sm text-gray-400 font-medium">
                        {uploading ? "Uploading..." : "Click or Drag Media Here"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Images (10MB) or Videos (50MB)</p>
                </div>
            )}

            {error && (
                <p className="text-xs text-red-400 mt-2">{error}</p>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
            />
        </div>
    );
};

export default MediaUploader;
