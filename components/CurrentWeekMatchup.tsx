"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MatchupCard } from "./MatchupCard";
import { LoadingSpinner } from "./LoadingSpinner";
import { Button } from "./Button";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface CurrentWeekMatchupProps {
  leagueId: string;
}

export function CurrentWeekMatchup({ leagueId }: CurrentWeekMatchupProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const matchup = useQuery(api.dataSync.getCurrentWeekMatchup, {
    leagueId: leagueId as any,
  });
  const syncMatchups = useAction(api.dataSyncActions.syncLeagueMatchups);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncMatchups({
        leagueId: leagueId as any,
      });
      // Refresh will happen automatically via query
    } catch (error) {
      console.error("Failed to sync matchups:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (matchup === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (matchup === null) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">No matchup found for current week.</p>
        <Button onClick={handleSync} isLoading={isSyncing} disabled={isSyncing}>
          Sync Matchups
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Current Week Matchup</h2>
          <p className="text-sm text-muted-foreground mt-1">Your active matchup for this week</p>
        </div>
        <Button
          onClick={handleSync}
          isLoading={isSyncing}
          disabled={isSyncing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      <MatchupCard matchup={matchup} showCategories={true} />
    </div>
  );
}

