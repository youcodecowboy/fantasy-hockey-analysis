"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function OpponentsPage() {
  const searchParams = useSearchParams();
  const leagueIdParam = searchParams.get("league");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(
    leagueIdParam
  );
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<
    Record<string, string>
  >({});

  const leagues = useQuery(api.dataSync.getUserLeagues);
  const teams = useQuery(
    api.dataSync.getLeagueTeams,
    selectedLeagueId ? { leagueId: selectedLeagueId as any } : "skip"
  );
  const userTeam = useQuery(
    api.dataSync.getUserTeam,
    selectedLeagueId ? { leagueId: selectedLeagueId as any } : "skip"
  );
  const analyzeOpponent = useAction(api.llm.analyzeOpponent);

  const handleAnalyze = async (opponentTeamId: string) => {
    if (!selectedLeagueId) return;
    setIsAnalyzing(opponentTeamId);
    try {
      const result = await analyzeOpponent({
        leagueId: selectedLeagueId as any,
        opponentTeamId: opponentTeamId as any,
      });
      setAnalysisResults((prev) => ({
        ...prev,
        [opponentTeamId]: result.analysis,
      }));
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setIsAnalyzing(null);
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

  // Filter out user's team
  const opponentTeams =
    teams?.filter((team) => team._id !== userTeam?._id) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Opponents</h1>
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
      </div>

      {selectedLeagueId ? (
        teams === undefined ? (
          <LoadingSpinner />
        ) : opponentTeams.length === 0 ? (
          <Card>
            <p className="text-gray-600">No opponents found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opponentTeams.map((team) => (
              <OpponentCard
                key={team._id}
                team={team}
                userTeam={userTeam}
                onAnalyze={() => handleAnalyze(team._id)}
                isAnalyzing={isAnalyzing === team._id}
                analysis={analysisResults[team._id]}
              />
            ))}
          </div>
        )
      ) : (
        <Card>
          <p className="text-gray-600">
            Please select a league to view opponents.
          </p>
        </Card>
      )}
    </div>
  );
}

function OpponentCard({
  team,
  userTeam,
  onAnalyze,
  isAnalyzing,
  analysis,
}: {
  team: any;
  userTeam: any;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  analysis?: string;
}) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Record:</span>{" "}
              <span className="font-semibold">
                {team.wins}-{team.losses}
                {team.ties ? `-${team.ties}` : ""}
              </span>
            </div>
            {team.pointsFor !== undefined && (
              <div>
                <span className="text-gray-600">Points For:</span>{" "}
                <span className="font-semibold">
                  {team.pointsFor.toFixed(1)}
                </span>
              </div>
            )}
            {team.pointsAgainst !== undefined && (
              <div>
                <span className="text-gray-600">Points Against:</span>{" "}
                <span className="font-semibold">
                  {team.pointsAgainst.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {userTeam && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Head-to-Head</span>
              <span className="text-sm font-semibold">
                {userTeam.pointsFor !== undefined &&
                team.pointsFor !== undefined
                  ? userTeam.pointsFor > team.pointsFor
                    ? "Advantage: You"
                    : userTeam.pointsFor < team.pointsFor
                    ? "Advantage: Opponent"
                    : "Even"
                  : "N/A"}
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={onAnalyze}
          isLoading={isAnalyzing}
          disabled={isAnalyzing}
          variant="secondary"
          className="w-full"
        >
          {analysis ? "Re-analyze" : "Get AI Analysis"}
        </Button>

        {analysis && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              AI Analysis
            </h4>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-xs text-gray-700">
                {analysis}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

