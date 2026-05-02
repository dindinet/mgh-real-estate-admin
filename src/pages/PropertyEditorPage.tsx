import React, { useEffect, useState } from 'react';
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
  MapPin,
  CircleDollarSign,
  Info,
  Image as ImageIcon,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  beds: z.coerce.number().min(0),
  baths: z.coerce.number().min(0),
  display: z.boolean().default(true),
  salestage: z.coerce.number().min(0).max(2).default(0),
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
      beds: 0,
      baths: 0,
      display: true,
      salestage: 0,
    },
  });
  const typedControl = form.control as unknown as Control<PropertyFormValues>;
  useEffect(() => {
    if (existingProperty) {
      form.reset({
        ref: existingProperty.ref,
        kref: existingProperty.kref || '',
        title: existingProperty.title,
        ptype: existingProperty.ptype,
        province: existingProperty.province,
        town: existingProperty.town,
        location: existingProperty.location,
        area: existingProperty.area || '',
        price: existingProperty.price,
        originalprice: existingProperty.originalprice,
        beds: existingProperty.beds,
        baths: existingProperty.baths,
        display: existingProperty.display,
        salestage: existingProperty.salestage,
      });
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
  if (isEditing && isLoadingProperty) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/properties')} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold tracking-tight text-primary">
                {isEditing ? 'Edit MGH Listing' : 'New MGH Listing'}
              </h1>
              <p className="text-muted-foreground">
                MaxGoldHouse Portfolio • {isEditing ? `Ref: ${ref}` : 'Crafting a new luxury entry'}
              </p>
            </div>
          </div>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-border/50 shadow-soft overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Info className="h-5 w-5" />
                      <CardTitle className="text-lg">Core Information</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={typedControl}
                        name="ref"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Public Reference</FormLabel>
                            <FormControl>
                              <Input placeholder="MGH-000" {...field} disabled={isEditing} className="h-11 rounded-xl uppercase font-bold" />
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
                            <FormLabel>Legacy Reference (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="K-000" {...field} className="h-11 rounded-xl" />
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
                          <FormLabel>Property Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Modern Glass Villa" {...field} className="h-11 rounded-xl" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={typedControl}
                        name="province"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Province</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Alicante" {...field} className="h-11 rounded-xl" />
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
                            <FormLabel>Town</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Javea" {...field} className="h-11 rounded-xl" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/50 shadow-soft overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <CircleDollarSign className="h-5 w-5" />
                      <CardTitle className="text-lg">Price & Status</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={typedControl}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Active Price ($)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} className="h-11 rounded-xl font-bold text-primary" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={typedControl}
                        name="salestage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sales Stage</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl">
                                  <SelectValue placeholder="Select stage" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="0">For Sale (Available)</SelectItem>
                                <SelectItem value="1">Reserved</SelectItem>
                                <SelectItem value="2">Sold</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-dashed">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold">Public Visibility</p>
                        <p className="text-xs text-muted-foreground">Toggle visibility on the main website portal</p>
                      </div>
                      <FormField
                        control={typedControl}
                        name="display"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-8">
                <Card className={cn("border-border/50 shadow-soft", isEditing ? "bg-card" : "bg-muted/10")}>
                  <CardHeader>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <ImageIcon className="h-5 w-5" />
                      <CardTitle className="text-lg">Gallery</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-center py-6 px-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="aspect-video rounded-2xl bg-slate-100 overflow-hidden border">
                          {existingProperty?.images?.[0] ? (
                            <img src={existingProperty.images[0]} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center opacity-20"><ImageIcon className="h-10 w-10" /></div>
                          )}
                        </div>
                        <Button variant="outline" className="w-full h-11 rounded-xl font-bold" type="button" onClick={() => setIsImageManagerOpen(true)}>
                          Manage Media
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Save basic details first to upload images</p>
                    )}
                  </CardContent>
                </Card>
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full h-14 btn-gradient rounded-2xl font-bold text-lg shadow-xl" disabled={mutation.isPending}>
                    {mutation.isPending ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Save className="mr-2 h-6 w-6" />}
                    {isEditing ? 'Update Property' : 'Publish Property'}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full h-12 rounded-xl" onClick={() => navigate('/properties')}>Cancel</Button>
                </div>
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