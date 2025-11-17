"use client";

import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { YahooConnectButton } from "@/components/YahooConnectButton";
import { CurrentWeekMatchup } from "@/components/CurrentWeekMatchup";
import { OtherMatchups } from "@/components/OtherMatchups";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
  const [isSyncing, setIsSyncing] = useState(false);
  const searchParams = useSearchParams();
  const leagues = useQuery(api.dataSync.getUserLeagues);
  const syncLeagues = useAction(api.dataSyncActions.syncLeagues);
  const storeYahooTokens = useMutation(api.yahoo.storeYahooTokens);

  // Handle Yahoo OAuth callback - store tokens from cookies
  useEffect(() => {
    const yahooConnected = searchParams.get("yahoo_connected");
    const error = searchParams.get("error");
    
    if (error) {
      console.error("Yahoo OAuth error:", error);
      // Show error to user
      alert(`Yahoo connection failed: ${error}`);
      // Remove error param
      window.history.replaceState({}, "", "/dashboard");
      return;
    }
    
    if (yahooConnected === "true") {
      console.log("🔵 Yahoo connected flag detected, looking for tokens...");
      
      let tokenDataString: string | null = null;
      
      // Try to read from cookie first
      const cookies = document.cookie.split("; ");
      console.log("🔵 All cookies:", cookies);
      const tokenCookie = cookies.find((c) => c.startsWith("yahoo_token_data="));
      
      if (tokenCookie) {
        console.log("✅ Found yahoo_token_data cookie");
        const cookieValue = tokenCookie.split("=").slice(1).join("=");
        // Next.js cookies are automatically decoded, but if it's double-encoded, decode twice
        try {
          // Try decoding once first
          const decodedOnce = decodeURIComponent(cookieValue);
          // If it still looks encoded (starts with %), decode again
          if (decodedOnce.startsWith("%")) {
            tokenDataString = decodeURIComponent(decodedOnce);
          } else {
            tokenDataString = decodedOnce;
          }
        } catch (e) {
          // If decoding fails, try using the value as-is
          tokenDataString = cookieValue;
        }
      } else {
        // Fallback: try reading from URL hash
        console.log("⚠️ No cookie found, checking URL hash...");
        const hash = window.location.hash;
        if (hash.includes("yahoo_tokens=")) {
          const match = hash.match(/yahoo_tokens=([^&]+)/);
          if (match) {
            console.log("✅ Found tokens in URL hash");
            tokenDataString = decodeURIComponent(match[1]);
            // Clear hash from URL
            window.history.replaceState({}, "", window.location.pathname + window.location.search);
          }
        }
      }
      
      if (tokenDataString) {
        try {
          const tokenData = JSON.parse(tokenDataString);
          
          console.log("✅ Parsed token data, storing in Convex...", {
            yahooUserId: tokenData.yahooUserId,
            hasAccessToken: !!tokenData.accessToken,
            hasRefreshToken: !!tokenData.refreshToken,
          });
          
          // Store tokens in Convex
          storeYahooTokens({
            yahooUserId: tokenData.yahooUserId,
            accessToken: tokenData.accessToken,
            refreshToken: tokenData.refreshToken,
            expiresIn: tokenData.expiresIn,
            yahooUserInfo: tokenData.yahooUserInfo,
          }).then(() => {
            console.log("✅✅ Yahoo tokens stored successfully in Convex");
            // Clear the cookie if it exists
            document.cookie = "yahoo_token_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure;";
            // Remove query param
            window.history.replaceState({}, "", "/dashboard");
            // Reload to refresh connection status
            window.location.reload();
          }).catch((error) => {
            console.error("❌ Failed to store Yahoo tokens:", error);
            alert(`Failed to store Yahoo tokens: ${error.message}`);
          });
        } catch (error) {
          console.error("❌ Error parsing token data:", error);
          console.error("Token data string:", tokenDataString?.substring(0, 100));
          alert("Error processing Yahoo connection. Please try again.");
        }
      } else {
        console.warn("⚠️⚠️ No yahoo_token_data found in cookie or URL hash");
        console.log("Available cookies:", document.cookie);
        console.log("URL hash:", window.location.hash);
        console.log("Full URL:", window.location.href);
        // Remove query param
        window.history.replaceState({}, "", "/dashboard");
        alert("Yahoo tokens not found. Please try connecting again.");
      }
    }
  }, [searchParams, storeYahooTokens]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      console.log("Starting league sync...");
      const result = await syncLeagues({});
      console.log("Sync completed:", result);
      
      if (result.synced === 0) {
        alert(`No leagues synced. ${result.message || "Check console for details."}`);
      } else {
        alert(`Successfully synced ${result.synced} league(s)!`);
        // Refresh the page to show new leagues
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Sync failed:", error);
      alert(`Sync failed: ${error.message || "Unknown error"}. Check console for details.`);
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

  // Get first league for now (we'll add league selection later)
  const primaryLeague = leagues.length > 0 ? leagues[0] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Your fantasy hockey overview</p>
        </div>
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
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4 text-lg">
              No leagues found. Connect your Yahoo account and sync your data.
            </p>
            <YahooConnectButton />
          </div>
        </Card>
      ) : primaryLeague ? (
        <div className="space-y-8">
          {/* Current Week Matchup */}
          <CurrentWeekMatchup leagueId={primaryLeague._id} />

          {/* Other Matchups */}
          {primaryLeague.currentWeek && (
            <OtherMatchupsWrapper
              leagueId={primaryLeague._id}
              currentWeek={primaryLeague.currentWeek}
            />
          )}

          {/* League Cards */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Leagues</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leagues.map((league) => (
                <LeagueCard key={league._id} league={league} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OtherMatchupsWrapper({ leagueId, currentWeek }: { leagueId: string; currentWeek: number }) {
  const currentMatchup = useQuery(api.dataSync.getCurrentWeekMatchup, {
    leagueId: leagueId as any,
  });

  return (
    <OtherMatchups
      leagueId={leagueId}
      currentWeek={currentWeek}
      excludeMatchupId={currentMatchup?._id}
    />
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
    <Card className="hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{league.name}</h3>
          <p className="text-sm text-slate-500 mt-1">
            Season {league.season} • Week {league.currentWeek || "N/A"}
          </p>
        </div>

        {userTeam ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
              <span className="text-sm font-medium text-slate-700">Record</span>
              <span className="text-lg font-bold text-slate-900">
                {userTeam.wins}-{userTeam.losses}
                {userTeam.ties ? `-${userTeam.ties}` : ""}
              </span>
            </div>
            {userTeam.pointsFor !== undefined && (
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Points For</span>
                <span className="text-lg font-bold text-slate-900">
                  {userTeam.pointsFor.toFixed(1)}
                </span>
              </div>
            )}
            {userTeam.pointsAgainst !== undefined && (
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-700">Points Against</span>
                <span className="text-lg font-bold text-slate-900">
                  {userTeam.pointsAgainst.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No team data available</p>
        )}

        <div className="pt-4 border-t border-slate-200">
          <a
            href={`/free-agents?league=${league._id}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            View Free Agents
            <span>→</span>
          </a>
        </div>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <DashboardContent />
    </Suspense>
  );
}

