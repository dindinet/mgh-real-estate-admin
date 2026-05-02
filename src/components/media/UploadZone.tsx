import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Cloud, Loader2, FileCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
interface UploadZoneProps {
  onUploadComplete: (urls: string[]) => void;
}
export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    setProgress(0);
    // Simulate multi-file upload progress
    const totalFiles = acceptedFiles.length;
    let uploadedCount = 0;
    const interval = setInterval(() => {
      uploadedCount += 0.5;
      const newProgress = Math.min(90, (uploadedCount / totalFiles) * 100);
      setProgress(newProgress);
      if (uploadedCount >= totalFiles) {
        clearInterval(interval);
        setProgress(100);
        // Simulate generating URLs for uploaded local files
        // In a real app, these would be R2/S3 URLs
        const mockUrls = acceptedFiles.map(file => URL.createObjectURL(file));
        setTimeout(() => {
          onUploadComplete(mockUrls);
          setIsUploading(false);
        }, 500);
      }
    }, 200);
  }, [onUploadComplete]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/zip': ['.zip']
    }
  });
  return (
    <div className="flex flex-col h-full gap-6">
      <div
        {...getRootProps()}
        className={cn(
          "flex-1 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer",
          isDragActive ? "border-primary bg-primary/5 scale-[0.98]" : "border-muted-foreground/20 hover:bg-muted/30 hover:border-muted-foreground/40",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center px-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            {isDragActive ? <FileCheck className="h-8 w-8 animate-bounce" /> : <Upload className="h-8 w-8" />}
          </div>
          <div>
            <p className="text-xl font-display font-bold">
              {isDragActive ? "Drop files now" : "Drag and drop images here"}
            </p>
            <p className="text-muted-foreground mt-1">
              Supports JPG, PNG, WEBP and ZIP archives
            </p>
          </div>
          <div className="mt-2 px-4 py-2 bg-secondary rounded-lg text-sm font-medium">
            Or browse from your computer
          </div>
        </div>
      </div>
      {isUploading && (
        <div className="space-y-3 animate-slide-up">
          <div className="flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Processing Media...</span>
            </div>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 rounded-full" />
        </div>
      )}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl flex gap-3 text-sm text-blue-700 dark:text-blue-300">
        <Cloud className="h-5 w-5 shrink-0" />
        <p>
          <strong>Cloud Optimizer:</strong> Images are automatically resized and converted to modern formats during upload for peak performance.
        </p>
      </div>
    </div>
  );
}