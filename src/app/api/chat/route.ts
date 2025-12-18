
import { ai } from '@/ai/genkit';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit, addDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// This type is for the data stored in Firestore
type FirestoreMessage = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
};


export async function POST(req: NextRequest) {
  const { chatId }: { chatId: string } = await req.json();

  if (!chatId) {
    return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
  }

  // Retrieve message history from Firestore
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("createdAt", "desc"), limit(20));
  const querySnapshot = await getDocs(q);
  
  const history: FirestoreMessage[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    history.unshift({ // unshift to keep the correct order (oldest first)
      id: doc.id,
      role: data.role,
      content: data.content,
    });
  });

  // The last message in the history is the user's prompt
  const lastUserMessage = history.findLast(m => m.role === 'user');
  if (!lastUserMessage) {
    // This can happen in a race condition or if history is empty.
    // We can't generate a response without a user prompt.
    return NextResponse.json({ success: true, message: "No user message found to respond to." });
  }

  const { text } = await ai.generate({
    system: `You are a compassionate and empathetic AI counselor for an addiction recovery app called 'ReHab'. Your role is to provide a safe, non-judgmental space for users to talk about their struggles with addiction. You should be supportive, encouraging, and offer helpful advice based on established therapeutic principles. Do not provide medical advice. Keep your responses concise and easy to understand.`,
    // Map Firestore history to the format Genkit expects.
    // The last message is the prompt, so we exclude it from the history array here.
    history: history.slice(0, -1).map(h => ({ role: h.role, content: [{text: h.content}]})),
    prompt: lastUserMessage.content,
  });

  const assistantMessage = {
      role: 'assistant' as const,
      content: text,
      createdAt: new Date(),
  };
  
  // Save the assistant's response to Firestore
  await addDoc(collection(db, "chats", chatId, "messages"), assistantMessage);

  return NextResponse.json({ success: true });
}
