import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Cloud, Loader2, FileCheck, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import JSZip from 'jszip';
import imageCompression from 'browser-image-compression';
interface UploadZoneProps {
  onUploadComplete: (urls: string[]) => void;
}
type UploadState = 'idle' | 'extracting' | 'optimizing' | 'uploading';
export function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const processFiles = useCallback(async (files: File[]) => {
    try {
      const allFiles: File[] = [];
      // 1. Extraction Phase
      setState('extracting');
      setProgress(10);
      for (const file of files) {
        if (file.type === 'application/zip' || file.name.endsWith('.zip')) {
          const zip = await JSZip.loadAsync(file);
          const zipFiles = Object.values(zip.files);
          for (const zipEntry of zipFiles) {
            if (!zipEntry.dir && zipEntry.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
              const blob = await zipEntry.async('blob');
              allFiles.push(new File([blob], zipEntry.name, { type: 'image/jpeg' }));
            }
          }
        } else if (file.type.startsWith('image/')) {
          allFiles.push(file);
        }
      }
      if (allFiles.length === 0) {
        toast.error('No valid images found in selection');
        setState('idle');
        return;
      }
      // 2. Optimization Phase
      setState('optimizing');
      const optimizedUrls: string[] = [];
      const compressionOptions = {
        maxSizeMB: 0.8, // Slightly more aggressive for mobile
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };
      for (let i = 0; i < allFiles.length; i++) {
        const file = allFiles[i];
        try {
          const compressedFile = await imageCompression(file, compressionOptions);
          const url = URL.createObjectURL(compressedFile);
          optimizedUrls.push(url);
        } catch (e) {
          console.warn(`Failed to compress ${file.name}, using original`, e);
          optimizedUrls.push(URL.createObjectURL(file));
        }
        // Progress: 20% to 80%
        setProgress(20 + ((i + 1) / allFiles.length) * 60);
      }
      // 3. Simulated Upload Phase
      setState('uploading');
      setProgress(90);
      // Artificial delay to ensure user sees the "securing" state
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(100);
      toast.success(`Successfully processed ${optimizedUrls.length} images`);
      onUploadComplete(optimizedUrls);
      setState('idle');
    } catch (error) {
      console.error('Processing failed:', error);
      toast.error('Media pipeline failed. Please try smaller batches.');
      setState('idle');
    }
  }, [onUploadComplete]);
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
      case 'extracting': return 'Unpacking Archive...';
      case 'optimizing': return 'Compressing Assets...';
      case 'uploading': return 'Finalizing Bundle...';
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
              {isDragActive ? "Drop to Import" : "Import Media"}
            </p>
            <p className="text-muted-foreground max-w-[280px] mx-auto text-sm leading-relaxed">
              Selection can include individual photos or full <span className="font-bold text-foreground underline decoration-primary/30 underline-offset-4">ZIP archives</span>.
            </p>
          </div>
          <div className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl text-sm font-bold shadow-xl hover:brightness-110 transition-all active:scale-95">
            Browse File System
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
      <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30 rounded-3xl flex gap-5 text-sm items-center">
        <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center shrink-0">
          <Cloud className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-blue-900 dark:text-blue-100 uppercase tracking-widest text-[10px]">Cloud Optimization</p>
          <p className="opacity-80 leading-relaxed font-medium">
            Images are automatically resized and compressed client-side to ensure blistering fast portfolio load times.
          </p>
        </div>
      </div>
    </div>
  );
}