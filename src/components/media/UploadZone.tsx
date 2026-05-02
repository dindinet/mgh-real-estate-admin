import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Cloud, Loader2, FileCheck, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import imageCompression from 'browser-image-compression';
interface UploadZoneProps {
  propertyRef: string;
  onUploadComplete: (urls: string[]) => void;
}
type UploadState = 'idle' | 'optimizing' | 'uploading';
export function UploadZone({ propertyRef, onUploadComplete }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const processFiles = useCallback(async (files: File[]) => {
    if (!propertyRef) {
      toast.error('Invalid property context');
      return;
    }
    try {
      // 1. Optimization Phase (Client-side)
      setState('optimizing');
      const optimizedFiles: File[] = [];
      const compressionOptions = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          try {
            const compressedFile = await imageCompression(file, compressionOptions);
            optimizedFiles.push(new File([compressedFile], file.name, { type: file.type }));
          } catch (e) {
            optimizedFiles.push(file);
          }
        }
        setProgress(10 + ((i + 1) / files.length) * 40);
      }
      // 2. Real Upload Phase (API Call)
      setState('uploading');
      const formData = new FormData();
      optimizedFiles.forEach(file => formData.append('files', file));
      const response = await fetch(`/api/properties/${propertyRef}/images`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Server upload failed');
      }
      setProgress(100);
      toast.success(`Successfully synchronized ${result.data.urls.length} images`);
      onUploadComplete(result.data.urls);
      setState('idle');
      setProgress(0);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error instanceof Error ? error.message : 'Media pipeline failed');
      setState('idle');
      setProgress(0);
    }
  }, [onUploadComplete, propertyRef]);
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    processFiles(acceptedFiles);
  }, [processFiles]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: state !== 'idle',
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/zip': ['.zip']
    }
  });
  const getStatusText = () => {
    switch (state) {
      case 'optimizing': return 'Optimizing Assets...';
      case 'uploading': return 'Syncing with MGH Cloud...';
      default: return 'Processing Media...';
    }
  };
  return (
    <div className="flex flex-col h-full gap-6">
      <div
        {...getRootProps()}
        className={cn(
          "flex-1 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group",
          isDragActive ? "border-primary bg-primary/5 scale-[0.99] ring-4 ring-primary/10 shadow-inner" : "border-muted-foreground/20 hover:bg-muted/30 hover:border-muted-foreground/40",
          state !== 'idle' && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-5 text-center px-8">
          <div className={cn(
            "h-24 w-24 rounded-3xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-lg",
            isDragActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
          )}>
            {isDragActive ? <FileCheck className="h-12 w-12 animate-bounce" /> : <Upload className="h-12 w-12" />}
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-display font-bold tracking-tight">
              {isDragActive ? "Release to Sync" : "Cloud Import"}
            </p>
            <p className="text-muted-foreground max-w-[280px] mx-auto text-sm leading-relaxed">
              Drag images here for automated processing and persistent storage in the MGH database.
            </p>
          </div>
        </div>
      </div>
      {state !== 'idle' && (
        <div className="space-y-4 p-8 bg-muted/40 rounded-[2.5rem] animate-slide-up border border-border/50 shadow-soft">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-pulse" />
              </div>
              <span className="font-bold text-foreground text-lg">{getStatusText()}</span>
            </div>
            <span className="font-mono font-black text-primary text-xl">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 rounded-full bg-background" />
        </div>
      )}
    </div>
  );
}