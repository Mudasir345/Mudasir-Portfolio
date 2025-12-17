"use server";

import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

// Set upload directory (public/uploads)
const UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

// Ensure upload directory exists
async function ensureDir(dirPath: string) {
    try {
        await fs.access(dirPath);
    } catch (e) {
        await fs.mkdir(dirPath, { recursive: true });
    }
}

export async function uploadFile(formData: FormData, folder: string = "misc") {
    try {
        const file = formData.get("file") as File;
        
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Validate file type
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");

        if (!isImage && !isVideo) {
            return { success: false, error: "Invalid file type. Only images and videos are allowed." };
        }

        // Validate size (10MB image, 50MB video)
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return { success: false, error: `File too large. Max size: ${isVideo ? "50MB" : "10MB"}` };
        }

        // Create unique filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}-${safeName}`;
        
        // Target directory
        const targetDir = path.join(UPLOAD_DIR, folder);
        await ensureDir(targetDir);

        // Allow write
        const filePath = path.join(targetDir, filename);
        await fs.writeFile(filePath, buffer);

        // Return relative path for frontend use
        const publicPath = `/uploads/${folder}/${filename}`;
        
        return { 
            success: true, 
            filePath: publicPath, 
            mediaType: isVideo ? "video" : "image" 
        };

    } catch (error) {
        console.error("Upload error:", error);
        return { success: false, error: "Upload failed" };
    }
}

export async function deleteFile(fileUrl: string) {
    try {
        // Prevent directory traversal attacks
        if (fileUrl.includes("..")) {
            return { success: false, error: "Invalid path" };
        }

        // Extract relative path if full URL is passed (though we expect relative)
        const relativePath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
        
        // Only allow deleting from public/uploads
        if (!relativePath.startsWith("uploads/")) {
             // If it's not in uploads (e.g. default assets), don't delete
             return { success: true, message: "Skipped deleting default asset" };
        }

        const absolutePath = path.join(process.cwd(), "public", relativePath);
        
        await fs.unlink(absolutePath);
        
        return { success: true };
    } catch (error) {
        console.error("Delete error:", error);
        // We return true even if file doesn't exist to not block the UI process
        return { success: true, message: "File not found or already deleted" }; 
    }
}
