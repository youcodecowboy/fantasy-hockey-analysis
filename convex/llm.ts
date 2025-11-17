import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// Type assertion for Next.js build (Convex types are generated at runtime)
const convexApi = api as any;

const TOGETHER_API_URL = "https://api.together.xyz/v1/chat/completions";

interface TogetherMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface TogetherResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// Generate analysis using Together.ai
async function generateAnalysis(
  messages: TogetherMessage[],
  model: string = "meta-llama/Llama-3.1-70B-Instruct-Turbo"
): Promise<string> {
  const apiKey = process.env.TOGETHER_API_KEY;
  if (!apiKey) {
    throw new Error("TOGETHER_API_KEY not configured");
  }

  const response = await fetch(TOGETHER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Together.ai API error: ${errorText}`);
  }

  const data: TogetherResponse = await response.json();
  return data.choices[0]?.message?.content || "No response generated";
}

// Analyze free agents
export const analyzeFreeAgents = action({
  args: {
    leagueId: v.id("leagues"),
    playerIds: v.array(v.id("players")),
  },
  handler: async (ctx, args) => {
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

    // Get league
    const league = await ctx.runQuery(api.dataSync.getLeagueQuery, {
      leagueId: args.leagueId,
    });

    if (!league) {
      throw new Error("League not found");
    }

    // Get user's team
    const userTeam = await ctx.runQuery(api.dataSync.getUserTeam, {
      leagueId: args.leagueId,
    });

    // Get players data
    const players = await Promise.all(
      args.playerIds.map((id) => ctx.runQuery(convexApi.llm.getPlayerQuery, { playerId: id }))
    );

    const playersData = players
      .filter((p: any) => p !== null)
      .map((p: any) => ({
        name: p!.name,
        position: p!.position,
        team: p!.team,
        stats: p!.stats,
      }));

    const systemPrompt = `You are an expert fantasy hockey analyst. Analyze free agents and provide actionable recommendations based on player statistics, team needs, and fantasy hockey strategy. Be concise but insightful.`;

    const userPrompt = `Analyze these free agents for my fantasy hockey team:

League: ${league.name}
My Team: ${userTeam?.name || "Unknown"}
Current Record: ${userTeam?.wins || 0}-${userTeam?.losses || 0}-${userTeam?.ties || 0}

Available Free Agents:
${playersData.map((p: any, i: number) => `${i + 1}. ${p.name} (${p.position}, ${p.team || "FA"})`).join("\n")}

Provide:
1. Top 3 recommended pickups with reasoning
2. Key strengths and weaknesses of each recommended player
3. How they fit with my team's needs
4. Any risks or concerns`;

    const analysis = await generateAnalysis([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    // Store analysis report  
    const reportId = await ctx.runMutation(convexApi.llm.storeAnalysisReport, {
      userId: userId,
      leagueId: args.leagueId,
      type: "free_agents",
      title: "Free Agent Analysis",
      content: analysis,
      metadata: {
        playerIds: args.playerIds,
      },
    });

    return { reportId, analysis };
  },
});

// Analyze opponent
export const analyzeOpponent = action({
  args: {
    leagueId: v.id("leagues"),
    opponentTeamId: v.id("teams"),
    week: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.dataSync.getUserByEmailQuery, {
      email: identity.email!,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const league = await ctx.runQuery(api.dataSync.getLeagueQuery, {
      leagueId: args.leagueId,
    });

    if (!league) {
      throw new Error("League not found");
    }

    const userTeam = await ctx.runQuery(api.dataSync.getUserTeam, {
      leagueId: args.leagueId,
    });

    const opponentTeam = await ctx.runQuery(convexApi.llm.getTeamQuery, {
      teamId: args.opponentTeamId,
    });

    if (!opponentTeam) {
      throw new Error("Opponent team not found");
    }

    const systemPrompt = `You are an expert fantasy hockey analyst. Analyze opponents and provide strategic insights for matchups. Focus on identifying strengths, weaknesses, and strategic recommendations.`;

    const userPrompt = `Analyze my upcoming opponent in fantasy hockey:

League: ${league.name}
Week: ${args.week || league.currentWeek || "Current"}

My Team: ${userTeam?.name || "Unknown"}
Record: ${userTeam?.wins || 0}-${userTeam?.losses || 0}-${userTeam?.ties || 0}
Points For: ${userTeam?.pointsFor || 0}
Points Against: ${userTeam?.pointsAgainst || 0}

Opponent Team: ${opponentTeam.name}
Record: ${opponentTeam.wins}-${opponentTeam.losses}-${opponentTeam.ties || 0}
Points For: ${opponentTeam.pointsFor || 0}
Points Against: ${opponentTeam.pointsAgainst || 0}

Provide:
1. Opponent's key strengths and weaknesses
2. Areas where I have an advantage
3. Strategic recommendations for the matchup
4. Key players to watch on their team
5. Potential streaming or roster adjustments`;

    const analysis = await generateAnalysis([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const reportId = await ctx.runMutation(convexApi.llm.storeAnalysisReport, {
      userId: userId,
      leagueId: args.leagueId,
      type: "opponent_analysis",
      title: `Opponent Analysis: ${opponentTeam.name}`,
      content: analysis,
      metadata: {
        teamId: args.opponentTeamId,
        week: args.week,
      },
    });

    return { reportId, analysis };
  },
});

// Analyze team performance
export const analyzeTeamPerformance = action({
  args: {
    leagueId: v.id("leagues"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.runQuery(api.dataSync.getUserByEmailQuery, {
      email: identity.email!,
    });

    if (!user) {
      throw new Error("User not found");
    }

    const league = await ctx.runQuery(api.dataSync.getLeagueQuery, {
      leagueId: args.leagueId,
    });

    if (!league) {
      throw new Error("League not found");
    }

    const userTeam = await ctx.runQuery(api.dataSync.getUserTeam, {
      leagueId: args.leagueId,
    });

    if (!userTeam) {
      throw new Error("User team not found");
    }

    const systemPrompt = `You are an expert fantasy hockey analyst. Analyze team performance and provide actionable insights for improvement. Focus on identifying trends, strengths, weaknesses, and specific recommendations.`;

    const userPrompt = `Analyze my fantasy hockey team's performance:

League: ${league.name}
Season: ${league.season}
Current Week: ${league.currentWeek || "N/A"}

My Team: ${userTeam.name}
Record: ${userTeam.wins}-${userTeam.losses}-${userTeam.ties || 0}
Points For: ${userTeam.pointsFor || 0}
Points Against: ${userTeam.pointsAgainst || 0}

Provide:
1. Overall team assessment and performance trends
2. Key strengths to leverage
3. Areas for improvement
4. Specific roster recommendations
5. Strategic advice for the rest of the season
6. Waiver wire priorities`;

    const analysis = await generateAnalysis([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const reportId = await ctx.runMutation(convexApi.llm.storeAnalysisReport, {
      userId: userId,
      leagueId: args.leagueId,
      type: "team_insights",
      title: "Team Performance Analysis",
      content: analysis,
      metadata: {
        teamId: userTeam._id,
      },
    });

    return { reportId, analysis };
  },
});

// Store analysis report
export const storeAnalysisReport = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("analysisReports", {
      userId: args.userId,
      leagueId: args.leagueId,
      type: args.type,
      title: args.title,
      content: args.content,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Helper queries
export const getPlayerQuery = query({
  args: { playerId: v.id("players") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.playerId);
  },
});

export const getTeamQuery = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.teamId);
  },
});

// Get analysis reports
export const getAnalysisReports = query({
  args: {
    leagueId: v.id("leagues"),
    type: v.optional(
      v.union(
        v.literal("free_agents"),
        v.literal("opponent_analysis"),
        v.literal("team_insights")
      )
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    let query = ctx.db
      .query("analysisReports")
      .withIndex("by_user_type", (q) =>
        q.eq("userId", userId).eq("type", args.type || "free_agents")
      );

    if (args.leagueId) {
      // Filter by league if provided
      const reports = await query.collect();
      return reports.filter((r) => r.leagueId === args.leagueId);
    }

    return await query.collect();
  },
});

