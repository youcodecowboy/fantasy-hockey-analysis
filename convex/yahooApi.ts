import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

const YAHOO_FANTASY_BASE_URL = "https://fantasysports.yahooapis.com/fantasy/v2";

interface YahooApiResponse<T> {
  fantasy_content: {
    [key: string]: T;
  };
}

interface YahooLeague {
  league_key: string;
  league_id: string;
  name: string;
  url: string;
  logo_url: string;
  draft_status: string;
  num_teams: number;
  edit_key: number;
  weekly_deadline: string;
  league_update_timestamp: string;
  scoring_type: string;
  league_type: string;
  renew: string;
  renewed: string;
  iris_group_chat_id: string;
  allow_add_to_dl_extra_pos: number;
  is_pro_league: string;
  is_cash_league: string;
  current_week: string;
  start_week: string;
  start_date: string;
  end_week: string;
  end_date: string;
  is_finished: number;
  season: string;
  game_code: string;
}

interface YahooTeam {
  team_key: string;
  team_id: string;
  name: string;
  url: string;
  team_logos: Array<{
    size: string;
    url: string;
  }>;
  waiver_priority: number;
  number_of_moves: string;
  number_of_trades: string;
  clinched_playoffs: number;
  managers: Array<{
    manager_id: string;
    nickname: string;
    guid: string;
    is_commissioner: string;
    is_current_login: string;
  }>;
  team_stats: {
    coverage_type: string;
    week: string;
    stats: Array<{
      stat_id: string;
      value: string;
    }>;
  };
  roster?: {
    coverage_type: string;
    week: string;
    is_editable: number;
    players: Array<YahooPlayer>;
  };
}

interface YahooPlayer {
  player_key: string;
  player_id: string;
  name: {
    full: string;
    first: string;
    last: string;
    ascii_first: string;
    ascii_last: string;
  };
  editorial_player_key: string;
  editorial_team_key: string;
  editorial_team_full_name: string;
  editorial_team_abbr: string;
  uniform_number: string;
  display_position: string;
  headshot: {
    url: string;
    size: string;
  };
  image_url: string;
  is_undroppable: string;
  position_type: string;
  eligible_positions: Array<{
    position: string;
  }>;
  has_player_notes: number;
  player_notes_last_timestamp: string;
  selected_position: {
    coverage_type: string;
    week: string;
    position: string;
    is_flex: number;
  };
  has_recent_player_notes: number;
  status: string;
  status_full: string;
  injury_note: string;
  on_disabled_list: string;
}

interface YahooMatchup {
  week: string;
  status: string;
  is_playoffs: string;
  is_consolation: string;
  is_matchup_recap_available: string;
  teams: {
    "0": YahooTeam;
    "1": YahooTeam;
  };
}

// Fetch user's games (leagues)
export const fetchUserGames = action({
  args: {},
  handler: async (ctx) => {
    const accessToken = await ctx.runAction(api.yahoo.getValidAccessToken, {});

    const response = await fetch(
      `${YAHOO_FANTASY_BASE_URL}/users;use_login=1/games`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch games: ${errorText}`);
    }

    const xml = await response.text();
    // Note: Yahoo API returns XML, we'll need to parse it
    // For now, returning the raw response - in production you'd use an XML parser
    return xml;
  },
});

// Fetch leagues for a specific game
export const fetchLeagues = action({
  args: {
    gameKey: v.string(),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runAction(api.yahoo.getValidAccessToken, {});

    const response = await fetch(
      `${YAHOO_FANTASY_BASE_URL}/users;use_login=1/games;game_keys=${args.gameKey}/leagues`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch leagues: ${errorText}`);
    }

    const xml = await response.text();
    return xml;
  },
});

// Fetch league details
export const fetchLeague = action({
  args: {
    leagueKey: v.string(),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runAction(api.yahoo.getValidAccessToken, {});

    const response = await fetch(
      `${YAHOO_FANTASY_BASE_URL}/league/${args.leagueKey}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch league: ${errorText}`);
    }

    const xml = await response.text();
    return xml;
  },
});

// Fetch teams in a league
export const fetchLeagueTeams = action({
  args: {
    leagueKey: v.string(),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runAction(api.yahoo.getValidAccessToken, {});

    const response = await fetch(
      `${YAHOO_FANTASY_BASE_URL}/league/${args.leagueKey}/teams`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch teams: ${errorText}`);
    }

    const xml = await response.text();
    return xml;
  },
});

// Fetch team roster
export const fetchTeamRoster = action({
  args: {
    teamKey: v.string(),
    week: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runAction(api.yahoo.getValidAccessToken, {});

    const weekParam = args.week ? `;week=${args.week}` : "";
    const response = await fetch(
      `${YAHOO_FANTASY_BASE_URL}/team/${args.teamKey}/roster${weekParam}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch roster: ${errorText}`);
    }

    const xml = await response.text();
    return xml;
  },
});

// Fetch free agents
export const fetchFreeAgents = action({
  args: {
    leagueKey: v.string(),
    position: v.optional(v.string()),
    status: v.optional(v.string()),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runAction(api.yahoo.getValidAccessToken, {});

    const params = new URLSearchParams();
    if (args.position) params.append("position", args.position);
    if (args.status) params.append("status", args.status);
    if (args.count) params.append("count", args.count.toString());

    const queryString = params.toString();
    const url = `${YAHOO_FANTASY_BASE_URL}/league/${args.leagueKey}/players${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch free agents: ${errorText}`);
    }

    const xml = await response.text();
    return xml;
  },
});

// Fetch matchups for a league
export const fetchMatchups = action({
  args: {
    leagueKey: v.string(),
    week: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runAction(api.yahoo.getValidAccessToken, {});

    const weekParam = args.week ? `;week=${args.week}` : "";
    const response = await fetch(
      `${YAHOO_FANTASY_BASE_URL}/league/${args.leagueKey}/scoreboard${weekParam}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch matchups: ${errorText}`);
    }

    const xml = await response.text();
    return xml;
  },
});

// Fetch player stats
export const fetchPlayerStats = action({
  args: {
    playerKey: v.string(),
    week: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const accessToken = await ctx.runAction(api.yahoo.getValidAccessToken, {});

    const weekParam = args.week ? `;week=${args.week}` : "";
    const response = await fetch(
      `${YAHOO_FANTASY_BASE_URL}/player/${args.playerKey}/stats${weekParam}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch player stats: ${errorText}`);
    }

    const xml = await response.text();
    return xml;
  },
});

