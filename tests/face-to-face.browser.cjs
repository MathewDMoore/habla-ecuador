const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const playwright = require(process.env.HABLA_PLAYWRIGHT_MODULE || "playwright");

async function main() {
  const engine = process.env.HABLA_BROWSER_ENGINE || "chromium";
  const browser = await playwright[engine].launch(engine === "chromium" ? {
    args:["--no-sandbox"], executablePath:process.env.HABLA_CHROMIUM_PATH
  } : {});
  try {
    for (const file of ["index.html","translator.html"]) {
      const context = await browser.newContext({viewport:{width:320,height:640},isMobile:true,hasTouch:true,serviceWorkers:"block"});
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.addInitScript(() => {
        localStorage.setItem("habla-tutorial-seen-v2","1");
        localStorage.setItem("habla-ecuador-conversation-playback-v1","spoken");
        window.faceRecordings = [];
        window.SpeechRecognition = class {
          start() {
            window.faceRecordings.push(this);
            this.onstart?.();
          }
          stop() { this.onend?.(); }
          abort() { this.aborted = true; this.onend?.(); }
          emit(text, isFinal, confidence) {
            const result = Object.assign([{transcript:text,confidence}],{isFinal});
            this.onresult?.({results:[result]});
          }
        };
      });
      await page.route("**/*", route => {
        const url = new URL(route.request().url());
        const local = path.join(__dirname,"..",url.pathname.replace(/^\/habla-ecuador\//,""));
        return url.origin === "https://mathewdmoore.github.io" && fs.existsSync(local) && fs.statSync(local).isFile()
          ? route.fulfill({path:local}) : route.abort();
      });
      await page.goto("https://mathewdmoore.github.io/habla-ecuador/" + file + "?ui=en");
      if (file === "index.html") await page.locator('.bottom-nav [data-open="translator-view"]').tap();
      await page.locator('[data-mode="conversation"]').tap();
      await page.evaluate(() => {
        window.faceSpoken = [];
        say = (text,lang) => window.faceSpoken.push({text,lang});
        requestGeneralTranslation = async (text,way,{source,target}) => `${source} → ${target} · ${text}`;
      });
      await page.locator("#open-face-to-face").tap();
      const dialog = page.locator("#face-to-face");
      const far = dialog.locator('[data-face-side="spanish"]');
      const near = dialog.locator('[data-face-side="english"]');
      const nearMic = near.locator("[data-face-mic]");
      const farMic = far.locator("[data-face-mic]");
      assert.equal(await far.evaluate(el => getComputedStyle(el).transform),"matrix(-1, 0, 0, -1, 0, 0)");
      assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth));

      async function hold(mic) {
        const {x,y,width,height} = await mic.boundingBox();
        await page.mouse.move(x + width / 2,y + height / 2);
        await page.mouse.down();
        await mic.waitFor();
        assert.equal(await mic.getAttribute("aria-pressed"),"true");
      }

      await hold(nearMic);
      assert.equal(await farMic.isDisabled(),true);
      await page.evaluate(() => faceRecordings.at(-1).emit("Hola, ¿dónde puedo encontrar camello?",false,0.8));
      assert.match(await near.innerText(),/dónde puedo/);
      assert.doesNotMatch(await far.innerText(),/dónde puedo/);
      await page.evaluate(() => faceRecordings.at(-1).emit("Hola, ¿dónde puedo encontrar camello?",true,0.8));
      assert.doesNotMatch(await far.innerText(),/es-EC → en-US/);
      await page.mouse.up();
      await far.getByText(/es-EC → en-US/).waitFor();
      await far.locator("summary").tap();
      assert.match(await far.innerText(),/work or job sense/);
      assert.deepEqual(await page.evaluate(() => faceSpoken),[]);
      await far.locator("[data-face-hear]").tap();
      assert.equal(await page.evaluate(() => faceSpoken.length),1);

      await farMic.focus();
      await farMic.press("Space");
      await page.evaluate(() => faceRecordings.at(-1).emit("Can you show me where the museum is?",true,0.9));
      await farMic.press("Space");
      await near.getByText(/en-US → es-EC/).waitFor();
      assert.equal(await page.evaluate(() => faceSpoken.length),1,"only the explicitly requested line is spoken");

      await hold(nearMic);
      await page.evaluate(() => faceRecordings.at(-1).emit("We should go to the museum now",true,0.2));
      await page.mouse.up();
      await far.getByText(/Please repeat/).waitFor();
      assert.equal(await page.evaluate(() => turns.length),2,"unclear capture is discarded");
      await hold(nearMic);
      await page.evaluate(() => faceRecordings.at(-1).emit("We should go now",false,0.8));
      await page.mouse.up();
      await far.getByText(/Please repeat/).waitFor();
      assert.equal(await page.evaluate(() => turns.length),2,"tentative capture is discarded");

      await nearMic.press("Space");
      await page.locator("#close-face-to-face").tap();
      assert.equal(await page.evaluate(() => faceRecordings.at(-1).aborted),true);
      assert.equal(await dialog.isVisible(),false);
      assert.deepEqual(errors,[]);
      await context.close();
    }
  } finally {
    await browser.close();
  }
}

main().then(() => console.log("Face-to-face conversation browser checks passed."),error => {
  console.error(error);
  process.exitCode = 1;
});
