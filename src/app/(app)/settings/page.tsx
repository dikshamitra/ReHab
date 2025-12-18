
"use client";

import { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, subDays, isSameDay } from "date-fns";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User, ConsumptionLog } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ADDICTION_TYPES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, AlertTriangle } from "lucide-react";


const settingsSchema = z.object({
  displayName: z.string().min(1, "Name is required."),
  addictionType: z.string().min(1, "Please select an addiction type."),
  dailySpending: z.coerce.number().min(0, "Spending must be a positive number."),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

function calculateStreak(logs: ConsumptionLog[]): { streak: number, longestStreak: number } {
    if (!logs || logs.length === 0) return { streak: 0, longestStreak: 0 };

    const sortedLogs = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreak = 0;
    let longestStreak = 0;
    let streakEnded = false;

    // Check if today's log exists and if consumption happened
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const todayLog = sortedLogs.find(l => l.date === todayStr);
    if (todayLog?.consumed) {
        // if consumed today, streak is 0
    } else {
       // Check from yesterday backwards
        for (let i = 0; i < sortedLogs.length; i++) {
            const logDate = new Date(sortedLogs[i].date);
            const expectedDate = subDays(new Date(), currentStreak);
            
            if (isSameDay(logDate, subDays(new Date(), 1)) && !sortedLogs[i].consumed && !streakEnded) {
                currentStreak++;
            } else if (!streakEnded && i > 0) {
                 const prevDate = new Date(sortedLogs[i-1].date);
                 if(isSameDay(logDate, subDays(prevDate, 1)) && !sortedLogs[i].consumed) {
                    currentStreak++;
                 } else if(!isSameDay(logDate, prevDate)) {
                    streakEnded = true;
                 }
            }
             if (sortedLogs[i].consumed) {
                if(longestStreak < currentStreak) {
                    longestStreak = currentStreak;
                }
                if(!isSameDay(logDate, new Date())) streakEnded = true;
             }
        }
    }
    
    if(longestStreak < currentStreak) longestStreak = currentStreak;
    // Check if the streak continues from today
    if (todayLog && !todayLog.consumed && sortedLogs.length > 0) {
        const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");
        const yesterdayLog = sortedLogs.find(l => l.date === yesterdayStr);
        if (yesterdayLog && !yesterdayLog.consumed) {
           // streak continues
        } else if (yesterdayLog && yesterdayLog.consumed) {
            currentStreak = 1;
        } else if (!yesterdayLog) {
            currentStreak = 1;
        }
    } else if (todayLog && !todayLog.consumed) {
        currentStreak = 1;
    }


    const lastLog = sortedLogs[0];
    if (lastLog.consumed && lastLog.date === todayStr) {
        currentStreak = 0;
    }


    return { streak: currentStreak, longestStreak };
}


export default function SettingsPage() {
  const { toast } = useToast();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [consumedToday, setConsumedToday] = useState(false);
  const [consumptionNotes, setConsumptionNotes] = useState("");
  const [isLogPending, startLogTransition] = useTransition();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      displayName: "",
      addictionType: "",
      dailySpending: 0,
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubSnapshot = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data() as User;
                setUserData(data);
                form.reset({
                    displayName: data.displayName || "",
                    addictionType: data.addictionType,
                    dailySpending: data.dailySpending || 0,
                });

                const todayLog = data.consumptionLog?.find(log => log.date === todayStr);
                if (todayLog) {
                    setConsumedToday(todayLog.consumed);
                    setConsumptionNotes(todayLog.notes || "");
                } else {
                    setConsumedToday(false);
                    setConsumptionNotes("");
                }
            }
            setLoading(false);
        });
        return () => unsubSnapshot();
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [form, todayStr]);

  const onSubmit = (values: SettingsFormValues) => {
    startTransition(async () => {
      if (!userData?.uid) return;
      const userDocRef = doc(db, "users", userData.uid);
      try {
        await setDoc(userDocRef, values, { merge: true });
        toast({ title: "Success", description: "Your settings have been updated." });
      } catch (error) {
        console.error("Error updating settings:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to update settings." });
      }
    });
  };

  const handleLogConsumption = () => {
    startLogTransition(async () => {
        if (!userData?.uid) return;
        
        // We need the most recent log data to calculate streak
        const userDocRef = doc(db, "users", userData.uid);
        const userDocSnap = await getDoc(userDocRef);
        const latestUserData = userDocSnap.data() as User;

        const newLog: ConsumptionLog = {
            date: todayStr,
            consumed: consumedToday,
            notes: consumptionNotes,
        };

        const updatedLog = latestUserData.consumptionLog ? [...latestUserData.consumptionLog] : [];
        const todayLogIndex = updatedLog.findIndex(log => log.date === todayStr);

        if (todayLogIndex > -1) {
            updatedLog[todayLogIndex] = newLog;
        } else {
            updatedLog.push(newLog);
        }

        const { streak, longestStreak } = calculateStreak(updatedLog);

        try {
            await setDoc(userDocRef, { 
              consumptionLog: updatedLog,
              streak,
              longestStreak,
              points: (latestUserData.points || 0) + (consumedToday ? -5 : 10)
            }, { merge: true });
            toast({ title: "Log Saved", description: `Your consumption for ${format(new Date(), "PPP")} has been logged.` });
        } catch (error) {
            console.error("Error logging consumption:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to save your log." });
        }
    });
  };

  if (loading) {
    return (
        <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
            <Skeleton className="h-96" />
            <Skeleton className="h-64" />
        </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Your Settings</CardTitle>
          <CardDescription>Manage your personal information and recovery goals.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name or nickname" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addictionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Addiction Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                name="dailySpending"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Average Daily Spending (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 500" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Daily Consumption Log</CardTitle>
                <CardDescription>Track your daily progress here. Be honest with yourself.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <AlertTriangle className="text-destructive"/>
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            Did you consume today? ({format(new Date(), 'PPP')})
                        </p>
                        <p className="text-sm text-muted-foreground">
                            This helps in tracking triggers and progress.
                        </p>
                    </div>
                    <Switch
                        checked={consumedToday}
                        onCheckedChange={setConsumedToday}
                        aria-readonly
                    />
                </div>
                {consumedToday && (
                    <div className="space-y-2">
                        <Label htmlFor="consumption-notes">Notes (Optional)</Label>
                        <Textarea
                            id="consumption-notes"
                            placeholder="What were the triggers? How were you feeling?"
                            value={consumptionNotes}
                            onChange={(e) => setConsumptionNotes(e.target.value)}
                        />
                    </div>
                )}
                <Button onClick={handleLogConsumption} disabled={isLogPending}>
                    {isLogPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Daily Log
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
