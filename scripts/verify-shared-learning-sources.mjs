// Verifies supplied source metadata outside Habla's learner lesson flow.
// Never equate a redirect, title or thumbnail with verified article/video content.
import { readFile, mkdir, writeFile } from "node:fs/promises";

const sources = JSON.parse(await readFile("data/shared-learning-links.json", "utf8"));
const report = { checkedAt: new Date().toISOString(), policy: "No learner action or lesson completion is required.", items: [] };

async function fetchLimited(url, accept = "text/html") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14000);
  try {
    return await fetch(url, {
      redirect: "follow", signal: controller.signal,
      headers: { "User-Agent": "HablaEcuadorSourceCheck/1.0 (source metadata only)", Accept: accept }
    });
  } finally { clearTimeout(timer); }
}
function allowedBBC(host) {
  const value = host.toLowerCase();
  return ["bbc.com", "bbc.co.uk"].some(root => value === root || value.endsWith("." + root));
}
function decodeEntities(text) {
  return text.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'")
             .replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();
}
function pageTitle(html) {
  const meta = html.match(/<meta\b[^>]*property=["']og:title["'][^>]*content=["']([^"']+)/i)
    || html.match(/<meta\b[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  const title = meta?.[1] || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return title ? decodeEntities(title.replace(/\s+/g," ")).slice(0,250) : null;
}

for (const source of sources) {
  const result = { id: source.id, provider: source.provider,
    originalUrl: source.originalUrl, state: "unresolved", learnerActionRequired: false };
  try {
    if (source.provider === "BBC News Mundo") {
      const response = await fetchLimited(source.originalUrl);
      result.httpStatus = response.status;
      result.finalUrl = response.url;
      const target = new URL(response.url);
      if (response.ok && target.protocol === "https:" && allowedBBC(target.hostname)) {
        const html = (await response.text()).slice(0,800000);
        result.headline = pageTitle(html);
        result.state = result.headline ? "verified-source-metadata" : "bbc-domain-resolved-no-headline";
        result.note = "Content, publication date and author require separate inspection.";
      } else if (response.ok && target.protocol === "https:"
        && ["www.youtube.com", "youtube.com", "m.youtube.com", "youtu.be"].includes(target.hostname)) {
        // Source labels are hints, not proof. Identify the actual linked publisher.
        const watchId = target.hostname === "youtu.be"
          ? target.pathname.split("/")[1]
          : target.searchParams.get("v");
        result.resolvedSourceType = "YouTube video";
        if (/^[A-Za-z0-9_-]{11}$/.test(watchId || "")) {
          result.videoId = watchId;
          const endpoint = "https://www.youtube.com/oembed?format=json&url="
            + encodeURIComponent("https://www.youtube.com/watch?v=" + watchId);
          const yt = await fetchLimited(endpoint, "application/json");
          result.youtubeMetadataStatus = yt.status;
          if (yt.ok) {
            const data = await yt.json();
            if (data.provider_name === "YouTube"
                && typeof data.title === "string"
                && typeof data.author_name === "string") {
              result.state = "verified-redirected-video-metadata";
              result.title = data.title.slice(0,250);
              result.channel = data.author_name.slice(0,250);
              result.note = "Redirect leads to a YouTube video, not a BBC article. Label as BBC only if verified channel metadata supports that attribution. Transcript, regional usage and video contents remain unverified.";
            }
          }
        }
        if (result.state === "unresolved") {
          result.note = "Short link redirects to YouTube but its public video metadata was unavailable.";
        }
      } else {
        result.note = "Short link did not resolve to a public BBC page; no article claims verified.";
      }
    } else if (source.provider === "YouTube") {
      if (!/^[A-Za-z0-9_-]{11}$/.test(source.videoId)) throw Error("Invalid video ID");
      const watch = "https://www.youtube.com/watch?v=" + source.videoId;
      const endpoint = "https://www.youtube.com/oembed?format=json&url=" + encodeURIComponent(watch);
      const response = await fetchLimited(endpoint, "application/json");
      result.httpStatus = response.status;
      if (response.ok) {
        const metadata = await response.json();
        if (metadata.provider_name === "YouTube" && typeof metadata.title === "string"
            && typeof metadata.author_name === "string") {
          result.state = "verified-public-metadata";
          result.title = metadata.title.slice(0,250);
          result.channel = metadata.author_name.slice(0,250);
          result.watchUrl = watch;
          result.note = "Public metadata only. Video speech, captions, reuse rights and region remain unverified.";
        } else result.note = "YouTube did not return trustworthy oEmbed metadata.";
      } else result.note = "YouTube oEmbed returned no public metadata; video content not verified.";
    } else result.note = "Unsupported source provider.";
  } catch (error) {
    result.error = String(error?.message || error).slice(0,200);
    result.note = "Source verification could not complete; do not guess content.";
  }
  report.items.push(result);
  console.log(JSON.stringify(result));
}
await mkdir("reports", {recursive:true});
await writeFile("reports/shared-link-verification.json", JSON.stringify(report,null,2)+"\n");
console.log("Saved independent source metadata report; no optional lesson involved.");
