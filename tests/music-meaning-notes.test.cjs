const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const meanings=require("../music-meaning-notes.js");

test("traditional choosing rhyme explains natural meaning, not nonsensical syllables",()=>{
  const matches=meanings.detect("De tin marín de dos pingüé, cúcara mácara, títere fue.");
  assert.equal(matches[0].id,"tin-marin");
  assert.equal(matches[0].natural,"Eeny, meeny, miny, moe.");
  assert.ok(matches.some(entry=>entry.id==="cucara-macara"));
  assert.ok(matches[0].sources.some(src=>src.url.includes("dialoguemos.ec")),
    "Ecuadorian use must have evidence, not an invented region");
});
test("song-specific play sounds have uncertainty label, not invented dictionary status",()=>{
  const [match]=meanings.detect("Tikiri marikiri de dos tingüé");
  assert.equal(match.id,"tikiri-song");
  assert.match(match.status,/Provisional/);
  assert.match(match.scope,/not a verified regional dictionary/);
});
test("music interpretation never tags Venezuelan lyrics as Caracas",()=>{
  const matches=meanings.detect("Siempre le pedí a Dios que me pusiera en tu camino");
  assert.equal(matches[0].id,"camino");
  assert.match(matches[0].scope,/not establish a city/);
});
test("normalization handles capitalization, accents and punctuation without arbitrary substring matches",()=>{
  assert.equal(meanings.detect("BACÁN!")[0].id,"bacan");
  assert.equal(meanings.detect("¡ACHACHAY!")[0].id,"achachay");
  assert.equal(meanings.detect("extraordinary bacanas").length,0,
    "do not label partial word matches as verified idioms");
  assert.deepEqual(meanings.detect("Unclear, fragmented caption #####"),[]);
});
test("reviews and direct music source show only compact disclosure until expanded",()=>{
  const before=global.document;
  class Node {
    constructor(tag,id=""){
      this.tag=tag;this.id=id;this.children=[];this.dataset={};this.handlers={};
      this.parentElement=null;this.hidden=false;this.open=false;this.textContent="";
      this.value="";this.className="";this.attrs={};
    }
    append(...children){for(const child of children){this.children.push(child);child.parentElement=this;}}
    replaceChildren(...children){this.children=[];this.append(...children);}
    addEventListener(type,fn){this.handlers[type]=fn;}
    setAttribute(key,value){this.attrs[key]=value;}
    getAttribute(key){return this.attrs[key];}
  }
  const ids=new Map();
  const add=id=>{const n=new Node("section",id);ids.set(id,n);return n;};
  const live=add("music-live-preview"),review=add("music-review"),
    liveSource=add("music-live-source"),liveDraft=add("music-live-draft"),
    reviewSource=add("music-review-source"),reviewDraft=add("music-review-draft"),
    result=add("translation-result"),translatorInput=add("translator-input");
  liveSource.textContent="";
  reviewSource.value="";
  global.document={
    getElementById:id=>ids.get(id)||null,
    createElement:tag=>new Node(tag),
    createTextNode:value=>{const n=new Node("#text");n.textContent=value;return n;}
  };
  try{
    meanings.bind();
    assert.equal(live.children.length,1);
    assert.equal(review.children.length,1);
    assert.equal(result.children.length,1);
    const liveDetails=live.children[0];
    assert.equal(liveDetails.tag,"details");
    assert.equal(liveDetails.hidden,true,"no initial music words means no idle visual clutter");
    liveSource.textContent="De tin marín de dos pingüé";
    meanings.refresh("live");
    assert.equal(liveDetails.hidden,false);
    assert.match(liveDetails.children[0].textContent,/¿Por qué significa eso?/);
    assert.equal(liveDetails.children[1].children.length,0,"closed accordion is lazy");
    liveDetails.open=true;
    liveDetails.handlers.toggle();
    assert.equal(liveDetails.children[1].children[0].tag,"article");
    const first=liveDetails.children[1].children[0];
    assert.ok(first.children.some(n=>n.textContent==="De tin marín de dos pingüé"));
    assert.ok(first.children.some(n=>n.className==="music-meaning-sources"));
    meanings.refresh("live");
    assert.equal(live.children.length,1,"updates never create duplicate controls");
    reviewSource.value="Unclear text with no verified idiom.";
    meanings.refresh("review");
    const reviewDetails=review.children[0];
    reviewDetails.open=true;
    reviewDetails.handlers.toggle();
    assert.match(reviewDetails.children[1].children[0].textContent,/No reviewed idiom/);
    const songHost=new Node("article");
    meanings.mount(songHost,{key:"my-song-test",source:"La patita principal",draft:"Little leg"});
    assert.equal(songHost.children.length,1);
    meanings.mount(songHost,{key:"my-song-test",source:"La patita principal"});
    assert.equal(songHost.children.length,1);
    const rerendered=new Node("article");
    meanings.mount(rerendered,{key:"my-song-test",source:"La patita principal"});
    assert.equal(rerendered.children.length,1,"detached lesson card can be recreated");
    meanings.showFull("De tin marín de dos pingüé","Eeny, meeny, miny, moe");
    assert.equal(result.children[0].hidden,false,"completed whole-song drafts have the same explanation");
    const fullDetails=result.children[0];
    fullDetails.open=true;
    fullDetails.handlers.toggle();
    assert.equal(fullDetails.children[1].children[0].tag,"article");
    meanings.clearFull();
    assert.equal(fullDetails.hidden,true,"normal translator mode does not inherit song notes");
  }finally{global.document=before;}
});
test("songs across all existing surfaces are wired without changing player controls or transcript",()=>{
  const html=fs.readFileSync("index.html","utf8");
  const standalone=fs.readFileSync("translator.html","utf8");
  const sw=fs.readFileSync("sw.js","utf8");
  const app=fs.readFileSync("app.js","utf8");
  const venezuela=fs.readFileSync("music-venezuela-captions.js","utf8");
  const traditional=fs.readFileSync("music-song.js","utf8");
  const css=fs.readFileSync("styles.css","utf8");
  for(const file of [html,standalone,sw]) assert.match(file,/music-meaning-notes\.js\?v=201/);
  assert.match(app,/HablaMusicMeaning\.bind\(\)/);
  assert.match(app,/const players = \$\$\("#music-view audio"\)/,"retain all music player events");
  assert.match(app,/HablaMusicMeaning\?\.showFull\(request\.source/);
  assert.match(app,/HablaMusicMeaning\?\.clearFull\(\)/);
  assert.match(app,/HablaMusicMeaning\?\.refresh\("live"\)/);
  assert.match(app,/HablaMusicMeaning\?\.refresh\("review"\)/);
  assert.match(app,/HablaMusicMeaning\.mount\(companion/);
  assert.match(venezuela,/HablaMusicMeaning\?\.mount\(section/);
  assert.match(traditional,/HablaMusicMeaning\?\.mount\(host\.querySelector\('\.song-lyrics'\)/);
  assert.match(css,/\.music-meaning-details\[hidden\]/);
});
