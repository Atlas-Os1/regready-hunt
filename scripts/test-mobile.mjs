import puppeteer from "puppeteer";

const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage();
  await page.emulate({
    viewport: { width: 390, height: 844, isMobile: true, deviceScaleFactor: 1 },
    userAgent: "Mozilla/5.0 Mobile"
  });
  await page.goto("http://127.0.0.1:4173/projects/regready-hunt/", { waitUntil: "networkidle0" });
  await page.select("#state", "Oklahoma");
  await page.select("#species", "White-tailed deer");
  await page.$eval("#hunt-date", (element) => { element.value = "2026-11-14"; });
  await page.select("#weapon", "Rifle");
  await page.click("button[type=submit]");
  await page.waitForSelector("#result:not([hidden])");
  await page.click("#save-card");
  const result = await page.evaluate(() => ({
    viewport: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    checklistItems: document.querySelectorAll(".check").length,
    seasonEvidence: document.querySelectorAll(".season").length,
    saved: Boolean(localStorage.getItem("regready:last-card")),
    disclaimer: document.querySelector(".trust-note")?.textContent?.includes("demonstration data")
  }));
  if (result.viewport !== 390 || result.overflow || result.checklistItems !== 4 || result.seasonEvidence !== 5 || !result.saved || !result.disclaimer) {
    throw new Error(JSON.stringify(result));
  }
  console.log(JSON.stringify(result));
} finally {
  await browser.close();
}
