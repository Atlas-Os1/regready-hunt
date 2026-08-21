interface Env {
  ASSETS: Fetcher;
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

    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
