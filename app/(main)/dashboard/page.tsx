"use client";

export const dynamic = "force-dynamic";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { YahooConnectButton } from "@/components/YahooConnectButton";
import { useState } from "react";

export default function DashboardPage() {
  const [isSyncing, setIsSyncing] = useState(false);
  const leagues = useQuery(api.dataSync.getUserLeagues);
  const syncLeagues = useAction(api.dataSyncActions.syncLeagues);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncLeagues({});
    } catch (error) {
      console.error("Sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (leagues === undefined) {
    return (
      <div className="space-y-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <YahooConnectButton />
          <Button
            onClick={handleSync}
            isLoading={isSyncing}
            disabled={isSyncing}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {leagues.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              No leagues found. Connect your Yahoo account and sync your data.
            </p>
            <YahooConnectButton />
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leagues.map((league) => (
            <LeagueCard key={league._id} league={league} />
          ))}
        </div>
      )}
    </div>
  );
}

function LeagueCard({ league }: { league: any }) {
  const userTeam = useQuery(api.dataSync.getUserTeam, {
    leagueId: league._id,
  });

  if (userTeam === undefined) {
    return (
      <Card>
        <LoadingSpinner />
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{league.name}</h3>
          <p className="text-sm text-gray-500">
            Season {league.season} • Week {league.currentWeek || "N/A"}
          </p>
        </div>

        {userTeam ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Record</span>
              <span className="font-semibold">
                {userTeam.wins}-{userTeam.losses}
                {userTeam.ties ? `-${userTeam.ties}` : ""}
              </span>
            </div>
            {userTeam.pointsFor !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Points For</span>
                <span className="font-semibold">
                  {userTeam.pointsFor.toFixed(1)}
                </span>
              </div>
            )}
            {userTeam.pointsAgainst !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Points Against</span>
                <span className="font-semibold">
                  {userTeam.pointsAgainst.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No team data available</p>
        )}

        <div className="pt-4 border-t border-gray-200">
          <a
            href={`/free-agents?league=${league._id}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View Free Agents →
          </a>
        </div>
      </div>
    </Card>
  );
}

