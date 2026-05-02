import React, { useEffect, useState, useMemo } from 'react';
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
  Maximize
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
  FormDescription,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ImageManager } from '@/components/media/ImageManager';
import { cn } from '@/lib/utils';
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
});
type PropertyFormValues = z.infer<typeof propertySchema>;
export function PropertyEditorPage() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isImageManagerOpen, setIsImageManagerOpen] = useState(false);
  const isEditing = !!ref;
  const { data: existingProperty, isLoading: isLoadingProperty } = useQuery({
    queryKey: ['property', ref],
    queryFn: () => api<Property>(`/api/properties/${ref}`),
    enabled: isEditing,
  });
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: {
      ref: '',
      kref: '',
      title: '',
      ptype: 'Villa',
      province: '',
      town: '',
      location: '',
      area: '',
      price: 0,
      originalprice: 0,
      frequency: 'Sale',
      beds: 0,
      baths: 0,
      living: 0,
      plot: 0,
      display: true,
      salestage: 0,
      description: '',
      moredetails: '',
      DE: '',
      FR: '',
      NL: '',
      rental: false,
      finca: false,
      penthouse: false,
      luxury: false,
      offplan: false,
      leasehold: false,
      golf: false,
      beach: false,
      aircon: false,
      pool: false,
      fireplace: false,
      heating: false,
      solarium: false,
      balconies: false,
      furnished: false,
      kitchen: false,
      utility: false,
      topsix: false,
      kyeroPrime: false,
    },
  });
  const typedControl = form.control as unknown as Control<PropertyFormValues>;
  useEffect(() => {
    if (existingProperty) {
      form.reset({
        ...existingProperty,
        kref: existingProperty.kref || '',
        area: existingProperty.area || '',
        DE: existingProperty.DE || '',
        FR: existingProperty.FR || '',
        NL: existingProperty.NL || '',
      } as any);
    }
  }, [existingProperty, form]);
  const mutation = useMutation({
    mutationFn: (values: PropertyFormValues) => {
      const method = isEditing ? 'PATCH' : 'POST';
      const endpoint = isEditing ? `/api/properties/${ref}` : '/api/properties';
      return api<Property>(endpoint, {
        method,
        body: JSON.stringify({
          ...values,
          lastEdited: new Date().toISOString(),
          ...(isEditing ? {} : { created: new Date().toISOString(), kdate: new Date().toISOString(), images: [] })
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(isEditing ? 'Property updated' : 'Property published');
      navigate('/properties');
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : 'Save failed'),
  });
  const features = useMemo(() => [
    { name: 'rental', label: 'Rental Potential', icon: CircleDollarSign },
    { name: 'luxury', label: 'Luxury Listing', icon: ImageIcon },
    { name: 'pool', label: 'Swimming Pool', icon: Waves },
    { name: 'beach', label: 'Near Beach', icon: Home },
    { name: 'aircon', label: 'Air Conditioning', icon: Wind },
    { name: 'heating', label: 'Heating System', icon: Wind },
    { name: 'finca', label: 'Finca/Country', icon: Home },
    { name: 'penthouse', label: 'Penthouse', icon: Home },
    { name: 'golf', label: 'Golf Frontline', icon: Home },
    { name: 'offplan', label: 'Off Plan', icon: Home },
    { name: 'furnished', label: 'Furnished', icon: Home },
    { name: 'kitchen', label: 'Equipped Kitchen', icon: Home },
    { name: 'utility', label: 'Utility Room', icon: Home },
    { name: 'solarium', label: 'Solarium', icon: Wind },
    { name: 'balconies', label: 'Balconies', icon: Home },
    { name: 'fireplace', label: 'Fireplace', icon: Wind },
    { name: 'topsix', label: 'Top Six Selection', icon: CheckCircle2 },
    { name: 'kyeroPrime', label: 'Kyero Prime', icon: CheckCircle2 },
  ], []);
  if (isEditing && isLoadingProperty) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-10 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/properties')} className="rounded-full h-12 w-12 hover:bg-muted">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">
                {isEditing ? 'Modify Portfolio' : 'New Listing'}
              </h1>
              <p className="text-muted-foreground font-medium">
                {isEditing ? `Referencing ID: ${ref}` : 'Expanding the MaxGoldHouse luxury collection'}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
             <Button type="button" variant="outline" className="h-12 px-6 rounded-xl font-bold" onClick={() => navigate('/properties')}>Cancel</Button>
             <Button
                onClick={form.handleSubmit((values) => mutation.mutate(values))}
                className="h-12 px-8 btn-gradient rounded-xl font-bold shadow-xl min-w-[160px]"
                disabled={mutation.isPending}
             >
                {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {isEditing ? 'Save Changes' : 'Publish Property'}
             </Button>
          </div>
        </div>
        <Form {...form}>
          <form className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-10">
                <Card className="border-border/50 shadow-soft overflow-hidden rounded-3xl">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex items-center gap-2 text-primary">
                      <Info className="h-5 w-5" />
                      <CardTitle className="text-lg">Identity & Location</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <FormField
                        control={typedControl}
                        name="ref"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Internal Reference</FormLabel>
                            <FormControl>
                              <Input placeholder="MGH-000" {...field} disabled={isEditing} className="h-12 rounded-xl border-2 focus:border-primary uppercase font-bold text-lg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={typedControl}
                        name="kref"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">External Legacy ID</FormLabel>
                            <FormControl>
                              <Input placeholder="K-000" {...field} className="h-12 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={typedControl}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Property Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Modern Glass Villa with Ocean Views" {...field} className="h-12 rounded-xl text-lg font-medium" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField
                        control={typedControl}
                        name="ptype"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Property Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-xl">
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Villa">Villa</SelectItem>
                                <SelectItem value="Apartment">Apartment</SelectItem>
                                <SelectItem value="Finca">Finca</SelectItem>
                                <SelectItem value="Townhouse">Townhouse</SelectItem>
                                <SelectItem value="Penthouse">Penthouse</SelectItem>
                                <SelectItem value="Plot">Plot</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={typedControl}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Province</FormLabel>
                            <FormControl>
                              <Input placeholder="Alicante" {...field} className="h-12 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={typedControl}
                        name="town"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Town</FormLabel>
                            <FormControl>
                              <Input placeholder="Javea" {...field} className="h-12 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 shadow-soft overflow-hidden rounded-3xl">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex items-center gap-2 text-primary">
                      <Languages className="h-5 w-5" />
                      <CardTitle className="text-lg">Multilingual Content</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <Tabs defaultValue="EN" className="space-y-6">
                      <TabsList className="bg-muted p-1 rounded-xl h-auto grid grid-cols-4">
                        <TabsTrigger value="EN" className="rounded-lg py-2 font-bold">EN</TabsTrigger>
                        <TabsTrigger value="DE" className="rounded-lg py-2 font-bold">DE</TabsTrigger>
                        <TabsTrigger value="FR" className="rounded-lg py-2 font-bold">FR</TabsTrigger>
                        <TabsTrigger value="NL" className="rounded-lg py-2 font-bold">NL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="EN">
                        <FormField
                          control={typedControl}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">English Description</FormLabel>
                              <FormControl><Textarea {...field} className="min-h-[200px] rounded-2xl resize-none" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="DE">
                        <FormField
                          control={typedControl}
                          name="DE"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">German Description</FormLabel>
                              <FormControl><Textarea {...field} className="min-h-[200px] rounded-2xl resize-none" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="FR">
                        <FormField
                          control={typedControl}
                          name="FR"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">French Description</FormLabel>
                              <FormControl><Textarea {...field} className="min-h-[200px] rounded-2xl resize-none" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      <TabsContent value="NL">
                        <FormField
                          control={typedControl}
                          name="NL"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold">Dutch Description</FormLabel>
                              <FormControl><Textarea {...field} className="min-h-[200px] rounded-2xl resize-none" /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                <Card className="border-border/50 shadow-soft overflow-hidden rounded-3xl">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex items-center gap-2 text-primary">
                      <LayoutGrid className="h-5 w-5" />
                      <CardTitle className="text-lg">Property Amenities & Features</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-4">
                      {features.map((feature) => (
                        <FormField
                          key={feature.name}
                          control={typedControl}
                          name={feature.name as any}
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between space-y-0 bg-muted/20 p-4 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                              <div className="flex items-center gap-3">
                                <feature.icon className="h-4 w-4 text-primary/60" />
                                <FormLabel className="text-xs font-semibold cursor-pointer">{feature.label}</FormLabel>
                              </div>
                              <FormControl>
                                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-10">
                <Card className="border-border/50 shadow-soft rounded-3xl overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex items-center gap-2 text-primary">
                      <CircleDollarSign className="h-5 w-5" />
                      <CardTitle className="text-lg">Pricing & Status</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <FormField
                      control={typedControl}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-xs uppercase text-muted-foreground">Listing Price ($)</FormLabel>
                          <FormControl><Input type="number" {...field} className="h-12 rounded-xl font-bold text-xl text-primary border-2 border-primary/20" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={typedControl}
                      name="salestage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-xs uppercase text-muted-foreground">Global Sales Stage</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value.toString()}>
                            <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="0">For Sale</SelectItem>
                              <SelectItem value="1">Reserved</SelectItem>
                              <SelectItem value="2">Sold</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
                <Card className="border-border/50 shadow-soft rounded-3xl overflow-hidden">
                  <CardHeader className="bg-muted/30 border-b">
                    <div className="flex items-center gap-2 text-primary">
                      <Maximize className="h-5 w-5" />
                      <CardTitle className="text-lg">Specifications</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={typedControl}
                        name="beds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-[10px] uppercase text-muted-foreground">Beds</FormLabel>
                            <FormControl><Input type="number" {...field} className="h-10 rounded-xl" /></FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={typedControl}
                        name="baths"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-[10px] uppercase text-muted-foreground">Baths</FormLabel>
                            <FormControl><Input type="number" {...field} className="h-10 rounded-xl" /></FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className={cn("border-border/50 shadow-soft rounded-3xl overflow-hidden", isEditing ? "bg-card" : "bg-muted/10")}>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <ImageIcon className="h-5 w-5" />
                      <CardTitle className="text-lg">Media Gallery</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center py-4 px-4">
                    {isEditing ? (
                      <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-2" type="button" onClick={() => setIsImageManagerOpen(true)}>
                        Manage Media Assets ({existingProperty?.images?.length || 0})
                      </Button>
                    ) : (
                      <div className="bg-muted/20 p-4 rounded-xl text-xs font-medium text-muted-foreground">
                        Publish first to activate media uploads.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
        {isEditing && existingProperty && (
          <ImageManager
            isOpen={isImageManagerOpen}
            onClose={() => setIsImageManagerOpen(false)}
            propertyRef={existingProperty.ref}
            initialImages={existingProperty.images}
          />
        )}
      </div>
    </div>
  );
}