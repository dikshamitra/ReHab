
"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import type { ForumPost } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreatePostDialog } from "@/components/forum/create-post-dialog";
import { PostItem } from "@/components/forum/post-item";

export default function ForumPage() {
    const [user] = useAuthState(auth);
    const [isCreatePostOpen, setCreatePostOpen] = useState(false);
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "forum_posts"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const postsData: ForumPost[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                postsData.push({ 
                    id: doc.id,
                    ...data
                 } as ForumPost);
            });
            setPosts(postsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <>
            <CreatePostDialog isOpen={isCreatePostOpen} onOpenChange={setCreatePostOpen} />
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                            Community Forum
                        </h1>
                        <p className="text-muted-foreground">
                            Share your story and connect with others. You are not alone.
                        </p>
                    </div>
                    <Button onClick={() => setCreatePostOpen(true)} disabled={!user}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Post
                    </Button>
                </div>
                
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {posts.length > 0 ? (
                            posts.map((post) => <PostItem key={post.id} post={post} />)
                        ) : (
                            <div className="text-center py-16">
                                <h3 className="text-lg font-semibold">No posts yet.</h3>
                                <p className="text-muted-foreground">Be the first to start a conversation!</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
