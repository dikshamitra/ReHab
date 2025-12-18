
"use client";

import { useState } from "react";
import { ListPlus, Trash2, Loader2 } from "lucide-react";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { User } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ReasonsToQuitProps {
    user: User;
}

export function ReasonsToQuit({ user }: ReasonsToQuitProps) {
    const { toast } = useToast();
    const [newReason, setNewReason] = useState("");
    const [isPending, setIsPending] = useState(false);

    const handleAddReason = async () => {
        if (!newReason.trim()) return;
        setIsPending(true);
        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                reasonsToQuit: arrayUnion(newReason.trim())
            });
            setNewReason("");
        } catch (error) {
            console.error("Error adding reason:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not add your reason." });
        }
        setIsPending(false);
    };

    const handleRemoveReason = async (reason: string) => {
        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                reasonsToQuit: arrayRemove(reason)
            });
        } catch (error) {
            console.error("Error removing reason:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not remove your reason." });
        }
    };
    
    return (
        <Card className="lg:col-span-1 flex flex-col">
            <CardHeader>
                <CardTitle>My Reasons to Quit</CardTitle>
                <CardDescription>Remind yourself why you started.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 flex flex-col">
                <div className="flex-grow space-y-2 overflow-y-auto max-h-[150px] pr-2">
                    {user.reasonsToQuit?.length ? (
                        user.reasonsToQuit.map((reason, index) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded-md animate-fade-in">
                                <span>{reason}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveReason(reason)}>
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center pt-4">Add your first reason below.</p>
                    )}
                </div>
                <div className="mt-auto flex items-center gap-2 pt-2">
                    <Input 
                        placeholder="e.g., For my family" 
                        value={newReason}
                        onChange={(e) => setNewReason(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddReason()}
                    />
                    <Button size="icon" onClick={handleAddReason} disabled={isPending}>
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListPlus className="h-4 w-4" />}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
