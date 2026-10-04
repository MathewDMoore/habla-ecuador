const phrases = [
  { en:"How are you?", us:"How are you? / How's it going?", uk:"How are you? / You alright?", es:"¿Cómo estás?", natural:"¿Cómo estás? / ¿Qué tal?", note:"Both sound natural in Ecuador. ¿Qué tal? is relaxed and conversational.", register:"Friendly · everyday", keys:["como estas","que tal"] },
  { en:"Maybe another time.", es:"Tal vez en otra ocasión.", natural:"Quizás otro día.", note:"Quizás otro día is the warmer everyday option when declining without sounding final.", register:"Friendly · neutral Ecuador", keys:["tal vez otra vez","talvez un otra vez","quizas otro dia"] },
  { en:"What happened?", us:"What happened? / What's going on?", uk:"What happened? / What's going on?", es:"¿Qué pasó?", natural:"¿Qué pasó? / ¿Qué fue?", note:"¿Qué pasó? works everywhere. ¿Qué fue? is much more informal and depends on the relationship.", register:"Everyday · informal alternative", keys:["que paso","que fue"] },
  { en:"I don't understand.", es:"No entiendo.", natural:"Disculpa, no entendí bien.", note:"The natural version softens the interruption: Sorry, I didn't quite understand.", register:"Polite · everyday", keys:["no entiendo","no entendi bien"] },
  { en:"Can you say it more slowly?", us:"Could you say that more slowly, please?", uk:"Could you say that again more slowly, please?", es:"¿Puedes decirlo más despacio?", natural:"¿Me puedes repetir más despacio, por favor?", note:"This asks the person to repeat themselves and sounds courteous in a real conversation.", register:"Polite · everyday", keys:["puedes decirlo mas despacio","repetir mas despacio"] },
  { en:"Nice to meet you.", es:"Mucho gusto.", natural:"Mucho gusto, qué gusto conocerte.", note:"Mucho gusto is the safest everyday choice. The longer version adds warmth.", register:"Warm · neutral Ecuador", keys:["mucho gusto","gusto conocerte"] },
  { en:"Do you want to go fishing with me?", us:"Would you like to go fishing with me?", uk:"Would you like to come fishing with me?", es:"¿Quieres ir a pescar conmigo?", natural:"¿Te gustaría ir a pescar conmigo?", note:"¿Te gustaría…? sounds inviting and gives the other person less pressure.", register:"Warm invitation · neutral", keys:["quieres ir a pescar","gustaria ir a pescar"] },
  { en:"I want to go with you.", es:"Quiero ir contigo.", natural:"Me gustaría ir contigo.", note:"The direct version is correct. Me gustaría… can sound gentler when making a new plan.", register:"Friendly · neutral", keys:["quiero ir contigo","gustaria ir contigo"] },
  { en:"I'm tired.", es:"Estoy cansado.", natural:"Estoy cansado, mejor seguimos mañana.", note:"Use cansado for a man and cansada for a woman. The longer version closes the conversation kindly.", register:"Everyday · neutral", keys:["estoy cansado","estoy cansada"] },
  { en:"I miss you.", es:"Te extraño.", natural:"Te he extrañado.", note:"Te extraño is direct. Te he extrañado can feel warmer: I've missed you.", register:"Personal · warm", keys:["te extrano","te he extranado"] },
  { en:"Do you want to get coffee?", us:"Do you want to get coffee?", uk:"Would you like to go for a coffee?", es:"¿Quieres ir a tomar un café?", natural:"¿Te gustaría ir a tomar un cafecito?", note:"Un cafecito adds warmth; it does not necessarily mean the coffee must be small.", register:"Warm invitation · everyday", keys:["quieres ir a tomar un cafe","tomar un cafecito"] },
  { en:"Definitely.", us:"Definitely. / For sure.", uk:"Definitely. / Absolutely.", es:"Definitivamente.", natural:"De ley.", note:"In Ecuador, de ley informally means definitely or of course. It may sound unfamiliar elsewhere.", register:"Distinctly Ecuadorian · informal", keys:["de ley"] },
  { en:"What time does the sun set?", es:"¿A qué hora se pone el sol?", natural:"¿A qué hora se pone el sol?", note:"This is the natural conversational structure. Ocaso is valid but sounds literary in an everyday plan.", register:"Everyday · neutral Ecuador", keys:["a que hora se pone el sol","puesta del sol","ocaso"] },
  { en:"Let's watch the sunset.", es:"Veamos la puesta del sol.", natural:"Vamos a ver el atardecer.", note:"Atardecer works naturally as a noun here. Puesta del sol is also correct; puesta solar is less conversational.", register:"Everyday plan · neutral Ecuador", keys:["vamos a ver el atardecer","puesta del sol"] },
  { en:"I want to watch the sunrise.", es:"Quiero ver la salida del sol.", natural:"Quiero ver salir el sol.", note:"The natural version uses the action ver salir el sol. Orto is technical or literary, not an everyday choice.", register:"Everyday · neutral Ecuador", keys:["quiero ver salir el sol","salida del sol","amanecer"] },
  { en:"That's cool!", us:"That's cool! / That's great!", uk:"That's brilliant! / That's great!", es:"¡Qué genial!", natural:"¡Qué bacán!", note:"In Ecuador, bacán informally means cool, great, or excellent. It is Ecuador-natural rather than uniquely Ecuadorian.", register:"Ecuador-natural · informal · positive", keys:["que bacan","bacan"] },
  { en:"Oh no, that's disappointing.", us:"Oh no, that's disappointing.", uk:"Oh no, that's a shame.", es:"Vaya, qué decepción.", natural:"Chuta, qué pena.", note:"Chuta can express surprise, annoyance, sympathy, or disappointment in Ecuador. Tone determines the feeling.", register:"Ecuadorian · informal · mild", keys:["chuta que pena","chuta"] },
  { en:"It's so cold!", uk:"It's absolutely freezing!", es:"¡Qué frío hace!", natural:"¡Achachay, qué frío!", note:"Achachay is a Kichwa-influenced exclamation associated with feeling cold, especially in Andean settings.", register:"Ecuadorian/Andean · expressive", keys:["achachay que frio","achachay"] },
  { en:"My brother is coming.", es:"Mi hermano viene.", natural:"Mi ñaño viene.", note:"Ñaño and ñaña are informal, often affectionate words for a brother or sister in Ecuador. In Panama, ñaño can carry a derogatory meaning.", register:"Ecuadorian · familiar · regional warning", keys:["mi nano viene","mi ñaño viene","nano","ñaño","ñaña"] },
  { en:"The baby is sleeping.", es:"El bebé está durmiendo.", natural:"La guagua está durmiendo.", note:"In Ecuador, guagua can mean a baby or young child. In several Caribbean countries, it commonly means a bus.", register:"Ecuadorian/Andean · familiar", keys:["la guagua esta durmiendo","guagua"] },
  { en:"Can you add a little extra?", es:"¿Puede agregar un poco más?", natural:"¿Me da la yapa, por favor?", note:"At a market, la yapa is a small extra amount or gift a seller adds to a purchase.", register:"Ecuadorian/Andean · market language", keys:["me da la yapa","la yapa","yapa"] },
  { en:"Bring a jacket.", us:"Bring a jacket.", uk:"Bring a jumper or jacket.", es:"Lleva una chaqueta.", natural:"Lleva una chompa.", note:"Chompa is normal in Ecuador for a warm upper garment; the English match can be jacket, sweater, or jumper.", register:"Ecuador-natural · clothing", keys:["lleva una chompa","trae una chompa","chompa"] },
  { en:"He's my close friend.", us:"He's a close friend of mine.", uk:"He's a close mate of mine.", es:"Es un amigo cercano.", natural:"Es mi pana.", note:"In Ecuador, pana means a close friend or inseparable companion, not merely any acquaintance.", register:"Ecuador-natural · affectionate", keys:["es mi pana","mi pana","pana"] },
  { en:"I'm completely worn out.", us:"I'm completely wiped out.", uk:"I'm completely shattered.", es:"Estoy completamente agotado.", natural:"Estoy hecho funda.", note:"Hecho funda can describe someone exhausted, battered, emotionally low, or very drunk. Context determines the meaning.", register:"Ecuadorian · very informal · context warning", keys:["estoy hecho funda","estoy hecha funda","hecho funda"] },
  { en:"I'm so fucking tired!", us:"I'm so fucking tired!", uk:"I'm so fucking tired!", es:"Estoy jodidamente cansado.", natural:"¡Estoy hecho mierda!", note:"The strong vulgar option preserves the force more naturally than a word-for-word translation. A less vulgar Ecuadorian colloquial candidate is Estoy hecho funda; a neutral emphatic option is Estoy cansadísimo. Regional and native-speaker review is still required.", register:"Strong vulgarity · adult language · review candidate", verificationLabel:"Ecuadorian usage candidate · native review pending", keys:["im so fucking tired","i am so fucking tired","estoy hecho mierda","estoy jodidamente cansado"] },
  { en:"They gave him a nickname.", es:"Le pusieron un apodo.", natural:"Le pusieron una chapa.", note:"Chapa can mean a nickname in Ecuador, often humorous. It can feel teasing or unkind depending on the relationship.", register:"Ecuadorian · informal · teasing possible", keys:["le pusieron una chapa","una chapa","chapa"] },
  { en:"They fired him.", us:"They fired him.", uk:"They sacked him.", es:"Lo despidieron.", natural:"Lo cancelaron del trabajo.", note:"Ecuador also uses cancelar for dismissing an employee. Lo despidieron is safest across countries.", register:"Ecuadorian sense · employment", keys:["lo cancelaron del trabajo","lo cancelaron"] },
  { en:"Where is your workplace?", us:"Where is your workplace? / Where do you work?", uk:"Where is your workplace? / Where do you work?", es:"¿Dónde está tu trabajo?", natural:"¿Dónde queda tu camello?", spanish:"¿Dónde queda tu camello?", standardEs:"¿Dónde está tu trabajo?", literalUs:"Where are you, camel?", literalUk:"Where are you, camel?", note:"The typed form ¿Dónde estás tú, camello? literally addresses someone as ‘camel.’ If you mean the Ecuadorian slang for a job or workplace, use ¿Dónde queda tu camello? Possessive tu means ‘your’ and has no accent.", register:"Informal · context-sensitive", warning:"The verb, accent, and punctuation change the meaning.", culturalEntry:true, keys:["donde queda tu camello","donde esta tu camello","donde estas tu camello"] },
  { en:"I go back to work on the 21st. Can we do something on the 20th?", es:"Regreso a trabajar el 21. ¿Podemos hacer algo el 20?", natural:"Regreso a trabajar el 21. ¿Te gustaría que hiciéramos algo el 20?", note:"This sounds natural, warm, and neutral in Ecuador. ¿Te gustaría que hiciéramos…? makes the invitation gentler.", register:"Warm invitation · neutral Ecuador", keys:["vuelvo al trabajo el 21 podemos hacer algo el 20","regreso a trabajar el 21"] },
  { en:"I was cleared to go back to work today with no limitations, but I convinced the doctor to give me another week to recover.", es:"Hoy me autorizaron a volver al trabajo sin restricciones, pero convencí al doctor de que me diera una semana más para recuperarme.", natural:"Hoy me dieron el alta para volver al trabajo sin restricciones, pero convencí al doctor de que me diera una semana más para recuperarme.", note:"Me dieron el alta is natural for medical clearance. Para recuperarme sounds more idiomatic than a literal translation of healing time.", register:"Medical/work · neutral Ecuador", keys:["hoy me dieron el alta","me autorizaron a volver al trabajo"] },
];

const APP_VERSION = "0.21.0 · build 47";

const TRANSLATOR_LANGUAGES = {
  "en-US": {label:"U.S. English", family:"en", voice:"en-US"},
  "en-GB": {label:"U.K. English", family:"en", voice:"en-GB"},
  "es-EC": {label:"Ecuadorian Spanish", family:"es", voice:"es-EC"},
  "es-BO": {label:"Bolivian Spanish", family:"es", voice:"es-BO"}
};

