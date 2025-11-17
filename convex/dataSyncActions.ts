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
    console.log("Found games:", gameArray.map((g: any) => ({ code: g.code, key: g.game_key })));
    
    // Yahoo API uses "code" not "game_code" for the game code
    const nhlGame = gameArray.find((g: any) => g.code === "nhl");

    if (!nhlGame) {
      console.warn("No NHL game found. Available games:", gameArray.map((g: any) => g.code));
      return { synced: 0, message: `No NHL game found. Available games: ${gameArray.map((g: any) => g.code).join(", ")}` };
    }
    
    console.log("Found NHL game:", nhlGame.game_key);

    // Fetch leagues for NHL game
    console.log("Fetching leagues for game:", nhlGame.game_key);
    const leaguesXml = await ctx.runAction(api.yahooApi.fetchLeagues, {
      gameKey: nhlGame.game_key,
    });
    console.log("Got leagues XML, length:", leaguesXml.length);
    
    const leaguesData = await parseXml(leaguesXml);
    console.log("Parsed leagues data:", JSON.stringify(leaguesData, null, 2).substring(0, 2000));

    // The structure might be different - check the actual response structure
    const leagues = leaguesData.fantasy_content?.users?.user?.games?.game?.leagues?.league;
    if (!leagues) {
      console.warn("No leagues found in response. Full structure:", JSON.stringify(leaguesData, null, 2).substring(0, 1000));
      return { synced: 0, message: "No leagues found in Yahoo account" };
    }

    const leagueArray = Array.isArray(leagues) ? leagues : [leagues];
    console.log("Found leagues:", leagueArray.map((l: any) => ({ key: l.league_key, name: l.name })));
    
    let syncedCount = 0;

    for (const league of leagueArray) {
      console.log("Syncing league:", league.league_key, league.name);
      await ctx.runMutation(api.dataSync.upsertLeague, {
        userId: userId,
        yahooLeagueKey: league.league_key,
        yahooLeagueId: league.league_id,
        name: league.name,
        season: league.season || nhlGame.season, // Use game season if league doesn't have it
        gameCode: league.code || "nhl", // Use "code" field, fallback to "nhl"
        isFinished: league.is_finished === "1" || league.is_finished === 1,
        currentWeek: league.current_week ? parseInt(league.current_week) : undefined,
      });
      syncedCount++;
    }

    console.log(`Successfully synced ${syncedCount} league(s)`);
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

// Sync matchups for a league
export const syncLeagueMatchups = action({
  args: {
    leagueId: v.id("leagues"),
    week: v.optional(v.number()),
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

    // Fetch matchups from Yahoo
    const matchupsXml = await ctx.runAction(api.yahooApi.fetchMatchups, {
      leagueKey: league.yahooLeagueKey,
      week: args.week,
    });
    const matchupsData = await parseXml(matchupsXml);

    // Parse matchups structure
    const scoreboard = matchupsData.fantasy_content?.league?.scoreboard;
    if (!scoreboard) {
      return { synced: 0, message: "No scoreboard data found" };
    }

    const matchups = scoreboard.matchups?.matchup;
    if (!matchups) {
      return { synced: 0, message: "No matchups found" };
    }

    const matchupArray = Array.isArray(matchups) ? matchups : [matchups];
    let syncedCount = 0;

    for (const matchup of matchupArray) {
      const week = parseInt(matchup.week || scoreboard.week || "1");
      const team1 = matchup.teams?.["0"] || matchup.teams?.team?.[0];
      const team2 = matchup.teams?.["1"] || matchup.teams?.team?.[1];

      if (!team1 || !team2) {
        console.warn("Matchup missing teams:", matchup);
        continue;
      }

      // Find teams by Yahoo key
      const allTeams = await ctx.runQuery(api.dataSync.getLeagueTeams, {
        leagueId: args.leagueId,
      });
      
      const team1Record = allTeams.find((t: any) => t.yahooTeamKey === team1.team_key);
      const team2Record = allTeams.find((t: any) => t.yahooTeamKey === team2.team_key);

      if (!team1Record || !team2Record) {
        // Teams might not be synced yet, sync them first
        await ctx.runAction(api.dataSyncActions.syncLeagueTeams, {
          leagueId: args.leagueId,
        });
        // Retry getting teams
        const allTeamsRetry = await ctx.runQuery(api.dataSync.getLeagueTeams, {
          leagueId: args.leagueId,
        });
        const team1Retry = allTeamsRetry.find((t: any) => t.yahooTeamKey === team1.team_key);
        const team2Retry = allTeamsRetry.find((t: any) => t.yahooTeamKey === team2.team_key);
        if (!team1Retry || !team2Retry) {
          console.warn("Could not find teams after sync:", team1.team_key, team2.team_key);
          continue;
        }
        
        // Use retry teams
        const team1Final = team1Retry;
        const team2Final = team2Retry;

        // Calculate scores from team stats
        const team1Stats = team1.team_stats?.stats || [];
        const team2Stats = team2.team_stats?.stats || [];
        
        // Find total points stat (stat_id "1" is usually total points)
        const team1Score = parseFloat(team1Stats.find((s: any) => s.stat_id === "1")?.value || "0");
        const team2Score = parseFloat(team2Stats.find((s: any) => s.stat_id === "1")?.value || "0");

        await ctx.runMutation(api.dataSync.upsertMatchup, {
          leagueId: args.leagueId,
          week,
          team1Id: team1Final._id,
          team2Id: team2Final._id,
          team1Score,
          team2Score,
          isPlayoffs: matchup.is_playoffs === "1",
          isConsolation: matchup.is_consolation === "1",
          status: matchup.status || "completed",
        });
      } else {
        // Use original teams
        // Calculate scores from team stats
        const team1Stats = team1.team_stats?.stats || [];
        const team2Stats = team2.team_stats?.stats || [];
        
        // Find total points stat (stat_id "1" is usually total points)
        const team1Score = parseFloat(team1Stats.find((s: any) => s.stat_id === "1")?.value || "0");
        const team2Score = parseFloat(team2Stats.find((s: any) => s.stat_id === "1")?.value || "0");

        await ctx.runMutation(api.dataSync.upsertMatchup, {
          leagueId: args.leagueId,
          week,
          team1Id: team1Record._id,
          team2Id: team2Record._id,
          team1Score,
          team2Score,
          isPlayoffs: matchup.is_playoffs === "1",
          isConsolation: matchup.is_consolation === "1",
          status: matchup.status || "completed",
        });
      }
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
