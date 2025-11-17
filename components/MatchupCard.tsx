"use client";

import { Card } from "./Card";

interface MatchupCardProps {
  matchup: {
    _id: string;
    week: number;
    team1: {
      _id: string;
      name: string;
      wins: number;
      losses: number;
      ties?: number;
    } | null;
    team2: {
      _id: string;
      name: string;
      wins: number;
      losses: number;
      ties?: number;
    } | null;
    team1Score?: number;
    team2Score?: number;
    status: string;
    isUserTeam1?: boolean;
  };
  showCategories?: boolean;
}

export function MatchupCard({ matchup, showCategories = false }: MatchupCardProps) {
  if (!matchup.team1 || !matchup.team2) {
    return null;
  }

  const userTeam = matchup.isUserTeam1 ? matchup.team1 : matchup.team2;
  const opponentTeam = matchup.isUserTeam1 ? matchup.team2 : matchup.team1;
  const userScore = matchup.isUserTeam1 ? matchup.team1Score : matchup.team2Score;
  const opponentScore = matchup.isUserTeam1 ? matchup.team2Score : matchup.team1Score;

  const isWinning = userScore !== undefined && opponentScore !== undefined && userScore > opponentScore;
  const isLosing = userScore !== undefined && opponentScore !== undefined && userScore < opponentScore;
  const isTied = userScore !== undefined && opponentScore !== undefined && userScore === opponentScore;

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-slate-600">Week {matchup.week}</h3>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 mt-1">
              {matchup.status === "postevent" ? "Final" : matchup.status === "midevent" ? "Live" : "Upcoming"}
            </span>
          </div>
        </div>

        {/* Teams */}
        <div className="space-y-4">
          {/* User Team */}
          <div className={`flex items-center justify-between p-4 rounded-lg ${
            isWinning ? "bg-green-50 border-2 border-green-200" :
            isLosing ? "bg-red-50 border-2 border-red-200" :
            isTied ? "bg-yellow-50 border-2 border-yellow-200" :
            "bg-slate-50 border-2 border-slate-200"
          }`}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900">{userTeam.name}</span>
                <span className="text-xs text-slate-500">(You)</span>
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {userTeam.wins}-{userTeam.losses}
                {userTeam.ties ? `-${userTeam.ties}` : ""}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                isWinning ? "text-green-700" :
                isLosing ? "text-red-700" :
                isTied ? "text-yellow-700" :
                "text-slate-700"
              }`}>
                {userScore !== undefined ? userScore.toFixed(1) : "—"}
              </div>
            </div>
          </div>

          {/* VS Divider */}
          <div className="flex items-center justify-center">
            <div className="text-xs font-semibold text-slate-400">VS</div>
          </div>

          {/* Opponent Team */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-white border-2 border-slate-200">
            <div className="flex-1">
              <div className="font-semibold text-slate-900">{opponentTeam.name}</div>
              <div className="text-sm text-slate-600 mt-1">
                {opponentTeam.wins}-{opponentTeam.losses}
                {opponentTeam.ties ? `-${opponentTeam.ties}` : ""}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-700">
                {opponentScore !== undefined ? opponentScore.toFixed(1) : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Category breakdown placeholder */}
        {showCategories && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 text-center">
              Category breakdown coming soon
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