const culturalExpressions = [
  {category:"idiom", spanish:"De ley.", us:"Definitely. / For sure.", uk:"Definitely. / Absolutely.", note:"A very common informal Ecuadorian way to agree strongly or say something is certain.", naturalness:"Sounds natural in Ecuador", register:"Informal · positive"},
  {category:"idiom", spanish:"Estoy hecho funda.", us:"I'm completely wiped out.", uk:"I'm completely shattered.", note:"A vivid Ecuadorian expression for being exhausted, battered, emotionally low, or very drunk. Context matters.", naturalness:"Sounds natural in Ecuador", register:"Very informal · context-sensitive"},
  {category:"slang", spanish:"¡Qué bacán!", us:"That's cool! / That's great!", uk:"That's brilliant! / That's great!", note:"Bacán is widely understood, but it is especially comfortable and natural in everyday Ecuadorian speech.", naturalness:"Sounds natural in Ecuador", register:"Informal · enthusiastic"},
  {category:"slang", spanish:"Chuta, qué pena.", us:"Oh no, that's disappointing.", uk:"Oh no, that's a shame.", note:"Chuta can show surprise, frustration, sympathy, or disappointment. The speaker's tone supplies much of the meaning.", naturalness:"Ecuador meanings attested by ASALE", verification:"Source-attested", register:"Informal · mild exclamation", intensity:"Mild", source:{name:"ASALE · Diccionario de americanismos",url:"https://www.asale.org/damer/%C2%A1chuta%21"}},
  {category:"slang", spanish:"acolitar", us:"to help / support / back someone up", uk:"to help / support / back someone up", exampleEs:"¿Me acolitas con esto?", exampleUs:"Can you help me with this?", exampleUk:"Can you give me a hand with this?", note:"In Ecuador, acolitar can mean supporting someone, helping with an activity, or backing up an idea.", naturalness:"Ecuador meaning attested by ASALE", verification:"Source-attested", register:"Informal · friendly · not vulgar", intensity:"Mild", comparisons:["Colombia: ASALE records the same support or solidarity sense."], source:{name:"ASALE · Diccionario de americanismos",url:"https://www.asale.org/damer/acolitar"}},
  {category:"slang", spanish:"camello", literalUs:"camel", literalUk:"camel", standardEs:"trabajo / empleo / lugar de trabajo", us:"work / job / workplace", uk:"work / job / workplace", exampleEs:"Ya me voy al camello.", exampleUs:"I'm heading to work now.", exampleUk:"I'm off to work now.", note:"The ordinary literal meaning is camel. In Ecuadorian slang, camello can instead refer to work, a job, or the place where someone works. The surrounding sentence determines the meaning.", naturalness:"Ecuador slang meaning attested by ASALE", verification:"Source-attested", register:"Popular · informal · not vulgar", intensity:"Mild", warning:"Do not translate camello as work unless the context clearly concerns employment or somebody's livelihood.", comparisons:["Mexico: the work or job sense is also recorded.","Bolivia: ASALE records a shoemaking tool sense instead, so context matters."], literalSource:{name:"RAE · Diccionario de la lengua española",url:"https://dle.rae.es/camello"}, source:{name:"ASALE · Diccionario de americanismos",url:"https://www.asale.org/damer/camello"}},
  {category:"slang", spanish:"chiro / chira", us:"broke / out of money", uk:"broke / out of money", exampleEs:"Estoy chiro hasta fin de mes.", exampleUs:"I'm broke until the end of the month.", exampleUk:"I'm broke until the end of the month.", note:"In Ecuador, chiro or chira describes someone who has no money. It can be matter-of-fact or lightly self-deprecating.", naturalness:"Ecuador meaning attested by ASALE", verification:"Source-attested", register:"Popular · informal · not vulgar", intensity:"Mild", warning:"Do not assume the same meaning across countries.", comparisons:["Mexico: ASALE records chiro as pretty, cute, or very good—not broke."], source:{name:"ASALE · Diccionario de americanismos",url:"https://www.asale.org/damer/chiro"}},
  {category:"slang", spanish:"aniñado / aniñada", us:"posh / upper-class / bourgeois-styled", uk:"posh / upper-class / bourgeois-styled", exampleEs:"Ese lugar es medio aniñado.", exampleUs:"That place is kind of upscale.", exampleUk:"That place is a bit posh.", note:"In Ecuador, aniñado can describe a person associated with the upper class or something that looks elegant or bourgeois. Tone can make it neutral, teasing, or critical.", naturalness:"Ecuador meaning attested by ASALE", verification:"Source-attested", register:"Youth usage · informal · context-sensitive", intensity:"Mild to pointed", warning:"Use carefully about a person; it can sound socially judgmental.", source:{name:"ASALE · Diccionario de americanismos",url:"https://www.asale.org/damer/ani%C3%B1ado"}},
  {category:"culture", spanish:"¡Achachay, qué frío!", us:"It's so cold!", uk:"It's absolutely freezing!", note:"Achachay is a Kichwa-influenced exclamation associated with feeling cold, especially in Andean settings.", naturalness:"Natural in Ecuador; especially Andean", register:"Expressive · regional"},
  {category:"culture", spanish:"¿Me da la yapa, por favor?", us:"Could you add a little extra, please?", uk:"Could you add a little extra, please?", note:"La yapa is the small extra amount or gift a seller may add at a market.", naturalness:"Sounds natural in Ecuador", register:"Friendly · market language"},
  {category:"culture", spanish:"Mi ñaño viene.", us:"My brother is coming.", uk:"My brother is coming.", note:"Ñaño or ñaña can affectionately mean brother or sister in Ecuador. It does not travel safely to every country.", naturalness:"Sounds natural in Ecuador", register:"Familiar · affectionate"},
  {category:"personal", spanish:"¿Te gustaría que hiciéramos algo el 20?", us:"Would you like us to do something on the 20th?", uk:"Would you like to do something on the 20th?", note:"A warm, low-pressure way to suggest spending time together.", naturalness:"Natural, neutral wording in Ecuador", register:"Warm invitation"},
  {category:"personal", spanish:"¿Te gustaría ir a tomar un cafecito?", us:"Would you like to get coffee?", uk:"Would you like to go for a coffee?", note:"Cafecito adds conversational warmth; it does not require the coffee to be small.", naturalness:"Natural in Ecuador", register:"Warm · everyday"},
  {category:"personal", spanish:"Disculpa, no entendí bien. ¿Me puedes repetir más despacio, por favor?", us:"Sorry, I didn't quite understand. Could you repeat that more slowly, please?", uk:"Sorry, I didn't quite catch that. Could you say it again more slowly, please?", note:"A practical learner phrase that keeps a real conversation moving politely.", naturalness:"Natural, polite wording in Ecuador", register:"Polite · learner-essential"}
];

const musicTraditions = [
  {
    name:"Pasillo",
    region:"National tradition · Coast, Sierra, and urban Ecuador",
    languageFocus:"Love, heartbreak, memory, family, homeland, and poetic emotional language",
    note:"Useful for cultural imagery, formal or poetic vocabulary, and how emotion is expressed. It should not be treated as a direct model of casual modern speech.",
    source:{name:"UNESCO · Pasillo, song and poetry",url:"https://ich.unesco.org/en/RL/pasillo-song-and-poetry-01702"}
  },
  {
    name:"Bomba del Chota",
    region:"Afro-Ecuadorian tradition · Chota-Mira valley and nearby communities",
    languageFocus:"Community history, everyday life, humor, identity, movement, and regional expression",
    note:"Useful for regionally grounded cultural context. Entries must identify the community and region instead of labeling every feature as general Ecuadorian Spanish.",
    source:{name:"Ecuador INPC · La Bomba as intangible heritage",url:"https://www.patrimoniocultural.gob.ec/la-bomba-es-parte-del-patrimonio-cultural-inmaterial-del-ecuador/"}
  },
  {
    name:"Marimba esmeraldeña",
    region:"Afro-Ecuadorian tradition · Esmeraldas",
    languageFocus:"Oral tradition, community identity, storytelling, celebration, and culturally situated vocabulary",
    note:"A valuable listening and culture source. Language observations must remain tied to Esmeraldas and the specific performance context.",
    source:{name:"UNESCO · Ecuador intangible cultural heritage",url:"https://ich.unesco.org/en/state/ecuador-EC?info=elements-on-the-lists"}
  }
];

const contemporaryMusicTracks = [
  {
    title:"Simples Maneras",
    artist:"DUNE",
    region:"Riobamba · wave / synthwave",
    year:"2017",
    note:"Modern Ecuadorian electronic music with an ’80s-inspired synthwave sound. It is instrumental, so use it for musical discovery and rhythm rather than vocabulary evidence.",
    license:"CC BY-NC-SA 4.0",
    licenseUrl:"https://creativecommons.org/licenses/by-nc-sa/4.0/",
    sourceUrl:"https://dunemusic.bandcamp.com/track/simples-maneras",
    audioMp3:"assets/music/dune-simples-maneras.mp3"
  },
  {
    title:"Dar",
    artist:"Huaya-Nay",
    region:"Quito · Andean / Afro-Ecuadorian electronic fusion",
    year:"2019",
    note:"Electronic fusion drawing on Pasto cultural sound and regional forms including bambuco, yumbo, pasillo, and Afro-Ecuadorian elements. It connects living production with regional tradition.",
    license:"CC BY-NC-SA 4.0",
    licenseUrl:"https://creativecommons.org/licenses/by-nc-sa/4.0/",
    sourceUrl:"https://reptilrecords.bandcamp.com/album/para-dar-recibir-ep",
    audioMp3:"assets/music/huaya-nay-dar.mp3"
  }
];

const heritageMusicTracks = [
  {
    title:"Pasillo Sinfónico",
    artist:"Jorge Valverde",
    region:"Ecuador · pasillo-inspired instrumental",
    year:"2010",
    note:"A full instrumental listening example in an Ecuadorian pasillo style. Use it to notice phrasing, pulse, and emotional shape; it contains no lyrics to study.",
    license:"CC BY-SA 3.0",
    licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:PasilloSinfonico3.ogg",
    audioMp3:"https://upload.wikimedia.org/wikipedia/commons/transcoded/2/24/PasilloSinfonico3.ogg/PasilloSinfonico3.ogg.mp3",
    audioOgg:"https://upload.wikimedia.org/wikipedia/commons/2/24/PasilloSinfonico3.ogg"
  },
  {
    title:"Himno de Portoviejo",
    artist:"Dfvm2424",
    region:"Portoviejo, Manabí · civic song",
    year:"2024 recording",
    note:"Actual Ecuadorian civic music for regional and listening context. A civic song is cultural material, not proof that a word is everyday slang.",
    license:"CC0 1.0",
    licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Himno_de_Portoviejo.ogg",
    audioMp3:"https://upload.wikimedia.org/wikipedia/commons/transcoded/3/31/Himno_de_Portoviejo.ogg/Himno_de_Portoviejo.ogg.mp3",
    audioOgg:"https://upload.wikimedia.org/wikipedia/commons/3/31/Himno_de_Portoviejo.ogg"
  },
  {
    title:"Himno de Rocafuerte",
    artist:"Dfvm2424",
    region:"Rocafuerte, Manabí · civic song",
    year:"2024 recording",
    note:"A second openly released regional listening sample. Compare its pace and form with the pasillo track without treating formal song language as ordinary conversation.",
    license:"CC0 1.0",
    licenseUrl:"https://creativecommons.org/publicdomain/zero/1.0/",
    sourceUrl:"https://commons.wikimedia.org/wiki/File:Himno_de_Rocafuerte.ogg",
    audioMp3:"https://upload.wikimedia.org/wikipedia/commons/transcoded/7/7c/Himno_de_Rocafuerte.ogg/Himno_de_Rocafuerte.ogg.mp3",
    audioOgg:"https://upload.wikimedia.org/wikipedia/commons/7/7c/Himno_de_Rocafuerte.ogg"
  }
];

const rhythmDrills = [
  {
    title:"Everyday Ecuador rhythm",
    focus:"Agreement → reaction → feeling",
    lines:[
      {es:"De ley.",en:"Definitely. / For sure.",note:"Informal Ecuadorian agreement; it signals strong certainty."},
      {es:"¡Qué bacán!",en:"How cool! / That’s great!",note:"Bacán means cool or great here; informal and positive."},
      {es:"Chuta, qué pena.",en:"Oh no, what a shame.",note:"Chuta is a mild exclamation of surprise, frustration, or sympathy."},
      {es:"Estoy hecho funda.",en:"I’m completely exhausted.",note:"Hecho funda is an informal Ecuadorian way to say physically or mentally worn out."}
    ],
    note:"An original Habla Ecuador sequence made from independently sourced expressions—not a song lyric. Echo each line, then use it in a new sentence."
  },
  {
    title:"Warm conversation rhythm",
    focus:"Invite → clarify → connect",
    lines:[
      {es:"¿Te gustaría ir?",en:"Would you like to go?",note:"A warm, neutral invitation."},
      {es:"¿Me puedes repetir?",en:"Can you repeat that for me?",note:"A useful polite clarification when you did not catch something."},
      {es:"Mucho gusto.",en:"Nice to meet you.",note:"A standard courteous response when meeting someone."},
      {es:"Nos vemos pronto.",en:"See you soon.",note:"A friendly way to close a conversation while expecting future contact."}
    ],
    note:"Practice connected speech and conversational timing. The goal is a natural response rhythm, not singing accuracy."
  }
];

