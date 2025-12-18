"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AFFIRMATIONS } from "@/lib/constants";

export function DailyAffirmation() {
  const [affirmation, setAffirmation] = useState("");

  useEffect(() => {
    const today = new Date().toDateString();
    const lastAffirmationDate = localStorage.getItem("lastAffirmationDate");
    let currentAffirmation = localStorage.getItem("currentAffirmation");

    if (lastAffirmationDate !== today || !currentAffirmation) {
      currentAffirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
      localStorage.setItem("currentAffirmation", currentAffirmation);
      localStorage.setItem("lastAffirmationDate", today);
    }

    setAffirmation(currentAffirmation);
  }, []);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Daily Affirmation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <p className="text-center text-lg font-medium text-muted-foreground italic">
          "{affirmation}"
        </p>
      </CardContent>
    </Card>
  );
}
