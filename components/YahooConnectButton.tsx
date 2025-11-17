"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "./Button";

export function YahooConnectButton() {
  const isConnected = useQuery(api.yahoo.isYahooConnected);

  if (isConnected === undefined) {
    return <Button disabled>Loading...</Button>;
  }

  if (isConnected) {
    return (
      <div className="flex items-center space-x-2 text-green-600">
        <svg
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <span>Yahoo Connected</span>
      </div>
    );
  }

  return (
    <a href="/api/yahoo/authorize">
      <Button>Connect Yahoo Account</Button>
    </a>
  );
}

