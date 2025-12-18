
"use server";

import { revalidatePath } from "next/cache";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";

interface CreatePostInput {
    title: string;
    content: string;
}

export async function createPostAction(input: CreatePostInput) {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, error: "You must be logged in to post." };
    }

    try {
        await addDoc(collection(db, "forum_posts"), {
            title: input.title,
            content: input.content,
            authorId: user.uid,
            authorName: user.displayName || "Anonymous",
            createdAt: new Date().toISOString(),
            replyCount: 0,
        });

        revalidatePath("/forum");
        return { success: true };
    } catch (error) {
        console.error("Error creating post:", error);
        return { success: false, error: "Failed to create post." };
    }
}

interface CreateReplyInput {
    postId: string;
    text: string;
}

export async function createReplyAction(input: CreateReplyInput) {
    const user = auth.currentUser;
    if (!user) {
        return { success: false, error: "You must be logged in to reply." };
    }

    try {
        const postRef = doc(db, "forum_posts", input.postId);
        const repliesRef = collection(postRef, "replies");

        await addDoc(repliesRef, {
            text: input.text,
            authorId: user.uid,
            authorName: user.displayName || "Anonymous",
            createdAt: new Date().toISOString(),
        });
        
        await updateDoc(postRef, {
            replyCount: increment(1)
        });

        revalidatePath(`/forum/${input.postId}`);
        return { success: true };
    } catch (error) {
        console.error("Error creating reply:", error);
        return { success: false, error: "Failed to create reply." };
    }
}
