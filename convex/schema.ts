import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    // Fields from authTables.users
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // Our custom fields
    yahooUserId: v.optional(v.string()),
    yahooAccessToken: v.optional(v.string()),
    yahooRefreshToken: v.optional(v.string()),
    yahooTokenExpiry: v.optional(v.number()),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    .index("by_yahoo_user_id", ["yahooUserId"]),

  leagues: defineTable({
    userId: v.id("users"),
    yahooLeagueKey: v.string(),
    yahooLeagueId: v.string(),
    name: v.string(),
    season: v.string(),
    gameCode: v.string(),
    isFinished: v.boolean(),
    currentWeek: v.optional(v.number()),
    lastSyncedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_yahoo_league_key", ["yahooLeagueKey"]),

  teams: defineTable({
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
    lastSyncedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_league", ["leagueId"])
    .index("by_yahoo_team_key", ["yahooTeamKey"]),

  players: defineTable({
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
    stats: v.optional(
      v.object({
        gamesPlayed: v.optional(v.number()),
        goals: v.optional(v.number()),
        assists: v.optional(v.number()),
        points: v.optional(v.number()),
        plusMinus: v.optional(v.number()),
        pim: v.optional(v.number()),
        powerPlayGoals: v.optional(v.number()),
        powerPlayPoints: v.optional(v.number()),
        shorthandedGoals: v.optional(v.number()),
        shorthandedPoints: v.optional(v.number()),
        gameWinningGoals: v.optional(v.number()),
        shotsOnGoal: v.optional(v.number()),
        shootingPercentage: v.optional(v.number()),
        faceoffsWon: v.optional(v.number()),
        faceoffsLost: v.optional(v.number()),
        hits: v.optional(v.number()),
        blocks: v.optional(v.number()),
        wins: v.optional(v.number()),
        losses: v.optional(v.number()),
        ties: v.optional(v.number()),
        goalsAgainst: v.optional(v.number()),
        goalsAgainstAverage: v.optional(v.number()),
        saves: v.optional(v.number()),
        savePercentage: v.optional(v.number()),
        shutouts: v.optional(v.number()),
      })
    ),
    lastSyncedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_yahoo_player_key", ["yahooPlayerKey"]),

  rosters: defineTable({
    teamId: v.id("teams"),
    leagueId: v.id("leagues"),
    week: v.optional(v.number()),
    players: v.array(
      v.object({
        playerId: v.id("players"),
        position: v.string(),
        isStarting: v.boolean(),
      })
    ),
    lastSyncedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_league", ["leagueId"])
    .index("by_team_week", ["teamId", "week"]),

  matchups: defineTable({
    leagueId: v.id("leagues"),
    week: v.number(),
    team1Id: v.id("teams"),
    team2Id: v.id("teams"),
    team1Score: v.optional(v.number()),
    team2Score: v.optional(v.number()),
    isPlayoffs: v.boolean(),
    isConsolation: v.boolean(),
    status: v.string(),
    lastSyncedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_league", ["leagueId"])
    .index("by_league_week", ["leagueId", "week"])
    .index("by_team1", ["team1Id"])
    .index("by_team2", ["team2Id"]),

  analysisReports: defineTable({
    userId: v.id("users"),
    leagueId: v.id("leagues"),
    type: v.union(
      v.literal("free_agents"),
      v.literal("opponent_analysis"),
      v.literal("team_insights")
    ),
    title: v.string(),
    content: v.string(),
    metadata: v.optional(
      v.object({
        playerIds: v.optional(v.array(v.id("players"))),
        teamId: v.optional(v.id("teams")),
        matchupId: v.optional(v.id("matchups")),
        week: v.optional(v.number()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_league", ["leagueId"])
    .index("by_type", ["type"])
    .index("by_user_type", ["userId", "type"]),
});

