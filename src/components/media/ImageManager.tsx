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
import { Loader2, Save, X, Trash2, CheckSquare, Square, HardDrive, AlertCircle, Image as ImageIcon, RefreshCcw } from 'lucide-react';
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
      toast.success('Gallery order synchronized');
      onClose();
    },
    onError: () => toast.error('Failed to sync reorder'),
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
      toast.success('Asset removed');
    } catch (e) {
      setImages(previous);
      toast.error('Failed to remove server asset');
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
      toast.success(`Removed ${targets.length} assets from cloud storage`);
    } catch (e) {
      setImages(previous);
      toast.error('Batch removal failed partially');
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background rounded-3xl border-none shadow-2xl">
        <DialogHeader className="p-8 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-display font-bold text-primary flex items-center gap-3">
                Portfolio Assets
                {deleteMutation.isPending && <RefreshCcw className="h-5 w-5 animate-spin text-muted-foreground" />}
              </DialogTitle>
              <DialogDescription className="text-base">
                Ref: <span className="font-mono font-bold text-foreground">{propertyRef}</span> • 
                Cloud-synchronized gallery management.
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-12 w-12 hover:bg-muted">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="gallery" className="flex-1 flex flex-col">
            <div className="px-8 border-b bg-muted/20 flex items-center justify-between">
              <TabsList className="bg-transparent h-14 p-0">
                <TabsTrigger value="gallery" className="data-[state=active]:bg-background font-bold h-full px-6">Gallery</TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-background font-bold h-full px-6">Add Media</TabsTrigger>
              </TabsList>
              <div className="text-xs font-black text-muted-foreground uppercase tracking-widest bg-secondary/50 px-3 py-1.5 rounded-full">
                {images.length} Assets Online
              </div>
            </div>
            <TabsContent value="gallery" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <div className="px-8 py-3 border-b bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(selected.size === images.length ? new Set() : new Set(images))} className="h-8 font-bold text-xs">
                    {selected.size === images.length && images.length > 0 ? "Deselect All" : "Select All"}
                  </Button>
                  {selected.size > 0 && (
                    <Button variant="destructive" size="sm" onClick={deleteSelected} disabled={deleteMutation.isPending} className="h-8 font-bold text-xs">
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Wipe Selected ({selected.size})
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1 p-8">
                {images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-[2.5rem] bg-muted/5">
                    <ImageIcon className="h-12 w-12 mb-4 opacity-10" />
                    <p className="font-bold">Portfolio is empty</p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
            <TabsContent value="upload" className="flex-1 p-8 overflow-hidden">
              <UploadZone propertyRef={propertyRef} onUploadComplete={(newUrls) => setImages(prev => [...prev, ...newUrls])} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="p-8 border-t bg-card flex justify-between items-center">
          <div className="text-sm font-bold text-amber-600">
            {hasChanged && <span className="flex items-center gap-2 animate-pulse"><AlertCircle className="h-4 w-4" /> Unsynced Sort Order</span>}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Discard</Button>
            <Button className="btn-gradient rounded-xl px-10 font-bold shadow-xl" onClick={() => saveMutation.mutate(images)} disabled={saveMutation.isPending || !hasChanged}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Commit Sort
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}