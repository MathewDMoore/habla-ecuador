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
          stop() {
            if (this.finalOnStop) this.emit(this.finalOnStop,true,0.9);
            this.onend?.();
          }
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
      const fullApp = file === "index.html";
      const mainNav = page.locator(".bottom-nav");
      if (fullApp) {
        assert.equal(await mainNav.getByRole("button").count(), 5);
        await page.evaluate(() => {
          const view = document.querySelector(".view.active");
          for (const [type, key, x] of [["touchstart", "touches", 240], ["touchend", "changedTouches", 90]]) {
            const event = new Event(type, {bubbles:true});
            Object.defineProperty(event, key, {value:[{clientX:x,clientY:200}]});
            view.dispatchEvent(event);
          }
        });
        assert.equal(await page.locator(".view.active").getAttribute("id"), "translator-view");
        assert.equal(await mainNav.locator('[aria-current="page"]').getAttribute("data-open"), "translator-view");
      }
      assert.equal(await page.locator('[data-mode="translate"]').getAttribute("aria-selected"),"true");
      const entry = page.getByRole("button",{name:"Face to Face",exact:true});
      await entry.waitFor({state:"visible"});
      assert.ok(await entry.evaluate(el => el.getBoundingClientRect().bottom <= innerHeight));
      await page.evaluate(() => {
        window.faceSpoken = [];
        say = (text,lang) => window.faceSpoken.push({text,lang});
        requestGeneralTranslation = async (text,way,{source,target}) => `${source} → ${target} · ${text}`;
      });
      await page.locator("#open-face-to-face").tap();
      const dialog = page.locator("#face-to-face");
      if (fullApp) {
        const faceNav = dialog.locator(".face-to-face-bottom-nav");
        const buttons = faceNav.getByRole("button");
        assert.equal(await buttons.count(), 5);
        assert.ok(await buttons.evaluateAll(items => items.every(button => {
          const bounds = button.getBoundingClientRect();
          return bounds.width > 0 && bounds.height > 0 && bounds.top >= 0 && bounds.bottom <= innerHeight;
        })));
        assert.equal(await faceNav.locator('[aria-current="page"]').getAttribute("data-face-open"), "translator-view");
        await faceNav.locator('[data-face-open="dictionary-view"]').tap();
        assert.equal(await dialog.isVisible(), false);
        assert.equal(await mainNav.locator('[aria-current="page"]').getAttribute("data-open"), "dictionary-view");
        await mainNav.locator('[data-open="translator-view"]').tap();
        await entry.tap();
      }
      const far = dialog.locator('[data-face-side="spanish"]');
      const near = dialog.locator('[data-face-side="english"]');
      const nearMic = near.locator("[data-face-mic]");
      const farMic = far.locator("[data-face-mic]");
      assert.equal(await far.evaluate(el => getComputedStyle(el).transform),"matrix(-1, 0, 0, -1, 0, 0)");
      assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth));

      async function tapToTalk(mic) {
        await mic.tap();
        assert.equal(await mic.getAttribute("aria-pressed"),"true");
        assert.match(await mic.innerText(),/Tap to finish/);
        assert.equal(await page.evaluate(() => Boolean(faceRecordings.at(-1).stopped)),false);
      }

      await tapToTalk(nearMic);
      assert.equal(await farMic.isDisabled(),true);
      await page.evaluate(() => faceRecordings.at(-1).emit("Hola, ¿dónde puedo encontrar camello?",false,0.8));
      assert.match(await near.innerText(),/dónde puedo/);
      assert.doesNotMatch(await far.innerText(),/dónde puedo/);
      await page.evaluate(() => faceRecordings.at(-1).emit("Hola, ¿dónde puedo encontrar camello?",true,0.8));
      assert.doesNotMatch(await far.innerText(),/es-EC → en-US/);
      await nearMic.tap();
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

      await tapToTalk(nearMic);
      await page.evaluate(() => faceRecordings.at(-1).emit("We should go to the museum now",true,0.2));
      await nearMic.tap();
      await far.getByText(/Please repeat/).waitFor();
      assert.equal(await page.evaluate(() => turns.length),2,"unclear capture is discarded");
      await tapToTalk(nearMic);
      await page.evaluate(() => faceRecordings.at(-1).emit("We should go now",false,0.8));
      await nearMic.tap();
      await far.getByText(/Please repeat/).waitFor();
      assert.equal(await page.evaluate(() => turns.length),2,"tentative capture is discarded");

      await nearMic.press("Space");
      await page.locator("#close-face-to-face").tap();
      assert.equal(await page.evaluate(() => faceRecordings.at(-1).aborted),true);
      assert.equal(await dialog.isVisible(),false);
      await entry.tap();
      const start = dialog.locator("#start-face-conversation");
      await start.tap();
      await dialog.getByRole("button",{name:/Stop listening/}).waitFor();
      assert.equal(await nearMic.isDisabled(),true);
      assert.equal(await farMic.isDisabled(),true);
      assert.equal(await page.evaluate(() => faceRecordings.at(-1).lang),"en-US");
      await page.evaluate(() => {
        const translate = requestGeneralTranslation;
        requestGeneralTranslation = (text,...options) => text.includes("blue bus")
          ? new Promise(resolve => { window.finishFirstTranslation = () => resolve("¿Dónde está el autobús azul?"); })
          : translate(text,...options);
        const microphone = faceRecordings.at(-1);
        microphone.finalOnStop = "Can you tell me where the blue bus is?";
        microphone.emit(microphone.finalOnStop,false,0.9);
      });
      await page.waitForFunction(() => faceRecordings.at(-1).lang === "es-EC" && Boolean(window.finishFirstTranslation));
      await far.getByText(/Translating/).waitFor();
      await page.evaluate(() => {
        const microphone = faceRecordings.at(-1);
        microphone.emit("Sí, la parada está en esta calle.",true,0.9);
        microphone.onend();
      });
      await near.getByText(/es-EC → en-US/).waitFor();
      await page.waitForFunction(() => faceRecordings.at(-1).lang === "en-US");
      await page.evaluate(() => window.finishFirstTranslation());
      await far.getByText("¿Dónde está el autobús azul?",{exact:true}).waitFor();
      await near.getByText(/es-EC → en-US/).waitFor();
      assert.equal(await page.evaluate(() => faceSpoken.length),1,"hands-free turns stay silent");
      await start.tap();
      assert.equal(await page.evaluate(() => faceRecordings.at(-1).aborted),true);
      assert.equal(await nearMic.isEnabled(),true);
      await near.getByText(/es-EC → en-US/).waitFor();
      await tapToTalk(farMic);
      await page.evaluate(() => faceRecordings.at(-1).emit("Fuck",true,0.9));
      await farMic.tap();
      await near.getByText("¡Mierda!",{exact:true}).waitFor();
      await near.getByText("Fuck",{exact:true}).waitFor();
      await tapToTalk(nearMic);
      await page.evaluate(() => {
        requestGeneralTranslation = async () => "This is terrible.";
        faceRecordings.at(-1).emit("Esto es una mierda",true,0.9);
      });
      await nearMic.tap();
      await far.getByText("This is terrible.",{exact:true}).waitFor();
      await far.getByText("Esto es una mierda",{exact:true}).waitFor();
      assert.equal(await page.evaluate(() => faceSpoken.length),1);
      await page.locator("#close-face-to-face").tap();

      await page.evaluate(() => localStorage.removeItem("habla-tutorial-seen-v2"));
      await page.goto("https://mathewdmoore.github.io/habla-ecuador/" + file + "?start=face-to-face&ui=es");
      await dialog.waitFor({state:"visible"});
      assert.equal(await page.evaluate(() => HablaTutorial.isOpen()),false);
      await page.locator("#close-face-to-face").tap();
      await page.getByRole("button",{name:"Cara a cara",exact:true}).waitFor({state:"visible"});
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
