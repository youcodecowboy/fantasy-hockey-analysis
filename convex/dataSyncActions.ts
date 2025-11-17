"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { parseStringPromise } from "xml2js";
import { getAuthUserId } from "@convex-dev/auth/server";

// Helper function to parse XML
async function parseXml(xml: string): Promise<any> {
  return await parseStringPromise(xml, {
    explicitArray: false,
    mergeAttrs: true,
  });
}

// Sync leagues for the current user
export const syncLeagues = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Get user
    const user = await ctx.runQuery(api.dataSync.getUserByIdQuery, {
      userId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Fetch games (leagues) from Yahoo
    console.log("Fetching user games from Yahoo...");
    const gamesXml = await ctx.runAction(api.yahooApi.fetchUserGames, {});
    console.log("Got games XML, length:", gamesXml.length);
    
    const gamesData = await parseXml(gamesXml);
    console.log("Parsed games data:", JSON.stringify(gamesData, null, 2).substring(0, 1000));

    // Extract NHL game (game_code: "nhl")
    const games = gamesData.fantasy_content?.users?.user?.games?.game;
    if (!games) {
      console.warn("No games found in response");
      return { synced: 0, message: "No games found in Yahoo account" };
    }

    const gameArray = Array.isArray(games) ? games : [games];
    console.log("Found games:", gameArray.map((g: any) => ({ code: g.game_code, key: g.game_key })));
    
    const nhlGame = gameArray.find((g: any) => g.game_code === "nhl");

    if (!nhlGame) {
      console.warn("No NHL game found. Available games:", gameArray.map((g: any) => g.game_code));
      return { synced: 0, message: `No NHL game found. Available games: ${gameArray.map((g: any) => g.game_code).join(", ")}` };
    }
    
    console.log("Found NHL game:", nhlGame.game_key);

    // Fetch leagues for NHL game
    const leaguesXml = await ctx.runAction(api.yahooApi.fetchLeagues, {
      gameKey: nhlGame.game_key,
    });
    const leaguesData = await parseXml(leaguesXml);

    const leagues = leaguesData.fantasy_content?.users?.user?.games?.game?.leagues?.league;
    if (!leagues) {
      return { synced: 0 };
    }

    const leagueArray = Array.isArray(leagues) ? leagues : [leagues];
    let syncedCount = 0;

    for (const league of leagueArray) {
      await ctx.runMutation(api.dataSync.upsertLeague, {
        userId: userId,
        yahooLeagueKey: league.league_key,
        yahooLeagueId: league.league_id,
        name: league.name,
        season: league.season,
        gameCode: league.game_code,
        isFinished: league.is_finished === "1",
        currentWeek: league.current_week ? parseInt(league.current_week) : undefined,
      });
      syncedCount++;
    }

    return { synced: syncedCount };
  },
});

// Sync teams for a league
export const syncLeagueTeams = action({
  args: {
    leagueId: v.id("leagues"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const league = await ctx.runQuery(api.dataSync.getLeagueQuery, {
      leagueId: args.leagueId,
    });

    if (!league) {
      throw new Error("League not found");
    }

    // Fetch teams from Yahoo
    const teamsXml = await ctx.runAction(api.yahooApi.fetchLeagueTeams, {
      leagueKey: league.yahooLeagueKey,
    });
    const teamsData = await parseXml(teamsXml);

    const teams = teamsData.fantasy_content?.league?.teams?.team;
    if (!teams) {
      return { synced: 0 };
    }

    const teamArray = Array.isArray(teams) ? teams : [teams];
    let syncedCount = 0;

    for (const team of teamArray) {
      const isUserTeam = team.managers?.manager?.some(
        (m: any) => m.is_current_login === "1"
      ) || false;

      await ctx.runMutation(api.dataSync.upsertTeam, {
        userId: userId,
        leagueId: args.leagueId,
        yahooTeamKey: team.team_key,
        yahooTeamId: team.team_id,
        name: team.name,
        isUserTeam,
        wins: parseInt(team.team_stats?.stats?.find((s: any) => s.stat_id === "7")?.value || "0"),
        losses: parseInt(team.team_stats?.stats?.find((s: any) => s.stat_id === "8")?.value || "0"),
        ties: parseInt(team.team_stats?.stats?.find((s: any) => s.stat_id === "9")?.value || "0"),
        pointsFor: parseFloat(team.team_stats?.stats?.find((s: any) => s.stat_id === "1")?.value || "0"),
        pointsAgainst: parseFloat(team.team_stats?.stats?.find((s: any) => s.stat_id === "2")?.value || "0"),
      });
      syncedCount++;
    }

    return { synced: syncedCount };
  },
});

// Sync free agents
export const syncFreeAgents = action({
  args: {
    leagueId: v.id("leagues"),
    position: v.optional(v.string()),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const league = await ctx.runQuery(api.dataSync.getLeagueQuery, {
      leagueId: args.leagueId,
    });

    if (!league) {
      throw new Error("League not found");
    }

    const freeAgentsXml = await ctx.runAction(api.yahooApi.fetchFreeAgents, {
      leagueKey: league.yahooLeagueKey,
      position: args.position,
      count: args.count || 50,
    });

    const freeAgentsData = await parseXml(freeAgentsXml);
    const players = freeAgentsData.fantasy_content?.league?.players?.player;
    if (!players) {
      return { synced: 0 };
    }

    const playerArray = Array.isArray(players) ? players : [players];
    let syncedCount = 0;

    for (const player of playerArray) {
      await ctx.runMutation(api.dataSync.upsertPlayer, {
        yahooPlayerKey: player.player_key,
        yahooPlayerId: player.player_id,
        name: player.name?.full || `${player.name?.first} ${player.name?.last}`,
        firstName: player.name?.first,
        lastName: player.name?.last,
        position: player.display_position,
        eligiblePositions: Array.isArray(player.eligible_positions?.position)
          ? player.eligible_positions.position.map((p: any) => p.position || p)
          : player.eligible_positions?.position
          ? [player.eligible_positions.position]
          : [],
        team: player.editorial_team_abbr,
        uniformNumber: player.uniform_number ? parseInt(player.uniform_number) : undefined,
        imageUrl: player.headshot?.url || player.image_url,
        status: player.status,
        injuryStatus: player.injury_note,
      });
      syncedCount++;
    }

    return { synced: syncedCount };
  },
});

