import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Property } from '@shared/types';
import {
  ChevronLeft,
  Save,
  Loader2,
  CircleDollarSign,
  Info,
  Image as ImageIcon,
  LayoutGrid,
  Languages,
  Waves,
  Wind,
  Home,
  CheckCircle2,
  Maximize,
  Clock,
  History,
  Building2,
  Bed,
  Bath,
  Maximize2,
  Palmtree,
  Wifi,
  Utensils,
  Sun,
  Flame,
  Snowflake,
  Lock,
  Globe,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ImageManager } from '@/components/media/ImageManager';
import { format } from 'date-fns';
const propertySchema = z.object({
  ref: z.string().min(3, 'Reference must be at least 3 characters'),
  kref: z.string().optional(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  ptype: z.string().min(1, 'Type is required'),
  province: z.string().min(2, 'Province is required'),
  town: z.string().min(2, 'Town is required'),
  location: z.string().min(3, 'Location description is required'),
  area: z.string().optional(),
  price: z.coerce.number().min(0),
  originalprice: z.coerce.number().min(0),
  frequency: z.string().default('Sale'),
  beds: z.coerce.number().min(0),
  baths: z.coerce.number().min(0),
  living: z.coerce.number().min(0),
  plot: z.coerce.number().min(0),
  display: z.boolean().default(true),
  salestage: z.coerce.number().min(0).max(2).default(0),
  description: z.string().min(10, 'Description is required'),
  moredetails: z.string().optional(),
  DE: z.string().optional(),
  FR: z.string().optional(),
  NL: z.string().optional(),
  rental: z.boolean().default(false),
  finca: z.boolean().default(false),
  penthouse: z.boolean().default(false),
  luxury: z.boolean().default(false),
  offplan: z.boolean().default(false),
  leasehold: z.boolean().default(false),
  golf: z.boolean().default(false),
  beach: z.boolean().default(false),
  aircon: z.boolean().default(false),
  pool: z.boolean().default(false),
  fireplace: z.boolean().default(false),
  heating: z.boolean().default(false),
  solarium: z.boolean().default(false),
  balconies: z.boolean().default(false),
  furnished: z.boolean().default(false),
  kitchen: z.boolean().default(false),
  utility: z.boolean().default(false),
  topsix: z.boolean().default(false),
  kyeroPrime: z.boolean().default(false),
  notrain: z.boolean().default(false),
});
type PropertyFormValues = z.infer<typeof propertySchema>;
const PROPERTY_TYPES = ["Villa", "Apartment", "Townhouse", "Penthouse", "Finca", "Plot", "Commercial"];
export function PropertyEditorPage() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const isEditing = !!ref;
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', ref],
    queryFn: () => api<Property>(`/api/properties/${ref}`),
    enabled: isEditing,
  });
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: { 
      ref: '', kref: '', title: '', ptype: 'Villa', province: '', town: '', location: '', area: '', price: 0, originalprice: 0, frequency: 'Sale', beds: 0, baths: 0, living: 0, plot: 0, display: true, salestage: 0, description: '', moredetails: '', DE: '', FR: '', NL: '', rental: false, finca: false, penthouse: false, luxury: false, offplan: false, leasehold: false, golf: false, beach: false, aircon: false, pool: false, fireplace: false, heating: false, solarium: false, balconies: false, furnished: false, kitchen: false, utility: false, topsix: false, kyeroPrime: false, notrain: false 
    },
  });
  const typedControl = form.control as unknown as Control<PropertyFormValues>;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (property) {
      form.reset({
        ...property,
        kref: property.kref || '',
        area: property.area || '',
        DE: property.DE || '',
        FR: property.FR || '',
        NL: property.NL || '',
      } as any);
    }
  }, [property]);
  const mutation = useMutation({
    mutationFn: (values: PropertyFormValues) => {
      const method = isEditing ? 'PATCH' : 'POST';
      const endpoint = isEditing ? `/api/properties/${ref}` : '/api/properties';
      return api<Property>(endpoint, {
        method,
        body: JSON.stringify(values),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(isEditing ? 'Portfolio record updated' : 'Property successfully listed');
      if (!isEditing) navigate(`/properties/${data.ref}/edit`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Operation failed'),
  });
  const featureGroups = useMemo(() => [
    {
      label: "General Features",
      items: [
        { name: 'luxury', label: 'Luxury', icon: Sparkles },
        { name: 'topsix', label: 'Top 6', icon: CheckCircle2 },
        { name: 'kyeroPrime', label: 'Kyero Prime', icon: Globe },
        { name: 'offplan', label: 'Off-Plan', icon: Clock },
      ]
    },
    {
      label: "Property Specs",
      items: [
        { name: 'pool', label: 'Pool', icon: Waves },
        { name: 'beach', label: 'Beachfront', icon: Palmtree },
        { name: 'golf', label: 'Golf Front', icon: Sun },
        { name: 'finca', label: 'Finca/Rustic', icon: Home },
      ]
    },
    {
      label: "Comfort & Utilities",
      items: [
        { name: 'aircon', label: 'Aircon', icon: Snowflake },
        { name: 'heating', label: 'Heating', icon: Wind },
        { name: 'fireplace', label: 'Fireplace', icon: Flame },
        { name: 'furnished', label: 'Furnished', icon: Lock },
      ]
    },
    {
      label: "Internal Areas",
      items: [
        { name: 'kitchen', label: 'Equipped Kitchen', icon: Utensils },
        { name: 'utility', label: 'Utility Room', icon: Wind },
        { name: 'solarium', label: 'Solarium', icon: Sun },
        { name: 'balconies', label: 'Balconies', icon: Home },
      ]
    }
  ], []);
  if (isEditing && isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b pb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/properties')} className="rounded-full h-12 w-12 hover:bg-muted">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
              {isEditing ? property?.title : 'New Entry'}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                REF: {isEditing ? ref : 'PENDING'}
              </span>
              {property?.created && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <Clock className="h-3 w-3" /> Published {format(new Date(property.created), 'MMM d, yyyy')}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-xl font-bold" onClick={() => navigate('/properties')}>Cancel</Button>
          <Button onClick={form.handleSubmit((data: PropertyFormValues) => mutation.mutate(data))} className="h-12 px-8 btn-gradient rounded-xl font-bold shadow-xl" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isEditing ? 'Update Entry' : 'Publish to Portal'}
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* CORE INFORMATION */}
            <Card className="rounded-[2rem] shadow-soft border-border/50">
              <CardHeader className="bg-muted/10 border-b p-8"><CardTitle className="text-xl flex items-center gap-3"><Info className="h-5 w-5 text-primary" />Core Information</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <FormField control={typedControl} name="ref" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest">Global Reference</FormLabel>
                      <FormControl><Input {...field} disabled={isEditing} className="h-12 rounded-xl bg-muted/20 font-black uppercase" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={typedControl} name="kref" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest">Legacy ID</FormLabel>
                      <FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={typedControl} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest">Public Title</FormLabel>
                    <FormControl><Input {...field} className="h-12 rounded-xl font-bold text-lg" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-3 gap-6">
                  <FormField control={typedControl} name="ptype" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest">Property Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={typedControl} name="province" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest">Province</FormLabel>
                      <FormControl><Input {...field} className="h-11 rounded-xl" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={typedControl} name="town" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest">Town</FormLabel>
                      <FormControl><Input {...field} className="h-11 rounded-xl" /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={typedControl} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest">Location Details</FormLabel>
                    <FormControl><Input {...field} className="h-12 rounded-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            {/* SPECIFICATIONS */}
            <Card className="rounded-[2rem] shadow-soft border-border/50">
              <CardHeader className="bg-muted/10 border-b p-8"><CardTitle className="text-xl flex items-center gap-3"><Maximize className="h-5 w-5 text-primary" />Specifications</CardTitle></CardHeader>
              <CardContent className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                <FormField control={typedControl} name="beds" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase opacity-60">Bedrooms</FormLabel>
                    <div className="relative"><Bed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" /><FormControl><Input type="number" {...field} className="pl-10 h-12 rounded-xl font-bold" /></FormControl></div>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="baths" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase opacity-60">Bathrooms</FormLabel>
                    <div className="relative"><Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" /><FormControl><Input type="number" {...field} className="pl-10 h-12 rounded-xl font-bold" /></FormControl></div>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="living" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase opacity-60">Living Area (sqm)</FormLabel>
                    <div className="relative"><Maximize2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" /><FormControl><Input type="number" {...field} className="pl-10 h-12 rounded-xl font-bold" /></FormControl></div>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="plot" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase opacity-60">Plot Size (sqm)</FormLabel>
                    <div className="relative"><LayoutGrid className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" /><FormControl><Input type="number" {...field} className="pl-10 h-12 rounded-xl font-bold" /></FormControl></div>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            {/* FEATURE GRID */}
            <Card className="rounded-[2rem] shadow-soft border-border/50">
              <CardHeader className="bg-muted/10 border-b p-8"><CardTitle className="text-xl flex items-center gap-3"><LayoutGrid className="h-5 w-5 text-primary" />Feature Matrix</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-10">
                {featureGroups.map((group, idx) => (
                  <div key={idx} className="space-y-4">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest px-1">{group.label}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {group.items.map(f => (
                        <FormField key={f.name} control={typedControl} name={f.name as any} render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border hover:border-primary/20 transition-all cursor-pointer">
                            <div className="flex items-center gap-2"><f.icon className="h-4 w-4 opacity-40 text-primary" /><span className="text-[10px] font-black uppercase tracking-wider">{f.label}</span></div>
                            <FormControl><Switch checked={!!field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* LOCALIZATIONS */}
            <Card className="rounded-[2rem] shadow-soft border-border/50">
              <CardHeader className="bg-muted/10 border-b p-8"><CardTitle className="text-xl flex items-center gap-3"><Languages className="h-5 w-5 text-primary" />Global Descriptions</CardTitle></CardHeader>
              <CardContent className="p-8">
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
                    <TabsTrigger value="en" className="rounded-lg px-6 font-bold">English (Default)</TabsTrigger>
                    <TabsTrigger value="de" className="rounded-lg px-6 font-bold">Deutsch</TabsTrigger>
                    <TabsTrigger value="fr" className="rounded-lg px-6 font-bold">Français</TabsTrigger>
                    <TabsTrigger value="nl" className="rounded-lg px-6 font-bold">Nederlands</TabsTrigger>
                  </TabsList>
                  <TabsContent value="en" className="space-y-6">
                    <FormField control={typedControl} name="description" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs font-bold uppercase opacity-60">Primary Description</FormLabel><FormControl><Textarea {...field} className="min-h-[200px] rounded-2xl" placeholder="Detailed property summary..." /></FormControl><FormMessage /></FormItem>
                    )} />
                  </TabsContent>
                  <TabsContent value="de">
                    <FormField control={typedControl} name="DE" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs font-bold uppercase opacity-60">German Translation</FormLabel><FormControl><Textarea {...field} className="min-h-[200px] rounded-2xl" /></FormControl></FormItem>
                    )} />
                  </TabsContent>
                  <TabsContent value="fr">
                    <FormField control={typedControl} name="FR" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs font-bold uppercase opacity-60">French Translation</FormLabel><FormControl><Textarea {...field} className="min-h-[200px] rounded-2xl" /></FormControl></FormItem>
                    )} />
                  </TabsContent>
                  <TabsContent value="nl">
                    <FormField control={typedControl} name="NL" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs font-bold uppercase opacity-60">Dutch Translation</FormLabel><FormControl><Textarea {...field} className="min-h-[200px] rounded-2xl" /></FormControl></FormItem>
                    )} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-10">
            {/* PRICING & STATUS */}
            <Card className="rounded-[2.5rem] shadow-glow overflow-hidden bg-primary text-primary-foreground border-none">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Valuation & Liquidity</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <FormField control={typedControl} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold opacity-80">MARKET PRICE ($)</FormLabel>
                    <FormControl><Input type="number" {...field} className="h-16 rounded-3xl bg-white/10 border-white/20 text-white text-3xl font-black font-display tracking-tighter" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="originalprice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold opacity-80">ORIGINAL PRICE ($)</FormLabel>
                    <FormControl><Input type="number" {...field} className="h-12 rounded-2xl bg-white/10 border-white/20 text-white text-xl font-bold" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="salestage" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold opacity-80">SALES VELOCITY</FormLabel>
                    <Select onValueChange={field.onChange} value={String(field.value || 0)}>
                      <FormControl><SelectTrigger className="h-12 rounded-2xl bg-white/10 border-white/20 font-black"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="0">FOR SALE</SelectItem><SelectItem value="1">RESERVED</SelectItem><SelectItem value="2">SOLD</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="display" render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-xs font-bold opacity-80">VISIBLE TO PUBLIC</span>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            {/* MEDIA ASSETS */}
            <Card className="rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardHeader className="text-center"><CardTitle className="text-xl">Portfolio Gallery</CardTitle></CardHeader>
              <CardContent className="p-8 text-center space-y-4">
                {isEditing ? (
                   <Button type="button" onClick={() => setIsImageManagerOpen(true)} className="w-full h-14 rounded-2xl font-black text-lg bg-white text-primary hover:bg-white/90 shadow-xl">
                    <ImageIcon className="mr-3 h-6 w-6" />
                    Manage Media ({property?.images?.length || 0})
                   </Button>
                ) : (
                  <div className="p-4 bg-muted/40 rounded-2xl border border-dashed border-muted-foreground/20">
                    <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed">Gallery activation available after initial publication.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* AUDIT LOG */}
            {isEditing && property?.lastEdited && (
              <div className="p-6 bg-muted/20 rounded-[2rem] border border-border/50 flex flex-col gap-4">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <History className="h-5 w-5 opacity-40" />
                  <div className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    Last Database Sync: <br/> {format(new Date(property.lastEdited), 'HH:mm • MMM d, yyyy')}
                  </div>
                </div>
                <div className="h-px bg-border/50" />
                <div className="flex items-center gap-4 text-muted-foreground">
                  <Building2 className="h-5 w-5 opacity-40" />
                  <div className="text-[10px] font-black uppercase tracking-widest leading-tight">
                    Internal Identifier: <br/> {property.id}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
      {isEditing && property && (
        <ImageManager isOpen={isImageManagerOpen} onClose={() => setIsImageManagerOpen(false)} propertyRef={property.ref} initialImages={property.images} />
      )}
    </div>
  );
}