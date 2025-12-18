"use client";

import type { User } from "@/lib/types";
import { format, subDays, isSameDay } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, MinusCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface DailyProgressLogProps {
  user: User;
}

export function DailyProgressLog({ user }: DailyProgressLogProps) {
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Progress</CardTitle>
        <CardDescription>Your consumption log for the last 7 days.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="flex justify-around items-center">
            {last7Days.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const log = user.consumptionLog?.find(l => l.date === dayStr);

                let Icon = MinusCircle;
                let color = "text-muted-foreground";
                let tooltipText = "No log for this day.";
                
                if (log) {
                    if (log.consumed) {
                        Icon = XCircle;
                        color = "text-destructive";
                        tooltipText = "Consumed.";
                    } else {
                        Icon = CheckCircle;
                        color = "text-green-500";
                        tooltipText = "Sober!";
                    }
                }

                return (
                <Tooltip key={dayStr}>
                    <TooltipTrigger asChild>
                        <div className="flex flex-col items-center gap-2">
                            <Icon className={`h-8 w-8 ${color}`} />
                            <span className="text-xs text-muted-foreground">{format(day, "eee")}</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{format(day, "PPP")}: {tooltipText}</p>
                    </TooltipContent>
                </Tooltip>
                );
            })}
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
