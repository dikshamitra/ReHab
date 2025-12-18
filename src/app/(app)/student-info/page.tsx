import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Bot, Database, BarChart, Settings, BrainCircuit } from "lucide-react";

export default function StudentInfoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          About ReHab - A VIT Student Project
        </h1>
        <p className="text-muted-foreground mt-2">
          Understanding the technology and purpose behind this application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Mission</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ReHab is a comprehensive tool designed to support individuals on their journey to overcome addiction. 
            The primary goal is to provide a safe, anonymous, and supportive environment where users can track their progress, 
            find healthy coping mechanisms, and connect with an AI-powered counselor. By leveraging modern technology, 
            this project aims to make recovery resources more accessible and engaging, empowering users to take control of their lives.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Core Features</CardTitle>
            <CardDescription>How the application helps users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
                <BarChart className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">Progress Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                        Visualizes key metrics like days sober, money saved, and milestones achieved to keep users motivated.
                    </p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <BrainCircuit className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">AI Coping Strategies</h3>
                    <p className="text-sm text-muted-foreground">
                        Uses Genkit AI to provide personalized coping strategies based on user's triggers and progress.
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Bot className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">Anonymous AI Chat</h3>
                    <p className="text-sm text-muted-foreground">
                        Offers a safe space to talk with an empathetic AI counselor, available 24/7.
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Settings className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">Personalized Settings</h3>
                    <p className="text-sm text-muted-foreground">
                        Allows users to set personal goals, track daily consumption, and calculate financial savings.
                    </p>
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>The tools and frameworks used to build this project.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
                <Code className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">Frontend</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">Next.js</Badge>
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">TypeScript</Badge>
                        <Badge variant="secondary">Tailwind CSS</Badge>
                        <Badge variant="secondary">ShadCN/UI</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Database className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">Backend & Database</h3>
                     <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">Firebase</Badge>
                        <Badge variant="secondary">Firestore</Badge>
                        <Badge variant="secondary">Firebase Auth</Badge>
                    </div>
                </div>
            </div>
            <div className="flex items-start gap-4">
                <Bot className="h-6 w-6 text-primary mt-1" />
                <div>
                    <h3 className="font-semibold">Generative AI</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="secondary">Genkit</Badge>
                        <Badge variant="secondary">Gemini Pro</Badge>
                    </div>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
