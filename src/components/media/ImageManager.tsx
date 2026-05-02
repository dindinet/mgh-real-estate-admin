import React, { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { SortableImage } from './SortableImage';
import { UploadZone } from './UploadZone';
import { Loader2, Save, X, Trash2, ImageIcon, RefreshCcw, Cloud } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
interface ImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyRef: string;
  initialImages: string[];
}
export function ImageManager({ isOpen, onClose, propertyRef, initialImages }: ImageManagerProps) {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (isOpen) {
      setImages(initialImages || []);
      setSelected(new Set());
    }
  }, [isOpen, initialImages]);
  const hasChanged = useMemo(() => {
    return JSON.stringify(images) !== JSON.stringify(initialImages);
  }, [images, initialImages]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const saveMutation = useMutation({
    mutationFn: (newImages: string[]) => {
      return api(`/api/properties/${propertyRef}`, {
        method: 'PATCH',
        body: JSON.stringify({ images: newImages }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyRef] });
      toast.success('Gallery order synchronized with cloud');
      onClose();
    },
    onError: () => toast.error('Failed to sync gallery order'),
  });
  const deleteMutation = useMutation({
    mutationFn: async (url: string) => {
      return api(`/api/properties/${propertyRef}/images`, {
        method: 'DELETE',
        body: JSON.stringify({ url }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyRef] });
    }
  });
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  const removeImage = async (url: string) => {
    const previous = [...images];
    setImages(prev => prev.filter(img => img !== url));
    try {
      await deleteMutation.mutateAsync(url);
      toast.success('Cloud asset purged');
    } catch (e) {
      setImages(previous);
      toast.error('Asset removal failed');
    }
  };
  const deleteSelected = async () => {
    if (!selected.size) return;
    const targets = Array.from(selected);
    const previous = [...images];
    setImages(prev => prev.filter(img => !selected.has(img)));
    setSelected(new Set());
    try {
      await Promise.all(targets.map(url => deleteMutation.mutateAsync(url)));
      toast.success(`Purged ${targets.length} assets`);
    } catch (e) {
      setImages(previous);
      toast.error('Partial bulk removal failure');
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0 overflow-hidden bg-background rounded-[3rem] border-none shadow-2xl">
        <DialogHeader className="p-10 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-4xl font-display font-black text-primary flex items-center gap-4">
                Media Intelligence Hub
                {deleteMutation.isPending && <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground opacity-50" />}
              </DialogTitle>
              <DialogDescription className="text-base font-medium flex items-center gap-2">
                <Cloud className="h-4 w-4 text-primary" /> Cloud Synchronized Bucket: <span className="font-black text-foreground">{propertyRef}</span>
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-2xl h-14 w-14 hover:bg-muted">
              <X className="h-7 w-7" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="gallery" className="flex-1 flex flex-col">
            <div className="px-10 border-b bg-muted/20 flex items-center justify-between">
              <TabsList className="bg-transparent h-16 p-0 gap-8">
                <TabsTrigger value="gallery" className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-black h-full px-8 text-xs uppercase tracking-widest rounded-t-2xl">Gallery View</TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-background data-[state=active]:shadow-sm font-black h-full px-8 text-xs uppercase tracking-widest rounded-t-2xl">Import Media</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                 <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{images.length} Assets Online</span>
              </div>
            </div>
            <TabsContent value="gallery" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <div className="px-10 py-4 border-b bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelected(selected.size === images.length ? new Set() : new Set(images))} 
                    className="h-10 px-6 rounded-xl font-black text-[10px] tracking-widest uppercase"
                  >
                    {selected.size === images.length && images.length > 0 ? "Deselect Portfolio" : "Select Entire Portfolio"}
                  </Button>
                  {selected.size > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={deleteSelected} 
                      disabled={deleteMutation.isPending}
                      className="h-10 px-6 rounded-xl font-black text-[10px] tracking-widest uppercase shadow-lg shadow-destructive/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Bulk Purge ({selected.size})
                    </Button>
                  )}
                </div>
                {hasChanged && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                    <RefreshCcw className="h-3 w-3" /> Unsynchronized Order Detected
                  </div>
                )}
              </div>
              <ScrollArea className="flex-1 p-10">
                {images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-muted-foreground border-4 border-dashed rounded-[4rem] bg-muted/5 gap-6">
                    <div className="h-24 w-24 rounded-[2rem] bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 opacity-20" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-2xl font-black text-foreground">Storage Bucket Empty</p>
                      <p className="text-sm font-medium">Import images or a .ZIP archive to begin.</p>
                    </div>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                      <SortableContext items={images} strategy={rectSortingStrategy}>
                        {images.map((url, index) => (
                          <SortableImage
                            key={url}
                            url={url}
                            onRemove={() => removeImage(url)}
                            isCover={index === 0}
                            isSelected={selected.has(url)}
                            onSelect={() => setSelected(prev => {
                              const next = new Set(prev);
                              if (next.has(url)) next.delete(url); else next.add(url);
                              return next;
                            })}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  </DndContext>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="upload" className="flex-1 p-10 overflow-hidden">
              <UploadZone propertyRef={propertyRef} onUploadComplete={(newUrls) => setImages(prev => [...prev, ...newUrls])} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="p-10 border-t bg-card flex justify-between items-center">
          <div className="flex items-center gap-4 text-muted-foreground">
             <Cloud className="h-6 w-6 opacity-30" />
             <div className="text-[10px] font-black uppercase tracking-widest">
               Consistency Mode: Transactional <br/>
               Persistence: Cloudflare Managed
             </div>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={onClose} className="rounded-2xl h-14 px-8 font-black text-muted-foreground hover:text-foreground">Discard Changes</Button>
            <Button 
              className="btn-gradient rounded-2xl h-14 px-12 font-black text-lg shadow-2xl" 
              onClick={() => saveMutation.mutate(images)} 
              disabled={saveMutation.isPending || !hasChanged}
            >
              {saveMutation.isPending ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Save className="mr-3 h-6 w-6" />}
              Commit Gallery Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}