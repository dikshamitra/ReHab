export type ConsumptionLog = {
  date: string; // YYYY-MM-DD
  consumed: boolean;
  notes?: string;
};

export type User = {
  uid: string;
  displayName: string | null;
  email: string | null;
  createdAt?: string;
  addictionType: string;
  quitDate: string | null;
  dailySpending: number;
  consumptionLog: ConsumptionLog[];
  reasonsToQuit?: string[];
  streak?: number;
  longestStreak?: number;
  points?: number;
};

export type ForumReply = {
    id: string;
    text: string;
    authorId: string;
    authorName: string;
    createdAt: string;
};

export type ForumPost = {
    id: string;
    title: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    replyCount?: number;
};
