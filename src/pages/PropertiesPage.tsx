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
  Building2,
  TrendingUp,
  DollarSign,
  Maximize2,
  ImageIcon,
  Waves,
  Palmtree,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
      (p.kref && p.kref.toLowerCase().includes(q)) ||
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
      toast.success('Listing removed successfully');
    },
    onError: () => toast.error('Failed to remove listing')
  });
  const handleDelete = (e: React.MouseEvent, ref: string) => {
    e.stopPropagation();
    if (confirm('Permanently remove this listing from the portfolio?')) {
      deleteMutation.mutate(ref);
    }
  };
  const getStatusBadge = (stage: number) => {
    switch (stage) {
      case 1: return <Badge className="bg-amber-500 hover:bg-amber-600 border-none px-3 font-black tracking-widest text-[10px]">RESERVED</Badge>;
      case 2: return <Badge className="bg-rose-500 hover:bg-rose-600 border-none px-3 font-black tracking-widest text-[10px]">SOLD</Badge>;
      default: return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-3 font-black tracking-widest text-[10px]">ACTIVE</Badge>;
    }
  };
  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div>
          <h1 className="text-5xl font-display font-black tracking-tighter text-foreground">Global Portfolio</h1>
          <p className="text-muted-foreground mt-2 text-xl font-medium">Managing the MaxGoldHouse Elite Collection</p>
        </div>
        <Button
          className="btn-gradient rounded-2xl px-10 h-16 font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
          onClick={() => navigate('/properties/new')}
        >
          <Plus className="mr-3 h-8 w-8 stroke-[3]" />
          Create Entry
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {[
          { label: 'Asset Count', val: stats.count, icon: Building2, color: 'bg-indigo-600' },
          { label: 'Active Value', val: `${(stats.value / 1e6).toFixed(1)}M`, icon: DollarSign, color: 'bg-emerald-600' },
          { label: 'Avg Value / Bed', val: `${Math.round(stats.avg / 1000)}k`, icon: TrendingUp, color: 'bg-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-card border border-border/50 p-8 rounded-[2.5rem] shadow-soft flex items-center gap-6 group hover:border-primary/20 transition-all">
            <div className={`${stat.color} h-16 w-16 rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{stat.label}</p>
              <p className="text-3xl font-display font-black">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="relative max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground/60" />
        <Input
          placeholder="Filter by ref, title, location, type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-14 bg-card/50 border-border/50 h-16 rounded-3xl text-xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40 font-medium"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-10">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-6">
              <Skeleton className="aspect-[4/3] w-full rounded-[3rem]" />
              <div className="space-y-3 px-4">
                <Skeleton className="h-8 w-3/4 rounded-xl" />
                <Skeleton className="h-6 w-1/2 rounded-xl" />
              </div>
            </div>
          ))
        ) : properties.length === 0 ? (
           <div className="col-span-full py-20 text-center space-y-4 bg-muted/20 rounded-[3rem] border-2 border-dashed">
              <Building2 className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
              <p className="text-xl font-bold text-muted-foreground">No matching listings found</p>
           </div>
        ) : (
          properties.map((property) => (
            <div
              key={property.id}
              className="group relative bg-card rounded-[3rem] border border-border/40 overflow-hidden hover:-translate-y-3 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-700"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={property.images[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'}
                  alt={property.title}
                  className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60" />
                {/* Overlays */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <Badge className="bg-white/95 text-black border-none backdrop-blur shadow-xl hover:bg-white font-black text-[10px] px-3 py-1.5 rounded-full tracking-widest uppercase">
                    {property.ref}
                  </Badge>
                  {getStatusBadge(property.salestage)}
                </div>
                <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[10px] font-black shadow-lg">
                  <ImageIcon className="h-3 w-3" />
                  {property.images.length}
                </div>
                {/* Quick Feature Badges */}
                <div className="absolute bottom-6 left-6 flex gap-2">
                  {property.pool && (
                    <div className="h-8 w-8 rounded-xl bg-blue-500/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg"><Waves className="h-4 w-4" /></div>
                  )}
                  {property.beach && (
                    <div className="h-8 w-8 rounded-xl bg-amber-500/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg"><Palmtree className="h-4 w-4" /></div>
                  )}
                  {property.luxury && (
                    <div className="h-8 w-8 rounded-xl bg-purple-600/80 backdrop-blur-md text-white flex items-center justify-center shadow-lg"><Sparkles className="h-4 w-4" /></div>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                   <div className="flex gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <Button
                      size="icon"
                      className="h-14 w-14 rounded-2xl bg-white text-black hover:bg-primary hover:text-white shadow-2xl transition-all"
                      onClick={(e) => { e.stopPropagation(); navigate(`/properties/${property.ref}/edit`); }}
                    >
                      <Edit3 className="h-6 w-6" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-14 w-14 rounded-2xl shadow-2xl transition-all"
                      disabled={deleteMutation.isPending}
                      onClick={(e) => handleDelete(e, property.ref)}
                    >
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-8 space-y-6 cursor-pointer" onClick={() => navigate(`/properties/${property.ref}/edit`)}>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary bg-primary/5 px-2 py-0.5 rounded-lg">{property.ptype}</span>
                    {!property.display && <span className="text-[10px] font-black uppercase tracking-[0.25em] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-lg">HIDDEN</span>}
                  </div>
                  <h3 className="text-2xl font-black line-clamp-1 group-hover:text-primary transition-colors duration-300 leading-tight">
                    {property.title}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground mt-3 font-bold">
                    <MapPin className="h-4 w-4 mr-2 text-primary" />
                    {property.town}, <span className="opacity-60">{property.province}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div className="flex flex-col">
                    {property.originalprice > property.price && (
                      <span className="text-xs text-muted-foreground line-through font-bold mb-0.5 opacity-50">
                        ${property.originalprice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-3xl font-display font-black text-foreground tracking-tighter">
                      ${property.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-center justify-center h-12 w-12 bg-muted/40 rounded-2xl group/stat hover:bg-primary/5 transition-colors">
                      <Bed className="h-4 w-4 text-primary mb-0.5" />
                      <span className="text-[10px] font-black">{property.beds}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center h-12 w-12 bg-muted/40 rounded-2xl group/stat hover:bg-primary/5 transition-colors">
                      <Bath className="h-4 w-4 text-primary mb-0.5" />
                      <span className="text-[10px] font-black">{property.baths}</span>
                    </div>
                    {property.living > 0 && (
                      <div className="flex flex-col items-center justify-center h-12 w-12 bg-muted/40 rounded-2xl group/stat hover:bg-primary/5 transition-colors">
                        <Maximize2 className="h-4 w-4 text-primary mb-0.5" />
                        <span className="text-[10px] font-black">{property.living}</span>
                      </div>
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