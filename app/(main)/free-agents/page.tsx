"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function FreeAgentsPage() {
  const searchParams = useSearchParams();
  const leagueIdParam = searchParams.get("league");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(
    leagueIdParam
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const leagues = useQuery(api.dataSync.getUserLeagues);
  const freeAgents = useQuery(
    api.dataSync.getFreeAgents,
    selectedLeagueId ? { leagueId: selectedLeagueId as any } : "skip"
  );
  const syncFreeAgents = useAction(api.dataSyncActions.syncFreeAgents);
  const analyzeFreeAgents = useAction(api.llm.analyzeFreeAgents);

  useEffect(() => {
    if (leagueIdParam && !selectedLeagueId) {
      setSelectedLeagueId(leagueIdParam);
    }
  }, [leagueIdParam, selectedLeagueId]);

  const handleSync = async () => {
    if (!selectedLeagueId) return;
    setIsSyncing(true);
    try {
      await syncFreeAgents({ leagueId: selectedLeagueId as any, count: 50 });
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedLeagueId || !freeAgents || freeAgents.length === 0) return;
    setIsAnalyzing(true);
    try {
      const topPlayers = freeAgents.slice(0, 10).map((p) => p._id);
      const result = await analyzeFreeAgents({
        leagueId: selectedLeagueId as any,
        playerIds: topPlayers,
      });
      setAnalysisResult(result.analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (leagues === undefined) {
    return <LoadingSpinner />;
  }

  if (leagues.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600">
            No leagues found. Please sync your leagues first.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Free Agents</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedLeagueId || ""}
            onChange={(e) => setSelectedLeagueId(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Select a league</option>
            {leagues.map((league) => (
              <option key={league._id} value={league._id}>
                {league.name}
              </option>
            ))}
          </select>
          <Button onClick={handleSync} isLoading={isSyncing} disabled={!selectedLeagueId}>
            Refresh
          </Button>
          <Button
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            disabled={!selectedLeagueId || !freeAgents || freeAgents.length === 0}
            variant="secondary"
          >
            Get AI Analysis
          </Button>
        </div>
      </div>

      {analysisResult && (
        <Card title="AI Analysis">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {analysisResult}
            </pre>
          </div>
        </Card>
      )}

      {selectedLeagueId ? (
        freeAgents === undefined ? (
          <LoadingSpinner />
        ) : freeAgents.length === 0 ? (
          <Card>
            <p className="text-gray-600">
              No free agents found. Click Refresh to sync data.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeAgents.map((player) => (
              <PlayerCard key={player._id} player={player} />
            ))}
          </div>
        )
      ) : (
        <Card>
          <p className="text-gray-600">
            Please select a league to view free agents.
          </p>
        </Card>
      )}
    </div>
  );
}

function PlayerCard({ player }: { player: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{player.name}</h3>
            <p className="text-sm text-gray-500">
              {player.position} • {player.team || "FA"}
            </p>
          </div>
          {player.imageUrl && (
            <img
              src={player.imageUrl}
              alt={player.name}
              className="w-12 h-12 rounded-full"
            />
          )}
        </div>
        {player.status && (
          <p className="text-xs text-gray-500">{player.status}</p>
        )}
        {player.injuryStatus && (
          <p className="text-xs text-red-600">{player.injuryStatus}</p>
        )}
      </div>
    </Card>
  );
}

