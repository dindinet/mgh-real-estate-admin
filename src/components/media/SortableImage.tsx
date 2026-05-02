import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
interface SortableImageProps {
  url: string;
  onRemove: () => void;
  isCover?: boolean;
}
export function SortableImage({ url, onRemove, isCover }: SortableImageProps) {
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
        "group relative aspect-[4/3] rounded-xl overflow-hidden border bg-muted shadow-sm transition-shadow",
        isDragging ? "shadow-2xl opacity-50" : "hover:shadow-md"
      )}
    >
      <img
        src={url}
        alt="Property"
        className="w-full h-full object-cover select-none pointer-events-none"
      />
      {/* Overlay controls */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg cursor-grab active:cursor-grabbing text-white transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </div>
        <Button
          size="icon"
          variant="destructive"
          className="h-9 w-9 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      {isCover && (
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded shadow-sm">
          COVER
        </div>
      )}
    </div>
  );
}