// Per-team access control.
//
// Each team has a shared password. Coaching staff for that team all use the
// same login. There's also a "head coach" wildcard scope that sees every team.
//
// The auth cookie holds the granted scope: either a specific team slug, or the
// literal "*" for head-coach access. That's it — no JWT, no DB lookup on every
// request. This is a coaching-plan app for family + friends, not a bank.

export const HEAD_COACH_SCOPE = "*";
export const AUTH_COOKIE = "coach-dad-session";

// Head-coach master password (env override wins; falls back to the same value
// the app has always used so nothing breaks in dev).
const HEAD_COACH_PASSWORD =
  process.env.HEAD_COACH_PASSWORD || "Newton2026";

// Per-team passwords. Add a row when you add a team.
export const TEAM_PASSWORDS: Record<string, string> = {
  "lugnuts-aaa":     "Lugnuts2026",
  "white-sox-farm2": "WhiteSox2026",
  "dodgers-teeball": "Dodgers2026",
  "river-cats-aaa":  "RiverCats2026",
  "astros-tball":    "Astros2026",
};

/**
 * Verify a login attempt. Returns the scope to grant, or null on failure.
 * `scope` is either a team slug or "*" for the head coach.
 */
export function verifyLogin(scope: string, password: string): string | null {
  if (scope === HEAD_COACH_SCOPE) {
    return password === HEAD_COACH_PASSWORD ? HEAD_COACH_SCOPE : null;
  }
  const expected = TEAM_PASSWORDS[scope];
  if (expected && password === expected) return scope;
  return null;
}

/**
 * Can the current cookie scope access this team?
 * Head coach (*) sees everything; team scopes only see themselves.
 */
export function canAccessTeam(scope: string | undefined, teamSlug: string): boolean {
  if (!scope) return false;
  if (scope === HEAD_COACH_SCOPE) return true;
  return scope === teamSlug;
}

export function isHeadCoach(scope: string | undefined): boolean {
  return scope === HEAD_COACH_SCOPE;
}
