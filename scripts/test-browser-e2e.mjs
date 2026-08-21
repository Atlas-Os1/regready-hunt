import puppeteer from "puppeteer";

const base = process.env.REGREADY_URL || "https://regready-hunt-production.srvcflo.workers.dev";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(String(error)));
page.on("console", (message) => {
  if (message.type() === "error" && !message.text().includes("401") && !message.text().includes("409") && !message.text().includes("404") && !message.text().includes("ERR_FILE_NOT_FOUND")) errors.push(message.text());
});
await page.emulate({ viewport: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 1 }, userAgent: "Mozilla/5.0 Mobile" });
await page.goto(`${base}/?e2e=${Date.now()}`, { waitUntil: "networkidle0" });
const assert = (value, message) => { if (!value) throw new Error(message); };
const email = `e2e.${Date.now()}@example.com`;
const password = "SafePassphrase9";

assert(await page.title() === "RegReady Hunt | Oklahoma", "title");
assert(await page.$eval("#source-status", (el) => el.textContent === "Source pack connected"), "source pack status");
assert(await page.$eval("#source-count", (el) => el.textContent === "8"), "source count");
assert(await page.$eval("#rule-count", (el) => el.textContent === "17"), "rule count");
assert(await page.$eval("#account-state", (el) => el.textContent === "Not signed in"), "initial account state");
assert(await page.$eval("html", (el) => el.scrollWidth <= 390), "initial mobile overflow");

const speciesChecks = [
  ["White-tailed deer", 5], ["Elk", 5], ["Antelope", 4], ["Black bear", 2], ["Mountain lion", 1], ["Turkey", 0]
];
for (const [species, expected] of speciesChecks) {
  await page.select("#state", "Oklahoma");
  await page.select("#species", species);
  await page.$eval("#hunt-date", (el) => { el.value = "2026-11-21"; });
  await page.select("#weapon", "Rifle");
  await page.click("button[type=submit]");
  await page.waitForSelector("#result:not([hidden])");
  const count = await page.$$eval(".season", (elements) => elements.length);
  assert(count === expected, `${species} evidence count ${count} != ${expected}`);
}
await page.click("#save-card");
assert(await page.$eval("#saved", (el) => !el.hidden), "local save");

await page.type("#account-email", email);
await page.type("#account-password", password);
await page.click("#account-form button[type=submit]");
await page.waitForFunction(() => document.querySelector("#account-state")?.textContent?.startsWith("Signed in as"));

const duplicate = await page.evaluate(async ({ email, password }) => {
  const response = await fetch("/api/account/signup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }) });
  return response.status;
}, { email, password });
assert(duplicate === 409, `duplicate signup ${duplicate}`);

await page.click("#show-license");
await (await page.$("#license-image")).uploadFile("C:/Users/Minte/ui-regready-mobile.png");
await page.waitForFunction(() => !document.querySelector("#license-preview")?.hidden);
assert(await page.$eval("#license-preview-image", (el) => el.src.startsWith("blob:")), "local screenshot preview");
await page.type("#license-name", "Annual elk license");
await page.type("#license-species", "Elk");
await page.type("#license-number", "...1234");
await page.$eval("#license-expiry", (el) => { el.value = "2026-12-31"; });
await page.click("#license-form button[type=submit]");
await page.waitForFunction(() => document.querySelector("#license-list")?.innerText.includes("Annual elk license"));
const licenseSource = await page.evaluate(async () => (await (await fetch("/api/licenses")).json()).licenses.at(-1)?.source);
assert(licenseSource === "screenshot-reviewed-local", `license source ${licenseSource}`);

await page.click("#save-plan");
await page.waitForFunction(() => document.querySelector("#plan-list")?.innerText.includes("Turkey in Oklahoma"));

const agency = await page.$eval("a[href*='license.gooutdoorsoklahoma.com']", (el) => el.getAttribute("href"));
assert(agency.includes("license.gooutdoorsoklahoma.com"), "ODWC official handoff link");
const unknown = await page.evaluate(async () => (await fetch("/api/not-a-route")).status);
assert(unknown === 404, `unknown API route ${unknown}`);

await page.click("#logout-button");
await page.waitForFunction(() => document.querySelector("#account-state")?.textContent === "Not signed in");
const unauthPlan = await page.evaluate(async () => (await fetch("/api/plans", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: "Oklahoma", species: "Elk", huntDate: "2026-11-21", weapon: "Rifle" }) })).status);
assert(unauthPlan === 401, `unauth plan ${unauthPlan}`);

await page.$eval("#account-email", (el, value) => { el.value = value; }, email);
await page.$eval("#account-password", (el, value) => { el.value = value; }, password);
await page.click("#login-button");
await page.waitForFunction(() => document.querySelector("#account-state")?.textContent?.startsWith("Signed in as"));
const output = await page.evaluate(() => ({
  status: document.querySelector("#source-status")?.textContent,
  account: document.querySelector("#account-state")?.textContent,
  license: document.querySelector("#license-list")?.innerText,
  plan: document.querySelector("#plan-list")?.innerText,
  overflow: document.documentElement.scrollWidth > innerWidth
}));
assert(!errors.length, `browser errors: ${errors.join(" | ")}`);
assert(!output.overflow, "final mobile overflow");
console.log(JSON.stringify({ email, speciesChecks, duplicate, unknown, unauthPlan, output, errors }, null, 2));
await browser.close();
