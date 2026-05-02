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
  History
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
import { cn } from '@/lib/utils';
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
  luxury: z.boolean().default(false),
  pool: z.boolean().default(false),
  beach: z.boolean().default(false),
  aircon: z.boolean().default(false),
  heating: z.boolean().default(false),
  finca: z.boolean().default(false),
  penthouse: z.boolean().default(false),
  golf: z.boolean().default(false),
  offplan: z.boolean().default(false),
  furnished: z.boolean().default(false),
  kitchen: z.boolean().default(false),
  utility: z.boolean().default(false),
  solarium: z.boolean().default(false),
  balconies: z.boolean().default(false),
  fireplace: z.boolean().default(false),
  topsix: z.boolean().default(false),
  kyeroPrime: z.boolean().default(false),
});
type PropertyFormValues = z.infer<typeof propertySchema>;
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
    defaultValues: { ref: '', title: '', ptype: 'Villa', display: true, salestage: 0, price: 0, originalprice: 0 },
  });
  const typedControl = form.control as unknown as Control<PropertyFormValues>;
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
  }, [property, form]);
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
  const features = useMemo(() => [
    { name: 'rental', label: 'Rental', icon: CircleDollarSign },
    { name: 'luxury', label: 'Luxury', icon: ImageIcon },
    { name: 'pool', label: 'Pool', icon: Waves },
    { name: 'beach', label: 'Beach', icon: Home },
    { name: 'aircon', label: 'Aircon', icon: Wind },
    { name: 'heating', label: 'Heating', icon: Wind },
    { name: 'topsix', label: 'Top 6', icon: CheckCircle2 },
    { name: 'kyeroPrime', label: 'Kyero', icon: CheckCircle2 },
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
          <Button onClick={form.handleSubmit(v => mutation.mutate(v))} className="h-12 px-8 btn-gradient rounded-xl font-bold shadow-xl" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
            {isEditing ? 'Update Entry' : 'Publish to Portal'}
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
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
                  {['province', 'town', 'location'].map(key => (
                    <FormField key={key} control={typedControl} name={key as any} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-black uppercase tracking-widest">{key}</FormLabel>
                        <FormControl><Input {...field} className="h-11 rounded-xl" /></FormControl>
                      </FormItem>
                    )} />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] shadow-soft border-border/50">
              <CardHeader className="bg-muted/10 border-b p-8"><CardTitle className="text-xl flex items-center gap-3"><LayoutGrid className="h-5 w-5 text-primary" />Feature Grid</CardTitle></CardHeader>
              <CardContent className="p-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {features.map(f => (
                  <FormField key={f.name} control={typedControl} name={f.name as any} render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border hover:border-primary/20">
                      <div className="flex items-center gap-2"><f.icon className="h-4 w-4 opacity-40" /><span className="text-[10px] font-black uppercase tracking-wider">{f.label}</span></div>
                      <FormControl><Switch checked={!!field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-10">
            <Card className="rounded-[2.5rem] shadow-glow overflow-hidden bg-primary text-primary-foreground">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Valuation & Liquidity</CardTitle></CardHeader>
              <CardContent className="p-8 space-y-6">
                <FormField control={typedControl} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold opacity-80">MARKET PRICE ($)</FormLabel>
                    <FormControl><Input type="number" {...field} className="h-16 rounded-3xl bg-white/10 border-white/20 text-white text-3xl font-black font-display tracking-tighter" /></FormControl>
                  </FormItem>
                )} />
                <FormField control={typedControl} name="salestage" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold opacity-80">SALES VELOCITY</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value.toString()}>
                      <FormControl><SelectTrigger className="h-12 rounded-2xl bg-white/10 border-white/20"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent><SelectItem value="0">FOR SALE</SelectItem><SelectItem value="1">RESERVED</SelectItem><SelectItem value="2">SOLD</SelectItem></SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </CardContent>
            </Card>
            <Card className="rounded-[2rem] border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
              <CardHeader className="text-center"><CardTitle className="text-xl">Media Assets</CardTitle></CardHeader>
              <CardContent className="p-8 text-center space-y-4">
                {isEditing ? (
                   <Button onClick={() => setIsImageManagerOpen(true)} className="w-full h-14 rounded-2xl font-black text-lg bg-white text-primary hover:bg-white/90">
                    Manage Portfolio ({property?.images?.length || 0})
                   </Button>
                ) : (
                  <p className="text-xs font-bold text-muted-foreground uppercase leading-relaxed">Gallery activation available after initial publication.</p>
                )}
              </CardContent>
            </Card>
            {isEditing && property?.lastEdited && (
              <div className="p-6 bg-muted/20 rounded-[2rem] flex items-center gap-4 text-muted-foreground">
                <History className="h-5 w-5 opacity-40" />
                <div className="text-[10px] font-black uppercase tracking-widest leading-tight">
                  Last Sync: {format(new Date(property.lastEdited), 'HH:mm • MMM d')}
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