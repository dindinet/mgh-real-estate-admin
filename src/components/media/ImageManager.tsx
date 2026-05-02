import React, { useState, useEffect } from 'react';
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
import { Loader2, Save, X } from 'lucide-react';
interface ImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  propertyRef: string;
  initialImages: string[];
}
export function ImageManager({ isOpen, onClose, propertyRef, initialImages }: ImageManagerProps) {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<string[]>([]);
  useEffect(() => {
    if (isOpen) {
      setImages(initialImages || []);
    }
  }, [isOpen, initialImages]);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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
      toast.success('Gallery updated successfully');
      onClose();
    },
    onError: () => {
      toast.error('Failed to save gallery changes');
    },
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
  };
  const addImages = (urls: string[]) => {
    setImages((prev) => [...prev, ...urls]);
  };
  const handleSave = () => {
    mutation.mutate(images);
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden bg-background">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-display">Manage Gallery</DialogTitle>
              <DialogDescription>
                Drag to reorder photos. The first image will be the cover.
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="gallery" className="h-full flex flex-col">
            <div className="px-6 border-b bg-muted/30">
              <TabsList className="bg-transparent h-12">
                <TabsTrigger value="gallery" className="data-[state=active]:bg-background">
                  Gallery View
                </TabsTrigger>
                <TabsTrigger value="upload" className="data-[state=active]:bg-background">
                  Upload Photos
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="gallery" className="flex-1 p-0 m-0 overflow-hidden">
              <ScrollArea className="h-full p-6">
                {images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border-2 border-dashed rounded-2xl">
                    <p>No images in gallery yet.</p>
                    <p className="text-sm">Switch to Upload to add some.</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      <SortableContext items={images} strategy={rectSortingStrategy}>
                        {images.map((url, index) => (
                          <SortableImage 
                            key={url} 
                            url={url} 
                            onRemove={() => removeImage(url)} 
                            isCover={index === 0}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  </DndContext>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="upload" className="flex-1 p-0 m-0 overflow-hidden">
              <div className="h-full p-6">
                <UploadZone onUploadComplete={addImages} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
        <div className="p-6 border-t bg-muted/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="btn-gradient rounded-xl px-8" 
            onClick={handleSave}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}