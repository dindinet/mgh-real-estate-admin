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
import { Loader2, Save, X, Trash2, CheckSquare, Square, HardDrive, AlertCircle, Image as ImageIcon } from 'lucide-react';
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
  const mutation = useMutation({
    mutationFn: (newImages: string[]) => {
      return api(`/api/properties/${propertyRef}`, {
        method: 'PATCH',
        body: JSON.stringify({ images: newImages }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property', propertyRef] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Gallery updated');
      onClose();
    },
    onError: () => toast.error('Failed to save changes'),
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
  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  };
  const toggleSelect = (url: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };
  const deleteSelected = () => {
    if (!selected.size) return;
    setImages(prev => prev.filter(img => !selected.has(img)));
    setSelected(new Set());
    toast.success(`Removed ${selected.size} images`);
  };
  const selectAll = () => {
    if (selected.size === images.length) setSelected(new Set());
    else setSelected(new Set(images));
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0 overflow-hidden bg-background rounded-3xl border-none shadow-2xl">
        <DialogHeader className="p-8 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-3xl font-display font-bold text-primary">Manage Gallery</DialogTitle>
              <DialogDescription className="text-base">
                Ref: <span className="font-mono font-bold text-foreground">{propertyRef}</span> •
                Drag to reorder. The first photo is your listing cover.
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
                <TabsTrigger value="gallery" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-6 transition-all font-bold">
                  Gallery View
                </TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full px-6 transition-all font-bold">
                  Add Photos
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/50 rounded-full text-xs font-bold text-muted-foreground">
                  <HardDrive className="h-3 w-3" />
                  {images.length} TOTAL
                </div>
              </div>
            </div>
            <TabsContent value="gallery" className="flex-1 p-0 m-0 overflow-hidden flex flex-col">
              <div className="px-8 py-3 border-b bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAll} className="h-8 px-3 font-semibold text-xs">
                    {selected.size === images.length && images.length > 0 ? <CheckSquare className="h-3.5 w-3.5 mr-2 text-primary" /> : <Square className="h-3.5 w-3.5 mr-2" />}
                    {selected.size === images.length && images.length > 0 ? "Deselect All" : "Select All"}
                  </Button>
                  {selected.size > 0 && (
                    <Button variant="destructive" size="sm" onClick={deleteSelected} className="h-8 px-3 font-semibold text-xs animate-in slide-in-from-left-2">
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete Selected ({selected.size})
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-8">
                  {images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border-2 border-dashed rounded-[2.5rem] bg-muted/5">
                      <ImageIcon className="h-12 w-12 mb-4 opacity-10" />
                      <p className="font-bold text-lg">Your gallery is empty</p>
                      <p className="text-sm opacity-60 mt-1">Upload photos to showcase this property</p>
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        <SortableContext items={images} strategy={rectSortingStrategy}>
                          <AnimatePresence mode="popLayout">
                            {images.map((url, index) => (
                              <motion.div
                                key={url}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                              >
                                <SortableImage
                                  url={url}
                                  onRemove={() => removeImage(url)}
                                  isCover={index === 0}
                                  isSelected={selected.has(url)}
                                  onSelect={() => toggleSelect(url)}
                                />
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </SortableContext>
                      </div>
                    </DndContext>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="upload" className="flex-1 p-0 m-0 overflow-hidden">
              <div className="h-full p-8">
                <UploadZone onUploadComplete={(newUrls) => setImages(prev => [...prev, ...newUrls])} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="p-8 border-t bg-card flex justify-between items-center">
          <div className="text-sm text-muted-foreground font-medium">
            {hasChanged ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Unsaved changes detected
              </span>
            ) : "No changes made"}
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="h-12 px-6 rounded-xl font-bold">
              Cancel
            </Button>
            <Button
              className="btn-gradient rounded-xl px-10 h-12 font-bold shadow-xl"
              onClick={() => mutation.mutate(images)}
              disabled={mutation.isPending || !hasChanged}
            >
              {mutation.isPending ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}