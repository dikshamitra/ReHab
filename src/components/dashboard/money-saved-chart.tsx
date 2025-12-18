
"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format, subDays, differenceInDays } from "date-fns"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { User } from "@/lib/types"

interface MoneySavedChartProps {
  user: User
}

export function MoneySavedChart({ user }: MoneySavedChartProps) {
  const chartData = React.useMemo(() => {
    if (!user.quitDate || !user.dailySpending || user.dailySpending <= 0) {
      return []
    }

    const today = new Date();
    const quitDate = new Date(user.quitDate);
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const daysSober = differenceInDays(date, quitDate);
      const savings = daysSober >= 0 ? (daysSober + 1) * user.dailySpending : 0;
      return {
        date: format(date, "MMM d"),
        savings: savings < 0 ? 0 : savings,
      }
    });
  }, [user.quitDate, user.dailySpending])
  
  const totalSaved = React.useMemo(() => {
    if(!user.quitDate || !user.dailySpending) return 0;
    const days = differenceInDays(new Date(), new Date(user.quitDate));
    return days > 0 ? days * user.dailySpending : 0;
  }, [user.quitDate, user.dailySpending])


  if (!user.dailySpending || user.dailySpending <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Money Saved</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full">
          <p className="text-muted-foreground text-center">
            Set your daily spending in settings to track your savings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Money Saved</CardTitle>
        <CardDescription>
          You've saved a total of <span className="font-bold text-primary">₹{totalSaved.toFixed(2)}</span> so far.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{
          savings: {
            label: "Savings",
            color: "hsl(var(--primary))",
          },
        }} className="min-h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
             />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                labelFormatter={(value, payload) => {
                    return payload?.[0]?.payload.date
                }}
                formatter={(value) => `₹${(value as number).toFixed(2)}`}
              />}
            />
            <Bar dataKey="savings" fill="var(--color-savings)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