const $ = (selector, root=document) => root.querySelector(selector);
const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
const normalize = value => value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zñ0-9\s]/g, " ").replace(/\s+/g, " ").trim();

function languageFamily(code) {
  return TRANSLATOR_LANGUAGES[code]?.family || code.split("-")[0];
}

function translatorRoute() {
  const sourceFamily = languageFamily(sourceLanguage);
  const targetFamily = languageFamily(targetLanguage);
  if (sourceFamily === "en" && targetFamily === "es") return "en-ec";
  if (sourceFamily === "es" && targetFamily === "en") return "ec-en";
  if (sourceFamily === "es" && targetFamily === "es") return "regional-es";
  return "regional-en";
}

function languageLabel(code) {
  return TRANSLATOR_LANGUAGES[code]?.label || code;
}

function syncLanguagePair({persist=true}={}) {
  direction = translatorRoute();
  englishVariant = targetLanguage === "en-GB" || (languageFamily(targetLanguage) !== "en" && sourceLanguage === "en-GB") ? "uk" : "us";
  if (persist) localStorage.setItem(TRANSLATOR_PAIR_STORAGE_KEY, JSON.stringify({source:sourceLanguage,target:targetLanguage}));
  const sourceSelect = $("#source-language-select");
  const targetSelect = $("#target-language-select");
  if (sourceSelect) sourceSelect.value = sourceLanguage;
  if (targetSelect) targetSelect.value = targetLanguage;
}

function sourceSpeechLocale() {
  return TRANSLATOR_LANGUAGES[sourceLanguage]?.voice || sourceLanguage;
}

function targetSpeechLocale() {
  return TRANSLATOR_LANGUAGES[targetLanguage]?.voice || targetLanguage;
}

const SPEECH_RATE_STORAGE_KEY = "habla-ecuador-speech-rate-v1";
const TRANSLATION_EDITS_STORAGE_KEY = "habla-ecuador-translation-edits-v1";
const TRANSLATION_PURPOSE_STORAGE_KEY = "habla-ecuador-translation-purpose-v1";
const TRANSLATOR_PAIR_STORAGE_KEY = "habla-ecuador-language-pair-v1";

let savedLanguagePair = (() => {
  try { return JSON.parse(localStorage.getItem(TRANSLATOR_PAIR_STORAGE_KEY) || "{}"); }
  catch { return {}; }
})();
let sourceLanguage = TRANSLATOR_LANGUAGES[savedLanguagePair.source] ? savedLanguagePair.source : "en-US";
let targetLanguage = TRANSLATOR_LANGUAGES[savedLanguagePair.target] ? savedLanguagePair.target : "es-EC";
let direction = TRANSLATOR_LANGUAGES[sourceLanguage].family === "en" && TRANSLATOR_LANGUAGES[targetLanguage].family === "es" ? "en-ec" : "ec-en";
let englishVariant = (targetLanguage === "en-GB" || (TRANSLATOR_LANGUAGES[targetLanguage].family !== "en" && sourceLanguage === "en-GB")) ? "uk" : "us";
let translationPurpose = localStorage.getItem(TRANSLATION_PURPOSE_STORAGE_KEY) === "academic" ? "academic" : "everyday";
let voiceRate = readVoiceRate();
let lessonStep = 1;
let selectedChoice = "";
let turns = [];
let recognition = null;
let evidenceFilter = "all";
let expressionFilter = "all";
let evidenceEntries = [];
let evidenceSources = new Map();
let reviewQueue = new Map();
let comparisonIndex = new Map();
let reviewIndex = 0;
let translationTimer = 0;
let translationRequest = 0;
let lastCompletedTranslation = null;
let activeTranslationEdit = null;
let translationEdits = readTranslationEdits();
let preservedCulturalContext = null;
let speechVoices = [];
let speechRequestId = 0;
const REVIEW_STORAGE_KEY = "habla-ecuador-review-v1";
const VOICE_STORAGE_KEY = "habla-ecuador-voice-preferences-v1";
const SPEAKER_NAMES_STORAGE_KEY = "habla-ecuador-speaker-names-v1";
let voicePreferences = readVoicePreferences();
let speakerNames = readSpeakerNames();

function readSpeakerNames() {
  try {
    return {...{english:"Mathew",spanish:"Maria"}, ...JSON.parse(localStorage.getItem(SPEAKER_NAMES_STORAGE_KEY) || "{}")};
  } catch {
    return {english:"Mathew",spanish:"Maria"};
  }
}

function speakerName(role) {
  const fallback = role === "spanish" ? "Maria" : "Mathew";
  return String(speakerNames[role] || fallback).trim().slice(0,24) || fallback;
}

function saveSpeakerName(role, value) {
  speakerNames[role] = String(value || "").trim().slice(0,24) || (role === "spanish" ? "Maria" : "Mathew");
  localStorage.setItem(SPEAKER_NAMES_STORAGE_KEY, JSON.stringify(speakerNames));
  const label = $('[data-speaker-label="' + role + '"]');
  if (label) label.textContent = speakerNames[role];
  const preset = $('[data-speaker-preset="' + role + '"]');
  if (preset) preset.value = Array.from(preset.options).some(option => option.value === speakerNames[role]) ? speakerNames[role] : "";
}

function syncSpeakerNames() {
  ["english","spanish"].forEach(role => {
    const name = speakerName(role);
    speakerNames[role] = name;
    const input = $('[data-speaker-name="' + role + '"]');
    if (input) input.value = name;
    const preset = $('[data-speaker-preset="' + role + '"]');
    if (preset) preset.value = Array.from(preset.options).some(option => option.value === name) ? name : "";
    const label = $('[data-speaker-label="' + role + '"]');
    if (label) label.textContent = name;
  });
}

function readVoicePreferences() {
  try {
    return {...{es:"auto",en:"auto"}, ...JSON.parse(localStorage.getItem(VOICE_STORAGE_KEY) || "{}")};
  } catch {
    return {es:"auto",en:"auto"};
  }
}

function voiceKey(voice) {
  return `${voice.name}|||${voice.lang}`;
}

function saveVoicePreference(language, value) {
  voicePreferences[language] = value;
  localStorage.setItem(VOICE_STORAGE_KEY, JSON.stringify(voicePreferences));
}

function readVoiceRate() {
  const saved = Number(localStorage.getItem(SPEECH_RATE_STORAGE_KEY));
  return Number.isFinite(saved) && saved >= .55 && saved <= 1.2 ? saved : .95;
}

function speechRateLabel(value) {
  const pace = value <= .65 ? "Very slow" : value <= .85 ? "Slow" : value <= 1 ? "Natural" : "Faster";
  return `${pace} · ${value.toFixed(2)}×`;
}

function setSpeechRate(value) {
  voiceRate = Math.max(.55,Math.min(1.2,Number(value) || .95));
  localStorage.setItem(SPEECH_RATE_STORAGE_KEY,String(voiceRate));
  const output = $("#voice-rate-value");
  if (output) output.textContent = speechRateLabel(voiceRate);
}

function matchPhrase(value, way=direction) {
  const clean = normalize(value);
  if (!clean) return null;
  const phraseMatch = phrases.find(phrase => {
    const candidates = way === "en-ec" ? [phrase.en, phrase.us, phrase.uk] : [phrase.es, phrase.natural, ...(phrase.keys || [])];
    return candidates.filter(Boolean).some(candidate => {
      const normalized = normalize(candidate);
      return normalized === clean || (clean.length > 7 && (normalized.includes(clean) || clean.includes(normalized)));
    });
  });
  if (phraseMatch) return phraseMatch;
  if (way !== "ec-en") return null;
  const culturalMatch = culturalExpressions.find(entry => {
    const spanish = normalize(entry.spanish);
    return spanish === clean || (clean.length >= 4 && spanish.split(" ").includes(clean)) || (clean.length >= 6 && spanish.includes(clean));
  });
  return culturalMatch ? {...culturalMatch, culturalEntry:true} : null;
}

function openView(id) {
  $$(".view").forEach(view => view.classList.toggle("active", view.id === id));
  $$(".bottom-nav button").forEach(button => button.classList.toggle("active", button.dataset.open === id));
  window.scrollTo({top:0, behavior:"smooth"});
  if (id === "lesson-view") renderLesson();
  if (id === "review-view") renderReview();
  if (id === "music-view") renderMusic();
}

function normalizedLocale(value="") {
  return value.replace("_", "-").toLowerCase();
}

const VOICE_NAME_BLOCKLIST = /albert|bad news|bahh|bells|boing|bubbles|cellos|fred|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox/i;
const QUALITY_MARKER = /enhanced|premium|neural|natural/i;
const TRUSTED_DEVICE_VOICES = {
  es:["mónica","monica","paulina","ximena","jorge","diego","luciana"],
  en:["ava","samantha","nathan","daniel","jamie","karen","moira","rishi"]
};

function voiceDisplayName(voice) {
  return voice.name
    .replace(/\bpremium\b/gi,"High quality")
    .replace(/\benhanced\b/gi,"Enhanced");
}

function isCuratedVoice(voice,base) {
  if (normalizedLocale(voice.lang).split("-")[0] !== base || VOICE_NAME_BLOCKLIST.test(voice.name)) return false;
  const name = voice.name.toLowerCase();
  return QUALITY_MARKER.test(name) || (TRUSTED_DEVICE_VOICES[base] || []).some(item => name.includes(item));
}

function voiceQualityScore(voice,requested,base) {
  const locale = normalizedLocale(voice.lang);
  const name = voice.name.toLowerCase();
  const localeOrder = base === "es"
    ? [requested,"es-ec","es-co","es-419","es-mx","es-us","es-es"]
    : requested === "en-gb"
      ? [requested,"en-ie","en-au","en-us"]
      : [requested,"en-us","en-ca","en-gb"];
  const localeIndex = localeOrder.indexOf(locale);
  let score = localeIndex < 0 ? 0 : 80 - (localeIndex * 8);
  if (/premium|neural|natural/i.test(name)) score += 55;
  else if (/enhanced/i.test(name)) score += 40;
  if (voice.localService) score += 12;
  if ((TRUSTED_DEVICE_VOICES[base] || []).some(item => name.includes(item))) score += 18;
  if (VOICE_NAME_BLOCKLIST.test(name)) score -= 500;
  return score;
}

function voiceForLanguage(lang) {
  const requested = normalizedLocale(lang);
  const base = requested.split("-")[0];
  const matching = speechVoices
    .filter(voice => normalizedLocale(voice.lang).split("-")[0] === base)
    .filter(voice => !VOICE_NAME_BLOCKLIST.test(voice.name));
  if (!matching.length) return null;
  const saved = voicePreferences[base];
  if (saved && saved !== "auto") {
    const chosen = matching.find(voice => voiceKey(voice) === saved && isCuratedVoice(voice,base));
    if (chosen) return chosen;
  }
  return [...matching].sort((a,b) => voiceQualityScore(b,requested,base) - voiceQualityScore(a,requested,base))[0];
}

function refreshSpeechVoices() {
  if (!("speechSynthesis" in window)) return [];
  speechVoices = speechSynthesis.getVoices();
  populateVoiceSelectors();
  return speechVoices;
}

function populateVoiceSelectors() {
  const groups = [
    {selector:"#spanish-voice-select",base:"es",automatic:"Best available Latin American Spanish voice"},
    {selector:"#english-voice-select",base:"en",automatic:"Best available voice for the selected English style"}
  ];
  groups.forEach(({selector,base,automatic}) => {
    const select = $(selector);
    if (!select) return;
    const available = speechVoices
      .filter(voice => isCuratedVoice(voice,base))
      .sort((a,b) => voiceQualityScore(b,base === "es" ? "es-EC" : "en-US",base) - voiceQualityScore(a,base === "es" ? "es-EC" : "en-US",base));
    const selected = voicePreferences[base] || "auto";
    select.innerHTML = `<option value="auto">${automatic}</option>` + available.map(voice => {
      const key = voiceKey(voice);
      const locality = voice.localService ? " · on device" : "";
      return `<option value="${escapeHtml(key)}">${escapeHtml(voiceDisplayName(voice))} · ${escapeHtml(voice.lang)}${locality}</option>`;
    }).join("");
    select.value = available.some(voice => voiceKey(voice) === selected) ? selected : "auto";
    if (select.value === "auto" && selected !== "auto") saveVoicePreference(base,"auto");
  });
}

