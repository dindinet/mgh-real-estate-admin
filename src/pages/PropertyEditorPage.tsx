import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Property } from '@shared/types';
import {
  ChevronLeft,
  Save,
  Loader2,
  Building2,
  MapPin,
  CircleDollarSign,
  Info,
  Image as ImageIcon
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
import { toast } from 'sonner';
const propertySchema = z.object({
  ref: z.string().min(3, 'Reference must be at least 3 characters'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  beds: z.coerce.number().min(0, 'Beds must be 0 or more'),
  baths: z.coerce.number().min(0, 'Baths must be 0 or more'),
  location: z.string().min(3, 'Location is required'),
});
type PropertyFormValues = z.infer<typeof propertySchema>;
export function PropertyEditorPage() {
  const { ref } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!ref;
  const { data: existingProperty, isLoading: isLoadingProperty } = useQuery({
    queryKey: ['property', ref],
    queryFn: () => api<Property>(`/api/properties/${ref}`),
    enabled: isEditing,
  });
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      ref: '',
      title: '',
      price: 0,
      beds: 0,
      baths: 0,
      location: '',
    },
  });
  useEffect(() => {
    if (existingProperty) {
      form.reset({
        ref: existingProperty.ref,
        title: existingProperty.title,
        price: existingProperty.price,
        beds: existingProperty.beds,
        baths: existingProperty.baths,
        location: existingProperty.location,
      });
    }
  }, [existingProperty, form]);
  const mutation = useMutation({
    mutationFn: (values: PropertyFormValues) => {
      return api<Property>('/api/properties', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success(isEditing ? 'Property updated' : 'Property created');
      navigate('/properties');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Save failed');
    },
  });
  function onSubmit(values: PropertyFormValues) {
    mutation.mutate(values);
  }
  if (isEditing && isLoadingProperty) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/properties')} className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight">
              {isEditing ? 'Edit Property' : 'New Property Listing'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? `Ref: ${ref}` : 'Create a stunning new luxury listing'}
            </p>
          </div>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card className="border-border/50 shadow-soft">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary">
                    <Info className="h-5 w-5" />
                    <CardTitle>Basic Information</CardTitle>
                  </div>
                  <CardDescription>Primary identification details for the listing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ref"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reference Code</FormLabel>
                          <FormControl>
                            <Input placeholder="LUM-000" {...field} disabled={isEditing} className="h-11 rounded-xl uppercase" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Beverly Hills, CA" {...field} className="pl-10 h-11 rounded-xl" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/50 shadow-soft">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary">
                    <CircleDollarSign className="h-5 w-5" />
                    <CardTitle>Pricing & Stats</CardTitle>
                  </div>
                  <CardDescription>Numerical data and property specifications</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="beds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bedrooms</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="baths"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bathrooms</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.5" {...field} className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-8">
              <Card className="border-border/50 shadow-soft bg-secondary/30">
                <CardHeader>
                  <div className="flex items-center gap-2 text-primary">
                    <ImageIcon className="h-5 w-5" />
                    <CardTitle>Media Content</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="text-center py-6">
                  {isEditing && existingProperty?.images?.length ? (
                    <div className="space-y-4">
                      <div className="relative aspect-[16/10] rounded-xl overflow-hidden shadow-inner bg-slate-200">
                        <img 
                          src={existingProperty.images[0]} 
                          className="object-cover w-full h-full"
                          alt="Cover"
                        />
                        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-white text-2xs">
                          {existingProperty.images.length} Photos
                        </div>
                      </div>
                      <Button variant="outline" className="w-full rounded-xl" type="button">
                        Manage Gallery
                      </Button>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-muted rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
                      <Building2 className="h-10 w-10 mb-2 opacity-20" />
                      <p className="text-sm">Save first to enable media management</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 btn-gradient rounded-xl font-bold text-lg"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-5 w-5" />
                  )}
                  {isEditing ? 'Update Listing' : 'Publish Listing'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full h-11 rounded-xl"
                  onClick={() => navigate('/properties')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}