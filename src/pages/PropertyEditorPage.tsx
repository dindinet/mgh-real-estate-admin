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
  Utensils,
  Sun,
  Flame,
  Snowflake,
  Lock,
  Globe,
  Sparkles,
  AlertTriangle
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
import { Badge } from '@/components/ui/badge';
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
      return api<Property>(endpoint, { method, body: JSON.stringify(values) });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(isEditing ? 'Database entry synchronized' : 'New property published');
      if (!isEditing) navigate(`/properties/${data.ref}/edit`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Record update failed'),
  });
  const featureGroups = useMemo(() => [
    { label: "Elite Class", items: [{ name: 'luxury', label: 'Luxury', icon: Sparkles }, { name: 'topsix', label: 'Top 6 Exclusive', icon: CheckCircle2 }, { name: 'kyeroPrime', label: 'Kyero Prime', icon: Globe }, { name: 'offplan', label: 'Off-Plan Development', icon: Clock }] },
    { label: "Environment", items: [{ name: 'pool', label: 'Private Pool', icon: Waves }, { name: 'beach', label: 'Beachfront Access', icon: Palmtree }, { name: 'golf', label: 'Golf Frontline', icon: Sun }, { name: 'finca', label: 'Finca / Rustic Estate', icon: Home }] },
    { label: "Internal Amenities", items: [{ name: 'aircon', label: 'Climate Control', icon: Snowflake }, { name: 'heating', label: 'Central Heating', icon: Wind }, { name: 'fireplace', label: 'Feature Fireplace', icon: Flame }, { name: 'furnished', label: 'Fully Furnished', icon: Lock }] },
    { label: "Service Areas", items: [{ name: 'kitchen', label: 'Designer Kitchen', icon: Utensils }, { name: 'utility', label: 'Utility/Laundry', icon: Wind }, { name: 'solarium', label: 'Private Solarium', icon: Sun }, { name: 'balconies', label: 'Multiple Balconies', icon: Home }] }
  ], []);
  if (isEditing && isLoading) {
    return (
      <div className="flex flex-col h-96 items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-xs">Accessing MGH Cloud...</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="icon" onClick={() => navigate('/properties')} className="rounded-2xl h-14 w-14 shadow-sm">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-5xl font-display font-black tracking-tight text-foreground leading-none">
              {isEditing ? property?.title : 'New Portfolio Entry'}
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant="secondary" className="px-3 py-1 font-black text-[10px] tracking-widest uppercase">
                REF: {isEditing ? ref : 'UNASSIGNED'}
              </Badge>
              {isEditing && (
                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  <Clock className="h-3 w-3" /> Sync: {format(new Date(property?.lastEdited || Date.now()), 'HH:mm • dd/MM/yy')}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="h-14 px-8 rounded-2xl font-bold text-muted-foreground hover:text-foreground" onClick={() => navigate('/properties')}>Cancel</Button>
          <Button
            onClick={form.handleSubmit((data) => mutation.mutate(data))}
            className="h-14 px-10 btn-gradient rounded-2xl font-black text-lg shadow-2xl"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Save className="mr-3 h-6 w-6" />}
            {isEditing ? 'Sync Changes' : 'Commit to Cloud'}
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-12">
            {/* CORE DATA */}
            <Card className="rounded-[3rem] shadow-soft border-border/40 overflow-hidden">
              <CardHeader className="bg-muted/20 border-b px-10 py-8">
                <CardTitle className="text-2xl font-black flex items-center gap-4">
                  <Info className="h-6 w-6 text-primary" /> Core Property Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField control={typedControl} name="ref" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unique Reference</FormLabel>
                      <FormControl><Input {...field} disabled={isEditing} className="h-14 rounded-2xl bg-muted/30 font-black text-lg uppercase" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={typedControl} name="kref" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legacy Database ID</FormLabel>
                      <FormControl><Input {...field} className="h-14 rounded-2xl" /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={typedControl} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Marketing Title</FormLabel>
                    <FormControl><Input {...field} className="h-16 rounded-2xl font-bold text-xl" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <FormField control={typedControl} name="ptype" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ''}>
                        <FormControl><SelectTrigger className="h-14 rounded-2xl bg-card text-foreground border-border hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary data-[state=open]:bg-accent data-[state=open]:shadow-md data-[state=open]:ring-2 data-[state=open]:ring-offset-2 data-[state=open]:ring-primary"><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent className="bg-popover text-popover-foreground border-popover shadow-lg data-[side=top]:animate-slideDown data-[side=bottom]:animate-slideUp z-[1000]">{PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={typedControl} name="province" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Province</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl" /></FormControl></FormItem>
                  )} />
                  <FormField control={typedControl} name="town" render={({ field }) => (
                    <FormItem><FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Town</FormLabel><FormControl><Input {...field} className="h-14 rounded-2xl" /></FormControl></FormItem>
                  )} />
                </div>
              </CardContent>
            </Card>
            {/* SPECS */}
            <Card className="rounded-[3rem] shadow-soft border-border/40 overflow-hidden">
              <CardHeader className="bg-muted/20 border-b px-10 py-8"><CardTitle className="text-2xl font-black flex items-center gap-4"><Maximize className="h-6 w-6 text-primary" />Technical Specifications</CardTitle></CardHeader>
              <CardContent className="p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                <FormField control={typedControl} name="beds" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Bedrooms</FormLabel>
                    <div className="relative"><Bed className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" /><FormControl><Input type="number" {...field} className="pl-12 h-14 rounded-2xl font-black text-lg" /></FormControl></div>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="baths" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Bathrooms</FormLabel>
                    <div className="relative"><Bath className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" /><FormControl><Input type="number" {...field} className="pl-12 h-14 rounded-2xl font-black text-lg" /></FormControl></div>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="living" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Living (m²)</FormLabel>
                    <div className="relative"><Maximize2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" /><FormControl><Input type="number" {...field} className="pl-12 h-14 rounded-2xl font-black text-lg" /></FormControl></div>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="plot" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Plot (m²)</FormLabel>
                    <div className="relative"><LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" /><FormControl><Input type="number" {...field} className="pl-12 h-14 rounded-2xl font-black text-lg" /></FormControl></div>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            {/* FEATURE MATRIX */}
            <Card className="rounded-[3rem] shadow-soft border-border/40 overflow-hidden">
              <CardHeader className="bg-muted/20 border-b px-10 py-8"><CardTitle className="text-2xl font-black flex items-center gap-4"><LayoutGrid className="h-6 w-6 text-primary" />Feature Intelligence Matrix</CardTitle></CardHeader>
              <CardContent className="p-10 space-y-12">
                {featureGroups.map((group, idx) => (
                  <div key={idx} className="space-y-6">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] pl-2">{group.label}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {group.items.map(f => (
                        <FormField key={f.name} control={typedControl} name={f.name as any} render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-5 bg-muted/10 rounded-3xl border border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3"><f.icon className="h-5 w-5 opacity-40 text-primary group-hover:opacity-100 transition-opacity" /><span className="text-[10px] font-black uppercase tracking-wider">{f.label}</span></div>
                            <FormControl><Switch checked={!!field.value} onCheckedChange={field.onChange} /></FormControl>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            {/* LOCALIZATION */}
            <Card className="rounded-[3rem] shadow-soft border-border/40 overflow-hidden">
              <CardHeader className="bg-muted/20 border-b px-10 py-8"><CardTitle className="text-2xl font-black flex items-center gap-4"><Languages className="h-6 w-6 text-primary" />Global Localization</CardTitle></CardHeader>
              <CardContent className="p-10">
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="bg-muted/30 p-1.5 rounded-2xl h-14 mb-8">
                    <TabsTrigger value="en" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-background">English</TabsTrigger>
                    <TabsTrigger value="de" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-background">Deutsch</TabsTrigger>
                    <TabsTrigger value="fr" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-background">Français</TabsTrigger>
                    <TabsTrigger value="nl" className="rounded-xl px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-background">Nederlands</TabsTrigger>
                  </TabsList>
                  <TabsContent value="en" className="space-y-6">
                    <FormField control={typedControl} name="description" render={({ field }) => (
                      <FormItem><FormLabel className="text-[10px] font-black uppercase opacity-60">Primary Portfolio Description</FormLabel><FormControl><Textarea {...field} className="min-h-[300px] rounded-[2rem] p-6 text-lg leading-relaxed" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </TabsContent>
                  {['DE', 'FR', 'NL'].map(lang => (
                    <TabsContent key={lang} value={lang.toLowerCase()}>
                       <FormField control={typedControl} name={lang as any} render={({ field }) => (
                        <FormItem><FormLabel className="text-[10px] font-black uppercase opacity-60">{lang} Translation</FormLabel><FormControl><Textarea {...field} className="min-h-[300px] rounded-[2rem] p-6 text-lg leading-relaxed" placeholder={`Pending ${lang} localization...`} /></FormControl></FormItem>
                      )} />
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-4 space-y-12">
            {/* PRICING CARD */}
            <Card className="rounded-[3rem] shadow-glow bg-primary text-primary-foreground border-none p-10 space-y-10">
              <div className="space-y-2">
                 <h2 className="text-sm font-black uppercase tracking-[0.3em] opacity-80">Market Valuation</h2>
                 <p className="text-xs opacity-60 font-bold uppercase">Cloud Synchronized Data</p>
              </div>
              <div className="space-y-8">
                <FormField control={typedControl} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black opacity-80 uppercase tracking-widest">Listing Price (USD)</FormLabel>
                    <FormControl><Input type="number" {...field} className="h-20 rounded-[2rem] bg-white/10 border-white/20 text-white text-4xl font-black font-display tracking-tighter text-center" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="originalprice" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black opacity-80 uppercase tracking-widest">Valuation Baseline</FormLabel>
                    <FormControl><Input type="number" {...field} className="h-16 rounded-2xl bg-white/10 border-white/20 text-white text-xl font-bold text-center" /></FormControl>
                  </FormItem>
                )} />
                <div className="h-px bg-white/10" />
                <FormField control={typedControl} name="salestage" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black opacity-80 uppercase tracking-widest text-center block">Sales stage Velocity</FormLabel>
                    <Select onValueChange={field.onChange} value={String(field.value || 0)}>
                      <FormControl><SelectTrigger className="h-16 rounded-2xl bg-card text-card-foreground border-card font-black text-lg hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary data-[state=open]:bg-accent data-[state=open]:shadow-md data-[state=open]:ring-2 data-[state=open]:ring-offset-2 data-[state=open]:ring-primary text-center"><SelectValue className="font-bold" /></SelectTrigger></FormControl>
                      <SelectContent className="backdrop-blur-sm bg-popover/95 text-popover-foreground border-popover shadow-lg data-[side=top]:animate-slideDown data-[side=bottom]:animate-slideUp z-[1000]"><SelectItem value="0">FOR SALE (ACTIVE)</SelectItem><SelectItem value="1">RESERVED (PENDING)</SelectItem><SelectItem value="2">SOLD (COMPLETE)</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="display" render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-6 bg-black/20 rounded-[2rem] border border-white/5">
                    <span className="text-[10px] font-black opacity-80 uppercase tracking-widest">Public Visibility</span>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-500" /></FormControl>
                  </FormItem>
                )} />
              </div>
            </Card>
            {/* GALLERY ENTRY */}
            <Card className="rounded-[3rem] border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all p-10 text-center space-y-6 group">
              <div className="h-20 w-20 rounded-[2rem] bg-white shadow-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <ImageIcon className="h-10 w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black">Media Assets</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Managed Cloud Bucket</p>
              </div>
              {isEditing ? (
                 <Button type="button" onClick={() => setIsImageManagerOpen(true)} className="w-full h-16 rounded-[2rem] font-black text-lg bg-white text-primary hover:bg-white/90 shadow-2xl">
                    Manage Gallery ({property?.images?.length || 0})
                 </Button>
              ) : (
                <div className="p-6 bg-muted/40 rounded-3xl border border-dashed border-muted-foreground/20 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <p className="text-[10px] font-black text-muted-foreground uppercase leading-relaxed text-left">Gallery activation requires record persistence. Publish the property first.</p>
                </div>
              )}
            </Card>
            {/* AUDIT */}
            {isEditing && property && (
              <div className="p-8 bg-muted/20 rounded-[3rem] border border-border/40 space-y-6">
                <div className="flex items-start gap-4">
                  <History className="h-6 w-6 text-muted-foreground opacity-30 mt-1" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Last Database Sync</span>
                    <p className="font-bold text-sm">{format(new Date(property.lastEdited || Date.now()), 'HH:mm:ss • MMM dd, yyyy')}</p>
                  </div>
                </div>
                <div className="h-px bg-border/40" />
                <div className="flex items-start gap-4">
                  <Building2 className="h-6 w-6 text-muted-foreground opacity-30 mt-1" />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Object ID</span>
                    <p className="font-mono text-[10px] break-all opacity-60">{property.id}</p>
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