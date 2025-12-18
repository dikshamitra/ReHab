"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { differenceInDays } from "date-fns";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getCopingStrategiesAction } from "./actions";
import { type CopingStrategyOutput } from "@/ai/flows/coping-strategy-suggestions";
import { ADDICTION_TYPES } from "@/lib/constants";
import type { UserData } from "./../dashboard/page";

const formSchema = z.object({
  addictionType: z.string().min(1, "Please select an addiction type."),
  progress: z.string().min(1, "Please enter your progress."),
  triggers: z.string().min(5, "Please describe your triggers in a bit more detail."),
});

type FormValues = z.infer<typeof formSchema>;

export default function CopingStrategiesPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<CopingStrategyOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      addictionType: "",
      progress: "",
      triggers: "",
    },
  });

  useEffect(() => {
    const fetchUserData = async (uid: string) => {
        try {
            const userDocRef = doc(db, "users", uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
                const { addictionType, quitDate } = docSnap.data() as UserData;
                form.setValue("addictionType", addictionType);
                if (quitDate) {
                    const days = differenceInDays(new Date(), new Date(quitDate));
                    form.setValue("progress", `${days} days sober`);
                }
            }
        } catch (error) {
            console.error("Could not load user data for pre-fill", error);
        }
    };
    
    const unsubscribe = auth.onAuthStateChanged(user => {
        if (user) {
            fetchUserData(user.uid);
        }
    });

    return () => unsubscribe();
  }, [form]);


  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const result = await getCopingStrategiesAction(values);
      if (result.success) {
        setSuggestions(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Find Coping Strategies
        </h1>
        <p className="text-muted-foreground mb-6">
          Feeling an urge? Describe your situation to get personalized, AI-powered suggestions.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="addictionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Addiction Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the type of addiction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ADDICTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Progress</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2 weeks sober, cutting down" {...field} />
                  </FormControl>
                  <FormDescription>
                    How are you doing with your goal?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="triggers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Triggers & Situation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Feeling stressed after work, seeing friends drink"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    What's making you feel the urge right now?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                 <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get Suggestions
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Your Suggested Strategies</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isPending && (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Finding the best strategies for you...</p>
                </div>
            )}
            {!isPending && !suggestions && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Your personalized strategies will appear here.</p>
              </div>
            )}
            {!isPending && suggestions && (
                <ul className="space-y-3">
                    {suggestions.strategies.map((strategy, index) => (
                        <li key={index} className="animate-in fade-in-0 slide-in-from-top-2 duration-500 ease-out" style={{animationDelay: `${index * 100}ms`}}>
                            <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>{strategy}</AlertTitle>
                            </Alert>
                        </li>
                    ))}
                </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
