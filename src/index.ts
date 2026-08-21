interface Env {
  ASSETS: Fetcher;
  RULES_DB: D1Database;
  ENVIRONMENT: string;
  RULES_STATUS: string;
}

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init.headers || {}) },
  });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json({ service: "regready-hunt", environment: env.ENVIRONMENT, status: "ok" });
    }

    if (url.pathname === "/api/rules/status") {
      return json({
        state: "Oklahoma",
        scope: "large-game source-pack planning",
        status: env.RULES_STATUS,
        sourceReviewRequired: true,
        officialSources: [
          "https://www.wildlifedepartment.com/hunting/regs/big-game-regulations",
          "https://www.wildlifedepartment.com/hunting/regs/general-hunting-regulations",
          "https://www.wildlifedepartment.com/hunting/regs/deer-big-game-season",
          "https://www.wildlifedepartment.com/hunting/regs/public-hunting-areas-special-regulations?page=11"
        ]
      });
    }

    if (url.pathname === "/api/rules/oklahoma") {
      const [pack, sources, rules] = await Promise.all([
        env.RULES_DB.prepare("SELECT pack_id, authority, retrieved_at, status, legal_notice FROM source_packs WHERE pack_id = ?")
          .bind("oklahoma-large-game").first(),
        env.RULES_DB.prepare("SELECT source_id, species, kind, scope, source_url, final_url, retrieved_at, raw_file, text_file, bytes FROM source_documents WHERE pack_id = ? ORDER BY source_id")
          .bind("oklahoma-large-game").all(),
        env.RULES_DB.prepare("SELECT rule_id, source_id, species, title, start_date, end_date, source_text, review_status, effective_year FROM rule_records ORDER BY species, start_date, title")
          .all()
      ]);
      return json({ pack, sources: sources.results, rules: rules.results });
    }

    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
