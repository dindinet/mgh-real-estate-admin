import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Property, ApiResponse } from '@shared/types';
import { 
  Plus, 
  Search, 
  Bed, 
  Bath, 
  MapPin, 
  Edit3, 
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
export function PropertiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api<{ items: Property[] }>('/api/properties')
  });
  const properties = data?.items ?? [];
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground mt-1">Showing {properties.length} active listings</p>
        </div>
        <Button className="btn-gradient rounded-xl px-6 h-11">
          <Plus className="mr-2 h-5 w-5" />
          Add Property
        </Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by title, ref, or location..." 
          className="pl-10 max-w-md bg-card/50 border-border/50 h-11 rounded-xl"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))
        ) : properties.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-muted-foreground">No properties found.</p>
          </div>
        ) : (
          properties.map((property) => (
            <div 
              key={property.id} 
              className="group relative bg-card rounded-3xl border border-border/40 overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <Badge className="absolute top-4 left-4 bg-white/90 text-black border-none backdrop-blur shadow-sm hover:bg-white">
                  {property.ref}
                </Badge>
                <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-lg">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-lg font-bold line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {property.location}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-display font-bold text-foreground">
                    ${property.price.toLocaleString()}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" /> {property.beds}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" /> {property.baths}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}