
"use client";

import { useState, useEffect } from "react";
import { Edit } from "lucide-react";
import { onSnapshot, doc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { ADDICTION_TYPES } from "@/lib/constants";
import type { User } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GoalSetterDialog } from "@/components/dashboard/goal-setter-dialog";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { MilestoneAwards } from "@/components/dashboard/milestone-awards";
import { DailyAffirmation } from "@/components/dashboard/daily-affirmation";
import { MoneySavedChart } from "@/components/dashboard/money-saved-chart";
import { DailyProgressLog } from "@/components/dashboard/daily-progress-log";
import { ReasonsToQuit } from "@/components/dashboard/reasons-to-quit";

export default function DashboardPage() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isGoalSetterOpen, setIsGoalSetterOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        const unsubDoc = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as User;
            data.displayName = user.displayName || 'Friend';
            setUserData(data);
             if (!data.quitDate) {
                setIsGoalSetterOpen(true);
            }
          } else {
             const initialData: User = { 
                 uid: user.uid, 
                 addictionType: ADDICTION_TYPES[0], 
                 quitDate: null, 
                 displayName: user.displayName || 'Friend',
                 dailySpending: 0,
                 consumptionLog: [],
                 email: user.email,
            };
             setUserData(initialData);
             setIsGoalSetterOpen(true);
          }
        });
        
        return () => unsubDoc();
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = (data: User) => {
    setUserData(data); // Optimistically update UI
    setIsGoalSetterOpen(false);
  };
  
  if (!isClient || !userData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 lg:col-span-2" />
          <Skeleton className="h-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <>
      <GoalSetterDialog
        isOpen={isGoalSetterOpen}
        onOpenChange={setIsGoalSetterOpen}
        currentData={userData}
        onSave={handleSave}
      />
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {userData.displayName || 'Friend'}!
            </h1>
            <p className="text-muted-foreground">
              You're on the path to recovery. Keep going!
            </p>
          </div>
          <Button variant="outline" onClick={() => setIsGoalSetterOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Goal
          </Button>
        </div>
        
        {userData.quitDate ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ProgressTracker quitDate={userData.quitDate} streak={userData.streak} />
              <div className="lg:col-span-1 flex flex-col gap-6">
                <MilestoneAwards quitDate={userData.quitDate} />
                <DailyAffirmation />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <MoneySavedChart user={userData} />
                <DailyProgressLog user={userData} />
                <ReasonsToQuit user={userData} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
              <h2 className="text-xl font-semibold">Your Journey Awaits</h2>
              <p className="text-muted-foreground mt-2">Set your goal to start tracking your progress.</p>
              <Button className="mt-4" onClick={() => setIsGoalSetterOpen(true)}>Set Your Goal</Button>
          </div>
        )}
      </div>
    </>
  );
}
