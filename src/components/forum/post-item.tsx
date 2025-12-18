
"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { ForumPost } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, UserCircle } from "lucide-react";

interface PostItemProps {
    post: ForumPost;
}

export function PostItem({ post }: PostItemProps) {
    return (
        <Card className="animate-fade-in transition-all hover:shadow-card-hover">
            <Link href={`/forum/${post.id}`} className="block">
                <CardHeader>
                    <CardTitle>{post.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{post.content}</CardDescription>
                </CardHeader>
                <CardFooter className="text-xs text-muted-foreground flex justify-between">
                    <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4" />
                        <span>{post.authorName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                        <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.replyCount || 0}</span>
                        </div>
                    </div>
                </CardFooter>
            </Link>
        </Card>
    );
}
