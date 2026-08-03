import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface AuthFormLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthFormLayout({ title, description, children }: AuthFormLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <Card className="space-y-6 p-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{description}</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{title}</h1>
          </div>
          {children}
        </Card>
      </div>
    </main>
  );
}
