import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Upsert a league
export const upsertLeague = mutation({
  args: {
    userId: v.id("users"),
    yahooLeagueKey: v.string(),
    yahooLeagueId: v.string(),
    name: v.string(),
    season: v.string(),
    gameCode: v.string(),
    isFinished: v.boolean(),
    currentWeek: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leagues")
      .withIndex("by_yahoo_league_key", (q) =>
        q.eq("yahooLeagueKey", args.yahooLeagueKey)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        season: args.season,
        isFinished: args.isFinished,
        currentWeek: args.currentWeek,
        lastSyncedAt: now,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("leagues", {
        userId: args.userId,
        yahooLeagueKey: args.yahooLeagueKey,
        yahooLeagueId: args.yahooLeagueId,
        name: args.name,
        season: args.season,
        gameCode: args.gameCode,
        isFinished: args.isFinished,
        currentWeek: args.currentWeek,
        lastSyncedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});


// Upsert a team
export const upsertTeam = mutation({
  args: {
    userId: v.id("users"),
    leagueId: v.id("leagues"),
    yahooTeamKey: v.string(),
    yahooTeamId: v.string(),
    name: v.string(),
    isUserTeam: v.boolean(),
    wins: v.number(),
    losses: v.number(),
    ties: v.optional(v.number()),
    pointsFor: v.optional(v.number()),
    pointsAgainst: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("teams")
      .withIndex("by_yahoo_team_key", (q) =>
        q.eq("yahooTeamKey", args.yahooTeamKey)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        isUserTeam: args.isUserTeam,
        wins: args.wins,
        losses: args.losses,
        ties: args.ties,
        pointsFor: args.pointsFor,
        pointsAgainst: args.pointsAgainst,
        lastSyncedAt: now,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("teams", {
        userId: args.userId,
        leagueId: args.leagueId,
        yahooTeamKey: args.yahooTeamKey,
        yahooTeamId: args.yahooTeamId,
        name: args.name,
        isUserTeam: args.isUserTeam,
        wins: args.wins,
        losses: args.losses,
        ties: args.ties,
        pointsFor: args.pointsFor,
        pointsAgainst: args.pointsAgainst,
        lastSyncedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});


// Upsert a player
export const upsertPlayer = mutation({
  args: {
    yahooPlayerKey: v.string(),
    yahooPlayerId: v.string(),
    name: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    position: v.string(),
    eligiblePositions: v.array(v.string()),
    team: v.optional(v.string()),
    uniformNumber: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    status: v.optional(v.string()),
    injuryStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("players")
      .withIndex("by_yahoo_player_key", (q) =>
        q.eq("yahooPlayerKey", args.yahooPlayerKey)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        firstName: args.firstName,
        lastName: args.lastName,
        position: args.position,
        eligiblePositions: args.eligiblePositions,
        team: args.team,
        uniformNumber: args.uniformNumber,
        imageUrl: args.imageUrl,
        status: args.status,
        injuryStatus: args.injuryStatus,
        lastSyncedAt: now,
        updatedAt: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("players", {
        yahooPlayerKey: args.yahooPlayerKey,
        yahooPlayerId: args.yahooPlayerId,
        name: args.name,
        firstName: args.firstName,
        lastName: args.lastName,
        position: args.position,
        eligiblePositions: args.eligiblePositions,
        team: args.team,
        uniformNumber: args.uniformNumber,
        imageUrl: args.imageUrl,
        status: args.status,
        injuryStatus: args.injuryStatus,
        lastSyncedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Helper queries
export const getUserByIdQuery = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getLeagueQuery = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.leagueId);
  },
});

// Get user's leagues
export const getUserLeagues = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("leagues")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get user's team in a league
export const getUserTeam = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    return await ctx.db
      .query("teams")
      .withIndex("by_league", (q) => q.eq("leagueId", args.leagueId))
      .filter((q) => q.eq(q.field("isUserTeam"), true))
      .first();
  },
});

// Get league teams
export const getLeagueTeams = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("teams")
      .withIndex("by_league", (q) => q.eq("leagueId", args.leagueId))
      .collect();
  },
});

// Get free agents (players not on any roster in the league)
export const getFreeAgents = query({
  args: { leagueId: v.id("leagues") },
  handler: async (ctx, args) => {
    // Get all teams in the league
    const teams = await ctx.db
      .query("teams")
      .withIndex("by_league", (q) => q.eq("leagueId", args.leagueId))
      .collect();

    // Get all rosters for these teams
    const rosterPlayerIds = new Set<string>();
    for (const team of teams) {
      const rosters = await ctx.db
        .query("rosters")
        .withIndex("by_team", (q) => q.eq("teamId", team._id))
        .collect();
      for (const roster of rosters) {
        for (const rosterPlayer of roster.players) {
          rosterPlayerIds.add(rosterPlayer.playerId);
        }
      }
    }

    // Get all players and filter out those on rosters
    // Note: This is a simplified version - in production you'd want to cache this
    const allPlayers = await ctx.db.query("players").collect();
    return allPlayers.filter((player) => !rosterPlayerIds.has(player._id));
  },
});

