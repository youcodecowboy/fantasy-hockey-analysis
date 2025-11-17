"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MatchupCard } from "./MatchupCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { useState } from "react";

interface OtherMatchupsProps {
  leagueId: string;
  currentWeek: number;
  excludeMatchupId?: string;
}

export function OtherMatchups({ leagueId, currentWeek, excludeMatchupId }: OtherMatchupsProps) {
  const matchups = useQuery(api.dataSync.getMatchups, {
    leagueId: leagueId as any,
    week: currentWeek,
  });

  if (matchups === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Filter out the current user's matchup
  const otherMatchups = matchups.filter((m) => m._id !== excludeMatchupId);

  if (otherMatchups.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600">No other matchups this week.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">Other Matchups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {otherMatchups.map((matchup) => (
          <MatchupCard key={matchup._id} matchup={matchup} />
        ))}
      </div>
    </div>
  );
}

