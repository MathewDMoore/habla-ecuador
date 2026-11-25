/* A YouTube link opens in the official embedded player. No media is downloaded,
   no captions are scraped, and no region/lyrics are inferred from the URL. */
(() => {
  "use strict";
  const byId = id => document.getElementById(id);
  const form = byId("habla-youtube-form");
  if (!form) return;
  const input = byId("habla-youtube-url");
  const status = byId("habla-youtube-status");
  const holder = byId("habla-youtube-player");
  const frame = byId("habla-youtube-iframe");
  const original = byId("habla-youtube-original");

  function videoFromLink(text) {
    let url;
    try { url = new URL(String(text || "").trim()); } catch { return null; }
    if (url.protocol !== "https:") return null;
    const host = url.hostname.toLowerCase();
    let id = "";
    if (host === "youtu.be") {
      id = url.pathname.split("/")[1] || "";
    } else if (["youtube.com", "www.youtube.com", "m.youtube.com",
                "music.youtube.com", "www.youtube-nocookie.com"].includes(host)) {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "watch") id = url.searchParams.get("v") || "";
      else if (["shorts", "live", "embed", "v"].includes(parts[0])) id = parts[1] || "";
    } else return null;
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return null;
    const rawStart = url.searchParams.get("start") || url.searchParams.get("t") || "";
    let seconds = /^\d+$/.test(rawStart) ? Number(rawStart) : 0;
    if (!seconds && rawStart) {
      const match = rawStart.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
      if (match) seconds = Number(match[1] || 0)*3600 + Number(match[2] || 0)*60 + Number(match[3] || 0);
    }
    return { id, seconds: Number.isFinite(seconds) && seconds > 0 ? Math.min(86400, Math.floor(seconds)) : 0 };
  }

  function show(text) {
    const parsed = videoFromLink(text);
    if (!parsed) {
      status.textContent = "Enter a valid YouTube video link (watch, Shorts, Live, or youtu.be).";
      status.setAttribute("data-state", "error");
      return false;
    }
    const embed = new URL("https://www.youtube-nocookie.com/embed/" + parsed.id);
    embed.searchParams.set("playsinline", "1");
    embed.searchParams.set("rel", "0");
    embed.searchParams.set("cc_load_policy", "1");
    embed.searchParams.set("origin", location.origin);
    if (parsed.seconds) embed.searchParams.set("start", String(parsed.seconds));
    frame.src = embed.href; // Never construct a player URL from an unvalidated host.
    frame.title = "YouTube video shared with Habla Ecuador";
    original.href = "https://www.youtube.com/watch?v=" + parsed.id +
      (parsed.seconds ? "&t=" + parsed.seconds + "s" : "");
    holder.hidden = false;
    status.removeAttribute("data-state");
    status.textContent = "Player ready. Tap Play. Some creators disable embedding; use Open on YouTube if needed.";
    return true;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    show(input.value);
  });

  const shared = new URLSearchParams(location.search).get("video");
  if (shared) {
    input.value = shared;
    if (show(shared)) {
      byId("habla-youtube-section")?.scrollIntoView({ block: "nearest" });
    }
  }
  // A Share extension launches no media itself; the main app reads the shared
  // App Group inbox when the user opens or returns to Habla.
  window.HablaYouTubeLink = Object.freeze({ videoFromLink });
})();