import { RESOURCES } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Phone } from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Help & Resources
            </h1>
            <p className="text-muted-foreground">
                You are not alone. Here are some resources that can help.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {RESOURCES.map((resource) => (
                <Card key={resource.name} className="flex flex-col">
                    <CardHeader>
                        <CardTitle>{resource.name}</CardTitle>
                        <CardDescription>{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow" />
                    <CardContent className="flex flex-col sm:flex-row gap-2">
                       <Button asChild variant="outline" className="w-full">
                            <a href={`tel:${resource.contact}`}>
                                <Phone className="mr-2 h-4 w-4"/>
                                {resource.contact}
                            </a>
                        </Button>
                        <Button asChild className="w-full">
                            <Link href={resource.website} target="_blank">
                                <Globe className="mr-2 h-4 w-4"/>
                                Visit Website
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ))}
        </div>
    </div>
  );
}
