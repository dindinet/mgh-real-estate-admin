import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
interface SortableImageProps {
  url: string;
  onRemove: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isCover?: boolean;
}
export function SortableImage({ url, onRemove, onSelect, isSelected, isCover }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: url });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-[4/3] rounded-[1.5rem] overflow-hidden border-2 bg-muted transition-all duration-300",
        isDragging ? "shadow-2xl opacity-40 scale-105 rotate-2" : "shadow-sm hover:shadow-xl",
        isSelected ? "border-primary ring-4 ring-primary/20" : "border-transparent"
      )}
    >
      <img
        src={url}
        alt="Property"
        className={cn(
          "w-full h-full object-cover select-none pointer-events-none transition-transform duration-500",
          !isDragging && "group-hover:scale-110"
        )}
      />
      {/* Selection Control */}
      <div 
        className={cn(
          "absolute top-3 left-3 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer z-20",
          isSelected ? "bg-primary text-white scale-110 shadow-lg" : "bg-black/30 text-white/70 backdrop-blur-md opacity-0 group-hover:opacity-100"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
      </div>
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-10">
        <div
          {...attributes}
          {...listeners}
          className="p-3 bg-white/20 hover:bg-white/40 backdrop-blur-xl rounded-2xl cursor-grab active:cursor-grabbing text-white transition-all transform active:scale-95 shadow-xl"
          title="Drag to reorder"
        >
          <GripVertical className="h-6 w-6" />
        </div>
        {!isSelected && (
          <Button
            size="sm"
            variant="destructive"
            className="h-10 px-4 rounded-xl font-bold shadow-2xl translate-y-2 group-hover:translate-y-0 transition-all duration-300"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Delete this image?')) onRemove();
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
      {isCover && (
        <div className="absolute top-3 right-3 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-black rounded-full shadow-lg border border-white/20 animate-pulse tracking-widest z-20">
          COVER
        </div>
      )}
      {/* Number indicator */}
      {!isDragging && (
        <div className="absolute bottom-3 left-3 h-6 w-6 rounded-lg bg-black/40 backdrop-blur-md text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          ID
        </div>
      )}
    </div>
  );
}