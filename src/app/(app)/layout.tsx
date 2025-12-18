
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Sun, Moon, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";


const navGroups = [
    {
        title: "Analyze",
        items: [
            { href: "/dashboard", icon: Icons.dashboard, label: "Dashboard" },
        ]
    },
    {
        title: "Tools",
        items: [
            { href: "/coping-strategies", icon: Icons.strategies, label: "Coping Strategies" },
            { href: "/chat", icon: Icons.chat, label: "Anonymous Chat" },
        ]
    },
    {
        title: "Community",
        items: [
            { href: "/forum", icon: Icons.forum, label: "Forum" },
        ]
    },
    {
        title: "Progress",
        items: [
            { href: "/money-saved", icon: Icons.money, label: "Money Saved" },
        ]
    },
    {
        title: "General",
        items: [
            { href: "/resources", icon: Icons.resources, label: "Resources" },
            { href: "/settings", icon: Icons.settings, label: "Settings" },
            { href: "/student-info", icon: Info, label: "Student Info" },
        ]
    }
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [userName, setUserName] = React.useState("User");

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setUserName(user.displayName || "User");
      } else {
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        router.push("/login");
    } catch (error) {
        console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full !bg-primary/20">
              <Icons.logo className="h-5 w-5 text-primary" />
            </Button>
            <span className="font-semibold text-lg">ReHab</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
            {navGroups.map((group) => (
                <SidebarGroup key={group.title} className="py-1">
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarMenu>
                        {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
                            className="w-full justify-start"
                            tooltip={item.label}
                            >
                            <Link href={item.href}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </SidebarContent>
        <SidebarFooter>
            <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium grow truncate">{userName}</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                    title="Toggle Theme"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle Theme</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLogout} title="Logout">
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6 md:hidden">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
             <Icons.logo className="h-6 w-6 text-primary" />
             <span className="font-semibold">ReHab</span>
          </div>
        </header>
        <main className="flex flex-col flex-1 p-4 sm:p-6">
          <div className="flex-grow">{children}</div>
          <footer className="text-center text-muted-foreground text-sm py-4 mt-auto">
            © {new Date().getFullYear()} @shro_____
          </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
