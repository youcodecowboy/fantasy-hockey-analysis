"use client";

import { Layout } from "@/components/Layout";
import { AuthGuard } from "@/components/AuthGuard";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <Layout>{children}</Layout>
    </AuthGuard>
  );
}

