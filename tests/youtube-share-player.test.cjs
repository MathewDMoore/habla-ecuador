const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const code = fs.readFileSync(path.join(__dirname, "..", "youtube-shared-player.js"), "utf8");

function harness(search = "") {
  const elements = new Map();
  for (const id of ["habla-youtube-form", "habla-youtube-url",
    "habla-youtube-status", "habla-youtube-player", "habla-youtube-iframe",
    "habla-youtube-original", "habla-youtube-section"]) {
    elements.set(id, {
      hidden: true, value: "", src: "", href: "", textContent: "",
      handler: null, addEventListener(_type, handler) { this.handler = handler; },
      setAttribute() {}, removeAttribute() {}, scrollIntoView() {}
    });
  }
  const sandbox = {
    URL, URLSearchParams,
    location: { origin: "https://mathewdmoore.github.io", search },
    document: { getElementById: id => elements.get(id) || null },
    window: {}
  };
  vm.runInNewContext(code, sandbox, { filename: "youtube-shared-player.js" });
  return { elements, parse: sandbox.window.HablaYouTubeLink.videoFromLink };
}

test("accepts standard, short, live, and Shorts URLs", () => {
  const { parse } = harness();
  for (const link of [
    "https://www.youtube.com/watch?v=zucN-uBedlg",
    "https://youtu.be/zucN-uBedlg?si=tracking",
    "https://m.youtube.com/shorts/zucN-uBedlg",
    "https://youtube.com/live/zucN-uBedlg",
    "https://music.youtube.com/watch?v=zucN-uBedlg"
  ]) assert.equal(parse(link)?.id, "zucN-uBedlg", link);
});
test("rejects non-YouTube hosts, insecure links and malformed IDs", () => {
  const { parse } = harness();
  for (const link of [
    "https://youtube.com.evil.example/watch?v=zucN-uBedlg",
    "https://evil.example/youtube.com/watch?v=zucN-uBedlg",
    "http://youtube.com/watch?v=zucN-uBedlg",
    "https://youtube.com/watch?v=x",
    "https://youtube.com/playlist?list=PL123",
    "javascript:alert(1)"
  ]) assert.equal(parse(link), null, link);
});
test("does not embed until a valid link is selected", () => {
  const { elements } = harness();
  const frame = elements.get("habla-youtube-iframe");
  const form = elements.get("habla-youtube-form");
  assert.equal(frame.src, "");
  elements.get("habla-youtube-url").value = "https://youtu.be/zucN-uBedlg?t=90";
  let prevented = false;
  form.handler({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  const src = new URL(frame.src);
  assert.equal(src.host, "www.youtube-nocookie.com");
  assert.equal(src.pathname, "/embed/zucN-uBedlg");
  assert.equal(src.searchParams.get("start"), "90");
  assert.equal(elements.get("habla-youtube-player").hidden, false);
});
test("loads a received iPhone share URL without autoplay", () => {
  const link = "https://www.youtube.com/shorts/zucN-uBedlg";
  const { elements } = harness("?start=music&video=" + encodeURIComponent(link));
  const src = new URL(elements.get("habla-youtube-iframe").src);
  assert.equal(src.pathname, "/embed/zucN-uBedlg");
  assert.equal(src.searchParams.has("autoplay"), false);
  assert.equal(elements.get("habla-youtube-original").href, "https://www.youtube.com/watch?v=zucN-uBedlg");
});
