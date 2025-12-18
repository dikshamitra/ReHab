
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { format, formatDistanceToNow } from "date-fns";
import { ArrowLeft, UserCircle, Send, Loader2 } from "lucide-react";
import type { ForumPost, ForumReply } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createReplyAction } from "../actions";

export default function PostPage({ params }: { params: { postId: string } }) {
    const { toast } = useToast();
    const [user] = useAuthState(auth);
    const [post, setPost] = useState<ForumPost | null>(null);
    const [replies, setReplies] = useState<ForumReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState("");
    const [isReplying, setIsReplying] = useState(false);

    useEffect(() => {
        const fetchPost = async () => {
            const docRef = doc(db, "forum_posts", params.postId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setPost({ id: docSnap.id, ...docSnap.data() } as ForumPost);
            } else {
                // Handle post not found
            }
        };

        fetchPost();

        const repliesQuery = query(collection(db, "forum_posts", params.postId, "replies"), orderBy("createdAt"));
        const unsubscribe = onSnapshot(repliesQuery, (querySnapshot) => {
            const repliesData: ForumReply[] = [];
            querySnapshot.forEach((doc) => {
                repliesData.push({ id: doc.id, ...doc.data() } as ForumReply);
            });
            setReplies(repliesData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [params.postId]);
    
    const handleReply = async () => {
        if (!replyText.trim() || !user) return;

        setIsReplying(true);
        const result = await createReplyAction({ postId: params.postId, text: replyText });

        if (result.success) {
            setReplyText("");
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
        setIsReplying(false);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }
    
    if (!post) {
        return <p>Post not found.</p>
    }

    return (
        <div className="space-y-6">
            <Button variant="ghost" asChild>
                <Link href="/forum">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Forum
                </Link>
            </Button>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{post.title}</CardTitle>
                    <div className="text-sm text-muted-foreground flex items-center gap-4 pt-2">
                         <div className="flex items-center gap-2">
                            <UserCircle className="h-4 w-4" />
                            <span>{post.authorName}</span>
                        </div>
                        <span>{format(new Date(post.createdAt), 'PPP')}</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Replies ({replies.length})</h3>
                {replies.map(reply => (
                    <Card key={reply.id} className="bg-muted/50 animate-fade-in">
                        <CardContent className="p-4">
                             <p className="text-sm">{reply.text}</p>
                             <div className="text-xs text-muted-foreground flex items-center gap-2 pt-3">
                                <Avatar className="h-5 w-5">
                                    <AvatarFallback>{reply.authorName.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <strong>{reply.authorName}</strong>
                                <span>·</span>
                                <span>{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                             </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Leave a Reply</CardTitle>
                </CardHeader>
                <CardContent>
                    {user ? (
                        <div className="space-y-2">
                            <Textarea 
                                placeholder="Share a supportive message..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                            />
                            <Button onClick={handleReply} disabled={isReplying || !replyText.trim()}>
                                {isReplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                Submit Reply
                            </Button>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            You must be <Link href="/login" className="text-primary underline">logged in</Link> to reply.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
