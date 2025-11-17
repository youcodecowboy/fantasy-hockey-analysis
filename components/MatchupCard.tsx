"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const statusLabel = matchup.status === "postevent" ? "Final" : matchup.status === "midevent" ? "Live" : "Upcoming";
  const statusVariant = matchup.status === "postevent" ? "secondary" : matchup.status === "midevent" ? "default" : "outline";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">Week {matchup.week}</h3>
            <Badge variant={statusVariant as any} className="text-xs">
              {statusLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* User Team */}
        <div className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
          isWinning ? "bg-green-50/50 border-green-200 dark:bg-green-950/20" :
          isLosing ? "bg-red-50/50 border-red-200 dark:bg-red-950/20" :
          isTied ? "bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/20" :
          "bg-muted/50 border-border"
        }`}>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{userTeam.name}</span>
              <Badge variant="outline" className="text-xs">You</Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {userTeam.wins}-{userTeam.losses}
              {userTeam.ties ? `-${userTeam.ties}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${
              isWinning ? "text-green-600 dark:text-green-400" :
              isLosing ? "text-red-600 dark:text-red-400" :
              isTied ? "text-yellow-600 dark:text-yellow-400" :
              "text-foreground"
            }`}>
              {userScore !== undefined ? userScore.toFixed(1) : "—"}
            </div>
          </div>
        </div>

        {/* VS Divider */}
        <div className="flex items-center justify-center py-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">VS</div>
        </div>

        {/* Opponent Team */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-card border-2 border-border">
          <div className="flex-1">
            <div className="font-semibold text-foreground">{opponentTeam.name}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {opponentTeam.wins}-{opponentTeam.losses}
              {opponentTeam.ties ? `-${opponentTeam.ties}` : ""}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-foreground">
              {opponentScore !== undefined ? opponentScore.toFixed(1) : "—"}
            </div>
          </div>
        </div>

        {/* Category breakdown placeholder */}
        {showCategories && (
          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              Category breakdown coming soon
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

