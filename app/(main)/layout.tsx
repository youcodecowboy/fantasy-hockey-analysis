"use client";

import { Layout } from "@/components/Layout";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}

