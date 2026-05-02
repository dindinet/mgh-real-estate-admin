import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api-client';
import type { Property } from '@shared/types';
import {
  Plus,
  Search,
  Bed,
  Bath,
  MapPin,
  Edit3,
  Trash2,
  Loader2,
  Building2,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Clock,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
export function PropertiesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: () => api<{ items: Property[] }>('/api/properties')
  });
  const properties = useMemo(() => {
    const raw = data?.items ?? [];
    if (!search.trim()) return raw;
    const q = search.toLowerCase();
    return raw.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.ref.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q) ||
      p.ptype.toLowerCase().includes(q)
    );
  }, [data, search]);
  const stats = useMemo(() => {
    const all = data?.items ?? [];
    const activeListings = all.filter(p => p.display && p.salestage === 0);
    const totalValue = activeListings.reduce((sum, p) => sum + p.price, 0);
    const avgPricePerBed = activeListings.length > 0
      ? totalValue / activeListings.reduce((sum, p) => sum + Math.max(1, p.beds), 0)
      : 0;
    return {
      count: all.length,
      value: totalValue,
      avg: avgPricePerBed
    };
  }, [data]);
  const deleteMutation = useMutation({
    mutationFn: (ref: string) => api(`/api/properties/${ref}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property listing removed');
    },
    onError: () => toast.error('Failed to delete property')
  });
  const handleDelete = (e: React.MouseEvent, ref: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to remove this listing?')) {
      deleteMutation.mutate(ref);
    }
  };
  const getStatusBadge = (stage: number) => {
    switch (stage) {
      case 1: return <Badge className="bg-amber-500 hover:bg-amber-600 border-none px-3 font-bold">RESERVED</Badge>;
      case 2: return <Badge className="bg-rose-500 hover:bg-rose-600 border-none px-3 font-bold">SOLD</Badge>;
      default: return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-3 font-bold">AVAILABLE</Badge>;
    }
  };
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">MGH Listings</h1>
          <p className="text-muted-foreground mt-1 text-lg">MaxGoldHouse Premium Portfolio</p>
        </div>
        <Button
          className="btn-gradient rounded-2xl px-8 h-14 font-bold text-lg shadow-xl"
          onClick={() => navigate('/properties/new')}
        >
          <Plus className="mr-2 h-6 w-6" />
          Create Listing
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Database', val: stats.count, icon: Building2, color: 'bg-blue-500' },
          { label: 'Active Sale Value', val: `${(stats.value / 1e6).toFixed(2)}M`, icon: DollarSign, color: 'bg-indigo-600' },
          { label: 'Avg Sale / Bed', val: `${Math.round(stats.avg / 1000)}k`, icon: TrendingUp, color: 'bg-emerald-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 p-6 rounded-3xl shadow-soft flex items-center gap-5">
            <div className={`${stat.color} h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-display font-bold">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search ref, title, type or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-12 bg-card/50 border-border/50 h-14 rounded-2xl text-lg shadow-sm focus:ring-primary/20"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-[4/3] w-full rounded-[2.5rem]" />
              <div className="space-y-2 px-2">
                <Skeleton className="h-7 w-2/3 rounded-lg" />
                <Skeleton className="h-5 w-1/2 rounded-lg" />
              </div>
            </div>
          ))
        ) : (
          properties.map((property) => (
            <div
              key={property.id}
              className="group relative bg-card rounded-[2.5rem] border border-border/40 overflow-hidden hover:-translate-y-2 hover:shadow-2xl transition-all duration-500"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                  alt={property.title}
                  className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80" />
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  <Badge className="bg-white/95 text-black border-none backdrop-blur shadow-xl hover:bg-white font-bold px-3 py-1 rounded-full">
                    {property.ref}
                  </Badge>
                  {getStatusBadge(property.salestage)}
                </div>
                <div className="absolute bottom-5 right-5 flex gap-3 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <Button
                    size="icon"
                    className="h-11 w-11 rounded-2xl bg-white text-black hover:bg-primary hover:text-white shadow-2xl transition-all"
                    onClick={() => navigate(`/properties/${property.ref}/edit`)}
                  >
                    <Edit3 className="h-5 w-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-11 w-11 rounded-2xl shadow-2xl transition-all"
                    disabled={deleteMutation.isPending}
                    onClick={(e) => handleDelete(e, property.ref)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4 cursor-pointer" onClick={() => navigate(`/properties/${property.ref}/edit`)}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">{property.ptype}</Badge>
                    {!property.display && <Badge variant="secondary" className="text-[10px]">HIDDEN</Badge>}
                  </div>
                  <h3 className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors duration-300">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-1.5 font-medium">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-primary/60" />
                    {property.town}, {property.province}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    {property.originalprice > property.price && (
                      <span className="text-xs text-muted-foreground line-through font-bold">
                        ${property.originalprice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-2xl font-display font-bold text-foreground">
                      ${property.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-3 text-[10px] font-black text-muted-foreground/80">
                    <span className="flex flex-col items-center gap-0.5 bg-muted/50 px-2 py-1 rounded-xl">
                      <Bed className="h-4 w-4 text-primary" /> {property.beds}
                    </span>
                    <span className="flex flex-col items-center gap-0.5 bg-muted/50 px-2 py-1 rounded-xl">
                      <Bath className="h-4 w-4 text-primary" /> {property.baths}
                    </span>
                    {property.plot > 0 && (
                      <span className="flex flex-col items-center gap-0.5 bg-muted/50 px-2 py-1 rounded-xl">
                        <Maximize2 className="h-4 w-4 text-primary" /> {property.plot}
                      </span>
                    )}
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