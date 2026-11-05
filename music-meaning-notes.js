/* Context for expressions in captured songs. Explanations are editorial,
   sourced when possible, and NEVER replace the original song lyrics.
   No new lyrics are downloaded, generated or stored by this feature. */
(function(root){
"use strict";
const entries=[
  {
    id:"tin-marin",aliases:["de tin marín de dos pingüé","de tin marin de do pingue","tin marín de dos pingüé"],
    term:"De tin marín de dos pingüé",kind:"Traditional choosing rhyme",
    literal:"The syllables do not form a reliable literal sentence.",
    natural:"Eeny, meeny, miny, moe.",
    why:"A rhythmic rhyme used to choose a person or option by chance. In a song, it can suggest playful indecision rather than a factual statement.",
    scope:"Documented as a children's choosing rhyme in Mexico and Ecuador. Not uniquely Ecuadorian.",
    usage:"No sé cuál escoger. ¡Dejémoslo a la suerte!",
    english:"I don't know which one to choose. Let's leave it to chance!",
    status:"Documented cultural parallel; song interpretation still depends on context.",
    sources:[
      {label:"Academic study of Mexican choosing rhymes",url:"https://colsan.repositorioinstitucional.mx/jspui/bitstream/1013/806/1/De%20tin%20mar%C3%ADn%20de%20do%20pingu%C3%A9.pdf"},
      {label:"Ecuadorian cultural usage (Universidad Andina contributor)",url:"https://dialoguemos.ec/2023/03/la-trampa-mafiosa-del-de-tin-marin-de-dos-pingue/"}
    ]
  },
  {
    id:"cucara-macara",aliases:["cúcara mácara títere fue","cucara macara titere fue","cucaramacará","cúcara mácara"],
    term:"Cúcara, mácara, títere fue",kind:"Rhythmic rhyme",
    literal:"The sounds primarily serve rhythm; translating the individual syllables literally would be misleading.",
    natural:"Part of an “eeny, meeny, miny, moe” choosing rhyme.",
    why:"This is part of a traditional selection chant. Its purpose is to count out or choose, not to describe an actual puppet or event.",
    scope:"Documented in Spanish-speaking children's rhymes; the exact wording varies by place.",
    usage:"¡Hagamos un sorteo! / ¡Dejémoslo a la suerte!",
    english:"Let's draw lots! / Let's leave it to chance!",
    status:"Traditional rhyme documented; exact song adaptation is interpretive.",
    sources:[{label:"Puerto Rico children's play guidance, p. 21",url:"https://cptspr.org/wp-content/uploads/2025/05/2022-guia-juega-diviertete-y-aprende.pdf"}]
  },
  {
    id:"tikiri-song",aliases:["tikiri marikiri","tikiri marikiri de dos"],
    term:"Tikiri / marikiri",kind:"Song-specific wordplay",
    literal:"No supported dictionary translation for these sung sounds.",
    natural:"Playful rhythmic sounds; keep them in Spanish and explain the rhyme around them.",
    why:"The singer's sound play resembles the rhythm of a choosing rhyme. It is not evidence that Tikiri is a standard Ecuadorian, Mexican, or Puerto Rican word.",
    scope:"Song-specific interpretation, not a verified regional dictionary meaning.",
    usage:"No sé qué elegir. ¡Dejémoslo a la suerte!",
    english:"I can't choose. Let's leave it to chance!",
    status:"Provisional interpretation; verify against the original audio.",
    sources:[]
  },
  {
    id:"ni-me-quita",aliases:["ni me quita ni me da","ni me quita, ni me da","que ni me quita ni me da"],
    term:"Ni me quita ni me da",kind:"Figurative expression",
    literal:"It neither takes anything from me nor gives me anything.",
    natural:"It makes no difference to me.",
    why:"The speaker is indifferent to the outcome. The phrase uses giving and taking to express lack of personal impact.",
    scope:"General Spanish-language interpretation. Do not infer a country or city from this expression alone.",
    usage:"Si vamos hoy o mañana, ni me quita ni me da.",
    english:"Whether we go today or tomorrow makes no difference to me.",
    status:"Editorial explanation; check surrounding lines for tone.",
    sources:[]
  },
  {
    id:"camino",aliases:["me pusiera en tu camino","pusiera en tu camino","ponerte en mi camino"],
    term:"Poner a alguien en tu camino",kind:"Metaphor",
    literal:"Put someone on your path.",
    natural:"Bring someone into your life; help your paths cross.",
    why:"The road is a metaphor for life. It expresses hoping to meet or encounter someone, not necessarily walking down a physical road.",
    scope:"General metaphor; Venezuelan song source does not establish a city-specific usage.",
    usage:"Qué bonito que la vida te haya puesto en mi camino.",
    english:"I'm glad life brought you into my life.",
    status:"Contextual editorial explanation; not a regional exclusivity claim.",
    sources:[]
  },
  {
    id:"corazon-helado",aliases:["corazón frío, helado","corazon frio helado","el corazón frío","corazon helado"],
    term:"El corazón helado",kind:"Metaphor",
    literal:"An ice-cold heart.",
    natural:"Feeling emotionally cold or hurt.",
    why:"Coldness expresses emotional distance, pain, or numbness. The comparison's intended emotion should be checked against the surrounding verse.",
    scope:"Poetic usage, not proof of a specific Venezuelan dialect or city.",
    usage:"Después de esa despedida, me quedé con el corazón helado.",
    english:"After that goodbye, I felt emotionally numb.",
    status:"Poetic interpretation, not a literal event.",
    sources:[]
  },
  {
    id:"patita",aliases:["la patita","patita principal"],term:"Patita",kind:"Diminutive",
    literal:"A little leg or paw.",
    natural:"The little leg (of an animal).",
    why:"The -ita ending makes pata diminutive. A person usually has a pierna; patita fits the playful animal imagery in this traditional song.",
    scope:"General Spanish grammar; this is not an Ecuador-only expression.",
    usage:"El perrito tiene una patita lastimada.",
    english:"The puppy has an injured little leg.",
    status:"Documented Spanish diminutive formation; teaching note.",
    sources:[]
  },
  {
    id:"de-ley",aliases:["de ley"],term:"De ley",kind:"Ecuadorian informal expression",
    literal:"By law (literal words), but that is not the usual casual meaning.",
    natural:"Definitely / for sure / of course.",
    why:"In an informal Ecuadorian response, this expresses strong agreement or certainty. Check the surrounding words before choosing the legal meaning.",
    scope:"Ecuadorian usage in Habla's curated vocabulary; not exclusive to Ecuador.",
    usage:"¿Vienes mañana? ¡De ley!",
    english:"Are you coming tomorrow? Definitely!",
    status:"Curated regional vocabulary; check other regional uses separately.",
    sources:[]
  },
  {
    id:"achachay",aliases:["achachay"],term:"¡Achachay!",kind:"Andean exclamation",
    literal:"No direct word-for-word English equivalent.",
    natural:"Brr! It's cold!",
    why:"An expressive exclamation of feeling cold, often associated with Andean Spanish and Kichwa influence.",
    scope:"Andean / Ecuadorian usage, not proof of a speaker's hometown.",
    usage:"¡Achachay, qué frío hace!",
    english:"Brr, it's freezing!",
    status:"Curated Ecuadorian vocabulary; context matters.",
    sources:[]
  },
  {
    id:"bacan",aliases:["bacán","bacan"],term:"¡Bacán!",kind:"Informal compliment",
    literal:"Not a literal description of an object.",
    natural:"Cool! / Awesome!",
    why:"An informal positive evaluation. The register and familiarity of the people speaking affect tone.",
    scope:"Natural in Ecuador and also used elsewhere in Latin America; not exclusively Ecuadorian.",
    usage:"¡Qué bacán esa canción!",
    english:"That song is awesome!",
    status:"Curated vocabulary; regional specificity needs attention.",
    sources:[]
  }
];
const clean=text=>String(text||"").normalize("NFD")
  .replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu," ").trim();
function detect(source,max=4){
  const value=" "+clean(source)+" ";
  if(value.trim().length<2)return [];
  return entries.map(entry=>{
    const positions=entry.aliases.map(alias=>value.indexOf(" "+clean(alias)+" "))
      .filter(pos=>pos>=0);
    return {...entry,position:positions.length?Math.min(...positions):-1};
  }).filter(entry=>entry.position>=0)
    .sort((a,b)=>a.position-b.position||b.term.length-a.term.length)
    .slice(0,max);
}
function el(tag,cls,text){
  const item=document.createElement(tag);
  if(cls)item.className=cls;
  if(text!==undefined)item.textContent=text;
  return item;
}
function paragraph(label,value,cls=""){
  const p=el("p",cls);
  p.append(el("strong","",label+" "),document.createTextNode(value));
  return p;
}
function explanation(entry){
  const card=el("article","music-meaning-entry");
  card.append(el("h4","",entry.term),
    el("p","music-meaning-type",entry.kind+" · "+entry.status),
    paragraph("Natural English / Inglés natural:",entry.natural),
    paragraph("Literal / Literal:",entry.literal),
    paragraph("Why / Por qué:",entry.why),
    paragraph("Region / Región:",entry.scope),
    paragraph("Use it / Úsalo:",entry.usage),
    paragraph("English example / Ejemplo:",entry.english));
  if(entry.sources.length){
    const sources=el("p","music-meaning-sources");
    sources.append(document.createTextNode("References / Fuentes: "));
    for(const [index,source] of entry.sources.entries()){
      if(index)sources.append(document.createTextNode(" · "));
      const link=el("a","",source.label);
      link.href=source.url;link.target="_blank";link.rel="noopener noreferrer";
      sources.append(link);
    }
    card.append(sources);
  } else card.append(el("p","music-meaning-uncertain","Editorial note. No independent source supplied for this exact phrase; don't assume a specific country or city."));
  return card;
}
const instances=new Map();
function add(container,key,reader){
  if(!container)return;
  // Some lesson cards are recreated when the interface language changes.
  // Never retain a detached <details> or multiply controls.
  if(instances.has(key)){
    if(instances.get(key).details.parentElement===container){refresh(key);return;}
    instances.delete(key);
  }
  const details=el("details","music-meaning-details");
  details.dataset.meaningScope=key;
  const summary=el("summary","","🧐 ¿Por qué significa eso? / Why does it mean that?");
  const content=el("div","music-meaning-body");
  details.append(summary,content);container.append(details);
  instances.set(key,{details,summary,content,reader,signature:null});
  details.addEventListener("toggle",()=>{if(details.open)refresh(key,true);});
  refresh(key);
}
function refresh(key,force=false){
  const instance=instances.get(key);
  if(!instance)return;
  const {source="",draft=""}=instance.reader()||{};
  const signature=JSON.stringify([source,draft]);
  instance.details.hidden=!String(source).trim();
  if(instance.details.hidden){instance.details.open=false;return;}
  const found=detect(source);
  instance.summary.textContent="🧐 ¿Por qué significa eso? / Why does it mean that?"+(found.length?" · "+found.length:"");
  if(!force&&instance.signature===signature)return;
  instance.signature=signature;
  // Avoid re-rendering on every interim music sample: only draw the explanations
  // once the user opens the compact accordion. Existing draft stays untouched.
  if(!instance.details.open)return;
  instance.content.replaceChildren();
  if(!found.length){
    instance.content.append(el("p","music-meaning-uncertain",
      "No reviewed idiom or metaphor matches this passage yet. Verify the captured words; Habla will not invent a cultural meaning or a singer's region."));
    return;
  }
  for(const item of found)instance.content.append(explanation(item));
  instance.content.append(el("p","music-meaning-disclaimer",
    "These are explanations of short expressions, not a transcription or translation of the full song. Check incomplete lyrics against the recording."));
}
function bind(){
  const live=document.getElementById("music-live-preview");
  add(live,"live",()=>({source:document.getElementById("music-live-source")?.textContent||"",
    draft:document.getElementById("music-live-draft")?.value||""}));
  const review=document.getElementById("music-review");
  add(review,"review",()=>({source:document.getElementById("music-review-source")?.value||"",
    draft:document.getElementById("music-review-draft")?.value||""}));
  document.getElementById("music-review-source")?.addEventListener("input",()=>refresh("review"));
  document.getElementById("music-review-draft")?.addEventListener("input",()=>refresh("review"));
}
function mount(host,config){
  if(!host)return;
  const key=config?.key;
  if(typeof key!=="string"||!key)return;
  add(host,key,()=>({source:config.source||"",draft:config.draft||""}));
}
root.HablaMusicMeaning={detect,bind,refresh,mount};
if(typeof module!=="undefined"&&module.exports)module.exports=root.HablaMusicMeaning;
})(typeof window!=="undefined"?window:globalThis);
