"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./Button";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function YahooConnectButton() {
  const isConnected = useQuery(api.yahoo.isYahooConnected);

  if (isConnected === undefined) {
    return <Button disabled variant="outline">Loading...</Button>;
  }

  if (isConnected) {
    return (
      <Badge variant="outline" className="gap-1.5 border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400">
        <CheckCircle2 className="h-3 w-3" />
        <span>Yahoo Connected</span>
      </Badge>
    );
  }

  return (
    <a href="/api/yahoo/authorize">
      <Button variant="default">Connect Yahoo Account</Button>
    </a>
  );
}

