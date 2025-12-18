"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import type { User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ADDICTION_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface GoalSetterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentData: User;
  onSave: (data: User) => void;
}

export function GoalSetterDialog({
  isOpen,
  onOpenChange,
  currentData,
  onSave,
}: GoalSetterDialogProps) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(currentData.displayName || "Friend");
  const [addictionType, setAddictionType] = useState(currentData.addictionType);
  const [quitDate, setQuitDate] = useState<Date | undefined>(
    currentData.quitDate ? new Date(currentData.quitDate) : new Date()
  );
  const [dailySpending, setDailySpending] = useState(currentData.dailySpending || 0);

  useEffect(() => {
    setDisplayName(currentData.displayName || "Friend");
    setAddictionType(currentData.addictionType);
    setQuitDate(currentData.quitDate ? new Date(currentData.quitDate) : new Date());
    setDailySpending(currentData.dailySpending || 0);
  }, [currentData]);

  const handleSave = async () => {
    if (quitDate && currentData.uid) {
        const userDocRef = doc(db, "users", currentData.uid);
        const dataToSave = {
            addictionType,
            quitDate: quitDate.toISOString(),
            displayName,
            dailySpending: Number(dailySpending)
        };

        try {
            await setDoc(userDocRef, dataToSave, { merge: true });
            if (auth.currentUser && auth.currentUser.displayName !== displayName) {
              await updateProfile(auth.currentUser, { displayName });
            }
            toast({ title: "Success", description: "Your goal has been saved." });
            onSave({ ...currentData, ...dataToSave, quitDate: dataToSave.quitDate });
        } catch (error) {
            console.error("Error saving user data:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to save your goal." });
        }
    }
  };

  const isInitialSetup = !currentData.quitDate;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={(e) => isInitialSetup && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{isInitialSetup ? "Start Your Journey" : "Edit Your Goal"}</DialogTitle>
          <DialogDescription>
            {isInitialSetup ? "Tell us a bit about your goal to get started." : "Update your recovery goal details here."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="col-span-3"
              placeholder="Your name or nickname"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="addiction-type" className="text-right">
              Type
            </Label>
            <Select value={addictionType} onValueChange={setAddictionType}>
              <SelectTrigger id="addiction-type" className="col-span-3">
                <SelectValue placeholder="Select addiction type" />
              </SelectTrigger>
              <SelectContent>
                {ADDICTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="daily-spending" className="text-right">
              Daily Spend
            </Label>
            <Input
              id="daily-spending"
              type="number"
              value={dailySpending}
              onChange={(e) => setDailySpending(Number(e.target.value))}
              className="col-span-3"
              placeholder="e.g., 15"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quit-date" className="text-right">
              Quit Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full col-span-3 justify-start text-left font-normal",
                    !quitDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {quitDate ? format(quitDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={quitDate}
                  onSelect={setQuitDate}
                  initialFocus
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          {!isInitialSetup && <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>}
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
