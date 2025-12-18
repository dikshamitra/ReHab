
import type { SVGProps } from "react";
import { Award, BookOpen, BrainCircuit, MessageSquare, PieChart, Star, Trophy, IndianRupee, Settings, MessageCircle } from 'lucide-react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m16 8-4 4-4-4"/>
      <path d="m12 16 4-4"/>
    </svg>
  ),
  dashboard: PieChart,
  strategies: BrainCircuit,
  chat: MessageSquare,
  resources: BookOpen,
  star: Star,
  award: Award,
  trophy: Trophy,
  money: IndianRupee,
  settings: Settings,
  forum: MessageCircle,
};
