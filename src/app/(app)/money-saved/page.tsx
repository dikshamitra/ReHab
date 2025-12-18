
"use client";

import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { User } from "@/lib/types";
import { differenceInDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Coins, TrendingUp, IndianRupee } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MoneySavedPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [moneySaved, setMoneySaved] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubDoc = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setUserData(doc.data() as User);
          }
          setLoading(false);
        });
        return () => unsubDoc();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (userData && userData.quitDate && userData.dailySpending > 0) {
      const daysSober = differenceInDays(new Date(), new Date(userData.quitDate));
      setMoneySaved(daysSober * userData.dailySpending);
    } else {
      setMoneySaved(0);
    }
  }, [userData]);
  
  if (loading) {
    return (
        <div className="space-y-6 animate-fade-in">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-80" />
            <div className="grid gap-6 md:grid-cols-3">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        </div>
    );
  }

  if (!userData || !userData.quitDate || !userData.dailySpending || userData.dailySpending <= 0) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg h-full animate-fade-in">
            <h2 className="text-xl font-semibold">Track Your Savings</h2>
            <p className="text-muted-foreground mt-2">
                Set your daily spending on the settings page to see how much you save.
            </p>
            <Button className="mt-4" asChild>
                <Link href="/settings">Go to Settings</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Money Saved
            </h1>
            <p className="text-muted-foreground">
                See the financial benefits of your journey.
            </p>
        </div>

        <Card className="bg-gradient-to-br from-primary/80 to-primary transition-all hover:shadow-lg">
            <CardHeader>
                <CardTitle className="text-primary-foreground flex items-center gap-2">
                    <IndianRupee />
                    Total Saved
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-5xl font-bold text-primary-foreground">
                    ₹{moneySaved.toFixed(2)}
                </p>
                 <p className="text-primary-foreground/80 mt-2">
                    Based on saving ₹{userData.dailySpending?.toFixed(2) || '0.00'} per day.
                </p>
            </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
            <Card className="transition-all hover:shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Coins />
                        Weekly Savings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-3xl font-bold">
                        ₹{(userData.dailySpending * 7).toFixed(2)}
                    </p>
                </CardContent>
            </Card>
            <Card className="transition-all hover:shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp />
                        Annual Savings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                     <p className="text-3xl font-bold">
                        ₹{(userData.dailySpending * 365).toFixed(2)}
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