function speechProfile(text, lang="es-EC") {
  const clean = normalize(text);
  const base = normalizedLocale(lang).split("-")[0];
  const profile = {text, rate:voiceRate, pitch:1, volume:1};
  if (base !== "es") return profile;
  // Browser voices cannot create genuine acting. Punctuation and restrained pacing
  // preserve intelligibility without the cartoonish pitch shifts used previously.
  if (clean.includes("chuta que pena")) return {...profile,text:"Chuta… qué pena.",rate:Math.min(voiceRate,.88)};
  if (clean.includes("que bacan")) return {...profile,text:"¡Qué bacán!",rate:Math.min(voiceRate,.94),pitch:1.02};
  if (clean.includes("de ley")) return {...profile,text:"De ley.",rate:Math.min(voiceRate,.92)};
  if (clean.includes("estoy hecho funda")) return {...profile,text:"Estoy hecho funda.",rate:Math.min(voiceRate,.86),pitch:.98};
  if (text.trim().startsWith("¡")) return {...profile,rate:Math.min(voiceRate,.95),pitch:1.02};
  if (text.trim().startsWith("¿")) return {...profile,rate:Math.min(voiceRate,.94)};
  return profile;
}

function say(text, lang="es-EC") {
  if (!text || !("speechSynthesis" in window)) return showToast("Speech playback is unavailable in this browser.");
  const requestId = ++speechRequestId;
  speechSynthesis.cancel();
  const speakWithFreshVoice = (attempt=0) => {
    if (requestId !== speechRequestId) return;
    refreshSpeechVoices();
    if (!speechVoices.length && attempt < 8) {
      setTimeout(() => speakWithFreshVoice(attempt + 1), 125);
      return;
    }
    const target = voiceForLanguage(lang);
    if (!target) {
      const label = normalizedLocale(lang).startsWith("es") ? "Spanish" : "English";
      showToast(`${label} speech is unavailable on this device.`);
      return;
    }
    const profile = speechProfile(text,lang);
    const utterance = new SpeechSynthesisUtterance(profile.text);
    utterance.voice = target;
    utterance.lang = target.lang;
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;
    utterance.onerror = event => {
      if (!["canceled", "interrupted"].includes(event.error)) showToast("That voice could not play. Please try again.");
    };
    document.documentElement.dataset.activeSpeechLanguage = normalizedLocale(target.lang);
    setTimeout(() => {
      if (requestId === speechRequestId) speechSynthesis.speak(utterance);
    }, 160);
  };
  setTimeout(() => speakWithFreshVoice(),160);
}

let activeRecognitionButton = null;

function setListeningButton(button, listening, finishing=false) {
  if (!button) return;
  button.classList.toggle("listening", listening);
  button.setAttribute("aria-pressed", listening ? "true" : "false");
  const hint = button.querySelector("small");
  if (!hint) return;
  if (!button.dataset.idleHint) button.dataset.idleHint = hint.textContent.trim();
  hint.textContent = listening
    ? (finishing ? (button.dataset.finishingHint || "Finishing…") : (button.dataset.activeHint || "Listening… tap to finish"))
    : button.dataset.idleHint;
}

function recognitionErrorMessage(error) {
  if (error === "not-allowed" || error === "service-not-allowed") return "Microphone access is blocked for this page. Allow microphone access, then tap again.";
  if (error === "audio-capture") return "No microphone was available to the browser.";
  if (error === "no-speech") return "No speech was detected. Tap the microphone, start speaking, then tap again when finished.";
  if (error === "network") return "Speech recognition could not reach the free browser service. Please try again.";
  return "Speech recognition stopped unexpectedly. Please tap the microphone and try again.";
}

function startListening({way=direction, lang, button, onText}={}) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return showToast("Live speech recognition is unavailable here. Typing and audio playback still work.");

  if (recognition) {
    if (activeRecognitionButton === button) return stopListening();
    try { recognition.abort(); } catch {}
    recognition = null;
    setListeningButton(activeRecognitionButton, false);
    activeRecognitionButton = null;
  }

  const instance = new Recognition();
  recognition = instance;
  activeRecognitionButton = button || null;
  instance.lang = lang || (way === "en-ec" ? "en-US" : "es-EC");
  instance.interimResults = true;
  instance.continuous = false;
  instance.maxAlternatives = 1;

  instance.onstart = () => setListeningButton(button, true);
  instance.onspeechstart = () => setListeningButton(button, true);
  instance.onresult = event => {
    const text = [...event.results].map(result => result[0].transcript).join(" ").trim();
    if (text) onText?.(text, event.results[event.results.length-1].isFinal);
  };
  instance.onerror = event => {
    if (event.error !== "aborted") showToast(recognitionErrorMessage(event.error));
  };
  instance.onend = () => {
    setListeningButton(button, false);
    if (recognition === instance) recognition = null;
    if (activeRecognitionButton === button) activeRecognitionButton = null;
  };

  try {
    instance.start();
    setListeningButton(button, true);
  } catch {
    setListeningButton(button, false);
    recognition = null;
    activeRecognitionButton = null;
    showToast("The microphone could not start. Please tap it again.");
  }
}

function stopListening() {
  if (!recognition) return;
  setListeningButton(activeRecognitionButton, true, true);
  try { recognition.stop(); } catch {}
}

function bindPushToTalk(button, getOptions) {
  if (!button) return;
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", event => {
    event.preventDefault();
    startListening(getOptions(button));
  });
}

function translatedText(phrase, way=direction) {
  if (way === "en-ec") return phrase.natural;
  return (englishVariant === "uk" ? phrase.uk : phrase.us) || phrase.en;
}

function decodeTranslation(value) {
  const box = document.createElement("textarea");
  box.innerHTML = value || "";
  return box.value;
}

function protectResearchTokens(text) {
  const protectedValues = [];
  const protectedText = text.replace(/https?:\/\/[^\s)\]}]+|\bdoi\s*:\s*10\.\d{4,9}\/[^\s)\]}]+|\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+|\[[0-9,;\s–-]+\]|\([^()\n]{0,90}\b(?:19|20)\d{2}[a-z]?[^()\n]{0,50}\)/gi, value => {
    const marker = `ZXQKEEP${protectedValues.length}ZXQ`;
    protectedValues.push(value);
    return marker;
  });
  return {
    text: protectedText,
    restore(value) {
      return protectedValues.reduce((result, original, index) => result.replace(new RegExp(`ZXQKEEP${index}ZXQ`, "gi"), original), value);
    }
  };
}

function splitLongTranslationText(text, limit=430) {
  const parts = text.split(/(\n\s*\n)/);
  const chunks = [];
  parts.forEach(part => {
    if (!part) return;
    if (/^\n\s*\n$/.test(part)) {
      chunks.push({text:part, separator:true});
      return;
    }
    const sentences = part.match(/[^.!?]+(?:[.!?]+|$)/g) || [part];
    let current = "";
    const flush = () => {
      if (current.trim()) chunks.push({text:current.trim(), separator:false});
      current = "";
    };
    sentences.forEach(sentence => {
      const candidate = current ? `${current} ${sentence.trim()}` : sentence.trim();
      if (candidate.length <= limit) {
        current = candidate;
        return;
      }
      flush();
      if (sentence.length <= limit) {
        current = sentence.trim();
        return;
      }
      const words = sentence.trim().split(/\s+/);
      words.forEach(word => {
        const wordCandidate = current ? `${current} ${word}` : word;
        if (wordCandidate.length > limit) flush();
        current = current ? `${current} ${word}` : word;
      });
    });
    flush();
  });
  return chunks;
}

