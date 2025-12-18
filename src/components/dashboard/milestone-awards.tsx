"use client";

import { differenceInDays } from "date-fns";
import { MILESTONES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface MilestoneAwardsProps {
  quitDate: string | null;
}

export function MilestoneAwards({ quitDate }: MilestoneAwardsProps) {
  if (!quitDate) return null;

  const now = new Date();
  const soberDays = differenceInDays(now, new Date(quitDate));

  let nextMilestone = MILESTONES.find(m => m.days > soberDays);
  let prevMilestoneDays = MILESTONES.slice().reverse().find(m => m.days <= soberDays)?.days || 0;
  
  const progressToNext = nextMilestone 
    ? ((soberDays - prevMilestoneDays) / (nextMilestone.days - prevMilestoneDays)) * 100
    : 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
        <CardDescription>Celebrate your achievements on your journey.</CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="flex justify-around items-center mb-6">
            {MILESTONES.map((milestone) => {
              const Icon = Icons[milestone.icon];
              const isAchieved = soberDays >= milestone.days;
              return (
                <Tooltip key={milestone.days}>
                  <TooltipTrigger>
                    <div
                      className={cn(
                        "relative flex h-12 w-12 items-center justify-center rounded-full border-2",
                        isAchieved ? "border-accent bg-accent/20" : "border-dashed border-muted-foreground/50 bg-muted"
                      )}
                    >
                      <Icon className={cn("h-6 w-6", isAchieved ? "text-accent" : "text-muted-foreground/50")} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{milestone.name} ({milestone.days} days)</p>
                    {isAchieved && <p className="text-sm text-muted-foreground">Achieved!</p>}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
        {nextMilestone && (
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="text-muted-foreground">Next Goal</span>
                <span className="font-semibold">{nextMilestone.name}</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
            <p className="text-right text-xs text-muted-foreground mt-1">{nextMilestone.days - soberDays} days to go!</p>
          </div>
        )}
        {!nextMilestone && (
            <p className="text-center font-semibold text-accent">Congratulations! You've achieved all milestones!</p>
        )}
      </CardContent>
    </Card>
  );
}
