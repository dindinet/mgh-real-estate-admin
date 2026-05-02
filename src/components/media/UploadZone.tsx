import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Cloud, Loader2, FileCheck, AlertCircle, Sparkles } from 'lucide-react';
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
  const processFiles = async (files: File[]) => {
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
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
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
        setProgress(20 + ((i + 1) / allFiles.length) * 60);
      }
      // 3. Simulated Upload Phase
      setState('uploading');
      setProgress(90);
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(100);
      toast.success(`Successfully processed ${optimizedUrls.length} images`);
      onUploadComplete(optimizedUrls);
      setState('idle');
    } catch (error) {
      console.error('Processing failed:', error);
      toast.error('Failed to process media. Archive may be corrupted.');
      setState('idle');
    }
  };
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    processFiles(acceptedFiles);
  }, [onUploadComplete]);
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
      case 'optimizing': return 'Optimizing Quality...';
      case 'uploading': return 'Securing Assets...';
      default: return 'Processing Media...';
    }
  };
  return (
    <div className="flex flex-col h-full gap-6">
      <div
        {...getRootProps()}
        className={cn(
          "flex-1 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group",
          isDragActive ? "border-primary bg-primary/5 scale-[0.99] ring-4 ring-primary/10" : "border-muted-foreground/20 hover:bg-muted/30 hover:border-muted-foreground/40",
          state !== 'idle' && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-5 text-center px-8">
          <div className={cn(
            "h-20 w-20 rounded-3xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
            isDragActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
          )}>
            {isDragActive ? <FileCheck className="h-10 w-10 animate-bounce" /> : <Upload className="h-10 w-10" />}
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-display font-bold tracking-tight">
              {isDragActive ? "Release to process" : "Drop media here"}
            </p>
            <p className="text-muted-foreground max-w-[240px] mx-auto text-sm">
              Supports individual images or <span className="font-semibold text-foreground">ZIP archives</span>
            </p>
          </div>
          <div className="px-6 py-2.5 bg-secondary/80 backdrop-blur rounded-full text-sm font-bold shadow-sm group-hover:bg-secondary transition-colors">
            Browse Files
          </div>
        </div>
      </div>
      {state !== 'idle' && (
        <div className="space-y-4 p-6 bg-muted/30 rounded-3xl animate-slide-up border border-border/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-yellow-500 animate-pulse" />
              </div>
              <span className="font-bold text-foreground">{getStatusText()}</span>
            </div>
            <span className="font-mono font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2.5 rounded-full bg-background" />
        </div>
      )}
      <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-3xl flex gap-4 text-sm text-blue-800 dark:text-blue-300 animate-pulse-subtle">
        <div className="h-10 w-10 rounded-2xl bg-blue-100 dark:bg-blue-800/40 flex items-center justify-center shrink-0">
          <Cloud className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-blue-900 dark:text-blue-100">Smart Media Pipeline</p>
          <p className="opacity-80 leading-relaxed">
            Archives are unpacked locally and images are optimized to under 1MB for blistering fast performance.
          </p>
        </div>
      </div>
    </div>
  );
}