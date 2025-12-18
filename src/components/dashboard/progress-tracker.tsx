
"use client";

import { useState, useEffect } from "react";
import { differenceInSeconds } from "date-fns";
import { Target, Flame } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressTrackerProps {
  quitDate: string | null;
  streak?: number;
}

export function ProgressTracker({ quitDate, streak = 0 }: ProgressTrackerProps) {
  const [duration, setDuration] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!quitDate) return;

    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(quitDate);
      
      const totalSeconds = differenceInSeconds(now, start);
      if (totalSeconds < 0) return;
      
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setDuration({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [quitDate]);

  if (!quitDate) return null;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Time Sober</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
                <p className="text-4xl md:text-5xl font-bold text-primary">{duration.days}</p>
                <p className="text-sm text-muted-foreground">Days</p>
            </div>
            <div>
                <p className="text-4xl md:text-5xl font-bold text-primary">{duration.hours}</p>
                <p className="text-sm text-muted-foreground">Hours</p>
            </div>
            <div>
                <p className="text-4xl md:text-5xl font-bold text-primary">{duration.minutes}</p>
                <p className="text-sm text-muted-foreground">Minutes</p>
            </div>
            <div>
                <p className="text-4xl md:text-5xl font-bold text-primary">{duration.seconds}</p>
                <p className="text-sm text-muted-foreground">Seconds</p>
            </div>
            <div className="border-l border-border pl-4">
                <p className="text-4xl md:text-5xl font-bold text-amber-500 flex items-center justify-center">
                  <Flame className="h-10 w-10 mr-1" />{streak}
                </p>
                <p className="text-sm text-muted-foreground">Streak</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
