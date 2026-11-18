const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const lab=require("../english-voice-lab.js");

test("six distinct, correctly flagged locales are represented without inventing voices",()=>{
  assert.deepEqual(lab.COUNTRIES.map(item=>item.locale),
    ["en-US","en-GB","en-CA","en-AU","en-NZ","en-IE"]);
  for(const country of lab.COUNTRIES)assert.match(country.label,/[\u{1F1E6}-\u{1F1FF}]{2}/u);
  const american={lang:"en-US",name:"Samantha",localService:true};
  const irish={lang:"en-IE",name:"Moira",localService:true};
  const pair=[american,irish];
  assert.equal(lab.exactVoice(pair,"en-US"),american);
  assert.equal(lab.exactVoice(pair,"en-IE"),irish);
  assert.equal(lab.exactVoice(pair,"en-AU"),null,
    "A missing Australian voice must not silently fall back to American or Irish");
});

test("automated conversation alternates two voices with distinct lines and no user repetition",()=>{
  const a={lang:"en-CA",name:"Canadian"},
        b={lang:"en-NZ",name:"New Zealand"};
  for(const scene of lab.SCENES){
    assert.equal(scene.turns.length,4);
    const turns=lab.turnsFor(scene,"en-CA","en-NZ",a,b);
    assert.deepEqual(turns.map(t=>t.speaker),["A","B","A","B"]);
    assert.deepEqual(turns.map(t=>t.locale),["en-CA","en-NZ","en-CA","en-NZ"]);
    assert.equal(turns[0].voice,a);
    assert.equal(turns[1].voice,b);
    assert.deepEqual(turns.map(t=>t.text),scene.turns);
    assert.notEqual(scene.turns[0],scene.turns[1],
      "This must be a dialogue, not one voice parroting another");
  }
});

test("both app screens expose hands-free dialogue, not a microphone repeat drill",()=>{
  for(const path of ["index.html","translator.html"]){
    const html=fs.readFileSync(path,"utf8");
    const start=html.indexOf('<details id="english-voice-lab"');
    const end=html.indexOf('<div id="lesson-content"',start);
    assert.ok(start>=0&&end>start,path+": missing voice dialogue");
    const fragment=html.slice(start,end);
    for(const id of ["voice-lab-left","voice-lab-right","voice-lab-scene",
                      "voice-lab-play-exchange","voice-lab-swap","voice-lab-stop",
                      "voice-lab-transcript"])assert.ok(fragment.includes('id="'+id+'"'),path+": missing "+id);
    for(const item of lab.COUNTRIES)
      assert.ok(fragment.includes('value="'+item.locale+'"'),path+": missing "+item.locale);
    assert.doesNotMatch(fragment,/data-practice-text|voice-lab-mic|Hold to speak|Tap to speak/i);
    assert.ok(html.includes("english-voice-lab.js?v=237"),path+": missing cache-busted script");
    assert.ok(html.includes("app.js?v=238"),path+": missing updated app");
  }
});

test("voice exchange keeps exact locale voice and release wiring",()=>{
  const app=fs.readFileSync("app.js","utf8"),
        sw=fs.readFileSync("sw.js","utf8"),
        release=JSON.parse(fs.readFileSync("app-version.json","utf8"));
  assert.match(app,/const voice = passage\.voice \|\| \(ENGLISH_PRACTICE_PREVIEW\.has\(passage\.lang\)/);
  assert.match(app,/passage\.requireExactVoice/);
  assert.match(app,/speak:passages => say\(passages\)/);
  assert.match(sw,/english-voice-lab\.js\?v=237/);
  assert.match(sw,/habla-ecuador-v238/);
  assert.equal(release.build,238);
  assert.equal(release.version,"0.27.28");
  assert.doesNotMatch(fs.readFileSync("english-voice-lab.js","utf8"),/SpeechRecognition|mediaDevices\.getUserMedia|new Audio\(/);
});
