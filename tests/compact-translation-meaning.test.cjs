const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const js = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const extract = (start, end) => js.slice(js.indexOf(start), js.indexOf(end, js.indexOf(start)+1));
const normalize = js.split("\n").find(line => line.startsWith("const normalize ="));
const api = new Function(normalize + "\nconst languageFamily=x=>x.split('-')[0];\n" +
  extract("function matchesPhraseCandidate(", "\nfunction matchEvidenceExample(") + "\n" +
  extract("function reviewedMeaningTranslation(", "\nasync function requestGeneralTranslation(") +
  "\nreturn {matchesPhraseCandidate,reviewedMeaningTranslation};")();
const translate = (text,target="en-US",purpose="everyday") =>
  api.reviewedMeaningTranslation(text,{source:"es-EC",target,purpose})?.text;
assert.equal(translate("Ya no hago eso 🤓"), "I don't do that anymore 🤓");
assert.equal(translate("Ya no hago eso 🤓","en-GB"), "I don't do that any more 🤓");
assert.equal(translate("Ya no hago eso."), "I don't do that anymore.");
assert.equal(translate("Ya no hago eso, pero mi amigo sí"), undefined);
assert.equal(translate("Ya no hago eso 🤓","en-US","academic"), undefined);
assert.equal(api.matchesPhraseCandidate("ya no hago eso","ya no hago eso"),true);
assert.equal(api.matchesPhraseCandidate("no hago eso","ya no hago eso"),false);
assert.equal(api.matchesPhraseCandidate("ya no hago eso pero mi amigo si","ya no hago eso"),false);
const pos = selector => html.indexOf(selector);
assert.ok(pos('id="translator-input"') < pos('id="translation-result"'));
assert.ok(pos('id="translation-result"') < pos('id="image-quick-actions"'));
assert.ok(pos('id="translation-result"') < pos('class="compact-info translation-export"'));
assert.ok(js.includes("Translation memory returned a different source sentence."));
console.log("Compact translation and exact-meaning regression checks passed.");