function refineAcademicEnglish(text) {
  const contractions = [
    [/\bcan't\b/gi,"cannot"],[/\bwon't\b/gi,"will not"],[/\bdoesn't\b/gi,"does not"],
    [/\bdon't\b/gi,"do not"],[/\bdidn't\b/gi,"did not"],[/\bisn't\b/gi,"is not"],
    [/\baren't\b/gi,"are not"],[/\bwasn't\b/gi,"was not"],[/\bweren't\b/gi,"were not"],
    [/\bhasn't\b/gi,"has not"],[/\bhaven't\b/gi,"have not"],[/\bhadn't\b/gi,"had not"],
    [/\bcouldn't\b/gi,"could not"],[/\bshouldn't\b/gi,"should not"],[/\bwouldn't\b/gi,"would not"]
  ];
  let refined = text.replace(/[ \t]+([,.;:!?])/g,"$1").replace(/[ \t]{2,}/g," ");
  contractions.forEach(([pattern,replacement]) => { refined = refined.replace(pattern,replacement); });
  return refined;
}

function convertEnglishVariety(text, target=targetLanguage) {
  const ukPairs = [
    ["color","colour"],["colors","colours"],["center","centre"],["centers","centres"],
    ["analyze","analyse"],["analyzed","analysed"],["analyzing","analysing"],
    ["organization","organisation"],["organizations","organisations"],
    ["behavior","behaviour"],["behaviors","behaviours"],["labor","labour"],
    ["favorite","favourite"],["favorites","favourites"],["traveling","travelling"],
    ["traveled","travelled"],["program","programme"]
  ];
  const pairs = target === "en-GB" ? ukPairs : ukPairs.map(([us,uk]) => [uk,us]);
  return pairs.reduce((result,[from,to]) => result.replace(new RegExp(`\\b${from}\\b`,"gi"), match => {
    if (match === match.toUpperCase()) return to.toUpperCase();
    if (match[0] === match[0].toUpperCase()) return `${to[0].toUpperCase()}${to.slice(1)}`;
    return to;
  }),text);
}

async function requestTranslationChunk(text, way=direction) {
  const pair = way === "en-ec" ? "en|es" : "es|en";
  const protectedText = translationPurpose === "academic" ? protectResearchTokens(text) : {text,restore:value=>value};
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText.text.slice(0,500))}&langpair=${encodeURIComponent(pair)}`, {signal:controller.signal});
    if (!response.ok) throw new Error(`translation service ${response.status}`);
    const payload = await response.json();
    if (Number(payload.responseStatus || 200) >= 400 || !payload.responseData?.translatedText) throw new Error(payload.responseDetails || "translation unavailable");
    return protectedText.restore(decodeTranslation(payload.responseData.translatedText));
  } finally {
    clearTimeout(timeout);
  }
}

async function requestGeneralTranslation(text, way=direction) {
  if (translationPurpose !== "academic" || text.length <= 430) {
    const translated = await requestTranslationChunk(text, way);
    const refined = translationPurpose === "academic" && way === "ec-en" ? refineAcademicEnglish(translated) : translated;
    return languageFamily(targetLanguage) === "en" ? convertEnglishVariety(refined,targetLanguage) : refined;
  }
  if (text.length > 8000) throw new Error("research text exceeds free prototype limit");
  const protectedDocument = protectResearchTokens(text);
  const chunks = splitLongTranslationText(protectedDocument.text);
  if (chunks.filter(chunk => !chunk.separator).length > 20) throw new Error("research text requires too many translation segments");
  const translated = [];
  for (const chunk of chunks) {
    translated.push(chunk.separator ? chunk.text : await requestTranslationChunk(chunk.text, way));
  }
  const combined = protectedDocument.restore(translated.join(""));
  const refined = way === "ec-en" ? refineAcademicEnglish(combined) : combined;
  return languageFamily(targetLanguage) === "en" ? convertEnglishVariety(refined,targetLanguage) : refined;
}


function readTranslationEdits() {
  try {
    const saved = JSON.parse(localStorage.getItem(TRANSLATION_EDITS_STORAGE_KEY) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function academicSourceFingerprint(source) {
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${normalize(source).slice(0,80)}|${(hash >>> 0).toString(36)}`;
}

function translationEditKey(source, way=direction, variant=englishVariant, purpose=translationPurpose) {
  const targetVariant = languageFamily(targetLanguage) === "en" ? variant : targetLanguage;
  const sourceKey = purpose === "academic" ? academicSourceFingerprint(source) : normalize(source);
  return `${purpose}|${sourceLanguage}>${targetLanguage}|${way}|${targetVariant}|${sourceKey}`;
}

function persistTranslationEdits() {
  try {
    localStorage.setItem(TRANSLATION_EDITS_STORAGE_KEY, JSON.stringify(translationEdits));
  } catch {}
}

function updateTranslationEditUi() {
  const status = $("#translation-edit-status");
  const restore = $("#restore-translation");
  if (!status || !restore) return;
  if (!activeTranslationEdit) {
    status.textContent = "Translation is being generated…";
    restore.hidden = true;
    return;
  }
  const currentText = $("#natural-result").textContent.trim();
  const edited = currentText !== activeTranslationEdit.generated;
  status.textContent = edited
    ? "Your edited translation is saved on this device."
    : "Tap the translation above to edit it. Changes stay on this device.";
  restore.hidden = !edited;
}

function setEditableTranslation(source, generated, metadata={}) {
  const result = $("#natural-result");
  const key = translationEditKey(source);
  const savedText = typeof translationEdits[key]?.text === "string" ? translationEdits[key].text.trim() : "";
  const target = savedText || generated;
  result.textContent = target;
  result.setAttribute("contenteditable", "true");
  activeTranslationEdit = {key, source, way:direction, sourceLanguage, targetLanguage, variant:englishVariant, purpose:translationPurpose, generated, metadata};
  lastCompletedTranslation = {source, target, way:direction, sourceLanguage, targetLanguage, purpose:translationPurpose, ...metadata, edited:target !== generated};
  updateTranslationEditUi();
}

function saveActiveTranslationEdit() {
  if (!activeTranslationEdit) return;
  const result = $("#natural-result");
  const text = result.textContent.trim();
  if (!text) {
    result.textContent = activeTranslationEdit.generated;
    showToast("A translation cannot be empty.");
  }
  const finalText = result.textContent.trim();
  if (finalText === activeTranslationEdit.generated) delete translationEdits[activeTranslationEdit.key];
  else translationEdits[activeTranslationEdit.key] = {text:finalText, updatedAt:new Date().toISOString()};
  persistTranslationEdits();
  lastCompletedTranslation = {
    source:activeTranslationEdit.source,
    target:finalText,
    way:activeTranslationEdit.way,
    sourceLanguage:activeTranslationEdit.sourceLanguage,
    targetLanguage:activeTranslationEdit.targetLanguage,
    purpose:activeTranslationEdit.purpose,
    ...activeTranslationEdit.metadata,
    edited:finalText !== activeTranslationEdit.generated
  };
  updateTranslationEditUi();
}

function restoreGeneratedTranslation() {
  if (!activeTranslationEdit) return;
  delete translationEdits[activeTranslationEdit.key];
  persistTranslationEdits();
  $("#natural-result").textContent = activeTranslationEdit.generated;
  lastCompletedTranslation = {
    source:activeTranslationEdit.source,
    target:activeTranslationEdit.generated,
    way:activeTranslationEdit.way,
    sourceLanguage:activeTranslationEdit.sourceLanguage,
    targetLanguage:activeTranslationEdit.targetLanguage,
    purpose:activeTranslationEdit.purpose,
    ...activeTranslationEdit.metadata,
    edited:false
  };
  updateTranslationEditUi();
  showToast("Generated translation restored.");
}

function regionalSpanishBridge(sourceText) {
  if (sourceLanguage === targetLanguage) return {
    text:sourceText,
    label:`${languageLabel(targetLanguage)} · unchanged`,
    detail:"The source and target varieties are the same, so the wording is preserved."
  };
  const phrase = matchPhrase(sourceText,"ec-en");
  if (sourceLanguage === "es-EC" && targetLanguage === "es-BO") {
    return {
      text:phrase?.standardEs || phrase?.es || sourceText,
      label:"Bolivian-facing neutral Spanish bridge",
      detail:phrase
        ? "Ecuadorian-specific wording was normalized to broadly understood Spanish. This does not claim a uniquely Bolivian idiom."
        : "The wording is preserved as broadly understandable Spanish. Bolivian regional review is still pending."
    };
  }
  if (sourceLanguage === "es-BO" && targetLanguage === "es-EC") {
    return {
      text:phrase?.natural || phrase?.spanish || phrase?.es || sourceText,
      label:phrase ? "Habla Ecuador regional adaptation" : "Ecuadorian regional adaptation pending",
      detail:phrase
        ? "A matching Ecuadorian expression was found in the local, source-labeled phrase library."
        : "The source is preserved rather than inventing Ecuadorian wording. Ecuadorian review is still required."
    };
  }
  return {text:sourceText,label:"Regional Spanish bridge",detail:"The wording is preserved pending regional review."};
}

function regionalEnglishBridge(sourceText) {
  const converted = convertEnglishVariety(sourceText,targetLanguage);
  return {
    text:converted,
    label:`${languageLabel(targetLanguage)} regional adaptation`,
    detail:sourceLanguage === targetLanguage
      ? "The source and target varieties are the same, so the wording is preserved."
      : "Common regional spellings are adapted. Meaning and specialist terminology are preserved for human review."
  };
}

function renderRegionalTranslation(sourceText,result,missing) {
  const bridge = languageFamily(sourceLanguage) === "es" ? regionalSpanishBridge(sourceText) : regionalEnglishBridge(sourceText);
  result.hidden = false;
  missing.hidden = true;
  $(".result-label").textContent = bridge.label;
  setEditableTranslation(sourceText,bridge.text,{regionalBridge:true});
  $("#literal-result").textContent = `${languageLabel(sourceLanguage)} → ${languageLabel(targetLanguage)} · editable regional draft`;
  $("#usage-note").innerHTML = `<strong>Regional adaptation</strong><span>${bridge.detail}</span>`;
}

async function renderTranslation() {
  const requestId = ++translationRequest;
  const sourceText = $("#translator-input").value.trim();
  const preservedEntry = direction === "en-ec"
    && preservedCulturalContext
    && normalize(sourceText) === normalize(preservedCulturalContext.input)
      ? preservedCulturalContext.entry
      : null;
  if (preservedCulturalContext && direction === "en-ec" && !preservedEntry) preservedCulturalContext = null;
  const result = $("#translation-result");
  const missing = $("#no-result");
  if (!sourceText) {
    lastCompletedTranslation = null;
    activeTranslationEdit = null;
    $("#natural-result").removeAttribute("contenteditable");
    updateTranslationEditUi();
    result.hidden = true;
    missing.hidden = true;
    return;
  }
  if (languageFamily(sourceLanguage) === languageFamily(targetLanguage)) {
    renderRegionalTranslation(sourceText,result,missing);
    return;
  }
  const ecuadorLocalRoute = (direction === "en-ec" && targetLanguage === "es-EC") || (direction === "ec-en" && sourceLanguage === "es-EC");
  const phrase = translationPurpose === "academic" || !ecuadorLocalRoute ? null : preservedEntry || matchPhrase($("#translator-input").value);
  if (!phrase) {
    result.hidden = false;
    missing.hidden = true;
    $(".result-label").textContent = translationPurpose === "academic"
      ? `${languageLabel(targetLanguage)} academic draft`
      : `${languageLabel(targetLanguage)} translation`;
    activeTranslationEdit = null;
    $("#natural-result").removeAttribute("contenteditable");
    $("#natural-result").textContent = "Translating…";
    updateTranslationEditUi();
    $("#literal-result").textContent = "";
    $("#usage-note").innerHTML = translationPurpose === "academic"
      ? `<strong>Research translation</strong><span>Preserving paragraph structure, citations, DOI links, and numerical references while preparing a formal draft.</span>`
      : `<strong>General translation</strong><span>Checking the free translation service. Regional naturalness has not yet been verified.</span>`;
    try {
      const translated = await requestGeneralTranslation(sourceText);
      if (requestId !== translationRequest) return;
      setEditableTranslation(sourceText, translated);
      const regionalReview = targetLanguage === "es-EC"
        ? "Ecuadorian review pending"
        : targetLanguage === "es-BO"
          ? "Bolivian review pending"
          : `${languageLabel(targetLanguage)} refinement pending`;
      $("#literal-result").textContent = translationPurpose === "academic"
        ? `${languageLabel(targetLanguage)} · editable research draft`
        : `General draft · ${regionalReview}`;
      $("#usage-note").innerHTML = translationPurpose === "academic"
        ? `<strong>Academic machine draft · source structure preserved</strong><span>Headings, paragraph breaks, citations, DOI/URLs, and numbers are protected where possible. Check discipline-specific terminology and claims before publication.</span>`
        : `<strong>General machine translation · regional review pending</strong><span>This works for text outside the local phrase library. The label names the requested variety without pretending the free engine guarantees that dialect.</span>`;
    } catch {
      if (requestId !== translationRequest) return;
      activeTranslationEdit = null;
      $("#natural-result").removeAttribute("contenteditable");
      updateTranslationEditUi();
      result.hidden = true;
      missing.hidden = false;
      $("#no-result p").textContent = "Translation is temporarily unavailable.";
      $("#no-result small").textContent = "Check your connection and try again. Verified local phrases still work offline.";
    }
    return;
  }
  result.hidden = false;
  missing.hidden = true;
  const isCultural = phrase.culturalEntry === true;
  const isPreservedCultural = Boolean(preservedEntry);
  $(".result-label").textContent = isPreservedCultural
    ? "Ecuadorian Spanish · preserved slang sense"
    : phrase.verificationLabel
      ? phrase.verificationLabel
    : direction === "en-ec"
      ? "Habla Ecuador local phrase"
    : isCultural
      ? `${englishVariant === "uk" ? "UK" : "U.S."} English · Ecuadorian slang`
      : `${englishVariant === "uk" ? "UK" : "U.S."} English`;
  const target = isPreservedCultural ? phrase.spanish : translatedText(phrase);
  setEditableTranslation(sourceText, target, {culturalEntry:isCultural});
  const literal = englishVariant === "uk" ? phrase.literalUk : phrase.literalUs;
  $("#literal-result").textContent = isPreservedCultural
    ? [`Literal meaning: ${literal}`, phrase.standardEs ? `Standard Spanish: ${phrase.standardEs}` : ""].filter(Boolean).join(" · ")
    : isCultural && literal
    ? `Literal meaning: ${literal}`
    : direction === "en-ec" && phrase.es !== phrase.natural
      ? `Direct version: ${phrase.es}`
      : direction === "ec-en" && phrase.en
        ? `Source sense: ${phrase.en}`
        : "";
  const warning = phrase.warning ? ` ${phrase.warning}` : "";
  const preservedNote = isPreservedCultural
    ? "This reversal preserves the Ecuadorian slang sense selected in the previous translation. "
    : "";
  $("#usage-note").innerHTML = `<strong>${isCultural ? "Ecuadorian slang · " : ""}${phrase.register}</strong><span>${preservedNote}${phrase.note}${warning}</span>`;
}

function setTranslationPurpose(purpose, rerender=true) {
  translationPurpose = purpose === "academic" ? "academic" : "everyday";
  localStorage.setItem(TRANSLATION_PURPOSE_STORAGE_KEY, translationPurpose);
  $$('[data-purpose]').forEach(button => {
    const active = button.dataset.purpose === translationPurpose;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.body.classList.toggle("research-mode", translationPurpose === "academic");
  const note = $("#research-mode-note");
  if (note) note.hidden = translationPurpose !== "academic";
  const input = $("#translator-input");
  if (input) {
    input.rows = translationPurpose === "academic" ? 8 : 4;
    input.placeholder = translationPurpose === "academic"
      ? `Paste ${languageLabel(sourceLanguage)} research text, an abstract, or several paragraphs…`
      : "Type or tap the microphone to speak…";
  }
  if (rerender && input?.value.trim()) renderTranslation();
}

function swapDirection() {
  saveActiveTranslationEdit();
  const input = $("#translator-input");
  const sourceText = input.value.trim();
  const completedTarget = lastCompletedTranslation
    && lastCompletedTranslation.sourceLanguage === sourceLanguage
    && lastCompletedTranslation.targetLanguage === targetLanguage
    && lastCompletedTranslation.source === sourceText
      ? lastCompletedTranslation.target
      : null;
  translationRequest += 1;
  [sourceLanguage,targetLanguage] = [targetLanguage,sourceLanguage];
  preservedCulturalContext = null;
  syncLanguagePair();
  input.value = completedTarget || sourceText;
  setTranslationPurpose(translationPurpose,false);
  renderTranslation();
}

function setMode(mode) {
  $$(".mode").forEach(button => { const active = button.dataset.mode === mode; button.classList.toggle("active", active); button.setAttribute("aria-selected", String(active)); });
  $("#translate-panel").hidden = mode !== "translate";
  $("#conversation-panel").hidden = mode !== "conversation";
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function renderTurns() {
  const box = $("#conversation-turns");
  box.innerHTML = turns.map(turn => `<article class="turn ${turn.role === "spanish" ? "spanish-speaker" : "english-speaker"}"><small>${escapeHtml(turn.speaker)}</small><p>${escapeHtml(turn.source)}</p><p class="translated">${escapeHtml(turn.translation)}</p></article>`).join("");
}

function startConversation(role, button) {
  startListening(conversationOptions(role, button));
}

function conversationOptions(role, button) {
  const way = role === "spanish" ? "ec-en" : "en-ec";
  const name = speakerName(role);
  $("#conversation-status").textContent = role === "spanish" ? `Escuchando a ${name} en español…` : `Listening to ${name} in English…`;
  return {way, button, onText:(text, final) => handleConversationText(role, name, text, final)};
}

async function handleConversationText(role, speaker, text, final) {
  const way = role === "spanish" ? "ec-en" : "en-ec";
  $("#conversation-status").textContent = `I heard: ${text}`;
  if (!final) return;
  const phrase = matchPhrase(text, way);
  let translation;
  if (phrase) {
    translation = translatedText(phrase, way);
  } else {
    $("#conversation-status").textContent = "Translating…";
    try { translation = await requestGeneralTranslation(text, way); }
    catch { $("#conversation-status").textContent = "Translation is temporarily unavailable. Please check the connection and try again."; return; }
  }
  turns.push({role, speaker, source:text, translation});
  renderTurns();
  say(translation, way === "en-ec" ? "es-EC" : englishVariant === "uk" ? "en-GB" : "en-US");
  $("#conversation-status").textContent = phrase ? "Ecuadorian-verified phrase translated and spoken." : "General translation spoken · Ecuadorian review pending.";
}

async function loadEvidence() {
  const status = $("#dictionary-status");
  try {
    const paths = [
      "data/learner-entries-v1.json",
      "data/vocabulary.json",
      "data/candidate-lexicon.json",
      "data/sources.json",
      "data/review-queue.json",
      "data/ecuador-bolivia-comparisons-v1.json"
    ];
    const responses = await Promise.all(paths.map(path => fetch(path, {cache:"no-cache"})));
    if (responses.some(response => !response.ok)) throw new Error("source file unavailable");
    const [learner, vocabulary, candidates, sources, queue, comparisons] = await Promise.all(responses.map(response => response.json()));
    evidenceSources = new Map(sources.map(source => [source.id, source]));
    reviewQueue = new Map(queue.map(item => [item.entryId, item]));
    comparisonIndex = new Map(comparisons.map(item => [item.entryId, item]));

    const combined = [
      ...learner.map(item => ({...item, origin:"learner-ready"})),
      ...vocabulary.map(item => ({...item, origin:"project-reference"})),
      ...candidates.map(item => ({...item, origin:item.status || "research-lead"}))
    ];
    const ranked = {"learner-ready":3,"project-reference":2,"dictionary-attested":1,"research-lead":0};
    const merged = new Map();
    combined.forEach(item => {
      const current = merged.get(item.id);
      if (!current || (ranked[item.origin] ?? 0) > (ranked[current.origin] ?? 0)) merged.set(item.id, item);
    });
    evidenceEntries = [...merged.values()].sort((a,b) => (a.spanish || "").localeCompare(b.spanish || "", "es"));
    $("#evidence-counts").innerHTML = `
      <article><strong>${learner.length}</strong><span>Learner-ready</span></article>
      <article><strong>${sources.length}</strong><span>Named sources</span></article>
      <article><strong>${queue.length}</strong><span>Review queue</span></article>`;
    status.hidden = true;
    renderDictionary();
  } catch (error) {
    status.hidden = false;
    status.textContent = "The evidence files could not be loaded. The translator still works, but no verification claims are being shown.";
  }
}

function expressionCategoryLabel(category) {
  return ({
    idiom:"Idiom & metaphor",
    slang:"Slang",
    culture:"Culture & everyday speech",
    personal:"Our useful phrases"
  })[category] || category;
}

function expressionVerificationLabel(entry) {
  if (entry.verification) return entry.verification;
  if (entry.source || entry.literalSource) return "Source-attested";
  return "Native review pending";
}

function renderSlangIndex(query="") {
  const root = $("#slang-index-list");
  if (!root) return;
  const entries = culturalExpressions.filter(entry => {
    if (!["slang", "idiom"].includes(entry.category)) return false;
    const searchable = normalize([entry.spanish, entry.literalUs, entry.literalUk, entry.us, entry.uk, entry.note, entry.register].filter(Boolean).join(" "));
    return !query || searchable.includes(query);
  });
  root.innerHTML = entries.length ? entries.map(entry => {
    const english = englishVariant === "uk" ? entry.uk : entry.us;
    const literal = englishVariant === "uk" ? entry.literalUk : entry.literalUs;
    return `<li>
      <div><strong>${escapeHtml(entry.spanish)}</strong><span>${literal ? `Literal: ${escapeHtml(literal)} · Ecuadorian slang: ${escapeHtml(english)}` : escapeHtml(english)}</span></div>
      <p><b>Context:</b> ${escapeHtml(entry.register)} — ${escapeHtml(entry.note)}</p>
    </li>`;
  }).join("") : `<li class="slang-index-empty">No slang entries match this search.</li>`;
}

function renderExpressionLibrary(query="") {
  const root = $("#expression-results");
  if (!root) return;
  renderSlangIndex(query);
  const visible = culturalExpressions.filter(entry => {
    const searchable = normalize([entry.spanish, entry.literalUs, entry.literalUk, entry.us, entry.uk, entry.exampleEs, entry.exampleUs, entry.exampleUk, entry.note, entry.register, entry.warning, ...(entry.comparisons || []), expressionCategoryLabel(entry.category)].filter(Boolean).join(" "));
    return (expressionFilter === "all" || entry.category === expressionFilter) && (!query || searchable.includes(query));
  });
  root.innerHTML = visible.length ? visible.map(entry => {
    const english = englishVariant === "uk" ? entry.uk : entry.us;
    const literal = englishVariant === "uk" ? entry.literalUk : entry.literalUs;
    const exampleEnglish = englishVariant === "uk" ? entry.exampleUk : entry.exampleUs;
    const verification = expressionVerificationLabel(entry);
    return `<article class="expression-card">
      <header><span class="expression-kind">${escapeHtml(expressionCategoryLabel(entry.category))}</span><span class="natural-indicator ${verification === "Native review pending" ? "pending" : ""}">${verification === "Native review pending" ? "◌" : "✓"} ${escapeHtml(verification)}</span></header>
      <p class="expression-spanish">${escapeHtml(entry.spanish)}</p>
      ${literal ? `<p class="expression-literal">Literal English: ${escapeHtml(literal)}</p><p class="expression-english">Ecuadorian slang: ${escapeHtml(english)}</p>` : `<p class="expression-english">${escapeHtml(english)}</p>`}
      <div class="dictionary-audio" aria-label="Spoken audio">
        <button type="button" data-dictionary-audio="${escapeHtml(entry.spanish)}" data-audio-lang="es-EC">🔊 Spanish</button>
        ${literal ? `<button type="button" data-dictionary-audio="${escapeHtml(literal)}" data-audio-lang="${englishVariant === "uk" ? "en-GB" : "en-US"}">🔊 Literal English</button>` : ""}
        <button type="button" data-dictionary-audio="${escapeHtml(english)}" data-audio-lang="${englishVariant === "uk" ? "en-GB" : "en-US"}">🔊 English</button>
      </div>
      ${entry.exampleEs ? `<div class="expression-example"><p>${escapeHtml(entry.exampleEs)}</p><small>${escapeHtml(exampleEnglish)}</small><button type="button" data-dictionary-audio="${escapeHtml(entry.exampleEs)}" data-audio-lang="es-EC">🔊 Example</button></div>` : ""}
      <p class="expression-note">${escapeHtml(entry.note)}</p>
      <p class="expression-naturalness"><b>Usage:</b> ${escapeHtml(entry.naturalness)}</p>
      <div class="expression-meta"><span>${escapeHtml(entry.register)}</span>${entry.intensity ? `<span>Intensity: ${escapeHtml(entry.intensity)}</span>` : ""}</div>
      ${entry.warning ? `<p class="expression-warning">⚠ ${escapeHtml(entry.warning)}</p>` : ""}
      ${entry.comparisons?.length ? `<div class="expression-comparisons"><strong>Regional comparison</strong>${entry.comparisons.map(item => `<p>${escapeHtml(item)}</p>`).join("")}</div>` : ""}
      ${[entry.literalSource, entry.source].filter(Boolean).map(source => `<a class="expression-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Source: ${escapeHtml(source.name)}</a>`).join("")}
    </article>`;
  }).join("") : `<p class="status">No expressions match this search and category.</p>`;
}

function renderMusic() {
  const recordings = $("#open-music-tracks");
  const heritageRecordings = $("#heritage-music-tracks");
  const traditions = $("#music-traditions");
  const drills = $("#rhythm-drills");
  if (!recordings || !heritageRecordings || !traditions || !drills) return;
  const renderTrackCards = tracks => tracks.map((track,index) => `<article class="open-music-card">
    <p class="music-region">${escapeHtml(track.region)}</p>
    <h2>${escapeHtml(track.title)}</h2>
    <p class="music-credit">${escapeHtml(track.artist)} · ${escapeHtml(track.year)}</p>
    <audio controls preload="none" aria-label="Play ${escapeHtml(track.title)}">
      <source src="${escapeHtml(track.audioMp3)}" type="audio/mpeg">
      ${track.audioOgg ? `<source src="${escapeHtml(track.audioOgg)}" type="audio/ogg">` : ""}
      Your browser cannot play this recording.
    </audio>
    ${track.lyrics ? `<section class="lyric-companion" data-lyric-companion="${index}">
      <header>
        <div><p class="music-region">Lyric companion</p><h3>Follow the meaning</h3></div>
        <div class="subtitle-switch" role="group" aria-label="Subtitle language">
          <button type="button" class="active" data-lyric-mode="en" data-track-index="${index}">English</button>
          <button type="button" data-lyric-mode="es" data-track-index="${index}">Español</button>
          <button type="button" data-lyric-mode="both" data-track-index="${index}">Both</button>
        </div>
      </header>
      <p class="lyric-note">${escapeHtml(track.lyricsNote)}</p>
      <div class="lyric-lines" data-lyric-lines="${index}">${renderLyricLines(track.lyrics,"en")}</div>
    </section>` : `<p class="instrumental-label">Instrumental track · no lyric subtitles</p>`}
    <p>${escapeHtml(track.note)}</p>
    <div class="music-license"><a href="${escapeHtml(track.sourceUrl)}" target="_blank" rel="noreferrer">Recording source</a><span>·</span><a href="${escapeHtml(track.licenseUrl)}" target="_blank" rel="noreferrer">${escapeHtml(track.license)}</a></div>
  </article>`).join("");
  recordings.innerHTML = renderTrackCards(contemporaryMusicTracks);
  heritageRecordings.innerHTML = renderTrackCards(heritageMusicTracks);
  const players = $$("#music-view audio");
  players.forEach(player => player.addEventListener("play", () => {
    players.forEach(otherPlayer => {
      if (otherPlayer !== player && !otherPlayer.paused) otherPlayer.pause();
    });
  }));
  $$('[data-lyric-mode]').forEach(button => button.addEventListener("click", () => {
    const trackIndex = Number(button.dataset.trackIndex);
    const mode = button.dataset.lyricMode;
    const companion = $(`[data-lyric-companion="${trackIndex}"]`);
    const lines = $(`[data-lyric-lines="${trackIndex}"]`);
    const track = contemporaryMusicTracks[trackIndex];
    if (!companion || !lines || !track?.lyrics) return;
    companion.querySelectorAll('[data-lyric-mode]').forEach(item => item.classList.toggle("active",item === button));
    lines.innerHTML = renderLyricLines(track.lyrics,mode);
  }));
  traditions.innerHTML = musicTraditions.map(item => `<article class="music-culture-card">
    <p class="music-region">${escapeHtml(item.region)}</p>
    <h2>${escapeHtml(item.name)}</h2>
    <p><b>Language value:</b> ${escapeHtml(item.languageFocus)}</p>
    <p>${escapeHtml(item.note)}</p>
    <a href="${escapeHtml(item.source.url)}" target="_blank" rel="noreferrer">Source: ${escapeHtml(item.source.name)}</a>
  </article>`).join("");
  drills.innerHTML = rhythmDrills.map((drill,index) => `<article class="rhythm-card">
    <p class="music-region">Original Habla Ecuador drill</p>
    <h2>${escapeHtml(drill.title)}</h2>
    <p class="rhythm-focus">${escapeHtml(drill.focus)}</p>
    <ol>${drill.lines.map(line => `<li>
      <div class="rhythm-definition"><span lang="es-EC">${escapeHtml(line.es)}</span><strong>${escapeHtml(line.en)}</strong><small>${escapeHtml(line.note)}</small></div>
      <button type="button" data-rhythm-line="${escapeHtml(line.es)}" aria-label="Hear ${escapeHtml(line.es)}">🔊</button>
    </li>`).join("")}</ol>
    <button class="primary-button music-play" type="button" data-rhythm-drill="${index}">▶ Hear the whole rhythm</button>
    <p class="music-note">${escapeHtml(drill.note)}</p>
  </article>`).join("");
  $$('[data-rhythm-line]').forEach(button => button.addEventListener("click", () => say(button.dataset.rhythmLine,"es-EC")));
  $$('[data-rhythm-drill]').forEach(button => button.addEventListener("click", () => playRhythmDrill(Number(button.dataset.rhythmDrill),button)));
}

function renderLyricLines(lyrics, mode) {
  return lyrics.map(line => `<p class="lyric-line">
    ${mode !== "en" ? `<span lang="es-EC" class="lyric-es">${escapeHtml(line.es)}</span>` : ""}
    ${mode !== "es" ? `<span lang="en-US" class="lyric-en">${escapeHtml(line.en)}</span>` : ""}
  </p>`).join("");
}

function playRhythmDrill(index, button) {
  const drill = rhythmDrills[index];
  if (!drill || !("speechSynthesis" in window)) return showToast("Speech playback is unavailable in this browser.");
  speechRequestId += 1;
  const requestId = speechRequestId;
  speechSynthesis.cancel();
  refreshSpeechVoices();
  const voice = voiceForLanguage("es-EC");
  if (!voice) return showToast("Spanish speech is unavailable on this device.");
  const originalLabel = button.textContent;
  button.textContent = "Playing…";
  button.disabled = true;
  const playLine = lineIndex => {
    if (requestId !== speechRequestId || lineIndex >= drill.lines.length) {
      button.textContent = originalLabel;
      button.disabled = false;
      return;
    }
    const profile = speechProfile(drill.lines[lineIndex].es,"es-EC");
    const utterance = new SpeechSynthesisUtterance(profile.text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;
    utterance.onend = () => setTimeout(() => playLine(lineIndex + 1), 420);
    utterance.onerror = () => {
      button.textContent = originalLabel;
      button.disabled = false;
    };
    speechSynthesis.speak(utterance);
  };
  playLine(0);
}

function entryStatus(entry) {
  if (entry.origin === "learner-ready") return "learner-ready";
  if (reviewQueue.has(entry.id)) return "research-lead";
  if (entry.verification?.dictionaryAttested || entry.status === "dictionary-attested") return "dictionary-attested";
  return entry.origin || "research-lead";
}

function statusLabel(value) {
  return ({
    "learner-ready":"Learner-ready",
    "dictionary-attested":"Dictionary-attested",
    "project-reference":"Project reference",
    "research-lead":"Needs review"
  })[value] || value;
}

function renderDictionary() {
  const root = $("#dictionary-results");
  const query = normalize($("#dictionary-search").value);
  renderExpressionLibrary(query);
  if (!root || !evidenceEntries.length) {
    bindDictionaryAudio();
    return;
  }
  const visible = evidenceEntries.filter(entry => {
    const status = entryStatus(entry);
    const searchable = normalize([
      entry.spanish,
      entry.usEnglish,
      entry.ukEnglish,
      entry.provisionalMeaning,
      entry.regionStatus,
      entry.register
    ].filter(Boolean).join(" "));
    return (evidenceFilter === "all" || status === evidenceFilter) && (!query || searchable.includes(query));
  });
  $("#dictionary-status").hidden = visible.length > 0;
  if (!visible.length) $("#dictionary-status").textContent = "No entries match that search and verification filter.";
  root.innerHTML = visible.map(renderEvidenceCard).join("");
  bindDictionaryAudio();
}

function renderEvidenceCard(entry) {
  const status = entryStatus(entry);
  const verification = entry.verification || {};
  const gloss = entry.usEnglish || entry.provisionalMeaning || "Meaning still under review";
  const sourceIds = entry.sources || [];
  const sourceLinks = sourceIds.map(id => evidenceSources.get(id)).filter(Boolean).map(source => `<a href="${source.url}" target="_blank" rel="noreferrer">${escapeHtml(source.name)}</a>`).join("");
  const queueItem = reviewQueue.get(entry.id);
  const comparison = comparisonIndex.get(entry.id);
  const inlineComparisons = entry.comparisons || [];
  const comparisonHtml = [
    comparison ? `<p class="comparison"><b>Bolivia:</b> ${escapeHtml(comparison.bolivia)} <span>· ${escapeHtml(comparison.learnerAlert || "")}</span></p>` : "",
    ...inlineComparisons.map(item => `<p class="comparison"><b>${escapeHtml(item.country)}:</b> ${escapeHtml(item.meaning)}${item.note ? ` · ${escapeHtml(item.note)}` : ""}</p>`)
  ].join("");
  const verificationBits = [
    entry.level ? `CEFR ${entry.level}` : "",
    verification.dictionaryAttested === true ? "Dictionary ✓" : "",
    verification.corpusChecked === true && entry.corpusEvidence?.meaningSupported === true ? "Corpus supports ✓" : "",
    verification.corpusChecked === true && entry.corpusEvidence?.meaningSupported === false ? "Corpus checked · no exact support" : "",
    verification.corpusChecked === false ? "Corpus pending" : "",
    verification.nativeSpeakerReviewed === true ? "Native review ✓" : verification.nativeSpeakerReviewed === false ? "Native review pending" : ""
  ].filter(Boolean);
  const reviewText = queueItem?.needs?.length ? queueItem.needs.join(" · ") : entry.nextChecks?.length ? entry.nextChecks.join(" · ") : "";
  const usMeaning = entry.usEnglish || entry.provisionalMeaning || "";
  const ukMeaning = entry.ukEnglish || "";
  const audioItems = [
    ["Spanish word", entry.spanish, "es-EC"],
    ["Spanish example", entry.exampleEs, "es-EC"],
    ["U.S. meaning", usMeaning, "en-US"],
    ...(ukMeaning && ukMeaning !== usMeaning ? [["U.K. meaning", ukMeaning, "en-GB"]] : [])
  ].filter(([,text]) => text);
  return `<article class="evidence-card">
    <header><div><h2>${escapeHtml(entry.spanish || "Untitled entry")}</h2><p class="english-gloss">${escapeHtml(gloss)}</p></div><span class="evidence-badge ${status === "research-lead" ? "research" : ""}">${statusLabel(status)}</span></header>
    <div class="dictionary-audio" aria-label="Spoken audio">${audioItems.map(([label,text,lang]) => `<button type="button" data-dictionary-audio="${escapeHtml(text)}" data-audio-lang="${lang}" aria-label="Hear ${escapeHtml(label)}">🔊 ${escapeHtml(label)}</button>`).join("")}</div>
    <div class="evidence-meta">${verificationBits.map(item => `<span>${escapeHtml(item)}</span>`).join("")}</div>
    ${entry.exampleEs ? `<div class="evidence-example"><p>${escapeHtml(entry.exampleEs)}</p>${entry.exampleUs ? `<small>${escapeHtml(entry.exampleUs)}</small>` : ""}</div>` : ""}
    ${entry.regionStatus ? `<div class="evidence-section"><h3>Regional status</h3><p>${escapeHtml(entry.regionStatus)}</p></div>` : ""}
    ${entry.register ? `<div class="evidence-section"><h3>Register & tone</h3><p>${escapeHtml(entry.register)}${entry.intensity ? ` ${escapeHtml(entry.intensity)}` : ""}</p></div>` : ""}
    ${(entry.naturalness || entry.warning) ? `<div class="evidence-section"><h3>Naturalness & warning</h3><p>${escapeHtml([entry.naturalness,entry.warning].filter(Boolean).join(" "))}</p></div>` : ""}
    ${entry.corpusEvidence ? `<div class="evidence-section corpus-evidence"><h3>CORPHA corpus check</h3><p>${escapeHtml(entry.corpusEvidence.note || "Exact-term search completed.")}</p><small>${entry.corpusEvidence.documentCount} matching documents · checked ${escapeHtml(entry.corpusEvidence.checkedOn || "")}${entry.corpusEvidence.observedRegions?.length ? ` · first results: ${escapeHtml(entry.corpusEvidence.observedRegions.join(", "))}` : ""}</small></div>` : ""}
    ${comparisonHtml ? `<div class="evidence-section"><h3>Regional comparison</h3>${comparisonHtml}</div>` : ""}
    ${reviewText ? `<div class="evidence-section"><h3>Still to verify</h3><p>${escapeHtml(reviewText)}</p></div>` : ""}
    <div class="evidence-section"><h3>Sources</h3><div class="source-links">${sourceLinks || "<span>No named source linked yet</span>"}</div></div>
  </article>`;
}

function bindDictionaryAudio() {
  $$('[data-dictionary-audio]').forEach(button => button.addEventListener("click", () => {
    say(button.dataset.dictionaryAudio, button.dataset.audioLang || "es-EC");
  }));
}

function readReviewPackage() {
  try {
    const saved = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || "{}");
    return {reviewer:saved.reviewer || "", reviews:saved.reviews || {}};
  } catch {
    return {reviewer:"", reviews:{}};
  }
}

function writeReviewPackage(value) {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(value));
}

function reviewEntries() {
  return evidenceEntries.filter(entry => entry.origin === "learner-ready");
}

function renderReview() {
  const root = $("#review-card");
  if (!root) return;
  const entries = reviewEntries();
  if (!entries.length) {
    root.innerHTML = `<p class="status">The learner-ready entries are still loading.</p>`;
    return;
  }
  reviewIndex = Math.max(0, Math.min(reviewIndex, entries.length - 1));
  const entry = entries[reviewIndex];
  const pack = readReviewPackage();
  const saved = pack.reviews[entry.id] || {};
  $("#reviewer-name").value = pack.reviewer;
  const reviewed = Object.values(pack.reviews).filter(item => item.rating).length;
  $("#review-progress").innerHTML = `<span style="width:${(reviewed / entries.length) * 100}%"></span><small>${reviewed} of ${entries.length} reviewed · entry ${reviewIndex + 1}</small>`;
  const choices = [
    ["natural", "Natural in Ecuador"],
    ["awkward", "Understandable but awkward"],
    ["regional", "Regional / depends where"],
    ["correction", "Needs correction"]
  ];
  root.innerHTML = `<article class="review-card">
    <p class="review-entry-number">Entry ${reviewIndex + 1} of ${entries.length}</p>
    <h2>${escapeHtml(entry.spanish)}</h2>
    <p class="review-gloss">${escapeHtml(entry.usEnglish || "")}</p>
    ${entry.exampleEs ? `<div class="evidence-example"><p>${escapeHtml(entry.exampleEs)}</p><small>${escapeHtml(entry.exampleUs || "")}</small></div>` : ""}
    <div class="review-evidence"><b>Existing evidence</b><span>Dictionary ${entry.verification?.dictionaryAttested ? "✓" : "pending"}</span><span>${entry.corpusEvidence?.meaningSupported ? "CORPHA meaning support ✓" : entry.verification?.corpusChecked ? "CORPHA checked; no exact support" : "CORPHA pending"}</span></div>
    <fieldset><legend>How does this wording sound?</legend><div class="review-choices">${choices.map(([value,label]) => `<button type="button" data-review-choice="${value}" class="${saved.rating === value ? "selected" : ""}">${label}</button>`).join("")}</div></fieldset>
    <label>Region or city <span>(optional)</span><input id="review-region" value="${escapeHtml(saved.region || "")}" placeholder="e.g. Quito, Guayaquil, Cuenca"></label>
    <label>Preferred wording or notes <span>(optional)</span><textarea id="review-notes" rows="3" placeholder="What would you say instead?">${escapeHtml(saved.notes || "")}</textarea></label>
  </article>`;
  $("#review-prev").disabled = reviewIndex === 0;
  $("#review-next").disabled = reviewIndex === entries.length - 1;
  $$('[data-review-choice]').forEach(button => button.addEventListener("click", () => saveCurrentReview({rating:button.dataset.reviewChoice})));
  $("#review-region").addEventListener("change", event => saveCurrentReview({region:event.target.value}));
  $("#review-notes").addEventListener("change", event => saveCurrentReview({notes:event.target.value}));
}

function saveCurrentReview(change) {
  const entry = reviewEntries()[reviewIndex];
  if (!entry) return;
  const pack = readReviewPackage();
  pack.reviews[entry.id] = {...(pack.reviews[entry.id] || {}), ...change, reviewedAt:new Date().toISOString()};
  writeReviewPackage(pack);
  renderReview();
}

function reviewSummary() {
  const pack = readReviewPackage();
  const labels = {natural:"Natural in Ecuador",awkward:"Understandable but awkward",regional:"Regional / depends where",correction:"Needs correction"};
  const lines = ["Habla Ecuador — Ecuadorian usage review", `Reviewer: ${pack.reviewer || "Not provided"}`, `Exported: ${new Date().toISOString()}`, ""];
  reviewEntries().forEach(entry => {
    const item = pack.reviews[entry.id];
    if (!item?.rating) return;
    lines.push(`${entry.spanish} — ${labels[item.rating] || item.rating}`);
    if (item.region) lines.push(`Region/city: ${item.region}`);
    if (item.notes) lines.push(`Notes: ${item.notes}`);
    lines.push("");
  });
  return lines.join("\n").trim();
}

async function copyReviewSummary() {
  const summary = reviewSummary();
  if (!Object.values(readReviewPackage().reviews).some(item => item.rating)) return showToast("Review at least one entry first.");
  try { await navigator.clipboard.writeText(summary); showToast("Review summary copied."); }
  catch { showToast("Press and hold to copy the review summary."); }
}

async function shareReviewSummary() {
  const summary = reviewSummary();
  if (!Object.values(readReviewPackage().reviews).some(item => item.rating)) return showToast("Review at least one entry first.");
  if (navigator.share) {
    try { await navigator.share({title:"Habla Ecuador usage review", text:summary}); }
    catch (error) { if (error.name !== "AbortError") showToast("Sharing was unavailable."); }
  } else {
    await copyReviewSummary();
  }
}

function renderLesson() {
  const content = $("#lesson-content");
  $("#lesson-step-count").textContent = `${lessonStep}/4`;
  $("#lesson-progress-bar").style.width = `${lessonStep * 25}%`;
  if (lessonStep === 1) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Scene first</p><h1 id="lesson-title">Make a plan before sunset.</h1><p class="lead">You want to meet someone while there is still daylight. Hear the natural question before you say it.</p><div class="scene" aria-label="Sunset over Ecuador">🌄</div><div class="phrase-card"><button class="play-button" id="lesson-play" aria-label="Hear the Spanish phrase">▶</button><p class="spanish">¿A qué hora se pone el sol?</p><p class="english">What time does the sun set?</p></div><button class="primary-button" id="lesson-next">Now say it</button></div>`;
  if (lessonStep === 2) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Speak from memory</p><h1 id="lesson-title">Ask the question aloud.</h1><p class="lead">Aim for clear key words: <em>hora</em>, <em>pone</em>, and <em>sol</em>. Flow matters more than perfection.</p><div class="mic-practice"><button id="lesson-mic" class="push-to-talk" aria-label="Hold to speak">🎙️</button><p>Hold the microphone while speaking. Release when finished.</p><div id="lesson-heard"></div></div><button class="primary-button" id="lesson-next">Continue</button></div>`;
  if (lessonStep === 3) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Naturalness check</p><h1 id="lesson-title">What would you say in conversation?</h1><p class="lead">Choose the most natural everyday way to ask about sunset.</p><div class="choice-list"><button class="choice" data-correct="true">¿A qué hora se pone el sol?</button><button class="choice">¿A qué hora ocurre el ocaso?</button><button class="choice">¿Cuál es la hora de la puesta solar?</button></div><button class="primary-button" id="lesson-next" disabled>See the language map</button></div>`;
  if (lessonStep === 4) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Language map</p><h1 id="lesson-title">One idea, several useful forms.</h1><div class="language-map"><article class="map-card"><header><h2>Sunset · conversational</h2><button data-say="Se pone el sol">🔊</button></header><p><span>se pone el sol</span> · the sun sets</p></article><article class="map-card"><header><h2>Sunset · noun</h2><button data-say="puesta del sol">🔊</button></header><p><span>puesta del sol</span> · sunset. <em>Ocaso</em> is more literary.</p></article><article class="map-card"><header><h2>Sunrise · conversational</h2><button data-say="sale el sol">🔊</button></header><p><span>sale el sol / ver salir el sol</span> · the sun rises / watch the sunrise.</p></article><article class="map-card"><header><h2>Dawn</h2><button data-say="antes de que amanezca">🔊</button></header><p><span>amanecer</span> · dawn or daybreak. <em>Orto</em> is formal or technical.</p></article></div><p class="lead">Ecuador-first guidance; broader regional nuance should still be reviewed by multiple Ecuadorian speakers.</p><button class="primary-button orange" id="lesson-finish">Finish lesson</button></div>`;
  bindLesson();
}

function bindLesson() {
  $("#lesson-play")?.addEventListener("click", () => say("¿A qué hora se pone el sol?"));
  $("#lesson-next")?.addEventListener("click", () => { if (lessonStep < 4) { lessonStep += 1; renderLesson(); } });
  bindPushToTalk($("#lesson-mic"), button => ({way:"ec-en",button,onText:text => {
    const heard = normalize(text);
    const understood = ["hora","pone","sol"].filter(word => heard.includes(word)).length >= 2;
    $("#lesson-heard").innerHTML = `<div class="heard"><small>I heard</small><p>${escapeHtml(text)}</p><p>${understood ? "✓ Understood — your key words came through." : "Try again and make hora, pone, and sol clear."}</p></div>`;
  }}));
  $$(".choice").forEach(button => button.addEventListener("click", () => {
    selectedChoice = button.textContent;
    $$(".choice").forEach(item => { item.classList.toggle("selected", item === button); const old = $("small", item); if (old) old.remove(); });
    const note = document.createElement("small");
    note.textContent = button.dataset.correct ? "✓ Natural and conversational in Ecuador." : "Correct Spanish, but not the ordinary conversational choice.";
    button.append(note);
    $("#lesson-next").disabled = false;
  }));
  $$('[data-say]').forEach(button => button.addEventListener("click", () => say(button.dataset.say)));
  $("#lesson-finish")?.addEventListener("click", () => { lessonStep = 1; selectedChoice = ""; openView("home-view"); showToast("Lesson complete — ¡bien hecho!"); });
}

function escapeHtml(value) {
  const span = document.createElement("span");
  span.textContent = value;
  return span.innerHTML;
}

function init() {
  const standaloneTranslator = location.pathname.endsWith("/translator.html") || new URLSearchParams(location.search).get("standalone") === "translator";
  localStorage.removeItem("habla-ecuador-ios-voice-correction-v1");
  if ("speechSynthesis" in window) {
    refreshSpeechVoices();
    speechSynthesis.addEventListener?.("voiceschanged", refreshSpeechVoices);
  }
  [["#spanish-voice-select","es"],["#english-voice-select","en"]].forEach(([selector,language]) => {
    $(selector)?.addEventListener("change", event => {
      saveVoicePreference(language, event.target.value);
      const sample = language === "es" ? "Hola, mucho gusto." : "Hello, nice to meet you.";
      const locale = language === "es" ? "es-EC" : englishVariant === "uk" ? "en-GB" : "en-US";
      say(sample,locale);
    });
  });
  $$('[data-app-version]').forEach(element => { element.textContent = `v${APP_VERSION}`; });
  syncLanguagePair({persist:false});
  setTranslationPurpose(translationPurpose, false);
  $$('[data-open]').forEach(button => button.addEventListener("click", () => openView(button.dataset.open)));
  $("#home-button").addEventListener("click", () => openView("home-view"));
  $$(".mode").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $("#swap-button").addEventListener("click", swapDirection);
  $("#source-language-select")?.addEventListener("change", event => {
    sourceLanguage = event.target.value;
    preservedCulturalContext = null;
    translationRequest += 1;
    syncLanguagePair();
    setTranslationPurpose(translationPurpose,false);
    renderTranslation();
  });
  $("#target-language-select")?.addEventListener("change", event => {
    targetLanguage = event.target.value;
    preservedCulturalContext = null;
    translationRequest += 1;
    syncLanguagePair();
    renderTranslation();
    renderDictionary();
  });
  $("#translator-input").addEventListener("input", () => {
    if (preservedCulturalContext && normalize($("#translator-input").value) !== normalize(preservedCulturalContext.input)) preservedCulturalContext = null;
    clearTimeout(translationTimer);
    const local = translationPurpose === "academic" ? null : matchPhrase($("#translator-input").value);
    if (local) renderTranslation();
    else translationTimer = setTimeout(renderTranslation, 550);
  });
  bindPushToTalk($("#input-mic"), button => ({way:direction,lang:sourceSpeechLocale(),button,onText:(text, final) => { preservedCulturalContext = null; $("#translator-input").value = text; if (final) renderTranslation(); }}));
  const rateSlider = $("#voice-rate-slider");
  if (rateSlider) {
    rateSlider.value = String(voiceRate);
    setSpeechRate(voiceRate);
    rateSlider.addEventListener("input", event => setSpeechRate(event.target.value));
    rateSlider.addEventListener("change", () => {
      const preview = $("#natural-result").textContent.trim();
      if (preview) say(preview,targetSpeechLocale());
    });
  }
  $$('[data-purpose]').forEach(button => button.addEventListener("click", () => setTranslationPurpose(button.dataset.purpose)));
  $("#hear-result").addEventListener("click", () => say($("#natural-result").textContent,targetSpeechLocale()));
  $("#copy-result").addEventListener("click", async () => { try { await navigator.clipboard.writeText($("#natural-result").textContent); showToast("Translation copied."); } catch { showToast("Press and hold the translation to copy it."); } });
  $("#natural-result").addEventListener("input", saveActiveTranslationEdit);
  $("#natural-result").addEventListener("blur", saveActiveTranslationEdit);
  $("#restore-translation").addEventListener("click", restoreGeneratedTranslation);
  const suggestions = ["Maybe another time.","Can you say it more slowly?","I'm so fucking tired!","Do you want to go fishing with me?","I miss you.","That's cool!","What time does the sun set?"];
  $("#suggestion-list").innerHTML = suggestions.map(item => `<button>${item}</button>`).join("");
  $$("#suggestion-list button").forEach(button => button.addEventListener("click", () => { preservedCulturalContext = null; $("#translator-input").value = button.textContent; renderTranslation(); }));
  syncSpeakerNames();
  document.querySelectorAll("[data-speaker-name]").forEach(input => input.addEventListener("input", event => {
    saveSpeakerName(event.target.dataset.speakerName, event.target.value);
  }));
  document.querySelectorAll("[data-speaker-preset]").forEach(select => select.addEventListener("change", event => {
    const role = event.target.dataset.speakerPreset;
    const input = $('[data-speaker-name="' + role + '"]');
    if (event.target.value) {
      if (input) input.value = event.target.value;
      saveSpeakerName(role, event.target.value);
    } else {
      input?.focus();
    }
  }));
  document.querySelectorAll("[data-speaker-role]").forEach(button => bindPushToTalk(button, current => conversationOptions(current.dataset.speakerRole, current)));
  $("#clear-conversation").addEventListener("click", () => { turns = []; renderTurns(); $("#conversation-status").textContent = "Conversation cleared. Nothing was stored."; });
  $("#dictionary-search").addEventListener("input", renderDictionary);
  $$('[data-expression-filter]').forEach(button => button.addEventListener("click", () => {
    expressionFilter = button.dataset.expressionFilter;
    $$('[data-expression-filter]').forEach(item => item.classList.toggle("active", item === button));
    renderDictionary();
  }));
  $$("[data-evidence-filter]").forEach(button => button.addEventListener("click", () => {
    evidenceFilter = button.dataset.evidenceFilter;
    $$("[data-evidence-filter]").forEach(item => item.classList.toggle("active", item === button));
    renderDictionary();
  }));
  $("#reviewer-name").addEventListener("change", event => {
    const pack = readReviewPackage();
    pack.reviewer = event.target.value.trim();
    writeReviewPackage(pack);
  });
  $("#review-prev").addEventListener("click", () => { reviewIndex -= 1; renderReview(); window.scrollTo({top:0,behavior:"smooth"}); });
  $("#review-next").addEventListener("click", () => { reviewIndex += 1; renderReview(); window.scrollTo({top:0,behavior:"smooth"}); });
  $("#copy-review").addEventListener("click", copyReviewSummary);
  $("#share-review").addEventListener("click", shareReviewSummary);
  renderTranslation();
  renderLesson();
  renderMusic();
  loadEvidence();
  if (standaloneTranslator) {
    document.body.classList.add("standalone-translator");
    openView("translator-view");
    setMode("translate");
  }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js?v=47").catch(() => {});
}

document.addEventListener("DOMContentLoaded", init);
