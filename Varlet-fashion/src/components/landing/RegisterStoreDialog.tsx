import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";

import { supabase } from "@/lib/supabase";
import { registerShop } from "@/lib/shopRegistration";
import { useAppCta } from "./AppCtaContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";

const CATEGORIES = ["Streetwear", "Men's Wear", "Women's Wear", "Ethnic Wear", "Footwear", "Accessories"];

// MG Road, Bengaluru — same fallback the mobile app uses when location
// access is unavailable, so a store can still be placed on the map.
const FALLBACK_COORDS = { lat: 12.9757, lng: 77.6070 };

const schema = z.object({
  ownerName: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
  storeName: z.string().min(2, "Enter your store name"),
  description: z.string().optional(),
  category: z.string().min(1, "Pick a category"),
  locationText: z.string().min(2, "Enter your store's location"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterStoreDialog() {
  const { registerOpen, setRegisterOpen } = useAppCta();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerName: "", email: "", password: "", storeName: "",
      description: "", category: "", locationText: "",
    },
  });

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setCoords(FALLBACK_COORDS);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setCoords(FALLBACK_COORDS);
        setLocating(false);
      },
      { timeout: 8000 },
    );
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { data: { name: values.ownerName } },
      });
      if (signUpError) throw signUpError;
      if (!signUpData.session) {
        throw new Error("Check your email to confirm your account, then register your store from the app.");
      }

      const point = coords ?? FALLBACK_COORDS;
      await registerShop({
        name: values.storeName,
        description: values.description ?? "",
        category: values.category,
        locationText: values.locationText,
        lat: point.lat,
        lng: point.lng,
      });

      setSuccess(values.storeName);
      form.reset();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const close = (open: boolean) => {
    setRegisterOpen(open);
    if (!open) {
      setSuccess(null);
      setSubmitError(null);
    }
  };

  return (
    <Dialog open={registerOpen} onOpenChange={close}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {success ? (
          <div className="flex flex-col items-center py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <DialogTitle className="mt-4 text-xl">{success} is registered!</DialogTitle>
            <DialogDescription className="mt-2">
              Your owner account is live. Download the Varlet app and sign in with your new email to manage products, orders and promotions.
            </DialogDescription>
            <Button className="mt-6" onClick={() => close(false)}>Done</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Register your store</DialogTitle>
              <DialogDescription>
                Create your owner account and list your store — both happen in one step. You'll manage it from the Varlet app.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="ownerName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your name</FormLabel>
                    <FormControl><Input placeholder="Priya Nair" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input type="email" placeholder="owner@yourshop.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="Min. 8 characters" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="storeName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store name</FormLabel>
                    <FormControl><Input placeholder="Urban Thread Co." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl><Textarea placeholder="What does your store sell?" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="locationText" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input placeholder="MG Road, Bengaluru" {...field} /></FormControl>
                    <div className="flex items-center justify-between">
                      <FormMessage />
                      <button
                        type="button"
                        onClick={useCurrentLocation}
                        className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                      >
                        <MapPin className="h-3 w-3" />
                        {locating ? "Locating…" : coords ? "Location set" : "Use my current location"}
                      </button>
                    </div>
                  </FormItem>
                )} />

                {submitError && <p className="text-sm font-medium text-destructive">{submitError}</p>}

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? "Registering…" : "Register store"}
                </Button>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
