"use client";

import { ReactNode } from "react";
import { ModernHeader } from "./ModernHeader";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ModernHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="border-t bg-background mt-auto">
        <div className="container mx-auto px-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            Fantasy Hockey Analysis App
          </p>
        </div>
      </footer>
    </div>
  );
}

