interface Env {
  ASSETS: Fetcher;
  RULES_DB: D1Database;
  ENVIRONMENT: string;
  RULES_STATUS: string;
}

const encoder = new TextEncoder();
const json = (body: unknown, init: ResponseInit = {}) => new Response(JSON.stringify(body), {
  ...init,
  headers: { "content-type": "application/json; charset=utf-8", ...(init.headers || {}) }
});
const now = () => new Date();
const isoNow = () => now().toISOString();
const addDays = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const b64 = (bytes: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
const randomToken = () => b64(crypto.getRandomValues(new Uint8Array(32)).buffer);
const cookieValue = (request: Request) => request.headers.get("cookie")?.match(/(?:^|;\s*)rr_session=([^;]+)/)?.[1];
const cookie = (token: string, maxAge: number) => `rr_session=${token}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
const error = (message: string, status = 400) => json({ error: message }, { status });

async function digest(value: string) {
  return b64(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: encoder.encode(salt), iterations: 100000, hash: "SHA-256" }, key, 256);
  return b64(bits);
}

async function body(request: Request) {
  try { return await request.json() as Record<string, unknown>; } catch { return null; }
}

async function userIdFromRequest(request: Request, env: Env) {
  const token = cookieValue(request);
  if (!token) return null;
  const session = await env.RULES_DB.prepare("SELECT user_id, expires_at FROM sessions WHERE session_id = ?").bind(await digest(token)).first<{ user_id: string; expires_at: string }>();
  if (!session || new Date(session.expires_at) <= now()) return null;
  return session.user_id;
}

async function createSession(userId: string, env: Env) {
  const token = randomToken();
  await env.RULES_DB.prepare("INSERT INTO sessions (session_id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(await digest(token), userId, addDays(30), isoNow()).run();
  return token;
}

function publicUser(user: { user_id: string; email: string; created_at: string }) {
  return { userId: user.user_id, email: user.email, createdAt: user.created_at };
}

async function accountRoute(request: Request, env: Env, path: string) {
  if (request.method === "GET" && path === "/api/account/session") {
    const userId = await userIdFromRequest(request, env);
    if (!userId) return error("Not authenticated", 401);
    const user = await env.RULES_DB.prepare("SELECT user_id, email, created_at FROM users WHERE user_id = ?").bind(userId).first<{ user_id: string; email: string; created_at: string }>();
    return user ? json({ user: publicUser(user) }) : error("Not authenticated", 401);
  }
  if (request.method === "POST" && (path === "/api/account/signup" || path === "/api/account/login")) {
    const input = await body(request);
    const email = typeof input?.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input?.password === "string" ? input.password : "";
    if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 10 || password.length > 200) return error("Use a valid email and a password between 10 and 200 characters.");
    if (path.endsWith("signup")) {
      const userId = crypto.randomUUID();
      const salt = randomToken();
      try {
        await env.RULES_DB.prepare("INSERT INTO users (user_id, email, password_salt, password_hash, created_at) VALUES (?, ?, ?, ?, ?)")
          .bind(userId, email, salt, await passwordHash(password, salt), isoNow()).run();
        const token = await createSession(userId, env);
        return json({ user: { userId, email }, mode: "account-created" }, { status: 201, headers: { "set-cookie": cookie(token, 2592000) } });
      } catch { return error("An account already exists for that email.", 409); }
    }
    const user = await env.RULES_DB.prepare("SELECT user_id, email, password_salt, password_hash, created_at FROM users WHERE email = ?").bind(email).first<{ user_id: string; email: string; password_salt: string; password_hash: string; created_at: string }>();
    if (!user || await passwordHash(password, user.password_salt) !== user.password_hash) return error("Email or password is incorrect.", 401);
    const token = await createSession(user.user_id, env);
    return json({ user: publicUser(user), mode: "logged-in" }, { headers: { "set-cookie": cookie(token, 2592000) } });
  }
  if (request.method === "POST" && path === "/api/account/logout") {
    const token = cookieValue(request);
    if (token) await env.RULES_DB.prepare("DELETE FROM sessions WHERE session_id = ?").bind(await digest(token)).run();
    return json({ ok: true }, { headers: { "set-cookie": cookie("", 0) } });
  }
  return null;
}

async function userDataRoute(request: Request, env: Env, path: string) {
  const userId = await userIdFromRequest(request, env);
  if (!userId) return error("Sign in to use this feature.", 401);
  if (path === "/api/licenses" && request.method === "GET") {
    const rows = await env.RULES_DB.prepare("SELECT license_id, agency, license_name, species, license_number_masked, expires_on, status, source, created_at FROM licenses WHERE user_id = ? ORDER BY expires_on IS NULL, expires_on")
      .bind(userId).all();
    return json({ licenses: rows.results });
  }
  if (path === "/api/licenses" && request.method === "POST") {
    const input = await body(request);
    const agency = typeof input?.agency === "string" ? input.agency.trim() : "";
    const licenseName = typeof input?.licenseName === "string" ? input.licenseName.trim() : "";
    const species = typeof input?.species === "string" ? input.species.trim() : null;
    const masked = typeof input?.licenseNumberMasked === "string" ? input.licenseNumberMasked.trim().slice(0, 40) : null;
    const expiresOn = typeof input?.expiresOn === "string" ? input.expiresOn : null;
    if (!agency || !licenseName) return error("Agency and license name are required.");
    const licenseId = crypto.randomUUID();
    await env.RULES_DB.prepare("INSERT INTO licenses (license_id, user_id, agency, license_name, species, license_number_masked, expires_on, status, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(licenseId, userId, agency, licenseName, species, masked, expiresOn, "user-entered", "user-entered", isoNow()).run();
    return json({ licenseId, status: "saved" }, { status: 201 });
  }
  if (path === "/api/plans" && request.method === "GET") {
    const rows = await env.RULES_DB.prepare("SELECT plan_id, state, species, hunt_date, weapon, notes, created_at FROM hunt_plans WHERE user_id = ? ORDER BY hunt_date DESC").bind(userId).all();
    return json({ plans: rows.results });
  }
  if (path === "/api/plans" && request.method === "POST") {
    const input = await body(request);
    const state = typeof input?.state === "string" ? input.state.trim() : "";
    const species = typeof input?.species === "string" ? input.species.trim() : "";
    const huntDate = typeof input?.huntDate === "string" ? input.huntDate : "";
    const weapon = typeof input?.weapon === "string" ? input.weapon.trim() : "";
    const notes = typeof input?.notes === "string" ? input.notes.trim().slice(0, 1000) : null;
    if (!state || !species || !huntDate || !weapon) return error("State, species, date, and weapon are required.");
    const planId = crypto.randomUUID();
    await env.RULES_DB.prepare("INSERT INTO hunt_plans (plan_id, user_id, state, species, hunt_date, weapon, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(planId, userId, state, species, huntDate, weapon, notes, isoNow()).run();
    return json({ planId, status: "saved" }, { status: 201 });
  }
  return null;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const account = await accountRoute(request, env, path);
    if (account) return account;
    if (path === "/api/agency/odwc" && request.method === "GET") {
      return json({ agency: "ODWC", name: "Oklahoma Department of Wildlife Conservation", mode: "official-handoff", directApi: false, officialUrl: "https://license.gooutdoorsoklahoma.com/Licensing/CustomerLookup.aspx", note: "ODWC credentials are never collected by RegReady. Use the official account and return to add a license snapshot." });
    }
    if (path === "/api/rules/oklahoma" && request.method === "GET") {
      const [pack, sources, rules] = await Promise.all([
        env.RULES_DB.prepare("SELECT pack_id, authority, retrieved_at, status, legal_notice FROM source_packs WHERE pack_id = ?").bind("oklahoma-large-game").first(),
        env.RULES_DB.prepare("SELECT source_id, species, kind, scope, source_url, final_url, retrieved_at, raw_file, text_file, bytes FROM source_documents WHERE pack_id = ? ORDER BY source_id").bind("oklahoma-large-game").all(),
        env.RULES_DB.prepare("SELECT rule_id, source_id, species, title, start_date, end_date, source_text, review_status, effective_year FROM rule_records ORDER BY species, start_date, title").all()
      ]);
      return json({ pack, sources: sources.results, rules: rules.results });
    }
    if (path === "/api/health" && request.method === "GET") return json({ service: "regready-hunt", environment: env.ENVIRONMENT, status: "ok", rulesStatus: env.RULES_STATUS });
    if (path === "/api/rules/status" && request.method === "GET") return json({ state: "Oklahoma", scope: "large-game source-pack planning", status: env.RULES_STATUS, sourceReviewRequired: true, officialSources: ["https://www.wildlifedepartment.com/hunting/regs/big-game-regulations", "https://www.wildlifedepartment.com/hunting/regs/general-hunting-regulations", "https://www.wildlifedepartment.com/hunting/regs/deer-big-game-season", "https://www.wildlifedepartment.com/hunting/regs/public-hunting-areas-special-regulations?page=11"] });
    if (path.startsWith("/api/")) {
      const data = await userDataRoute(request, env, path);
      if (data) return data;
      return error("API route not found", 404);
    }
    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
