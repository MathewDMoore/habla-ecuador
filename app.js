const phrases = [
  { en:"How are you?", us:"How are you? / How's it going?", uk:"How are you? / You alright?", es:"¿Cómo estás?", natural:"¿Cómo estás? / ¿Qué tal?", note:"Both sound natural in Ecuador. ¿Qué tal? is relaxed and conversational.", register:"Friendly · everyday", keys:["como estas","que tal"] },
  { en:"Maybe another time.", es:"Tal vez en otra ocasión.", natural:"Quizás otro día.", note:"Quizás otro día is the warmer everyday option when declining without sounding final.", register:"Friendly · neutral Ecuador", keys:["tal vez otra vez","talvez un otra vez","quizas otro dia"] },
  { en:"What happened?", us:"What happened? / What's going on?", uk:"What happened? / What's going on?", es:"¿Qué pasó?", natural:"¿Qué pasó? / ¿Qué fue?", note:"¿Qué pasó? works everywhere. ¿Qué fue? is much more informal and depends on the relationship.", register:"Everyday · informal alternative", keys:["que paso","que fue"] },
  { en:"What strength! / You’re so strong!", us:"What strength! / You’re so strong!", uk:"What strength! / You’re so strong!", es:"¡Qué fuerza!", natural:"¡Qué fuerzas!", literalUs:"What forces? / What strengths?", literalUk:"What forces? / What strengths?", note:"As an exclamation admiring a person, natural English focuses on their strength: What strength! or You’re so strong! In a technical discussion, fuerzas means forces; when discussing several abilities or advantages, strengths may fit. Context and punctuation determine the intended sense.", register:"Context-sensitive · exclamation or literal plural", keys:["que fuerzas"] },
  { en:"I don't understand.", es:"No entiendo.", natural:"Disculpa, no entendí bien.", note:"The natural version softens the interruption: Sorry, I didn't quite understand.", register:"Polite · everyday", keys:["no entiendo","no entendi bien"] },
  { en:"Can you say it more slowly?", us:"Could you say that more slowly, please?", uk:"Could you say that again more slowly, please?", es:"¿Puedes decirlo más despacio?", natural:"¿Me puedes repetir más despacio, por favor?", note:"This asks the person to repeat themselves and sounds courteous in a real conversation.", register:"Polite · everyday", keys:["puedes decirlo mas despacio","repetir mas despacio"] },
  { en:"Nice to meet you.", es:"Mucho gusto.", natural:"Mucho gusto, qué gusto conocerte.", note:"Mucho gusto is the safest everyday choice. The longer version adds warmth.", register:"Warm · neutral Ecuador", keys:["mucho gusto","gusto conocerte"] },
  { en:"Do you want to go fishing with me?", us:"Would you like to go fishing with me?", uk:"Would you like to come fishing with me?", es:"¿Quieres ir a pescar conmigo?", natural:"¿Te gustaría ir a pescar conmigo?", note:"¿Te gustaría…? sounds inviting and gives the other person less pressure.", register:"Warm invitation · neutral", keys:["quieres ir a pescar","gustaria ir a pescar"] },
  { en:"I want to go with you.", es:"Quiero ir contigo.", natural:"Me gustaría ir contigo.", note:"The direct version is correct. Me gustaría… can sound gentler when making a new plan.", register:"Friendly · neutral", keys:["quiero ir contigo","gustaria ir contigo"] },
  { en:"I'm tired.", es:"Estoy cansado.", natural:"Estoy cansado, mejor seguimos mañana.", note:"Use cansado for a man and cansada for a woman. The longer version closes the conversation kindly.", register:"Everyday · neutral", keys:["estoy cansado","estoy cansada"] },
  { en:"After eating, I'm walking around the block.", us:"After eating, I'm walking around the block.", uk:"After eating, I'm walking around the block.", es:"Después de comer, estoy caminando alrededor de la cuadra.", natural:"Después de comer, estoy caminando alrededor de la cuadra.", note:"Alrededor de la cuadra means around the block. Aterrorizando means terrifying and is a speech-recognition error in this walking context.", register:"Everyday activity · speech-recognition safeguard", keys:["despues de comer estoy caminando alrededor de la cuadra"] },
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
  { en:"They're going to my workplace.", us:"They're going to my workplace.", uk:"They're going to my workplace.", es:"Van a mi trabajo.", natural:"Van a mi camello.", standardEs:"Van a mi trabajo.", literalUs:"They go to my camel.", literalUk:"They go to my camel.", note:"Here camello is Ecuadorian slang for work, a job, or a workplace—not the animal. In conversation, Van a… can mean they are going now or soon; in a habitual context it can mean they go.", register:"Informal · context-sensitive", warning:"The literal animal meaning remains possible only when the surrounding context is actually about a camel.", culturalEntry:true, keys:["van a mi camello"] },
  { en:"I go back to work on the 21st. Can we do something on the 20th?", es:"Regreso a trabajar el 21. ¿Podemos hacer algo el 20?", natural:"Regreso a trabajar el 21. ¿Te gustaría que hiciéramos algo el 20?", note:"This sounds natural, warm, and neutral in Ecuador. ¿Te gustaría que hiciéramos…? makes the invitation gentler.", register:"Warm invitation · neutral Ecuador", keys:["vuelvo al trabajo el 21 podemos hacer algo el 20","regreso a trabajar el 21"] },
  { en:"I was cleared to go back to work today with no limitations, but I convinced the doctor to give me another week to recover.", es:"Hoy me autorizaron a volver al trabajo sin restricciones, pero convencí al doctor de que me diera una semana más para recuperarme.", natural:"Hoy me dieron el alta para volver al trabajo sin restricciones, pero convencí al doctor de que me diera una semana más para recuperarme.", note:"Me dieron el alta is natural for medical clearance. Para recuperarme sounds more idiomatic than a literal translation of healing time.", register:"Medical/work · neutral Ecuador", keys:["hoy me dieron el alta","me autorizaron a volver al trabajo"] },
];

const APP_VERSION = "0.26.72 · build 182";

const TRANSLATOR_LANGUAGES = {
  "en-US": {label:"U.S. English", family:"en", voice:"en-US"},
  "en-GB": {label:"U.K. English", family:"en", voice:"en-GB"},
  "es-EC": {label:"Ecuadorian Spanish", family:"es", voice:"es-EC"},
  "es-BO": {label:"Bolivian Spanish", family:"es", voice:"es-BO"},
  "es-MX": {label:"Mexican Spanish", family:"es", voice:"es-MX"},
  "es-VE": {label:"Venezuelan Spanish", family:"es", voice:"es-VE"},
  "es-PE": {label:"Peruvian Spanish", family:"es", voice:"es-PE"},
  "es-CO": {label:"Colombian Spanish", family:"es", voice:"es-CO"},
  "es-CU": {label:"Cuban Spanish", family:"es", voice:"es-CU"},
  "es-AR": {label:"Argentina \u00b7 Spanish", family:"es", voice:"es-AR"},
  "es-CL": {label:"Chile \u00b7 Spanish", family:"es", voice:"es-CL"},
  "es-CR": {label:"Costa Rica \u00b7 Spanish", family:"es", voice:"es-CR"},
  "es-DO": {label:"Dominican Republic / Rep\u00fablica Dominicana \u00b7 Spanish", family:"es", voice:"es-DO"},
  "es-SV": {label:"El Salvador \u00b7 Spanish", family:"es", voice:"es-SV"},
  "es-GT": {label:"Guatemala \u00b7 Spanish", family:"es", voice:"es-GT"},
  "es-HN": {label:"Honduras \u00b7 Spanish", family:"es", voice:"es-HN"},
  "es-NI": {label:"Nicaragua \u00b7 Spanish", family:"es", voice:"es-NI"},
  "es-PA": {label:"Panama / Panam\u00e1 \u00b7 Spanish", family:"es", voice:"es-PA"},
  "es-PY": {label:"Paraguay \u00b7 Spanish", family:"es", voice:"es-PY"},
  "es-PR": {label:"Puerto Rico \u00b7 Spanish", family:"es", voice:"es-PR"},
  "es-ES": {label:"Spain / Espa\u00f1a \u00b7 Spanish", family:"es", voice:"es-ES"},
  "es-UY": {label:"Uruguay \u00b7 Spanish", family:"es", voice:"es-UY"},
  "es-GQ": {label:"Equatorial Guinea / Guinea Ecuatorial \u00b7 Spanish", family:"es", voice:"es-GQ"}
};

const culturalExpressions = [
  {category:"idiom", spanish:"De ley.", us:"Definitely. / For sure.", uk:"Definitely. / Absolutely.", note:"A very common informal Ecuadorian way to agree strongly or say something is certain.", naturalness:"Sounds natural in Ecuador", register:"Informal · positive"},
  {category:"idiom", spanish:"Estoy hecho funda.", us:"I'm completely wiped out.", uk:"I'm completely shattered.", note:"A vivid Ecuadorian expression for being exhausted, battered, emotionally low, or very drunk. Context matters.", naturalness:"Sounds natural in Ecuador", register:"Very informal · context-sensitive"},
  {category:"slang", spanish:"¡Qué bacán!", us:"That's cool! / That's great!", uk:"That's brilliant! / That's great!", note:"Bacán is widely understood, but it is especially comfortable and natural in everyday Ecuadorian speech.", naturalness:"Sounds natural in Ecuador", register:"Informal · enthusiastic"},
  {category:"slang", spanish:"Chuta, qué pena.", us:"Oh no, that's disappointing.", uk:"Oh no, that's a shame.", note:"Chuta can show surprise, frustration, sympathy, or disappointment. The speaker's tone supplies much of the meaning.", naturalness:"Ecuador meanings attested by ASALE", verification:"Source-attested", register:"Informal · mild exclamation", intensity:"Mild", source:{name:"ASALE · Diccionario de americanismos",url:"https://www.asale.org/damer/%C2%A1chuta%21"}},
  {category:"slang", spanish:"acolitar", us:"to help / support / back someone up", uk:"to help / support / back someone up", exampleEs:"¿Me acolitas con esto?", exampleUs:"Can you help me with this?", exampleUk:"Can you give me a hand with this?", note:"In Ecuador, acolitar can mean supporting someone, helping with an activity, or backing up an idea.", naturalness:"Ecuador meaning attested by ASALE", verification:"Source-attested", register:"Informal · friendly · not vulgar", intensity:"Mild", comparisons:["Colombia: ASALE records the same support or solidarity sense."], source:{name:"ASALE · Diccionario de americanismos",url:"https://www.asale.org/damer/acolitar"}},
  {category:"slang", spanish:"camello", embeddedReplacements:{camello:"trabajo"}, literalUs:"camel", literalUk:"camel", standardEs:"trabajo / empleo / lugar de trabajo", us:"work / job / workplace", uk:"work / job / workplace", exampleEs:"Ya me voy al camello.", exampleUs:"I'm heading to work now.", exampleUk:"I'm off to work now.", note:"The ordinary literal meaning is camel. In Ecuadorian slang, camello can instead refer to work, a job, or the place where someone works. The surrounding sentence determines the meaning.", naturalness:"Ecuador slang meaning attested by ASALE", verification:"Source-attested", register:"Popular · informal · not vulgar", intensity:"Mild", warning:"Do not translate camello as work unless the context clearly concerns employment or somebody's livelihood.", comparisons:["Mexico: the work or job sense is also recorded.","Bolivia: ASALE records a shoemaking tool sense instead, so context matters."], literalSource:{name:"RAE · Diccionario de la lengua española",url:"https://dle.rae.es/camello"}, source:{name:"ASALE · Diccionario de americanismos",url:"https://www.asale.org/damer/camello"}},
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
  wholeDocumentTools?.pause('Paused because the language settings changed. Saved progress keeps its original languages.');
  direction = translatorRoute();
  englishVariant = targetLanguage === "en-GB" || (languageFamily(targetLanguage) !== "en" && sourceLanguage === "en-GB") ? "uk" : "us";
  if (persist) localStorage.setItem(TRANSLATOR_PAIR_STORAGE_KEY, JSON.stringify({source:sourceLanguage,target:targetLanguage}));
  const sourceSelect = $("#source-language-select");
  const targetSelect = $("#target-language-select");
  if (sourceSelect) sourceSelect.value = sourceLanguage;
  if (targetSelect) targetSelect.value = targetLanguage;
  wholeDocumentTools?.refresh();
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
let lessonLanguagePreference = "";
try { lessonLanguagePreference = localStorage.getItem("habla-lesson-language-v1") || ""; } catch {}

function lessonTargetLocale(preference=lessonLanguagePreference, ui=window.HablaUI?.language || "en") {
  return ["es-EC","en-US","en-GB"].includes(preference) ? preference : ui === "es" ? "en-US" : "es-EC";
}
let turns = [];
let liveConversationTurn = null;
let conversationGeneration = 0;
const CONVERSATION_PLAYBACK_KEY = "habla-ecuador-conversation-playback-v1";
let conversationPlayback = localStorage.getItem(CONVERSATION_PLAYBACK_KEY) === "text" ? "text" : "spoken";
let conversationActive = false;
let conversationComposerBusy = false;
const CONVERSATION_LOCALES_KEY = "habla-ecuador-conversation-locales-v1";
let conversationLocaleOverrides = {};
try {
  const saved=JSON.parse(localStorage.getItem(CONVERSATION_LOCALES_KEY)||"{}");
  for(const role of ['english','spanish'])if(Object.hasOwn(TRANSLATOR_LANGUAGES,saved?.[role]))conversationLocaleOverrides[role]=saved[role];
} catch {}
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
let documentImportActive = false;
let documentLoading = false;
let importedDocument = null;
let documentImportRequest = 0;
let wholeDocumentTools = null;
let comparisonContext = null;
let comparisonChanges = [];
let comparisonPurpose = "everyday";
let activeTranslationEdit = null;
let translationEdits = readTranslationEdits();
let preservedCulturalContext = null;
let speechVoices = [];
let speechRequestId = 0;
let activeSpeechPlayback = null;
const REVIEW_STORAGE_KEY = "habla-ecuador-review-v1";
const VOICE_STORAGE_KEY = "habla-ecuador-voice-preferences-v1";
const SPEAKER_NAMES_STORAGE_KEY = "habla-ecuador-speaker-names-v1";
let voicePreferences = readVoicePreferences();
let speakerNames = readSpeakerNames();
const SPEAKER_REGIONS_STORAGE_KEY = "habla-ecuador-speaker-regions-v1";
let speakerRegions = readSpeakerRegions();

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

const DEFAULT_SPEAKER_REGIONS = {
  Maria:{country:"es-EC",city:"Guayaquil"}, Eddie:{country:"es-CU",city:"Holguín",region:"Oriente"},
  Silvia:{country:"es-BO",city:""}, Grayson:{country:"es-VE",city:"Caracas"}, Ayssel:{country:"es-MX",city:""}
};
function speakerRegionKey(name) { return String(name).trim().normalize("NFC").toLowerCase(); }
function readSpeakerRegions() {
  try {
    const saved=JSON.parse(localStorage.getItem(SPEAKER_REGIONS_STORAGE_KEY)||"{}");
    return saved && typeof saved==="object" && !Array.isArray(saved) ? saved : {};
  } catch { return {}; }
}
function speakerRegionProfile(name) {
  const key=speakerRegionKey(name);
  const saved=Object.hasOwn(speakerRegions,key) ? speakerRegions[key] : null;
  const fallback=Object.entries(DEFAULT_SPEAKER_REGIONS).find(([name])=>speakerRegionKey(name)===key)?.[1];
  const profile=saved && typeof saved==="object" ? saved : fallback || {};
  return {name:typeof profile.name==="string" ? profile.name.slice(0,24) : String(name).slice(0,24),
    country:Object.hasOwn(TRANSLATOR_LANGUAGES,profile.country||"") ? profile.country : "",
    city:typeof profile.city==="string" ? profile.city.slice(0,80) : "",
    region:typeof profile.region==="string" ? profile.region.slice(0,80) : "",
    locales:profile.locales && typeof profile.locales==="object" ? profile.locales : {}};
}
const PERSON_COUNTRY_LABELS = {
  "en-US":"United States / Estados Unidos", "en-GB":"United Kingdom / Reino Unido",
  "es-EC":"Ecuador", "es-BO":"Bolivia", "es-MX":"Mexico / México", "es-VE":"Venezuela",
  "es-PE":"Peru / Perú", "es-CO":"Colombia", "es-CU":"Cuba", "es-AR":"Argentina",
  "es-CL":"Chile", "es-CR":"Costa Rica", "es-DO":"Dominican Republic / República Dominicana",
  "es-SV":"El Salvador", "es-GT":"Guatemala", "es-HN":"Honduras", "es-NI":"Nicaragua",
  "es-PA":"Panama / Panamá", "es-PY":"Paraguay", "es-PR":"Puerto Rico", "es-ES":"Spain / España",
  "es-UY":"Uruguay", "es-GQ":"Equatorial Guinea / Guinea Ecuatorial"
};
// Country-specific suggestions from country-region-data (MIT); see docs/region-data-license.txt.
const PERSON_REGION_OPTIONS = {
  "en-US": [
    "Alabama",
    "Alaska",
    "American Samoa",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "District of Columbia",
    "Micronesia",
    "Florida",
    "Georgia",
    "Guam",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Marshall Islands",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Northern Mariana Islands",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Palau",
    "Pennsylvania",
    "Puerto Rico",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virgin Islands",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "Armed Forces Americas",
    "Armed Forces Europe, Canada, Africa and Middle East",
    "Armed Forces Pacific"
  ],
  "en-GB": [
    "England",
    "Scotland",
    "Wales",
    "Northern Ireland",
    "Aberdeen City",
    "Aberdeenshire",
    "Angus",
    "Antrim and Newtownabbey",
    "Ards and North Down",
    "Argyll and Bute",
    "Armagh City, Banbridge and Craigavon",
    "Barking and Dagenham",
    "Barnet",
    "Barnsley",
    "Bath and North East Somerset",
    "Bedford",
    "Belfast City",
    "Berkshire",
    "Bexley",
    "Birmingham",
    "Blackburn with Darwen",
    "Blackpool",
    "Blaenau Gwent",
    "Bolton",
    "Bournemouth, Christchurch and Poole",
    "Bracknell Forest",
    "Bradford",
    "Brent",
    "Bridgend",
    "Brighton and Hove",
    "Bristol, City of",
    "Bromley",
    "Buckinghamshire",
    "Bury",
    "Caerphilly",
    "Calderdale",
    "Cambridgeshire",
    "Camden",
    "Cardiff",
    "Carmarthenshire",
    "Causeway Coast and Glens",
    "Central Bedfordshire",
    "Ceredigion",
    "Cheshire East",
    "Cheshire West and Chester",
    "Clackmannanshire",
    "Conwy",
    "Cornwall",
    "Coventry",
    "Croydon",
    "Cumbria",
    "Darlington",
    "Denbighshire",
    "Derby",
    "Derbyshire",
    "Derry and Strabane",
    "Devon",
    "Doncaster",
    "Dorset",
    "Dudley",
    "Dumfries and Galloway",
    "Dundee City",
    "Durham, County",
    "Ealing",
    "East Ayrshire",
    "East Dunbartonshire",
    "East Lothian",
    "East Renfrewshire",
    "East Riding of Yorkshire",
    "East Sussex",
    "Edinburgh, City of",
    "Eilean Siar",
    "Enfield",
    "Essex",
    "Falkirk",
    "Fermanagh and Omagh",
    "Fife",
    "Flintshire",
    "Gateshead",
    "Glasgow City",
    "Gloucestershire",
    "Greenwich",
    "Gwynedd",
    "Hackney",
    "Halton",
    "Hammersmith and Fulham",
    "Hampshire",
    "Haringey",
    "Harrow",
    "Hartlepool",
    "Havering",
    "Herefordshire",
    "Hertfordshire",
    "Highland",
    "Hillingdon",
    "Hounslow",
    "Inverclyde",
    "Isle of Anglesey",
    "Isle of Wight",
    "Isles of Scilly",
    "Islington",
    "Kensington and Chelsea",
    "Kent",
    "Kingston upon Hull",
    "Kingston upon Thames",
    "Kirklees",
    "Knowsley",
    "Lambeth",
    "Lancashire",
    "Leeds",
    "Leicester",
    "Leicestershire",
    "Lewisham",
    "Lincolnshire",
    "Lisburn and Castlereagh",
    "Liverpool",
    "London",
    "Luton",
    "Manchester",
    "Medway",
    "Merthyr Tydfil",
    "Merton",
    "Mid and East Antrim",
    "Mid-Ulster",
    "Middlesbrough",
    "Midlothian",
    "Milton Keynes",
    "Monmouthshire",
    "Moray",
    "Neath Port Talbot",
    "Newcastle upon Tyne",
    "Newham",
    "Newport",
    "Newry, Mourne and Down",
    "Norfolk",
    "North Ayrshire",
    "North East Lincolnshire",
    "North Lanarkshire",
    "North Lincolnshire",
    "North Somerset",
    "North Tyneside",
    "North Yorkshire",
    "Northamptonshire",
    "Northumberland",
    "Nottingham",
    "Nottinghamshire",
    "Oldham",
    "Orkney Islands",
    "Oxfordshire",
    "Pembrokeshire",
    "Perth and Kinross",
    "Peterborough",
    "Plymouth",
    "Portsmouth",
    "Powys",
    "Reading",
    "Redbridge",
    "Redcar and Cleveland",
    "Renfrewshire",
    "Rhondda Cynon Taff",
    "Richmond upon Thames",
    "Rochdale",
    "Rotherham",
    "Rutland",
    "Salford",
    "Sandwell",
    "Scottish Borders",
    "Sefton",
    "Sheffield",
    "Shetland Islands",
    "Shropshire",
    "Slough",
    "Solihull",
    "Somerset",
    "South Ayrshire",
    "South Gloucestershire",
    "South Lanarkshire",
    "South Tyneside",
    "Southampton",
    "Southend-on-Sea",
    "Southwark",
    "St. Helens",
    "Staffordshire",
    "Stirling",
    "Stockport",
    "Stockton-on-Tees",
    "Stoke-on-Trent",
    "Suffolk",
    "Sunderland",
    "Surrey",
    "Sutton",
    "Swansea",
    "Swindon",
    "Tameside",
    "Telford and Wrekin",
    "Thurrock",
    "Torbay",
    "Torfaen",
    "Tower Hamlets",
    "Trafford",
    "Vale of Glamorgan, The",
    "Wakefield",
    "Walsall",
    "Waltham Forest",
    "Wandsworth",
    "Warrington",
    "Warwickshire",
    "West Berkshire",
    "West Dunbartonshire",
    "West Lothian",
    "West Sussex",
    "Westminster",
    "Wigan",
    "Wiltshire",
    "Windsor and Maidenhead",
    "Wirral",
    "Wokingham",
    "Wolverhampton",
    "Worcestershire",
    "Wrexham",
    "York"
  ],
  "es-EC": [
    "Azuay",
    "Bolívar",
    "Cañar",
    "Carchi",
    "Chimborazo",
    "Cotopaxi",
    "El Oro",
    "Esmeraldas",
    "Galápagos",
    "Guayas",
    "Imbabura",
    "Loja",
    "Los Ríos",
    "Manabí",
    "Morona-Santiago",
    "Napo",
    "Orellana",
    "Pastaza",
    "Pichincha",
    "Santa Elena",
    "Santo Domingo de los Tsáchilas",
    "Sucumbíos",
    "Tungurahua",
    "Zamora-Chinchipe"
  ],
  "es-BO": [
    "Beni",
    "Chuquisaca",
    "Cochabamba",
    "La Paz",
    "Oruro",
    "Pando",
    "Potosí",
    "Santa Cruz",
    "Tarija"
  ],
  "es-MX": [
    "Aguascalientes",
    "Baja California",
    "Baja California Sur",
    "Campeche",
    "Ciudad de México",
    "Chiapas",
    "Chihuahua",
    "Coahuila de Zaragoza",
    "Colima",
    "Durango",
    "Estado de México",
    "Guanajuato",
    "Guerrero",
    "Hidalgo",
    "Jalisco",
    "Michoacán de Ocampo",
    "Morelos",
    "Nayarit",
    "Nuevo León",
    "Oaxaca",
    "Puebla",
    "Querétaro de Arteaga",
    "Quintana Roo",
    "San Luis Potosí",
    "Sinaloa",
    "Sonora",
    "Tabasco",
    "Tamaulipas",
    "Tlaxcala",
    "Veracruz",
    "Yucatán",
    "Zacatecas"
  ],
  "es-VE": [
    "Dependencias Federales",
    "Distrito Federal",
    "Amazonas",
    "Anzoátegui",
    "Apure",
    "Aragua",
    "Barinas",
    "Bolívar",
    "Carabobo",
    "Cojedes",
    "Delta Amacuro",
    "Falcón",
    "Guárico",
    "Lara",
    "Mérida",
    "Miranda",
    "Monagas",
    "Nueva Esparta",
    "Portuguesa",
    "Sucre",
    "Táchira",
    "Trujillo",
    "Vargas",
    "Yaracuy",
    "Zulia"
  ],
  "es-PE": [
    "Amazonas",
    "Ancash",
    "Apurimac",
    "Arequipa",
    "Ayacucho",
    "Cajamarca",
    "Callao",
    "Cusco",
    "Huancavelica",
    "Huanuco",
    "Ica",
    "Junin",
    "La Libertad",
    "Lambayeque",
    "Lima",
    "Loreto",
    "Madre de Dios",
    "Moquegua",
    "Municipalidad Metropolitana de Lima",
    "Pasco",
    "Piura",
    "Puno",
    "San Martin",
    "Tacna",
    "Tumbes",
    "Ucayali"
  ],
  "es-CO": [
    "Amazonas",
    "Antioquia",
    "Arauca",
    "Archipiélago de San Andrés",
    "Atlántico",
    "Bogotá D.C.",
    "Bolívar",
    "Boyacá",
    "Caldas",
    "Caquetá",
    "Casanare",
    "Cauca",
    "Cesar",
    "Chocó",
    "Córdoba",
    "Cundinamarca",
    "Guainía",
    "Guaviare",
    "Huila",
    "La Guajira",
    "Magdalena",
    "Meta",
    "Nariño",
    "Norte de Santander",
    "Putumayo",
    "Quindío",
    "Risaralda",
    "Santander",
    "Sucre",
    "Tolima",
    "Valle del Cauca",
    "Vaupés",
    "Vichada"
  ],
  "es-CU": [
    "Artemisa",
    "Camagüey",
    "Ciego de Ávila",
    "Cienfuegos",
    "Granma",
    "Guantánamo",
    "Holguín",
    "Isla de la Juventud",
    "La Habana",
    "Las Tunas",
    "Matanzas",
    "Mayabeque",
    "Pinar del Río",
    "Sancti Spíritus",
    "Santiago de Cuba",
    "Villa Clara"
  ],
  "es-AR": [
    "Buenos Aires",
    "Capital Federal",
    "Catamarca",
    "Chaco",
    "Chubut",
    "Córdoba",
    "Corrientes",
    "Entre Ríos",
    "Formosa",
    "Jujuy",
    "La Pampa",
    "La Rioja",
    "Mendoza",
    "Misiones",
    "Neuquén",
    "Río Negro",
    "Salta",
    "San Juan",
    "San Luis",
    "Santa Cruz",
    "Santa Fe",
    "Santiago del Estero",
    "Tierra del Fuego",
    "Tucumán"
  ],
  "es-CL": [
    "Aisén del General Carlos Ibáñez del Campo",
    "Antofagasta",
    "Araucanía",
    "Arica y Parinacota",
    "Atacama",
    "Bío-Bío",
    "Coquimbo",
    "Libertador General Bernardo O'Higgins",
    "Los Lagos",
    "Los Ríos",
    "Magallanes y Antartica Chilena",
    "Maule",
    "Ñuble",
    "Región Metropolitana de Santiago",
    "Tarapacá",
    "Valparaíso"
  ],
  "es-CR": [
    "Alajuela",
    "Cartago",
    "Guanacaste",
    "Heredia",
    "Limón",
    "Puntarenas",
    "San José"
  ],
  "es-DO": [
    "Cibao Central",
    "Del Valle",
    "Distrito Nacional",
    "Enriquillo",
    "Norcentral",
    "Nordeste",
    "Noroeste",
    "Norte",
    "Valdesia"
  ],
  "es-SV": [
    "Ahuachapán",
    "Cabañas",
    "Cuscatlán",
    "Chalatenango",
    "La Libertad",
    "La Paz",
    "La Unión",
    "Morazán",
    "San Miguel",
    "San Salvador",
    "Santa Ana",
    "San Vicente",
    "Sonsonate",
    "Usulután"
  ],
  "es-GT": [
    "Alta Verapaz",
    "Baja Verapaz",
    "Chimaltenango",
    "Chiquimula",
    "El Progreso",
    "Escuintla",
    "Guatemala",
    "Huehuetenango",
    "Izabal",
    "Jalapa",
    "Jutiapa",
    "Petén",
    "Quetzaltenango",
    "Quiché",
    "Retalhuleu",
    "Sacatepéquez",
    "San Marcos",
    "Santa Rosa",
    "Sololá",
    "Suchitepéquez",
    "Totonicapán",
    "Zacapa"
  ],
  "es-HN": [
    "Atlántida",
    "Choluteca",
    "Colón",
    "Comayagua",
    "Copán",
    "Cortés",
    "El Paraíso",
    "Francisco Morazán",
    "Gracias a Dios",
    "Intibucá",
    "Islas de la Bahía",
    "La Paz",
    "Lempira",
    "Ocotepeque",
    "Olancho",
    "Santa Bárbara",
    "Valle",
    "Yoro"
  ],
  "es-NI": [
    "Boaco",
    "Carazo",
    "Chinandega",
    "Chontales",
    "Estelí",
    "Granada",
    "Jinotega",
    "León",
    "Madriz",
    "Managua",
    "Masaya",
    "Matagalpa",
    "Nueva Segovia",
    "Río San Juan",
    "Rivas",
    "Atlántico Norte",
    "Atlántico Sur"
  ],
  "es-PA": [
    "Bocas del Toro",
    "Chiriquí",
    "Coclé",
    "Colón",
    "Darién",
    "Emberá",
    "Herrera",
    "Kuna Yala",
    "Los Santos",
    "Naso Tjër Di",
    "Ngäbe-Buglé",
    "Panamá",
    "Panamá Oeste",
    "Veraguas"
  ],
  "es-PY": [
    "Alto Paraguay",
    "Alto Parana",
    "Amambay",
    "Asuncion",
    "Caaguazu",
    "Caazapa",
    "Canindeyu",
    "Central",
    "Concepcion",
    "Cordillera",
    "Boqueron",
    "Guaira",
    "Itapua",
    "Misiones",
    "Neembucu",
    "Paraguari",
    "Presidente Hayes",
    "San Pedro"
  ],
  "es-PR": [
    "Adjuntas",
    "Aguada",
    "Aguadilla",
    "Aguas Buenas",
    "Aibonito",
    "Anasco",
    "Arecibo",
    "Arroyo",
    "Barceloneta",
    "Barranquitas",
    "Bayamon",
    "Cabo Rojo",
    "Caguas",
    "Camuy",
    "Canovanas",
    "Carolina",
    "Cat",
    "Ceiba",
    "Ciales",
    "Cidra",
    "Coamo",
    "Comerio",
    "Corozal",
    "Culebra",
    "Dorado",
    "Fajardo",
    "Florida",
    "Guanica",
    "Guayama",
    "Guayanilla",
    "Guaynabo",
    "Gurabo",
    "Hatillo",
    "Hormigueros",
    "Humacao",
    "Isabe",
    "Juana Diaz",
    "Juncos",
    "Lajas",
    "Lares",
    "Las Marias",
    "Las oiza",
    "Luquillo",
    "Manati",
    "Maricao",
    "Maunabo",
    "Mayaguez",
    "Moca",
    "Morovis",
    "Naguabo",
    "Naranjito",
    "Orocovis",
    "Patillas",
    "Penuelas",
    "Ponce",
    "Quebradillas",
    "Rincon",
    "Rio Grande",
    "Sabana linas",
    "San German",
    "San Juan",
    "San Lorenzo",
    "San Sebastian",
    "Santa Isabel",
    "Toa Alta",
    "Toa Baja",
    "Trujillo Alto",
    "Utuado",
    "Vega Alta",
    "Vega ues",
    "Villalba",
    "Yabucoa",
    "Yauco"
  ],
  "es-ES": [
    "Andalucìa",
    "Albacete",
    "Alicante",
    "Almería",
    "Araba/Álava",
    "Asturias",
    "Ávila",
    "Aragòn",
    "Badajoz",
    "Barcelona",
    "Bizkaia",
    "Burgos",
    "Cáceres",
    "Cádiz",
    "Canarias",
    "Cantabria",
    "Castellón/Castelló",
    "Ceuta",
    "Ciudad Real",
    "Córdoba",
    "A Coruña",
    "Cuenca",
    "Gipuzkoa",
    "Girona",
    "Granada",
    "Guadalajara",
    "Huelva",
    "Huesca",
    "Illes Balears",
    "Jaén",
    "León",
    "Lleida",
    "Lugo",
    "Madrid",
    "Málaga",
    "Melilla",
    "Murcia",
    "Navarra/Nafarroa",
    "Ourense",
    "Palencia",
    "Las Palmas",
    "Pontevedra",
    "La Rioja",
    "Salamanca",
    "Santa Cruz de Tenerife",
    "Segovia",
    "Sevilla",
    "Soria",
    "Tarragona",
    "Teruel",
    "Toledo",
    "Valencia/València",
    "Valladolid",
    "Zamora",
    "Zaragoza"
  ],
  "es-UY": [
    "Artigas",
    "Canelones",
    "Cerro Largo",
    "Colonia",
    "Durazno",
    "Flores",
    "Florida",
    "Lavalleja",
    "Maldonado",
    "Montevideo",
    "Paysandú",
    "Río Negro",
    "Rivera",
    "Rocha",
    "Salto",
    "San José",
    "Soriano",
    "Tacuarembó",
    "Treinta y Tres"
  ],
  "es-GQ": [
    "Annobón",
    "Bioko Norte",
    "Bioko Sur",
    "Centro Sur",
    "Kié-Ntem",
    "Litoral",
    "Wele-Nzas"
  ]
};
function speakerRegionOptions(country,current="") {
  const saved=Object.values(speakerRegions).filter(profile=>profile && profile.country===country && typeof profile.region==="string").map(profile=>profile.region.trim().slice(0,80));
  return [...new Set([...(PERSON_REGION_OPTIONS[country]||[]),...saved,current].filter(Boolean))].sort((a,b)=>a.localeCompare(b,"es"));
}
function syncSpeakerRegionPicker(role,profile) {
  const picker=document.querySelector('[data-person-region-choice="'+role+'"]');
  if(!picker)return;
  const prompt=profile.country ? "Choose region / Elige región" : "Choose country first / Elige primero un país";
  picker.innerHTML='<option value="" disabled>'+prompt+'</option><option value="">Clear region / Borrar región</option>'
    + speakerRegionOptions(profile.country,profile.region).map(value=>'<option value="'+escapeHtml(value)+'">'+escapeHtml(value)+'</option>').join("");
  picker.value=profile.region;
}
// A small city suggestion list, supplemented with this device's saved places.
const PERSON_CITY_OPTIONS = {
  "en-US": [
    [
      "Laramie",
      "Wyoming"
    ],
    [
      "Casper",
      "Wyoming"
    ],
    [
      "Cheyenne",
      "Wyoming"
    ],
    [
      "Denver",
      "Colorado"
    ]
  ],
  "en-GB": [
    [
      "London",
      "London"
    ],
    [
      "Edinburgh",
      "Scotland"
    ],
    [
      "Cardiff",
      "Wales"
    ]
  ],
  "es-EC": [
    [
      "Guayaquil",
      "Guayas"
    ],
    [
      "Quito",
      "Pichincha"
    ],
    [
      "Cuenca",
      "Azuay"
    ]
  ],
  "es-BO": [
    [
      "La Paz",
      "La Paz"
    ],
    [
      "Santa Cruz de la Sierra",
      "Santa Cruz"
    ],
    [
      "Cochabamba",
      "Cochabamba"
    ]
  ],
  "es-MX": [
    [
      "Guadalajara",
      "Jalisco"
    ],
    [
      "Ciudad de México",
      "Ciudad de México"
    ],
    [
      "Monterrey",
      "Nuevo León"
    ]
  ],
  "es-VE": [
    [
      "Caracas",
      "Distrito Capital"
    ],
    [
      "Maracaibo",
      "Zulia"
    ]
  ],
  "es-CU": [
    [
      "Holguín",
      "Holguín"
    ],
    [
      "La Habana",
      "La Habana"
    ],
    [
      "Santiago de Cuba",
      "Santiago de Cuba"
    ]
  ],
  "es-PE": [
    [
      "Lima",
      "Municipalidad Metropolitana de Lima"
    ],
    [
      "Cusco",
      "Cusco"
    ]
  ],
  "es-CO": [
    [
      "Bogotá",
      "Distrito Capital"
    ],
    [
      "Medellín",
      "Antioquia"
    ]
  ],
  "es-AR": [
    [
      "Buenos Aires",
      "Capital Federal"
    ],
    [
      "Córdoba",
      "Córdoba"
    ]
  ],
  "es-CL": [
    [
      "Santiago",
      "Región Metropolitana de Santiago"
    ],
    [
      "Valparaíso",
      "Valparaíso"
    ]
  ],
  "es-CR": [
    [
      "San José",
      "San José"
    ]
  ],
  "es-DO": [
    [
      "Santo Domingo",
      "Distrito Nacional"
    ]
  ],
  "es-SV": [
    [
      "San Salvador",
      "San Salvador"
    ]
  ],
  "es-GT": [
    [
      "Ciudad de Guatemala",
      "Guatemala"
    ]
  ],
  "es-HN": [
    [
      "Tegucigalpa",
      "Francisco Morazán"
    ]
  ],
  "es-NI": [
    [
      "Managua",
      "Managua"
    ]
  ],
  "es-PA": [
    [
      "Ciudad de Panamá",
      "Panamá"
    ]
  ],
  "es-PY": [
    [
      "Asunción",
      "Asunción"
    ]
  ],
  "es-PR": [
    [
      "San Juan",
      "San Juan"
    ]
  ],
  "es-ES": [
    [
      "Madrid",
      "Madrid"
    ],
    [
      "Barcelona",
      "Barcelona"
    ]
  ],
  "es-UY": [
    [
      "Montevideo",
      "Montevideo"
    ]
  ],
  "es-GQ": [
    [
      "Malabo",
      "Bioko Norte"
    ]
  ]
};
function speakerCityOptions(country,city="",region="") {
  const choices=new Map((PERSON_CITY_OPTIONS[country]||[]).map(([city,region])=>[normalize(city),{city,region}]));
  for(const profile of Object.values(speakerRegions))if(profile && profile.country===country && typeof profile.city==='string' && profile.city.trim()) {
    const city=profile.city.trim().slice(0,80),key=normalize(city);
    if(!choices.has(key))choices.set(key,{city,region:typeof profile.region==='string'?profile.region.slice(0,80):''});
  }
  if(city&&!choices.has(normalize(city)))choices.set(normalize(city),{city,region});
  return [...choices.values()].sort((a,b)=>a.city.localeCompare(b.city,'es'));
}
// Explicit choices remain usable without opening a platform select menu.
function syncVisibleLocationChoices(role,profile) {
  for(const kind of ['country','region','city']) {
    const panel=document.querySelector('[data-location-options="'+role+'-'+kind+'"]');
    const list=panel?.querySelector('[data-location-choices]');
    if(!list)continue;
    const choices=kind==='country' ? Object.entries(PERSON_COUNTRY_LABELS) : kind==='region' ? speakerRegionOptions(profile.country,profile.region).map(value=>[value,value]) : speakerCityOptions(profile.country,profile.city,profile.region).map(place=>[place.city,[place.city,place.region].filter(Boolean).join(' · ')]);
    const current=kind==='country' ? profile.country : kind==='region' ? profile.region : profile.city;
    const label=kind==='country' ? 'countries / países' : kind==='region' ? 'regions / regiones' : 'cities / ciudades';
    panel.querySelector('summary').textContent='Show '+choices.length+' '+label;
    list.innerHTML=[['','Clear / Borrar'],...choices].map(([value,text])=>'<button type="button" data-location-pick="'+kind+'" data-location-role="'+role+'" data-location-value="'+escapeHtml(value)+'" aria-pressed="'+(value===current)+'">'+escapeHtml(text)+'</button>').join('');
    const search=panel.querySelector('[data-location-search]');
    if(search)search.value='';
    const empty=panel.querySelector('[data-location-empty]');
    if(empty){empty.hidden=choices.length>0;empty.textContent=kind!=='country'&&!profile.country ? 'Choose a country above to see its places / Elige un país arriba para ver sus lugares' : 'No matching choices / No hay coincidencias';}
    if(!current)panel.open=true;
  }
}
function speakerCountryLabel(country) { return PERSON_COUNTRY_LABELS[country] || ""; }
function conversationProfileRegion(name) {
  const profile=speakerRegionProfile(name);
  return [profile.city,profile.region,speakerCountryLabel(profile.country)].filter(Boolean).join(", ") || "Region not set / Región sin indicar";
}
function syncSpeakerRegion(role) {
  const name=speakerName(role), profile=speakerRegionProfile(name), region=conversationProfileRegion(name);
  const badge=document.querySelector('[data-speaker-region="'+role+'"]');
  if(badge)badge.textContent=region;
  const country=document.querySelector('[data-person-country="'+role+'"]');
  if(country && country.options) {
    if(!country.options.length) {
      country.innerHTML='<option value="">Not set / Sin indicar</option>'
        + Object.entries(PERSON_COUNTRY_LABELS).map(([value,label])=>'<option value="'+value+'">'+escapeHtml(label)+'</option>').join("");
    }
    country.value=profile.country;
  }
  const area=document.querySelector('[data-person-region="'+role+'"]');
  if(area)area.value=profile.region;
  syncSpeakerRegionPicker(role,profile);
  syncVisibleLocationChoices(role,profile);
  const city=document.querySelector('[data-person-city="'+role+'"]');
  if(city)city.value=profile.city;
  const person=document.querySelector('[data-person-region-name="'+role+'"]');
  if(person)person.textContent=name;
  const picker=document.querySelector('#conversation-text-speaker');
  const hint=document.querySelector('[data-conversation-text-profile]');
  if(hint&&picker?.value===role)hint.textContent=name+" · "+region+" · "+speakerSlotLanguageLabel(role);
}
function persistSpeakerProfile(name,profile) {
  profile.name=String(name).trim().slice(0,24);
  Object.defineProperty(speakerRegions,speakerRegionKey(name),{value:profile,enumerable:true,writable:true,configurable:true});
  try { localStorage.setItem(SPEAKER_REGIONS_STORAGE_KEY,JSON.stringify(speakerRegions)); }
  catch { showToast("Region changed for this session; device storage is unavailable."); }
}
function applySpeakerLocale(role) {
  const profile=speakerRegionProfile(speakerName(role));
  const locale=profile.locales[role] || (languageFamily(profile.country)===(role==="spanish"?"es":"en") ? profile.country : "");
  if(locale)setConversationLocale(role,locale,false);
}
function saveSpeakerRegion(role,country,city,region) {
  if(!["english","spanish"].includes(role) || (country && !Object.hasOwn(TRANSLATOR_LANGUAGES,country)))return;
  const name=speakerName(role), profile=speakerRegionProfile(name);
  for(const r of ["english","spanish"])if(speakerRegionKey(speakerName(r))===speakerRegionKey(name))profile.locales[r]=conversationLocales()[r];
  profile.country=country;profile.city=String(city||"").trim().slice(0,80);
  if(region!==undefined)profile.region=String(region||"").trim().slice(0,80);

  persistSpeakerProfile(name,profile);
  syncSpeakerNames();

}

function speakerRegionIndex(query="") {
  const names=[...Object.keys(DEFAULT_SPEAKER_REGIONS),speakerName("english"),speakerName("spanish")];
  document.querySelectorAll('[data-speaker-preset="spanish"] option').forEach(option=>{
    if(option.value && option.parentElement?.label!=="Roles and other")names.push(option.value);
  });
  Object.entries(speakerRegions).forEach(([key,profile])=>{
    if(profile && typeof profile==="object")names.push(typeof profile.name==="string" ? profile.name : key);
  });
  const unique=new Map();
  names.forEach(value=>{const name=String(value).trim().slice(0,24);if(name&&!unique.has(speakerRegionKey(name)))unique.set(speakerRegionKey(name),name);});
  const search=normalize(query);
  return [...unique.values()].map(name=>{
    const profile=speakerRegionProfile(name);
    const country=speakerCountryLabel(profile.country);
    return {name,city:profile.city,region:profile.region,country,location:conversationProfileRegion(name)};
  }).filter(person=>!search||normalize([person.name,person.city,person.region,person.country].join(" ")).includes(search))
    .sort((a,b)=>a.name.localeCompare(b.name,"es"));
}
function renderSpeakerRegionIndex() {
  const results=document.querySelector('[data-people-index-results]');
  if(!results)return;
  const query=document.querySelector('#people-region-search')?.value||"";
  const people=speakerRegionIndex(query);
  results.innerHTML=people.map(person=>`<article class="person-index-item">
    <div><strong data-ui-content>${escapeHtml(person.name)}</strong><p>${escapeHtml(person.city||"City not specified / Ciudad sin indicar")}</p><p>${escapeHtml(person.region||"Region/state not specified / Región o estado sin indicar")}</p><p>${escapeHtml(person.country||"Country not specified / País sin indicar")}</p></div>
    <div class="person-index-actions"><button type="button" data-ui-content data-index-person="${escapeHtml(person.name)}" data-index-role="english" aria-label="${escapeHtml(person.name)} · Person 1 / Persona 1" aria-pressed="${speakerRegionKey(speakerName("english"))===speakerRegionKey(person.name)}">Person 1 / Persona 1</button><button type="button" data-ui-content data-index-person="${escapeHtml(person.name)}" data-index-role="spanish" aria-label="${escapeHtml(person.name)} · Person 2 / Persona 2" aria-pressed="${speakerRegionKey(speakerName("spanish"))===speakerRegionKey(person.name)}">Person 2 / Persona 2</button><button type="button" class="person-index-edit" data-ui-content data-edit-person="${escapeHtml(person.name)}" aria-label="${escapeHtml(person.name)} · Edit location / Editar ubicación">Edit location / Editar ubicación</button></div>
  </article>`).join("");
  const status=document.querySelector('[data-people-index-status]');
  if(status)status.textContent=people.length ? `${people.length} people / personas` : "No matches / Sin resultados";
}

function syncConversationProfiles() {
  document.querySelectorAll('[data-conversation-profile]').forEach(button => {
    button.setAttribute('aria-pressed',String(speakerName(button.dataset.conversationProfile)===button.dataset.profileName));
  });
}

function saveSpeakerName(role, value) {
  speakerNames[role] = String(value || "").trim().slice(0,24) || (role === "spanish" ? "Maria" : "Mathew");
  localStorage.setItem(SPEAKER_NAMES_STORAGE_KEY, JSON.stringify(speakerNames));
  syncConversationProfiles();
  syncSpeakerRegion(role);
  applySpeakerLocale(role);
  const label = $('[data-speaker-label="' + role + '"]');
  if (label) label.textContent = speakerNames[role];
  const textLabel = $('[data-conversation-text-name="' + role + '"]');
  if(textLabel)textLabel.textContent = speakerNames[role]+" · "+conversationProfileRegion(speakerNames[role])+" · "+speakerSlotLanguageLabel(role);
  const preset = $('[data-speaker-preset="' + role + '"]');
  if (preset) preset.value = Array.from(preset.options).some(option => option.value === speakerNames[role]) ? speakerNames[role] : "";
  syncConversationLocaleUi();
  renderSpeakerRegionIndex();
}

function syncSpeakerNames() {
  renderSpeakerRegionIndex();
  syncConversationProfiles();
  document.querySelectorAll('[data-conversation-profile]').forEach(button=>{
    const small=button.querySelector('small');if(small)small.textContent=conversationProfileRegion(button.dataset.profileName);
  });
  document.querySelectorAll('[data-speaker-preset] option,#conversation-text-speaker optgroup option').forEach(option=>{
    if(!option.value)return;
    const name=option.value.includes('::') ? option.value.split('::')[1] : option.value;
    option.textContent=name+" · "+conversationProfileRegion(name);
  });
  ["english","spanish"].forEach(role => {
    const name = speakerName(role);
    speakerNames[role] = name;
    syncSpeakerRegion(role);
    const input = $('[data-speaker-name="' + role + '"]');
    if (input) input.value = name;
    const preset = $('[data-speaker-preset="' + role + '"]');
    if (preset) preset.value = Array.from(preset.options).some(option => option.value === name) ? name : "";
    const label = $('[data-speaker-label="' + role + '"]');
    if (label) label.textContent = name;
    const textLabel = $('[data-conversation-text-name="' + role + '"]');
    if(textLabel)textLabel.textContent = name+" · "+conversationProfileRegion(name)+" · "+speakerSlotLanguageLabel(role);
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

function containsWholePhrase(text, phrase) {
  return ` ${text} `.includes(` ${phrase} `);
}

function matchesPhraseCandidate(clean, candidate) {
  const normalized = normalize(candidate);
  if (!normalized) return false;
  if (normalized === clean) return true;
  const cleanWords = clean.split(" ");
  const candidateWords = normalized.split(" ");
  if (Math.min(cleanWords.length,candidateWords.length) < 2) return false;
  return containsWholePhrase(clean,normalized) || containsWholePhrase(normalized,clean);
}

function matchPhrase(value, way=direction) {
  const clean = normalize(value);
  if (!clean) return null;
  const phraseMatch = phrases.find(phrase => {
    const candidates = way === "en-ec" ? [phrase.en, phrase.us, phrase.uk] : [phrase.es, phrase.natural, ...(phrase.keys || [])];
    return candidates.filter(Boolean).some(candidate => matchesPhraseCandidate(clean,candidate));
  });
  if (phraseMatch) return phraseMatch;
  if (way !== "ec-en") return null;
  const culturalMatch = culturalExpressions.find(entry => matchesPhraseCandidate(clean,entry.spanish));
  return culturalMatch ? {...culturalMatch, culturalEntry:true} : null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^{}$()|[\]\\]/g, "\\$&");
}

function prepareEmbeddedEcuadorianSlang(text, way=direction) {
  if (way !== "ec-en" || translationPurpose === "academic" || !['es-EC','es-MX','es-CO'].includes(sourceLanguage)) return {text, entries:[]};
  let rewritten = text;
  const matchedEntries = [];
  culturalExpressions.forEach(entry => {
    Object.entries(entry.embeddedReplacements || {}).forEach(([term,replacement]) => {
      const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
      if (!pattern.test(rewritten)) return;
      let changed=false;
      rewritten = rewritten.replace(pattern,(word,index,whole)=>{
        const before=whole.slice(0,index).split(/[.!?\n]/).at(-1),after=whole.slice(index+word.length).split(/[.!?\n]/)[0];
        const context=before+word+after;
        if(term==='camello' && (typeof HablaSpanishContext==='undefined' || !HablaSpanishContext.workSense(context) || /"[^"\n]*camello[^"\n]*"|“[^”]*camello[^”]*”/i.test(context)))return word;
        changed=true;return replacement;
      });
      if(changed)matchedEntries.push(entry);
    });
  });
  return {text:rewritten, entries:[...new Set(matchedEntries)]};
}

function openView(id) {
  if (typeof HablaQuickLessons !== "undefined") HablaQuickLessons.leave();
  if (typeof HablaRecordedPractice !== "undefined") HablaRecordedPractice.leave();
  cancelDictionaryPractice();
  if (activeRecognitionButton?.id === "lesson-mic" && id !== "lesson-view") cancelListening(false);
  if (id !== "translator-view") cancelMusicListening();
  if(id !== "translator-view") leaveConversation();
  $$(".view").forEach(view => view.classList.toggle("active", view.id === id));
  $$(".bottom-nav button").forEach(button => button.classList.toggle("active", button.dataset.open === id));
  window.scrollTo({top:0, behavior:typeof HablaTutorial!=="undefined"&&HablaTutorial.isOpen()?"instant":"smooth"});
  if (id === "lesson-view") { renderLesson(); renderSourcePractice(); }
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

function updateSpeechPauseControls() {
  const supported = "speechSynthesis" in window
    && typeof speechSynthesis.speak === "function" && typeof speechSynthesis.cancel === "function";
  for (const selector of ["#pause-result", "#pause-conversation", "#pause-paper"]) {
    const button = $(selector);
    if (!button) continue;
    const paused = !!activeSpeechPlayback?.paused;
    button.disabled = !supported || !activeSpeechPlayback;
    button.textContent = paused ? "▶ Resume" : "⏸ Pause";
    button.setAttribute("aria-label", paused ? "Resume spoken translation" : "Pause spoken translation");
    button.setAttribute("aria-pressed", String(paused));
  }
}

// Request the media-playback route for a spoken lesson, not an inherited ambient
// or recording route. Feature-detect this newer Safari API; never activate at boot.
function claimSpeechAudioSession(session) {
  if (session.audioRoute) return;
  try {
    const audio = typeof navigator !== "undefined" ? navigator.audioSession : null;
    if (!audio || typeof audio.type !== "string") return;
    const previous = audio.type;
    audio.type = "playback";
    session.audioRoute = {audio,previous};
  } catch { /* Older browsers and restricted contexts keep their normal route. */ }
}

function releaseSpeechAudioSession(session) {
  const route = session?.audioRoute;
  if (!route) return;
  session.audioRoute = null;
  try {
    // A microphone or another media owner may already have changed the mode.
    if (route.audio.type === "playback") route.audio.type = route.previous;
  } catch {}
}

function speechPlaybackFeedback(session, message, busy=false) {
  const button = session?.button;
  if (!button?.isConnected) return;
  button.setAttribute("aria-busy",String(busy));
  const host = button.closest(".dictionary-practice, .phrase-card, .map-card") || button.parentElement;
  if (!host) return;
  let status = host.querySelector(":scope > .speech-action-status");
  if (!status) {
    status = document.createElement("p");
    status.className = "speech-action-status status";
    status.setAttribute("role","status");
    host.append(status);
  }
  status.textContent = message;
}

function stopSpeechPlayback() {
  const stoppedSession = activeSpeechPlayback;
  const hadUtterance = Boolean(activeSpeechPlayback?.utterance);
  clearTimeout(activeSpeechPlayback?.startTimer);
  speechPlaybackFeedback(activeSpeechPlayback,"Audio stopped.");
  speechRequestId += 1;
  activeSpeechPlayback = null;
  if (hadUtterance && "speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
  releaseSpeechAudioSession(stoppedSession);
  // Do not activate Safari's speech audio session while nothing is speaking.
  // The next actual speech segment resumes the synthesizer when needed.
  updateSpeechPauseControls();
}

function splitSpeechPlaybackText(text, limit=220) {
  const chunks = [];
  for (const sentence of text.split(/(?<=[.!?])\s+|\n+/u)) {
    let current = "";
    for (const word of sentence.trim().split(/\s+/)) {
      if (!word) continue;
      if (current && current.length + word.length + 1 > limit) {
        chunks.push(current);
        current = "";
      }
      current += (current ? " " : "") + word;
    }
    if (current) chunks.push(current);
  }
  return chunks;
}

function startSpeechSegment(session) {
  if (activeSpeechPlayback !== session || session.paused || !session.chunks || session.utterance) return;
  while (session.index < session.chunks.length && session.offset >= session.chunks[session.index].length) {
    session.index += 1;
    session.offset = 0;
  }
  if (session.index >= session.chunks.length) {
    activeSpeechPlayback = null;
    releaseSpeechAudioSession(session);
    speechPlaybackFeedback(session,"Audio finished.");
    updateSpeechPauseControls();
    return;
  }
  const baseOffset = session.offset;
  const token = ++session.token;
  const utterance = new SpeechSynthesisUtterance(session.chunks[session.index].slice(baseOffset));
  session.utterance = utterance;
  if (session.voice) utterance.voice = session.voice;
  utterance.lang = session.voice?.lang || session.lang;
  utterance.rate = session.profile.rate;
  utterance.pitch = session.profile.pitch;
  utterance.volume = session.profile.volume;
  const current = () => activeSpeechPlayback === session && session.token === token;
  utterance.onstart = () => {
    if (!current()) return;
    clearTimeout(session.startTimer);
    speechPlaybackFeedback(session,"Playing audio.",true);
  };
  utterance.onboundary = event => {
    if (!current() || session.paused || !Number.isInteger(event.charIndex)) return;
    let position = Math.min(session.chunks[session.index].length, baseOffset + Math.max(0,event.charIndex));
    // Re-enter at the current word, never halfway through a word or past it.
    while (position > 0 && position < session.chunks[session.index].length
        && !/\s/.test(session.chunks[session.index][position-1])) position -= 1;
    session.offset = Math.max(session.offset,position);
  };
  utterance.onend = () => {
    if (!current() || session.paused) return;
    clearTimeout(session.startTimer);
    session.utterance = null;
    session.index += 1;
    session.offset = 0;
    setTimeout(() => startSpeechSegment(session),80);
  };
  utterance.onerror = event => {
    if (!current()) return;
    clearTimeout(session.startTimer);
    activeSpeechPlayback = null;
    releaseSpeechAudioSession(session);
    updateSpeechPauseControls();
    const message = ["canceled","interrupted"].includes(event.error)
      ? "Audio stopped. Tap Hear again to retry."
      : "Audio could not start. Tap Hear again to retry.";
    speechPlaybackFeedback(session,message);
    if (!["canceled", "interrupted"].includes(event.error)) showToast(message);
  };
  document.documentElement.dataset.activeSpeechLanguage = normalizedLocale(utterance.lang);
  // Some Safari failures emit neither start nor error. Never leave a silent
  // button with no explanation, and never retry outside a fresh user gesture.
  session.startTimer = setTimeout(() => {
    if (!current()) return;
    activeSpeechPlayback = null;
    speechSynthesis.cancel();
    releaseSpeechAudioSession(session);
    updateSpeechPauseControls();
    speechPlaybackFeedback(session,"Audio did not start. Tap Hear again to retry.");
  },6000);
  claimSpeechAudioSession(session);
  try {
    speechSynthesis.resume?.();
    speechSynthesis.speak(utterance);
  } catch {
    utterance.onerror({error:"synthesis-failed"});
  }
}

function toggleSpeechPause() {
  const session = activeSpeechPlayback;
  if (!session) return;
  session.paused = !session.paused;
  // The app owns Pause/Resume. Native paused flags and delayed pause/end events
  // must never overwrite the user's choice or discard the remembered position.
  updateSpeechPauseControls();
  if (session.paused) {
    clearTimeout(session.startTimer);
    speechPlaybackFeedback(session,"Audio paused.");
    const hadUtterance = Boolean(session.utterance);
    session.token += 1;
    session.utterance = null;
    if(hadUtterance)speechSynthesis.cancel();
    releaseSpeechAudioSession(session);
  } else {
    startSpeechSegment(session);
  }
}

function say(text, lang="es-EC", button=null) {
  if (typeof HablaRecordedPractice !== "undefined") HablaRecordedPractice.pause();
  cancelMusicListening();
  stopSpeechPlayback();
  const session = {requestId:speechRequestId, paused:false, token:0, index:0, offset:0,
    utterance:null, startTimer:null, lang, button};
  const unavailable = message => { speechPlaybackFeedback(session,message); showToast(message); };
  if (!text || !("speechSynthesis" in window)) return unavailable("Speech playback is unavailable in this browser.");
  refreshSpeechVoices();
  session.voice = voiceForLanguage(lang);
  if (speechVoices.length && !session.voice) {
    const label = normalizedLocale(lang).startsWith("es") ? "Spanish" : "English";
    return unavailable(`${label} speech is unavailable on this device.`);
  }
  // An empty getVoices() list can be temporary. Submit the requested language
  // now rather than waiting for enumeration and losing the tap's activation.
  session.profile = speechProfile(text,lang);
  session.chunks = splitSpeechPlaybackText(session.profile.text);
  activeSpeechPlayback = session;
  speechPlaybackFeedback(session,"Starting audio…",true);
  updateSpeechPauseControls();
  // The first speak() must remain inside the button's trusted activation.
  startSpeechSegment(session);
}

let activeRecognitionButton = null;

function setListeningButton(button, listening, finishing=false) {
  if (!button) return;
  button.classList.toggle("listening", listening);
  button.setAttribute("aria-pressed", listening ? "true" : "false");
  if (button === $("#music-listen") && $("#input-mic")?.closest?.(".view")?.id === "music-view") {
    setListeningButton($("#input-mic"), listening, finishing);
  }
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
  if (error === "session-timeout") return "Speech recognition stalled and was reset. Tap the microphone to retry or use keyboard dictation.";
  return "Speech recognition stopped unexpectedly. Please tap the microphone and try again.";
}

function correctSpeechRecognitionTranscript(text, lang="") {
  if (!normalizedLocale(lang).startsWith("es")) return {text, corrected:false, reason:""};
  const walkingContext = /\bcaminando\s+aterrorizando\s+la\s+cuadra\b/i;
  if (!walkingContext.test(text)) return {text, corrected:false, reason:""};
  return {
    text:text.replace(/\baterrorizando\s+la\s+cuadra\b/gi,"alrededor de la cuadra"),
    corrected:true,
    reason:"Walking context: corrected ‘aterrorizando la cuadra’ to ‘alrededor de la cuadra’."
  };
}

function startListening({way=direction, lang, button, onText, onEnd, onCancel, onStart, onAudioStart, onSpeechStart, onError, formatError=recognitionErrorMessage, continuous=false, commitOnEnd=false, correctTranscript=true}={}) {
  if (typeof HablaRecordedPractice !== "undefined") HablaRecordedPractice.pause();
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return showToast("Live speech recognition is unavailable here. Typing and audio playback still work.");

  if (recognition) {
    if (activeRecognitionButton === button) return stopListening();
    cancelListening(true);
  }

  // Do not let an older playback enter this microphone recording.
  stopSpeechPlayback();

  const instance = new Recognition();
  recognition = instance;
  activeRecognitionButton = button || null;
  instance.lang = lang || (way === "en-ec" ? "en-US" : "es-EC");
  instance.interimResults = true;
  instance.continuous = continuous;
  instance.maxAlternatives = 1;
  let latestText = "";
  let latestFinal = false;
  let latestMetadata = {};
  let committed = false;
  let finalized = false;
  let finishDeadline = null;
  // WebKit can deliver start/audiostart but never send end after stop/error.
  // Keep deadlines strictly tied to this recognizer; stale callbacks must not
  // clear a newer recording or overwrite a learner's existing words.
  instance._hablaFinish = () => {
    if (recognition !== instance || finalized) return;
    finalized = true;
    clearTimeout(finishDeadline);
    finishDeadline = null;
    instance.commitTranscript(true);
    setListeningButton(button, false);
    recognition = null;
    activeRecognitionButton = null;
    onEnd?.();
  };
  instance._hablaArmFinishDeadline = (delay=3000, reportStall=true) => {
    if (recognition !== instance || finalized) return;
    clearTimeout(finishDeadline);
    finishDeadline = setTimeout(() => {
      if (recognition !== instance || finalized) return;
      // Abort the stalled backend before freeing the UI. A late native/web
      // event from this instance is ignored by the identity check above.
      try { instance.abort(); } catch {}
      if (reportStall) onError?.("session-timeout");
      instance._hablaFinish();
    }, delay);
  };
  instance._hablaClearFinishDeadline = () => {
    finalized = true;
    clearTimeout(finishDeadline);
    finishDeadline = null;
  };
  instance.cancelTranscript = onCancel;
  instance.commitTranscript = (provisional=false) => {
    if (recognition !== instance || committed || !latestText) return;
    committed = true;
    // A native backend may report session-end while it still contains
    // tentative words. Ending a session does not certify its transcript.
    const tentative = typeof latestMetadata.tentativeText === "string"
      && latestMetadata.tentativeText.trim().length > 0;
    provisional = Boolean(provisional || tentative);
    if (commitOnEnd && latestFinal && !tentative) provisional = false;
    onText?.(latestText, true, {...latestMetadata, provisional});
    if (provisional && !continuous) showToast("Dictated text kept. Check the wording: the microphone ended before confirming it.");
  };

  instance.onstart = () => { if (recognition === instance) { setListeningButton(button, true); onStart?.(); } };
  instance.onaudiostart = () => { if (recognition === instance) onAudioStart?.(); };
  instance.onspeechstart = () => { if (recognition === instance) onSpeechStart?.(); };
  instance.onresult = event => {
    if (recognition !== instance || committed || !event.results.length) return;
    const results = Array.from(event.results);
    const rawText = results.map(result => result[0].transcript).join(" ").trim();
    const isFinal = results.every(result => result.isFinal);
    latestFinal = isFinal;
    const correction = correctTranscript ? correctSpeechRecognitionTranscript(rawText, instance.lang) : {text:rawText};
    latestText = correction.text;
    latestMetadata = typeof event.confirmedText === "string"
      ? {confirmedText:event.confirmedText, tentativeText:event.tentativeText || ""} : {};
    if (isFinal && correction.corrected) showToast(correction.reason);
    if (isFinal && !continuous && !commitOnEnd) instance.commitTranscript();
    else if (latestText || typeof latestMetadata.confirmedText === "string") onText?.(latestText, false, latestMetadata);
  };
  instance.onerror = event => {
    if (recognition !== instance) return;
    onError?.(event.error);
    if (event.error !== "aborted") {
      showToast(formatError(event.error));
      instance._hablaArmFinishDeadline(1600, false);
    }
  };
  instance.onend = instance._hablaFinish;

  try {
    instance.start();
    setListeningButton(button, true);
  } catch {
    instance._hablaClearFinishDeadline();
    setListeningButton(button, false);
    recognition = null;
    activeRecognitionButton = null;
    showToast("The microphone could not start. Please tap it again.");
    onError?.("start-failed");
    onEnd?.();
  }
}

function cancelListening(preserveTranscript=false) {
  if (!recognition) return;
  const instance = recognition;
  if (preserveTranscript) instance.commitTranscript?.(true);
  instance._hablaClearFinishDeadline?.();
  recognition = null;
  setListeningButton(activeRecognitionButton, false);
  activeRecognitionButton = null;
  try { instance.abort(); } catch {}
  instance.cancelTranscript?.();
}

let musicListening = null;
let musicTranscriptReview = false;
let musicCapturedText = "";
let musicCapturedLanguage = "";
let musicCapturedConfirmedText = null;
let musicCapturedTentativeText = "";
let musicFullTranslation = null;
let musicPassages = [];
let musicPassageID = 0;
let selectedMusicPassage = null;
let musicReviewRequest = 0;
let musicReviewBusy = false;

function currentMusicPassage() {
  return musicPassages.find(passage => passage.id === selectedMusicPassage);
}

function syncMusicReview() {
  const panel = $("#music-review");
  if (!panel) return;
  panel.hidden = !musicPassages.length;
  $("#music-review-heading").textContent = `Review captured passages (${musicPassages.length})`;
  const select = $("#music-review-passage");
  select.replaceChildren();
  musicPassages.forEach(passage => {
    const option = document.createElement("option");
    option.value = String(passage.id);
    option.textContent = `Passage ${passage.id} · ${languageLabel(passage.target)}`;
    select.append(option);
  });
  if (!currentMusicPassage()) selectedMusicPassage = musicPassages[0]?.id ?? null;
  select.value = String(selectedMusicPassage ?? "");
  const passage = currentMusicPassage();
  $("#music-review-source").value = passage?.source || "";
  $("#music-review-draft").value = passage?.draft || "";
  $("#music-review-source").setAttribute("lang",passage?.language || "es");
  $("#music-review-draft").setAttribute("lang",passage?.target || "en");
  $("#music-review-pair").textContent = passage ? `${languageLabel(passage.language)} → ${languageLabel(passage.target)}` : "";
  $("#music-review-source").readOnly = Boolean(musicListening);
  $("#music-review-draft").readOnly = Boolean(musicListening);
  $("#music-review-translate").disabled = Boolean(musicListening || musicReviewBusy || !passage?.source.trim());
  $("#music-review-status").textContent = musicListening
    ? "Paired drafts stay available while listening. Stop to correct the captured words or English."
    : passage?.status || "Check the captured words against what you heard. Correct them here, then translate this passage again.";
}

function keepMusicPassage(source, draft, session) {
  musicPassages.unshift({id:++musicPassageID,source,draft,language:session.lang,
    target:session.live.target,way:session.live.way,purpose:session.live.purpose,status:""});
  musicPassages = musicPassages.slice(0,20);
  syncMusicReview();
}

function editMusicPassage() {
  if (musicListening) return;
  const passage = currentMusicPassage();
  if (!passage) return;
  musicReviewRequest += 1;
  passage.source = $("#music-review-source").value;
  passage.draft = $("#music-review-draft").value;
  passage.status = "Passage edits kept for this session. Translate again after correcting captured words.";
  $("#music-review-status").textContent = passage.status;
  $("#music-review-translate").disabled = musicReviewBusy || !passage.source.trim();
}

async function translateReviewedMusicPassage() {
  const passage = currentMusicPassage();
  if (musicListening || musicReviewBusy || !passage?.source.trim()) return;
  const source = passage.source.trim(), previousDraft = passage.draft;
  if (utf8Length(source) > 450) {
    passage.status = "Keep this passage within 450 UTF-8 bytes. Use the main text box for longer text.";
    syncMusicReview();
    return;
  }
  const token = ++musicReviewRequest;
  const onDevice = typeof HablaOffline !== "undefined" && HablaOffline.shouldUse();
  const current = () => !musicListening && token === musicReviewRequest
    && currentMusicPassage() === passage && passage.source.trim() === source
    && passage.draft === previousDraft
    && $("#music-review-source").value.trim() === source
    && $("#music-review-draft").value === previousDraft
    && onDevice === (typeof HablaOffline !== "undefined" && HablaOffline.shouldUse());
  musicReviewBusy = true;
  passage.status = "Translating this corrected passage…";
  syncMusicReview();
  try {
    const draft = await requestGeneralTranslation(source,passage.way,
      {purpose:passage.purpose,source:passage.language,target:passage.target,onDevice,isCurrent:current,inputType:"music"});
    if (!current()) return;
    passage.draft = draft;
    passage.status = "Updated draft. Review its meaning against the captured words; either field is editable.";
  } catch (error) {
    if (!current()) return;
    const message = translationErrorMessage(error);
    passage.status = `${message.title} ${message.help} Your passage and previous draft are kept.`;
  } finally {
    musicReviewBusy = false;
    if (passage.status === "Translating this corrected passage…") passage.status = "The passage or translation route changed. Check your edits, then translate again.";
    syncMusicReview();
  }
}

// Live music drafts use one recent passage, rather than re-translating a growing
// song on every interim result. Capture remains independent of translation errors.
function recentMusicPassage(text) {
  const words = text.trim().split(/\s+/);
  const selected = [];
  for (let index = words.length - 1; index >= 0; index--) {
    const candidate = [words[index], ...selected].join(" ");
    if (utf8Length(candidate) > 450) break;
    selected.unshift(words[index]);
  }
  return selected.join(" ");
}

function nextMusicLivePassage(text, previous="") {
  const words = text.trim().split(/\s+/), old = previous.trim().split(/\s+/);
  const key = word => word.toLowerCase().replace(/[¿¡.,!?;:]/g, "");
  let shared = 0;
  while (shared < Math.min(words.length,old.length) && key(words[shared]) === key(old[shared])) shared += 1;
  // An arbitrary five-word overlap can cut off the subject or governing verb.
  // Resume only at a sentence/segment boundary before the revised words.
  const matches = [...text.trim().matchAll(/[^\s]+/g)];
  const revisionStart = matches[Math.min(shared,matches.length-1)]?.index || 0;
  let start = 0;
  for (const boundary of text.trim().matchAll(/[.!?]\s+|\n+/g)) {
    const end = boundary.index + boundary[0].length;
    if (end <= revisionStart) start = end;
  }
  const passage = text.trim().slice(start).trim();
  // A long unpunctuated clause needs review; never silently chop its beginning.
  return utf8Length(passage) <= 450 ? passage : "";
}

function bilingualMusicEnabled() {
  return typeof HablaBilingualMusic !== "undefined" && $("#music-source-mode")?.value === "auto";
}

function musicTranslationRequestCost(text,source,target,purpose="everyday") {
  if (!bilingualMusicEnabled() || purpose === "academic") return 1;
  return HablaBilingualMusic.plan(text,{source,target}).parts.reduce((sum,part) => sum +
    (part.language && part.language !== languageFamily(target)
      ? splitLongTranslationText(part.text.trim()).filter(chunk=>!chunk.separator).length : 0),0);
}

function musicFragmentReason(passage, language, checkBoth=false) {
  if (checkBoth) return musicFragmentReason(passage,"es-EC") || musicFragmentReason(passage,"en-US");
  if (!passage) return "This passage is too long without a clear sentence break. Stop to review and split the captured words.";
  const ending = passage.toLowerCase().replace(/[.!?…,:;¿¡]+$/g, "").trim();
  const dangling = languageFamily(language) === "es"
    ? /\b(?:que|porque|aunque|pero|para|con|sin|del|al|el|la|los|las|un|una|de|en|por|y|o|que\s+(?:ya|no|yo|tú|él|ella|nosotros|ellos|ellas))$/u
    : /\b(?:because|although|but|with|without|of|to|the|a|an|and|or|that\s+(?:i|you|he|she|we|they)|(?:i|you|he|she|we|they)(?:'re|'s|\s+(?:am|are|is))\s+(?:already|not))$/u;
  // "Turn it on" is complete; a fee/commission "on" needs its object.
  const missingEnglishObject = languageFamily(language) === "en"
    && /\b(?:commissions?|fees?|charges?|tax(?:es)?|interest|based|depend(?:s|ing)?)\s+on$/u.test(ending);
  return dangling.test(ending) || missingEnglishObject
    ? "The captured phrase ends mid-clause. Waiting for more words; stop to correct it if recognition missed the rest."
    : "";
}

function resetMusicLivePreview() {
  if ($("#music-live-preview")) $("#music-live-preview").hidden = true;
  if ($("#music-live-draft")) { $("#music-live-draft").value = ""; $("#music-live-draft").readOnly = true; }
  if ($("#music-live-source")) $("#music-live-source").textContent = "";
  if ($("#music-live-status")) $("#music-live-status").textContent = "";
  if ($("#music-live-pending")) { $("#music-live-pending").hidden = true; $("#music-live-pending").textContent = ""; }
  if ($("#music-live-retry")) $("#music-live-retry").hidden = true;
}

function queueMusicLiveDraft(session) {
  const live = session.live;
  if (!live?.enabled || live.failed || live.busy || live.timer || session.stopping || musicListening !== session) return;
  const delay = typeof HablaOffline !== "undefined" && HablaOffline.shouldUse() ? 1000 : 3000;
  live.timer = setTimeout(() => { live.timer = null; translateMusicLivePassage(session); }, delay);
}

function musicLiveSource(session) {
  if(session.live.mode === "quick" && session.confirmedSource !== null && session.tentativeText)return $("#translator-input").value.trim();
  return session.confirmedSource ?? $("#translator-input").value.trim();
}

function musicLiveProvisional(session) {
  return session.live.mode === "quick" && session.confirmedSource !== null && Boolean(session.tentativeText);
}

function updateMusicLiveRetry(session) {
  const button=$("#music-live-retry");
  if(button)button.hidden=!session?.live.enabled||!session.live.failed||!session.live.errorCode;
}

function retryMusicLiveDraft() {
  const session=musicListening;
  if(!session||session.stopping||session.live.busy||!session.live.enabled)return;
  session.live.failed=false;session.live.errorCode="";session.live.errorMessage="";
  session.live.revision+=1;
  clearTimeout(session.live.timer);session.live.timer=null;
  updateMusicLiveRetry(session);
  $("#music-live-status").textContent="Retrying translation of the latest captured words. Listening continues.";
  queueMusicLiveDraft(session);
}

function setMusicLiveUpdateMode(mode) {
  const value=mode === "quick" ? "quick" : "confirmed";
  $("#music-live-update-mode").value=value;
  localStorage.setItem("habla-ecuador-music-live-update-v1",value);
  if(musicListening) {
    musicListening.live.mode=value;
    musicListening.live.lastProvisional=false;
    refreshMusicLiveRoute();
  }
}

function showMusicLiveDraftKind(session,onDevice) {
  const live=session.live;
  $("#music-live-label").textContent=`${languageLabel(live.target)} · ${live.lastProvisional ? "unconfirmed quick preview" : "latest passage draft"}`;
  $("#music-live-status").textContent=live.lastProvisional
    ? "Quick preview includes tentative recognition. Words and translation can change; it is not saved as a finalized passage."
    : session.confirmedSource !== null
      ? "Draft uses finalized recognition passages. Finalized words can still be wrong; check them against the song."
      : `Live draft checks new words about every ${onDevice ? 1 : 3} seconds, plus translation time. Missed lyrics still need review.`;
}

function showTentativeMusicWords(session) {
  if (session.confirmedSource === null || !session.tentativeText) return false;
  $("#music-live-pending").hidden = false;
  $("#music-live-pending").textContent = `Tentative recognition — waiting for confirmation: ${session.tentativeText}`;
  return true;
}

function setMusicLiveEnabled(enabled) {
  const session = musicListening;
  if (!session) return;
  const live = session.live;
  live.enabled = enabled;
  live.revision += 1;
  clearTimeout(live.timer); live.timer = null;
  $("#music-live-pending").hidden = true;
  if (!enabled) {
    $("#music-live-status").textContent = "Live draft paused. Capturing words continues.";
  } else {
    live.failed = false;
    live.errorMessage = "";
    live.errorCode = "";
    live.lastSource = "";
    $("#music-live-status").textContent = "Live draft on. Waiting for the next passage…";
    queueMusicLiveDraft(session);
  }
  updateMusicLiveRetry(session);
}

function refreshMusicLiveRoute() {
  const session = musicListening;
  if (!session) return;
  const live = session.live;
  live.target = targetLanguage; live.purpose = translationPurpose; live.way = direction;
  live.lastPassage = "";
  if ($("#music-live-preview")) $("#music-live-preview").hidden = true;
  setMusicLiveEnabled(live.enabled);
}

async function translateMusicLivePassage(session) {
  const live = session.live;
  const source = musicLiveSource(session);
  const provisional=musicLiveProvisional(session);
  if (musicListening !== session || session.stopping || !live.enabled || live.failed || live.busy
      || sourceLanguage !== session.lang || targetLanguage !== live.target
      || translationPurpose !== live.purpose) return;
  if (!source || source === live.lastSource) {
    if(!source&&live.lastProvisional) {
      $("#music-live-preview").hidden=true;
      live.lastSource="";live.lastPassage="";live.lastProvisional=false;
    } else if(source===live.lastSource&&live.lastProvisional&&!provisional) {
      live.lastProvisional=false;
      showMusicLiveDraftKind(session,typeof HablaOffline !== "undefined"&&HablaOffline.shouldUse());
      keepMusicPassage(live.lastPassage,$("#music-live-draft").value,session);
    }
    if (showTentativeMusicWords(session)) $("#music-live-status").textContent = "Waiting for recognition to finalize new words. Tentative words remain above for review.";
    return;
  }
  if (languageFamily(session.lang) === languageFamily(live.target) && !bilingualMusicEnabled()) {
    live.failed = true;
    live.errorMessage = "Live drafts need Spanish ↔ English. Regional comparisons remain available after capture.";
    $("#music-live-status").textContent = live.errorMessage;
    return;
  }
  const passage = nextMusicLivePassage(source,live.lastSource);
  const fragmentReason = musicFragmentReason(passage,session.lang,bilingualMusicEnabled());
  if (fragmentReason) {
    $("#music-live-status").textContent = fragmentReason + (live.lastPassage ? " The previous paired draft remains below." : "");
    $("#music-live-pending").hidden = false;
    $("#music-live-pending").textContent = `Waiting for a complete phrase: ${passage || source}`;
    return;
  }
  if (passage.split(/\s+/).length < 3 || passage === live.lastPassage) return;
  if (!showTentativeMusicWords(session)) $("#music-live-pending").hidden = true;
  const onDevice = typeof HablaOffline !== "undefined" && HablaOffline.shouldUse();
  const requestCost=musicTranslationRequestCost(passage,session.lang,live.target,live.purpose);
  if (!onDevice && (live.requests + requestCost > 30 || live.characters + (requestCost ? passage.length : 0) > 2500)) {
    live.failed = true;
    live.errorMessage = "Online live draft paused to protect the free allowance. Use the downloaded on-device translation pack for longer live drafts, or translate the collected words after Stop.";
    $("#music-live-status").textContent = live.errorMessage + " Capturing continues.";
    return;
  }
  const revision = live.revision;
  const current = () => musicListening === session && !session.stopping && live.enabled
    && live.revision === revision && sourceLanguage === session.lang && targetLanguage === live.target
    && translationPurpose === live.purpose
    && onDevice === (typeof HablaOffline !== "undefined" && HablaOffline.shouldUse());
  live.busy = true;
  if (!onDevice) { live.requests += requestCost; live.characters += requestCost ? passage.length : 0; }
  $("#music-live-status").textContent = "Translating the latest captured passage…";
  try {
    const draft = await requestGeneralTranslation(passage,live.way,
      {purpose:live.purpose,source:session.lang,target:live.target,onDevice,isCurrent:current,inputType:"music"});
    if (!current()) return;
    live.lastSource = source;
    live.lastPassage = passage;
    live.lastProvisional=provisional;
    $("#music-live-preview").hidden = false;
    $("#music-live-source").textContent = passage;
    $("#music-live-draft").value = draft;
    $("#music-live-draft").readOnly = true;
    if(!provisional)keepMusicPassage(passage,draft,session);
    showMusicLiveDraftKind(session,onDevice);
  } catch (error) {
    if (!current()) return;
    live.failed = true;
    live.errorCode=error.code||"service";
    const message = translationErrorMessage(error);
    live.errorMessage = `${message.title} ${message.help}`;
    $("#music-live-status").textContent = `Live draft paused. ${live.errorMessage} Capturing words continues.`;
    updateMusicLiveRetry(session);
  } finally {
    live.busy = false;
    if (musicListening === session && !session.stopping && (source !== musicLiveSource(session) || provisional !== musicLiveProvisional(session) || revision !== live.revision)) queueMusicLiveDraft(session);
  }
}

function musicContinuationAvailable() {
  return Boolean(musicCapturedText && musicCapturedLanguage === sourceLanguage
    && musicCapturedText === $("#translator-input").value.trim());
}

function updateMusicListenLabel() {
  if (!musicListening && $("#music-listen")) $("#music-listen").textContent = musicContinuationAvailable() ? "Continue listening" : "Listen to music";
}

function updateMusicSourceHelp() {
  const bluetooth = $("#music-playback-source")?.value === "phone-bluetooth";
  if ($("#bluetooth-music-help")) $("#bluetooth-music-help").hidden = !bluetooth;
}

function handleMusicPlayerPlay(player, players) {
  // Selecting a song does not stop an active music capture. Only other tracks
  // are paused, preserving the existing single-track playback rule.
  players.forEach(otherPlayer => {
    if (otherPlayer !== player && !otherPlayer.paused) otherPlayer.pause();
  });
}

function cancelMusicListening(preserveTranscript=true) {
  const session = musicListening;
  if (!session) return;
  session.stopping = true;
  if (recognition && activeRecognitionButton === $("#music-listen")) cancelListening(preserveTranscript);
  else session.finish();
}

function newMusicSong() {
  musicFullTranslation = null;
  cancelMusicListening();
  saveActiveTranslationEdit();
  musicCapturedText = "";
  musicCapturedLanguage = "";
  musicCapturedConfirmedText = null;
  musicCapturedTentativeText = "";
  musicTranscriptReview = false;
  resetMusicLivePreview();
  musicReviewRequest += 1;
  musicPassages = []; selectedMusicPassage = null; musicPassageID = 0;
  syncMusicReview();
  closeImportedDocument();
  clearTimeout(translationTimer);
  $("#translator-input").value = "";
  $("#translate-music").disabled = true;
  $("#music-listening-status").textContent = "Ready for a new song. Choose From, then tap Listen to music.";
  updateMusicListenLabel();
  renderTranslation();
}

async function translateCapturedMusic() {
  const source = $("#translator-input").value.trim();
  if (musicListening || musicFullTranslation || !musicTranscriptReview || !source) return;
  const request = {source,language:sourceLanguage,target:targetLanguage,purpose:translationPurpose,
    uncertain:Boolean(musicCapturedText === source && musicCapturedLanguage === sourceLanguage && musicCapturedTentativeText)};
  musicFullTranslation = request;
  $("#music-listening-status").textContent = "Translating captured words…";
  $("#translate-music").disabled = true;
  try {
    const pending = renderTranslation({allowMusic:true});
    const renderRequest = translationRequest;
    await pending;
    if (musicFullTranslation !== request) return;
    const current = request.source === $("#translator-input").value.trim()
      && request.language === sourceLanguage && request.target === targetLanguage
      && request.purpose === translationPurpose && renderRequest === translationRequest;
    const completed = current && lastCompletedTranslation?.source === request.source
      && lastCompletedTranslation.sourceLanguage === request.language
      && lastCompletedTranslation.targetLanguage === request.target;
    if (completed) {
      const incomplete = Boolean(musicFragmentReason(source,request.language));
      $("#music-listening-status").textContent = incomplete
        ? "Draft ready, but the captured source ends mid-phrase. Missing words can change its meaning."
        : request.uncertain
          ? "Draft ready. Some captured words were unconfirmed; check them before relying on the translation."
        : "Translation ready. Check the draft against the captured words.";
      if (incomplete) {
        $("#translation-result .result-label").textContent += " · incomplete captured text";
        $("#usage-note").innerHTML += "<p>The captured source ends mid-phrase. This draft cannot supply the missing words; continue listening or correct the source before relying on its meaning.</p>";
      }
      if (request.uncertain) {
        $("#translation-result .result-label").textContent += " · unconfirmed captured words";
        $("#usage-note").innerHTML += "<p>Some source words were still tentative when capture stopped. They are included in this manually requested draft and need review; recognition has not confirmed them.</p>";
      }
    } else {
      musicTranscriptReview = true;
      $("#music-listening-status").textContent = current
        ? "Translation could not finish. Captured words are kept. Check the error message, then tap Translate captured words to retry."
        : "The text or language changed. Check the captured words, then tap Translate captured words again.";
    }
  } catch {
    if (musicFullTranslation !== request) return;
    musicTranscriptReview = true;
    $("#music-listening-status").textContent = "Translation could not finish. Captured words are kept. Tap Translate captured words to retry.";
  } finally {
    if (musicFullTranslation === request) {
      musicFullTranslation = null;
      $("#translate-music").disabled = !musicTranscriptReview || !$("#translator-input").value.trim();
    }
  }
}

function retryTranslation() {
  if (documentImportActive && importedDocument) return $("#translate-document").click();
  return musicTranscriptReview ? translateCapturedMusic() : renderTranslation();
}

function stopMusicListening() {
  const session = musicListening;
  if (!session || session.stopping) return;
  session.stopping = true;
  $("#music-listen").disabled = true;
  $("#music-listen").textContent = "Finishing…";
  $("#music-listening-status").textContent = "Finishing capture…";
  if (!recognition) return session.finish();
  // Some browsers never send end after stop; release the mic and keep words.
  session.finishTimer = setTimeout(() => {
    if (musicListening === session) cancelMusicListening();
  }, 3000);
  stopListening();
}

function startMusicListening() {
  if (musicListening) return stopMusicListening();
  const button = $("#music-listen"), status = $("#music-listening-status");
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
    status.textContent = "Microphone recognition is unavailable in this browser. Try Safari or Chrome, or import a lyrics screenshot.";
    return;
  }
  cancelListening(true);
  musicFullTranslation = null;
  musicReviewRequest += 1;
  saveActiveTranslationEdit();
  const continuing = musicContinuationAvailable();
  const baseText = continuing ? $("#translator-input").value.trim() : "";
  const baseConfirmedText = continuing && musicCapturedConfirmedText !== null ? musicCapturedConfirmedText : baseText;
  const baseTentativeText = continuing ? musicCapturedTentativeText : "";
  closeImportedDocument();
  clearTimeout(translationTimer);
  translationRequest += 1;
  stopSpeechPlayback();
  const playbackSource = $("#music-playback-source")?.value;
  const phoneBluetooth = playbackSource === "phone-bluetooth";
  const systemAudio = playbackSource === "system" && window.__hablaSystemAudioSupported === true;
  const session = {baseText, baseConfirmedText, baseTentativeText, heard:false, error:"", stopping:false, lang:sourceLanguage,
    confirmedSource:null, tentativeText:baseTentativeText,
    phoneBluetooth, systemAudio, song:$("#music-capture-length").value === "song",
    live:{enabled:Boolean($("#music-live-translation")?.checked),mode:$("#music-live-update-mode")?.value === "quick" ? "quick" : "confirmed",lastProvisional:false,errorCode:"",target:targetLanguage,
      purpose:translationPurpose,way:direction,revision:0,busy:false,timer:null,failed:false,
      lastSource:baseText,lastPassage:"",requests:0,characters:0,errorMessage:""}};
  resetMusicLivePreview();
  if (session.live.enabled && $("#music-live-status")) $("#music-live-status").textContent = "Live draft on. Waiting for captured words…";
  musicListening = session;
  syncMusicReview();
  musicTranscriptReview = true;
  button.textContent = "Stop listening";
  button.setAttribute("aria-pressed", "true");
  $("#music-capture-length").disabled = true;
  if ($("#music-playback-source")) $("#music-playback-source").disabled = true;
  $("#translate-music").disabled = true;
  status.textContent = systemAudio
    ? "Starting this iPhone's audio capture… allow Apple's picker if asked."
    : "Starting microphone… allow access if asked.";
  session.finish = () => {
    if (musicListening !== session) return;
    clearTimeout(session.timer);
    clearTimeout(session.finishTimer);
    clearTimeout(session.restartTimer);
    clearTimeout(session.live.timer);
    session.live.revision += 1;
    if (session.confirmedSource !== null && session.tentativeText && $("#music-live-pending")) {
      $("#music-live-pending").hidden = false;
      $("#music-live-pending").textContent = `Unconfirmed words kept for review: ${session.tentativeText}`;
    }
    if ($("#music-live-draft")) $("#music-live-draft").readOnly = false;
    if ($("#music-live-status")) {
      if (session.live.failed) $("#music-live-status").textContent = "Capture stopped. Live draft paused. " + session.live.errorMessage;
      else if ($("#music-live-draft")?.value) $("#music-live-status").textContent = "Latest passage draft paused; you can edit it here. Translate captured words below prepares the full collected text.";
      else if (session.live.enabled) $("#music-live-status").textContent = "Capture stopped before a live draft was ready. Captured words, if any, remain above.";
    }
    musicListening = null;
    updateMusicLiveRetry(null);
    syncMusicReview();
    button.disabled = false;
    button.setAttribute("aria-pressed", "false");
    $("#music-capture-length").disabled = false;
    if ($("#music-playback-source")) $("#music-playback-source").disabled = false;
    const ready = Boolean((session.heard || session.baseText) && $("#translator-input").value.trim());
    $("#translate-music").disabled = !ready;
    musicTranscriptReview = ready;
    if (ready) {
      musicCapturedText = $("#translator-input").value.trim();
      musicCapturedLanguage = session.lang;
      if (session.heard || !continuing || session.confirmedSource !== null) musicCapturedConfirmedText = session.confirmedSource;
      musicCapturedTentativeText = session.tentativeText;
    }
    updateMusicListenLabel();
    status.textContent = session.error || (ready
      ? "Capture paused. Check the words above, then Translate captured words. Continue listening adds the next passage; New song starts fresh."
      : session.systemAudio
        ? "No words captured from this iPhone's audio. The playback app may be sending silence. Your previous text is unchanged."
      : session.phoneBluetooth
        ? "No words captured. Check that music is still audible on the Bluetooth speaker. iOS may have paused it or changed the audio route. Your previous text is unchanged."
        : "No words captured. Move closer to the other device or try clearer vocals. Your previous text is unchanged.");
  };
  session.timer = setTimeout(() => { if (musicListening === session) stopMusicListening(); }, session.song ? 600000 : 30000);
  startMusicSegment(session);
}

function startMusicSegment(session) {
  if (musicListening !== session || session.stopping) return;
  const status = $("#music-listening-status");
  let segmentHeard = false;
  startListening({lang:session.lang, button:$("#music-listen"), continuous:true, correctTranscript:false,
    onStart:() => {
      if (session.stopping) return;
      const duration = session.song ? "Maximum 10 minutes" : "Up to 30 seconds";
      status.textContent = session.systemAudio
        ? `Capturing this iPhone's audio… ${duration}. You can switch to the playback app; tap Stop listening when finished.`
        : session.phoneBluetooth
        ? `Listening through the microphone… check the Bluetooth speaker is still playing. ${duration}; keep Habla open, then Stop listening.`
        : `Listening to the song… ${duration}; keep this screen open. Tap Stop listening when finished.`;
    },
    onText:(text, final, metadata={}) => {
      if ((!text && typeof metadata.confirmedText !== "string") || musicListening !== session) return;
      if (text) session.heard = segmentHeard = true;
      if (typeof metadata.confirmedText === "string") {
        session.confirmedSource = [session.baseConfirmedText,metadata.confirmedText].filter(Boolean).join("\n").trim();
        session.tentativeText = [session.baseTentativeText,metadata.tentativeText || ""].filter(Boolean).join("\n").trim();
        if (session.live.enabled) {
          if (!showTentativeMusicWords(session)) $("#music-live-pending").hidden = true;
        }
      }
      preservedCulturalContext = null;
      $("#translator-input").value = [session.baseText,text].filter(Boolean).join("\n");
      lastCompletedTranslation = null;
      activeTranslationEdit = null;
      $("#translation-result").hidden = true;
      $("#no-result").hidden = true;
      $("#english-comparison").hidden = true;
      $("#spanish-context").hidden = true;
      $("#compare-english").disabled = true;
      queueMusicLiveDraft(session);
    },
    onError:error => {
      if (error === "aborted") return;
      session.error = error === "no-speech"
        ? session.phoneBluetooth
          ? "No words detected. Check music is still playing on the Bluetooth speaker; iOS may pause playback or change the route when the microphone starts."
          : "No words detected in this passage. Try clearer vocals or a lyrics screenshot."
        : recognitionErrorMessage(error);
      if (session.heard || session.baseText) session.error += " Captured words are kept above; continue when ready or translate them.";
      stopMusicListening();
    },
    onEnd:() => {
      if (musicListening !== session) return;
      if (!session.song || session.stopping || session.error || !segmentHeard) return session.finish();
      // Normal browser session limits do not discard earlier verses. No retry
      // loop on silence, denied access or service errors; those need a tap.
      session.baseText = $("#translator-input").value.trim();
      session.baseConfirmedText = session.confirmedSource ?? session.baseText;
      session.baseTentativeText = session.tentativeText;
      status.textContent = "Browser capture restarted. Earlier words are kept; check for a gap between passages.";
      session.restartTimer = setTimeout(() => startMusicSegment(session),200);
    },
    onCancel:session.finish
  });
}

function stopListening() {
  const instance = recognition;
  if (!instance || instance._hablaStopping) return;
  instance._hablaStopping = true;
  setListeningButton(activeRecognitionButton, true, true);
  try {
    instance.stop();
    instance._hablaArmFinishDeadline?.(3000);
  } catch {
    try { instance.abort(); } catch {}
    instance._hablaFinish?.();
  }
}

function claimSourceTextEdit() {
  // Claim the source before the browser replaces its selected range. Otherwise
  // an in-flight dictation callback can put the highlighted words back.
  if (musicListening) cancelMusicListening(false);
  else if (recognition && activeRecognitionButton === $("#input-mic")) cancelListening(false);
}

let translatorDictationNeedsReview = false;

function setTranslatorMicFeedback(message="",needsConfirmation=false,keyboardOption=false) {
  const box=$("#translator-mic-feedback"),status=$("#translator-mic-status");
  const confirm=$("#translator-mic-confirm"),keyboard=$("#translator-mic-keyboard");
  if (!box || !status || !confirm || !keyboard) return;
  box.hidden=!message;
  status.textContent=message;
  confirm.hidden=!needsConfirmation;
  keyboard.hidden=!keyboardOption;
}

function composeDictationText(existing, recognized, append=false) {
  // A recognition callback contains a cumulative draft for *this session*.
  // Replace only that session's contribution, never the earlier text.
  const fresh=String(recognized||"").trim();
  if (!append || !String(existing||"").trim()) return fresh;
  if (!fresh) return String(existing);
  const prefix=String(existing).trimEnd();
  return prefix + (/\n$/.test(prefix) ? "" : "\n") + fresh;
}

function startInputMicrophone({append=false}={}) {
  const button = $("#input-mic");
  // The native layout moves this same editor into Music. Its microphone must
  // use the live capture pipeline rather than waiting for dictation to end.
  if (musicListening || button?.closest?.(".view")?.id === "music-view") return startMusicListening();
  if (recognition && activeRecognitionButton === button) {
    setTranslatorMicFeedback("Finishing speech recognition…");
    return stopListening();
  }
  // Prevent an older translation timer/request from translating an unfinished
  // new dictation. User edits and manual confirmation remain independent.
  clearTimeout(translationTimer);
  translationRequest += 1;
  // Keep observed recognizer events visible: orange means the browser started
  // a capture attempt, NOT proof that the speech engine decoded the words.
  const locale=sourceSpeechLocale();
  const label=languageLabel(sourceLanguage);
  const priorText=append ? ($("#translator-input")?.value || "") : "";
  let receivedWords=false,failed=false;
  setTranslatorMicFeedback("Starting microphone… " + label);
  startListening({way:direction,lang:locale,button,
    onStart:()=>setTranslatorMicFeedback("Microphone started. Speak clearly, then tap again to finish."),
    onAudioStart:()=>setTranslatorMicFeedback("Microphone audio ready. Speak now."),
    onSpeechStart:()=>setTranslatorMicFeedback("Speech detected. Continue speaking."),
    onError:error=>{
      if (error === "aborted") return;
      failed=true;
      setTranslatorMicFeedback(recognitionErrorMessage(error),false,true);
    },
    onEnd:()=>{
      if (!receivedWords && !failed) {
        setTranslatorMicFeedback("No words recognized. Existing words are preserved. Try again or use keyboard dictation.",false,true);
        if(append) $("#translator-input").value=priorText;
      }
    },
    onText:(text,final,metadata={})=>{
      musicFullTranslation = null;
      musicTranscriptReview = false;
      musicCapturedText = "";
      updateMusicListenLabel();
      $("#translate-music").disabled = true;
      preservedCulturalContext = null;
      if (!text.trim()) return;
      receivedWords=true;
      $("#translator-input").value = composeDictationText(priorText,text,append);
      if (!final) {
        // Never show an old translation alongside an unfinished new source.
        translationRequest += 1;
        translatorDictationNeedsReview=true;
        const result=$("#translation-result");
        if(result)result.hidden=true;
        setTranslatorMicFeedback(append
          ? "Adding recognized words below the original. Still listening; check for omissions."
          : "Partial words heard. Checking the final transcript…");
      } else if (metadata.provisional) {
        // iOS/Safari can end with only an unconfirmed fragment ("Sí" instead
        // of "¿Cómo estás?"). Keep it editable, but never translate it as fact.
        translationRequest += 1;
        translatorDictationNeedsReview = true;
        const result=$("#translation-result"),empty=$("#translation-empty-target");
        if (result) result.hidden=true;
        if (empty) empty.hidden=false;
        setTranslatorMicFeedback("Only a partial transcript was received. Check the complete source; add missing words before translating.",true,true);
      } else {
        translatorDictationNeedsReview = false;
        setTranslatorMicFeedback("Recognized words received. Check for missing or changed words. Use Add missing words to continue.");
        renderTranslation();
      }
    }
  });
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

function refineSpanishOrthography(draft, source) {
  // RAE DLE: https://dle.rae.es/ma%C3%B1ana . MyMemory can return the
  // unaccented spelling for English "tomorrow". Require that source meaning;
  // an explicitly supplied Manana/mañana may be a name or literal spelling.
  if (!/\btomorrow\b/i.test(source) || /(?:^|[^\p{L}\p{M}\p{N}_])ma[nñ]ana(?:$|[^\p{L}\p{M}\p{N}_])/iu.test(source)) return draft;
  // Keep quoted text, code, links, email, handles and compound words intact.
  return draft.replace(/https?:\/\/\S+|[\w.+-]+@[\w.-]+\.[a-z]+|`[^`]*`|"[^"\n]*"|“[^”]*”|‘[^’]*’|«[^»]*»|'[^'\n]*'|[@#][\p{L}\p{M}\p{N}_-]+|[\p{L}\p{M}\p{N}_-]+/giu, token => {
    if (!/^manana$/i.test(token)) return token;
    return token.slice(0,2) + (token[2] === "N" ? "Ñ" : "ñ") + token.slice(3);
  });
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

function utf8Length(text) {
  let bytes = 0;
  for (const character of text) {
    const code = character.codePointAt(0);
    bytes += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
  }
  return bytes;
}

function splitLongTranslationText(text, limit=430) {
  const chunks = [];
  text.split(/(\n\s*\n)/).forEach(part => {
    if (!part) return;
    if (/^\n\s*\n$/.test(part)) { chunks.push({text:part,separator:true}); return; }
    let remaining = part.trim();
    let joiner = " ";
    while (remaining) {
      if (utf8Length(remaining) <= limit) { chunks.push({text:remaining,separator:false,joiner}); break; }
      let length = 0, bytes = 0;
      for (const character of remaining) {
        const size = utf8Length(character);
        if (bytes + size > limit) break;
        bytes += size; length += character.length;
      }
      const prefix = remaining.slice(0,length);
      const boundary = prefix.match(/\s+\S*$/);
      if (boundary && boundary.index > 0) length = boundary.index;
      chunks.push({text:remaining.slice(0,length),separator:false,joiner});
      remaining = remaining.slice(length);
      const whitespace = remaining.match(/^\s+/)?.[0] || "";
      if (whitespace) { chunks.push({text:whitespace,separator:true}); remaining = remaining.slice(whitespace.length); }
      joiner = "";
    }
  });
  return chunks;
}

function refineAcademicEnglish(text, source="") {
  const contractions = [
    [/\bcan't\b/gi,"cannot"],[/\bwon't\b/gi,"will not"],[/\bdoesn't\b/gi,"does not"],
    [/\bdon't\b/gi,"do not"],[/\bdidn't\b/gi,"did not"],[/\bisn't\b/gi,"is not"],
    [/\baren't\b/gi,"are not"],[/\bwasn't\b/gi,"was not"],[/\bweren't\b/gi,"were not"],
    [/\bhasn't\b/gi,"has not"],[/\bhaven't\b/gi,"have not"],[/\bhadn't\b/gi,"had not"],
    [/\bcouldn't\b/gi,"could not"],[/\bshouldn't\b/gi,"should not"],[/\bwouldn't\b/gi,"would not"]
  ];
  let refined = text.replace(/[ \t]+([,.;:!?])/g,"$1").replace(/[ \t]{2,}/g," ");
  contractions.forEach(([pattern,replacement]) => { refined = refined.replace(pattern,replacement); });
  const protectedDraft = protectResearchTokens(refined);
  return protectedDraft.restore(refinePragmaticsTerminology(protectedDraft.text, source));
}

function convertEnglishVariety(text, target=targetLanguage, options={}) {
  if (typeof HablaEnglish !== "undefined") {
    const adapted=HablaEnglish.adapt(text,target,options).text;
    return HablaEnglish.preserveCompleteSolutions(adapted,options.source);
  }
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

function translationFailure(code, detail="", status=0) {
  const error = new Error(detail || code);
  error.code = code;
  error.status = status;
  return error;
}

function translationErrorMessage(error) {
  const messages = {
    research_limit:["This section is too long.", "Use at most 8,000 characters and 20 translation segments. Your source text is preserved."],
    quota:["The free translation allowance has been used.", "MyMemory reported that the free allowance is exhausted. Retry after the service resets it. Successful segments stay in memory while this page is open."],
    rate_limit:["The service is limiting requests.", "Wait a little, then tap Retry translation. This is a service limit, not a problem with your document."],
    timeout:["The translation service took too long.", "Tap Retry translation. Completed segments will be reused while this page is open."],
    offline:["You appear to be offline.", "New text can be translated offline after downloading the pack. Your source text is preserved."],
    offline_pack:["Download the offline pack first.", "Connect, tap Download offline pack, and keep the page open until it is ready. On-device mode never sends your text to the online service."],
    offline_engine:["On-device translation could not finish.", "Your source text is preserved. Retry with a shorter section; reload if the device ran out of memory. No online service was used."],
    network:["The translation service could not be reached.", "The browser did not receive a response. This may be a connection or access problem; a daily quota has not been confirmed. Tap Retry translation when connected."],
    invalid_response:["The service returned an unreadable response.", "Tap Retry translation. Your source text is preserved."],
    request_limit:["The service rejected a translation segment.", "Use a shorter section and retry. Your source text is preserved."],
    service:["The service rejected this translation.", "Retry later. Your source text is preserved."]
  };
  const [title, help] = messages[error?.code] || messages.service;
  const detail = ["quota","rate_limit","service","request_limit","offline_engine"].includes(error?.code)
    ? String(error.message || "").replace(/https?:\/\/\S+/g,"[service link]").slice(0,240) : "";
  return {title,help:help + (detail ? ` ${error?.code === "offline_engine" ? "Device error" : "Service response"}${error.status ? ` (${error.status})` : ""}: ${detail}` : "")};
}

const translationChunkCache = new Map();
async function requestTranslationChunk(text, way=direction, purpose=translationPurpose) {
  const pair = way === "en-ec" ? "en|es" : "es|en";
  const protectedText = purpose === "academic" ? protectResearchTokens(text) : {text,restore:value=>value};
  // Never truncate text to fit a request. The caller splits the whole passage.
  if (utf8Length(protectedText.text) > 500) throw translationFailure("request_limit", "Segment exceeds 500 UTF-8 bytes.");
  const key = JSON.stringify([pair,purpose,text]);
  if (translationChunkCache.has(key)) return translationChunkCache.get(key);
  const request = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      let response;
      try { response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(protectedText.text)}&langpair=${encodeURIComponent(pair)}`, {signal:controller.signal,cache:"no-store"}); }
      catch (error) {
        if (controller.signal.aborted || error.name === "AbortError") throw translationFailure("timeout");
        throw translationFailure(typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "network");
      }
      let payload;
      try { payload = await response.json(); }
      catch { throw translationFailure(response.ok ? "invalid_response" : response.status === 429 ? "rate_limit" : "service", "Unreadable service response",response.status); }
      const status = Number(payload.responseStatus || response.status || 200);
      const output = payload.responseData?.translatedText;
      const detail = String(payload.responseDetails || output || "Translation unavailable");
      const quotaText = /used all available free translations|daily (?:translation )?(?:quota|limit)|quota (?:exceeded|reached)|next available in/i.test(detail);
      if (payload.quotaFinished === true || quotaText) throw translationFailure("quota",detail,status);
      if (status === 429 || response.status === 429) throw translationFailure("rate_limit",detail,status);
      if (/query length limit|500 (?:bytes|characters)/i.test(detail) && status >= 400) throw translationFailure("request_limit",detail,status);
      if (!response.ok || status >= 400 || typeof output !== "string" || !output.trim()) throw translationFailure("service",detail,status);
      // Provider warnings must never become editable 'translations'.
      if (/^MYMEMORY WARNING/i.test(output.trim())) throw translationFailure("service",detail,status);
      return protectedText.restore(decodeTranslation(output));
    } finally { clearTimeout(timeout); }
  })();
  translationChunkCache.set(key,request);
  try {
    const translated = await request;
    if (translationChunkCache.size > 200) translationChunkCache.delete(translationChunkCache.keys().next().value);
    return translated;
  } catch (error) { translationChunkCache.delete(key); throw error; }
}

function imageParagraphText(text) {
  // OCR can split a connected clause into separate blocks. Join only clear dangling clauses.
  const connected=text.replace(/\b(que|para|porque|aunque|estemos|estamos|estar)\s*\n\s*\n(?=[a-záéíóúüñ])/g,'$1 ');
  return connected.split(/(\n\s*\n)/).map(part=>/^\n\s*\n$/.test(part)?part:part.replace(/\n/g,' ')).join('');
}

function refineImageEnglish(draft,source,fullSource=source,{musicContext=false}={}) {
  let result=draft;
  if(/\b(?:hasta|a)\s+la\s+cuenta\s+de\s+(?:uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|\d+)\b/i.test(source)) {
    result=result.replace(/\baccount(?=\s+of\s+(?:one|two|three|four|five|six|seven|eight|nine|ten|\d+)\b)/gi,word=>word[0]==='A'?'Count':'count');
  }
  const music=musicContext||/\b(?:cumbia|salsa|bachata|reguet[oó]n|m[uú]sica|canci[oó]n|remix|DJ)\b/i.test(fullSource);
  if(!music)return result;
  const dance=/\b(?:bail(?:ar|amos|ando|a)|baile|trasero|discoteca)\b/i.test(source);
  const otherTrack=/\b(?:aeropuerto|atletismo|carrera|audio|grabaci[oó]n)\b/i.test(source);
  if(dance&&!otherTrack&&(source.match(/\bpista\b/gi)||[]).length===1&&(result.match(/\b(?:track|runway)\b/gi)||[]).length===1) {
    result=result.replace(/\b(?:track|runway)\b/i,'dance floor');
  }
  if(/^[¡!\s]*(?:y\s+)?s[uú]bele[!.\s]*$/i.test(source))result=result.replace(/\b(?:lift|raise)\s+it\s+up\b/gi,word=>/^[A-Z]/.test(word)?'Turn it up':'turn it up');
  return result;
}

async function requestGeneralTranslation(text, way=direction, {purpose=translationPurpose, source=sourceLanguage, target=targetLanguage, isCurrent=()=>true, onDevice=typeof HablaOffline !== "undefined" && HablaOffline.shouldUse(), inputType, chunkProgress, musicSourceMode}={}) {
  if (text.length > 8000) throw translationFailure("research_limit");
  if (inputType === "music" && purpose !== "academic" && musicSourceMode !== "selected" && bilingualMusicEnabled()) {
    const plan = HablaBilingualMusic.plan(text,{source,target});
    if (musicTranslationRequestCost(text,source,target,purpose) > 20) throw translationFailure("research_limit");
    const translated=[];
    for (const part of plan.parts) {
      if (!isCurrent()) throw translationFailure("superseded");
      if (!part.language || part.language === languageFamily(target)) { translated.push(part.text); continue; }
      const locale = languageFamily(source) === part.language ? source : part.language === "es" ? "es-EC" : "en-US";
      const trimmed=part.text.trim();
      const draft=await requestGeneralTranslation(trimmed,part.language === "es" ? "ec-en" : "en-ec",
        {purpose,source:locale,target,isCurrent,onDevice,inputType:"music",musicSourceMode:"selected"});
      translated.push(part.text.slice(0,part.text.indexOf(trimmed))+draft+part.text.slice(part.text.indexOf(trimmed)+trimmed.length));
    }
    if (!isCurrent()) throw translationFailure("superseded");
    const status=$("#music-language-status");
    if(status) status.textContent=HablaBilingualMusic.label(plan);
    return translated.join("");
  }
  if (purpose === "academic" && way === "ec-en") {
    const reference = findAcademicReference(text);
    if (reference !== null) return convertEnglishVariety(reference.text,target,{source:text,purpose});
  }
  // Isolated Spanish-language community terms must not depend on a general
  // machine translator guessing "Spanish" as nationality or language name.
  const languageCommunityTerm=typeof HablaLanguageCommunity!=="undefined"
    ? HablaLanguageCommunity.lookup(text,{source,target}) : null;
  if(languageCommunityTerm!==null){
    if(!isCurrent())throw translationFailure("superseded");
    return languageCommunityTerm;
  }
  if (text.length > 8000) throw translationFailure("research_limit");
  const localIndifference = typeof HablaSpanishContext !== "undefined" ? HablaSpanishContext.translateIndifferenceExpression(text,{source,target}) : null;
  if(localIndifference) {
    if(!isCurrent())throw translationFailure("superseded");
    return localIndifference.text;
  }
  const localVulgarity = typeof HablaSpanishContext !== "undefined" ? HablaSpanishContext.translateEnglishVulgarity(text,{source,target,purpose}) : null;
  if (localVulgarity) {
    if (!isCurrent()) throw translationFailure("superseded");
    return localVulgarity.text;
  }
  const wordMeanings = typeof HablaSpanishContext !== "undefined" ? HablaSpanishContext.wordMeanings(text,{source,target,purpose}) : [];
  if (wordMeanings.length) {
    if (!isCurrent()) throw translationFailure("superseded");
    return wordMeanings.map(item=>item.text).join("; ");
  }
  const image=inputType==='image'&&purpose!=='academic';
  const music=inputType==='music'&&purpose!=='academic';
  const sourceDraft=image?imageParagraphText(text):text;
  // Normalize only the provider request for explicit Spanish/English
  // code-switches. Never replace the learner's entered source text.
  const mixedPrepared=typeof HablaMixedTranslation!=='undefined'
    ? HablaMixedTranslation.prepare(sourceDraft,{source,target,purpose,way}) : sourceDraft;
  const prepared=way==='ec-en'&&typeof HablaSpanishContext!=='undefined'
    ? HablaSpanishContext.prepare(mixedPrepared,{purpose,source}) : mixedPrepared;
  const protectedDocument = purpose === "academic" ? protectResearchTokens(text) : {text:prepared,restore:value=>value};
  const chunks = splitLongTranslationText(protectedDocument.text);
  if (!onDevice && chunks.filter(chunk => !chunk.separator).length > 20) throw translationFailure("research_limit");
  const translated = [];
  for (let index=0;index<chunks.length;index++) {
    const chunk=chunks[index];
    if (!isCurrent()) throw translationFailure("superseded");
    const cached=chunk.separator?undefined:chunkProgress?.read(index,chunk.text);
    const draft=chunk.separator ? chunk.text : cached !== undefined ? cached : (onDevice ? await HablaOffline.translate(chunk.text,way) : await requestTranslationChunk(chunk.text,way,purpose));
    if (!isCurrent()) throw translationFailure("superseded");
    if(!chunk.separator&&cached===undefined)chunkProgress?.write(index,chunk.text,draft);
    let contextualDraft=(image||music)&&way==='ec-en'&&!chunk.separator?refineImageEnglish(draft,chunk.text,text,{musicContext:music}):draft;
    if(way==='ec-en'&&!chunk.separator&&purpose!=='academic'&&typeof HablaSpanishContext!=='undefined')contextualDraft=HablaSpanishContext.refine(contextualDraft,chunk.text,{purpose}).text;
    translated.push(contextualDraft);
  }
  const joined = translated.map((value,index) => index > 0 && !chunks[index].separator && !chunks[index-1].separator ? `${chunks[index].joiner ?? " "}${value}` : value).join("");
  const combined = protectedDocument.restore(joined);
  const refined = purpose === "academic" && way === "ec-en" ? refineAcademicEnglish(combined,text) : combined;
  if (languageFamily(target) === "en") {
    const english=convertEnglishVariety(refined,target,{source:text,purpose});
    return typeof HablaMixedTranslation!=='undefined'
      ? HablaMixedTranslation.refine(english,text,{source,target,purpose,way}) : english;
  }
  const corrected = languageFamily(source) === "en" && languageFamily(target) === "es"
    ? refineSpanishOrthography(refined,text) : refined;
  return typeof HablaLanguageCommunity!=="undefined"
    ? HablaLanguageCommunity.refine(corrected,text,{source,target}) : corrected;
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

function translationEditKey(source, way=direction, variant=englishVariant, purpose=translationPurpose, musicSourceMode="selected") {
  const targetVariant = languageFamily(targetLanguage) === "en" ? variant : targetLanguage;
  const sourceKey = purpose === "academic" ? academicSourceFingerprint(source) : normalize(source);
  return `${purpose}|${sourceLanguage}>${targetLanguage}|${way}|${targetVariant}|${sourceKey}${musicSourceMode === "auto" ? "|bilingual-music-v1" : ""}`;
}

function persistTranslationEdits() {
  try {
    localStorage.setItem(TRANSLATION_EDITS_STORAGE_KEY, JSON.stringify(translationEdits));
  } catch {}
}

let translationSharePending = false;
let translationCopyPending = false;

function bindTranslationTextTools() {
  const tools = $("#translation-text-tools"), draft = $("#natural-result");
  if (!tools || !draft || tools.dataset.bound) return;
  tools.dataset.bound = "true";
  // The installed companion puts unknown result children in its notes dropdown.
  // Move only these new controls back beside the same editable translation.
  draft.before(tools);
  // Recover hosted controls from the installed companion's collapsed notes.
  tools.after($("#translation-copy-status"),$("#translation-copy-fallback"));
  $("#copy-result").addEventListener("click",()=>copyTranslation());
  $("#translation-copy-retry").addEventListener("click",()=>copyTranslation({legacyFirst:true}));
  $("#translation-copy-close").addEventListener("click",clearTranslationCopyFallback);
  const expand = $("#translation-expand"), smaller = $("#translation-text-smaller");
  const larger = $("#translation-text-larger"), reset = $("#translation-text-reset");
  const syncSize = () => {
    const size = parseFloat(getComputedStyle(draft).fontSize);
    smaller.disabled = size <= 14;
    larger.disabled = size >= 40;
    reset.disabled = !draft.classList.contains("translation-size-custom");
  };
  const changeSize = step => {
    const size = Math.min(40, Math.max(14, parseFloat(getComputedStyle(draft).fontSize) + step));
    draft.style.setProperty("--translation-text-size", `${size}px`);
    draft.classList.add("translation-size-custom");
    syncSize();
  };
  expand.addEventListener("click", () => {
    const expanded = draft.classList.toggle("translation-expanded");
    expand.setAttribute("aria-expanded", String(expanded));
    expand.textContent = expanded ? "Collapse" : "Expand";
  });
  smaller.addEventListener("click", () => changeSize(-2));
  larger.addEventListener("click", () => changeSize(2));
  reset.addEventListener("click", () => {
    draft.classList.remove("translation-size-custom");
    draft.style.removeProperty("--translation-text-size");
    syncSize();
  });
  $("#translation-select-all").addEventListener("click", () => {
    if (draft.getAttribute("contenteditable") !== "true") return;
    draft.focus({preventScroll:true});
    const range = document.createRange();
    range.selectNodeContents(draft);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  });
  syncSize();
}

const PUBLIC_APP_URL = "https://mathewdmoore.github.io/habla-ecuador/index.html";
const APP_SHARE_REGIONS = new Set(["monterrey", "es-EC", "es-BO", "es-MX", "es-VE", "es-PE", "es-CO", "es-CU", "es-AR", "es-CL", "es-CR", "es-DO", "es-SV", "es-GT", "es-HN", "es-NI", "es-PA", "es-PY", "es-PR", "es-ES", "es-UY", "es-GQ"]);
const APP_SHARE_DESTINATIONS = new Set(["caracas",...APP_SHARE_REGIONS]);
let appSharePending = false;

function publicAppShareUrl(region="", ui="es") {
  const url = new URL(PUBLIC_APP_URL);
  if (APP_SHARE_DESTINATIONS.has(region)) {
    url.searchParams.set("start","dictionary");
    url.searchParams.set("region",region === "caracas" ? "es-VE" : region);
    if (region === "caracas") url.searchParams.set("city","caracas");
  }
  url.searchParams.set("ui",ui === "en" ? "en" : "es");
  return url.href;
}

function sharedAppRegion(query) {
  const region = query.get("region");
  return query.get("start") === "dictionary" && APP_SHARE_REGIONS.has(region) ? region : null;
}

function bindAppSharing() {
  const select = $("#app-share-region"), link = $("#app-share-link");
  if (!select || !link) return;
  const refresh = () => {
    link.value = publicAppShareUrl(select.value,$("#app-share-language")?.value);
    $("#app-share-status").textContent = "";
  };
  select.addEventListener("change",refresh);
  $("#app-share-language")?.addEventListener("change",refresh);
  $("#share-app").addEventListener("click",() => shareApp());
  $("#copy-app-link").addEventListener("click",() => shareApp(true));
  refresh();
}

async function shareApp(copyOnly=false) {
  if (appSharePending) return;
  const button = $("#share-app"), copy = $("#copy-app-link"), select = $("#app-share-region");
  const link = $("#app-share-link"), status = $("#app-share-status");
  if (!button || !copy || !select || !link || !status) return;
  // Build from a fixed public URL and an allowlisted region. Never forward the
  // current page's parameters, translation text, recordings or local history.
  const url = publicAppShareUrl(select.value,$("#app-share-language")?.value);
  link.value = url;
  appSharePending = true;
  button.disabled = copy.disabled = select.disabled = true;
  if($("#app-share-language")) $("#app-share-language").disabled=true;
  button.textContent = copyOnly ? "Copying link…" : "Opening sharing…";
  try {
    if (!copyOnly && typeof navigator.share === "function") {
      try {
        // Invoke synchronously within the user's tap, before any other await.
        await navigator.share({title:"Habla Ecuador",text:new URL(url).searchParams.get("ui")==="en" ? "Try Habla Ecuador: translation, regional vocabulary and speaking practice. Tap 💬 in the app to suggest a correction." : "Prueba Habla Ecuador: traducción, diccionario regional y práctica oral. Toca 💬 en la app para sugerir una corrección.",url});
        status.textContent = "Share action completed.";
        return;
      } catch (error) {
        if (error?.name === "AbortError") { status.textContent = "Sharing cancelled."; return; }
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      status.textContent = "App link copied. Paste it into Messages, WhatsApp or email.";
    } catch {
      status.textContent = "Select and copy the public link above, then paste it into your chosen app.";
      link.focus(); link.select();
    }
  } finally {
    appSharePending = false;
    button.disabled = copy.disabled = select.disabled = false;
    if($("#app-share-language")) $("#app-share-language").disabled=false;
    button.textContent = "Share app";
  }
}

function clearTranslationCopyFallback() {
  const field=$("#translation-copy-text"),fallback=$("#translation-copy-fallback");
  // Dismiss iOS textarea selection before hiding its field; otherwise selection
  // handles can remain attached to an invisible, horizontally scrolled editor.
  if(field){if(document.activeElement===field){field.setSelectionRange(0,0);field.blur();}field.value='';}
  if(fallback)fallback.hidden=true;
}

function renderedTranslationText() {
  const draft=$("#natural-result");
  return (draft?.innerText ?? draft?.textContent ?? "").trim();
}

function legacyCopyTranslation(text) {
  const active=document.activeElement, selection=window.getSelection();
  const ranges=selection ? Array.from({length:selection.rangeCount},(_,i)=>selection.getRangeAt(i).cloneRange()) : [];
  const caret=active && typeof active.selectionStart==='number' ? [active.selectionStart,active.selectionEnd,active.selectionDirection] : null;
  const field=document.createElement('textarea');field.value=text;field.readOnly=true;
  field.setAttribute('aria-hidden','true');field.style.cssText='position:fixed;left:-10000px;top:0;opacity:0;pointer-events:none;font-size:16px';
  document.body.append(field);
  try{field.focus({preventScroll:true});field.select();field.setSelectionRange(0,field.value.length);return document.execCommand?.('copy')===true;}
  catch{return false;}
  finally{
    field.remove();
    try{if(active?.isConnected)active.focus({preventScroll:true});if(caret)active.setSelectionRange(...caret);
      if(selection){selection.removeAllRanges();for(const range of ranges)if(range.commonAncestorContainer.isConnected)selection.addRange(range);}
    }catch{}
  }
}

async function copyTranslation({legacyFirst=false}={}) {
  if(translationCopyPending)return;
  const draft=$("#natural-result"),button=$("#copy-result"),status=$("#translation-copy-status"),fallback=$("#translation-copy-fallback"),field=$("#translation-copy-text");
  const text=renderedTranslationText(),edit=activeTranslationEdit;
  const report=message=>{status.textContent=message;status.hidden=false;};
  if(!edit || $("#translation-result")?.hidden || draft?.getAttribute('contenteditable')!=='true' || !text){report('Translate some text first, then copy the completed draft.');return;}
  translationCopyPending=true;button.disabled=true;button.textContent='Copying…';
  const current=()=>activeTranslationEdit===edit && renderedTranslationText()===text && !$("#translation-result").hidden;
  try{
    let copied=legacyFirst && legacyCopyTranslation(text);
    if(!copied && typeof navigator.clipboard?.writeText==='function'){
      try{await navigator.clipboard.writeText(text);copied=true;}catch{}
    }
    if(!copied && !legacyFirst)copied=legacyCopyTranslation(text);
    if(!current()){report('Translation changed. Tap Copy again for the current text.');return;}
    if(copied){clearTranslationCopyFallback();report('Translation copied. Paste it into your chosen app.');return;}
    field.value=text;fallback.hidden=false;
    report('Clipboard access is unavailable. Select and copy the translation below.');
    field.focus({preventScroll:true});field.select();field.setSelectionRange(0,field.value.length);
  }finally{translationCopyPending=false;button.textContent='Copy';button.disabled=!activeTranslationEdit;}
}

async function shareTranslation() {
  if (translationSharePending) return;
  const button = $("#share-result"), status = $("#translation-share-status");
  const result = $("#translation-result"), draft = $("#natural-result");
  const report = message => {
    if (status) { status.textContent = message; status.hidden = false; }
  };
  // Share only the visible completed draft, including edits and paragraph breaks.
  // Never include the original text, source URL, saved history or private metadata.
  const text = (draft?.innerText ?? draft?.textContent ?? "").trim();
  if (!activeTranslationEdit || result?.hidden || !text || draft?.getAttribute("contenteditable") !== "true") {
    report("Translate some text first, then share the completed draft.");
    return;
  }
  translationSharePending = true;
  if (button) { button.disabled = true; button.textContent = "Opening sharing…"; }
  try {
    if (typeof navigator.share === "function") {
      try {
        // Call before any await: the system sheet requires this button gesture.
        await navigator.share({title:"Habla Ecuador translation", text});
        report("Translation handed to your sharing app.");
        return;
      } catch (error) {
        if (error?.name === "AbortError") { report("Sharing cancelled."); return; }
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      report("Translation copied. Paste it into Messages, WhatsApp, email or another app. This app view cannot open the share sheet.");
    } catch {
      report("Sharing is unavailable here. Press and hold the translation to copy it, then paste it into your chosen app.");
    }
  } finally {
    translationSharePending = false;
    if (button) { button.textContent = "Share translation"; button.disabled = !activeTranslationEdit; }
  }
}

function updateTranslationEditUi() {
  const copy=$("#copy-result");if(copy)copy.disabled=translationCopyPending || !activeTranslationEdit;
  const copyFallback=$("#translation-copy-fallback"),copyField=$("#translation-copy-text");
  if(copyFallback && !copyFallback.hidden && copyField.value!==renderedTranslationText())clearTranslationCopyFallback();

  const selectAll = $("#translation-select-all");
  if (selectAll) selectAll.disabled = !activeTranslationEdit;
  const share = $("#share-result");
  if (share) share.disabled = translationSharePending || !activeTranslationEdit;
  const status = $("#translation-edit-status");
  const restore = $("#restore-translation");
  if (!status || !restore) return;
  if (!activeTranslationEdit) {
    status.textContent = "Translation is being generated…";
    restore.hidden = true;
    return;
  }
  const currentText = $("#natural-result").textContent.trim();
  const contextFindings=activeTranslationEdit.metadata.musicSourceMode === "auto" ? [] : renderSpanishContext(activeTranslationEdit.source,currentText)||[];
  const edited = currentText !== activeTranslationEdit.generated;
  status.textContent = edited
    ? "Your edited translation is saved on this device."
    : "Tap the translation above to edit it. Changes stay on this device.";
  if(contextFindings.some(item=>item.kind==='slang-literal'))status.textContent+=' Review the slang meaning in Context & regional expressions before using this draft.';
  restore.hidden = !edited;
}

function setEditableTranslation(source, generated, metadata={}) {
  if($("#translation-copy-status"))$("#translation-copy-status").hidden=true;
  clearTranslationCopyFallback();
  if ($("#translation-share-status")) $("#translation-share-status").hidden = true;
  const result = $("#natural-result");
  const key = translationEditKey(source,direction,englishVariant,translationPurpose,metadata.musicSourceMode);
  const savedText = typeof translationEdits[key]?.text === "string" ? translationEdits[key].text.trim() : "";
  const target = (metadata.documentDraft || metadata.swapPair) ? generated : savedText || generated;
  if ($("#compare-english")) $("#compare-english").disabled = languageFamily(targetLanguage) !== "en";
  result.textContent = target;
  result.setAttribute("contenteditable", "true");
  activeTranslationEdit = {key, source, way:direction, sourceLanguage, targetLanguage, variant:englishVariant, purpose:translationPurpose, generated, metadata};
  lastCompletedTranslation = {source, target, way:direction, sourceLanguage, targetLanguage, purpose:translationPurpose, ...metadata, edited:target !== generated};
  updateTranslationEditUi();
}

function saveActiveTranslationEdit({allowEmpty=false}={}) {
  if (!activeTranslationEdit) return;
  const result = $("#natural-result");
  const text = result.textContent.trim();
  if (!text && allowEmpty) return; // selection replacement/IME may briefly delete everything
  if (!text) {
    result.textContent = translationEdits[activeTranslationEdit.key]?.text || activeTranslationEdit.generated;
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
  recordCurrentDocumentDraft();
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
  recordCurrentDocumentDraft();
}

function recordCurrentDocumentDraft() {
  if(!importedDocument || importedDocument.kind==='image' || !documentImportActive || !lastCompletedTranslation)return;
  const draft=lastCompletedTranslation;
  if(draft.sourceLanguage!==sourceLanguage || draft.targetLanguage!==targetLanguage || draft.purpose!==translationPurpose)return;
  wholeDocumentTools?.recordSection(importedDocument.index,draft.source,draft.target);
}

function regionalSpanishBridge(sourceText) {
  if (translationPurpose === "academic") return {
    text:sourceText,
    label:`${languageLabel(targetLanguage)} · research wording preserved`,
    detail:`Research retains the ${languageLabel(sourceLanguage)} source and specialist terms. Conversational Ecuadorian or Bolivian rewrites are not applied; regional academic adaptation needs review.`
  };
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
  return {text:sourceText,label:`${languageLabel(targetLanguage)} adaptation pending`,detail:`The wording is preserved. Country and city-specific adaptation to ${languageLabel(targetLanguage)} needs local review.`};
}

function regionalEnglishBridge(sourceText) {
  const converted = convertEnglishVariety(sourceText,targetLanguage,{source:sourceText,purpose:translationPurpose});
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
  $("#translation-result .result-label").textContent = bridge.label;
  setEditableTranslation(sourceText,bridge.text,{regionalBridge:true});
  $("#literal-result").textContent = `${languageLabel(sourceLanguage)} → ${languageLabel(targetLanguage)} · editable regional draft`;
  $("#usage-note").innerHTML = `<strong>Regional adaptation</strong><span>${bridge.detail}</span>`;
}

function renderSpanishContext(sourceText,draft='') {
  const panel=$('#spanish-context'),body=$('#spanish-context-notes');
  if(!panel||!body)return;
  const findings=typeof HablaSpanishContext==='undefined'?[]:HablaSpanishContext.analyse(sourceText,{source:sourceLanguage,target:targetLanguage,purpose:translationPurpose,image:importedDocument?.kind==='image'});
  if(languageFamily(sourceLanguage)==='es'&&draft&&typeof HablaSpanishContext!=='undefined')findings.push(...HablaSpanishContext.residue(sourceText,draft,{purpose:translationPurpose,target:targetLanguage,region:sourceLanguage}));
  panel.hidden=!findings.length;
  if(findings.some(item=>item.kind==='word-senses'&&item.choices.length))panel.open=true;
  const selectedMeaning=typeof HablaSpanishContext==='undefined'?null:HablaSpanishContext.wordMeanings(sourceText,{source:sourceLanguage,target:targetLanguage,purpose:translationPurpose}).find(item=>item.text===draft)?.id;
  body.innerHTML=findings.length?`<p>Using your chosen source: ${escapeHtml(languageLabel(sourceLanguage))}. Usage clues do not establish a country. Change From if you know the source is different. English options are editorial suggestions; check tone before editing the draft.</p>`+findings.map(item=>`<p><strong>${escapeHtml(item.term)}</strong> — ${escapeHtml(item.detail)}${item.url?` <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Usage reference</a>`:''}${(item.references||[]).map(reference=>` · <a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener">${escapeHtml(reference.name)}</a>`).join('')}</p>${item.choices?.length?`<div class="context-choice-actions">${item.choices.map(choice=>`<button type="button" data-slang-meaning="${escapeHtml(choice)}" aria-pressed="${selectedMeaning===choice}">${item.choiceLabels?.[choice] ? `Use ${escapeHtml(item.choiceLabels[choice])}` : `Use ${escapeHtml(choice)} meaning`}</button>`).join('')}</div>`:''}`).join(''):'';
  return findings;
}

function applySlangMeaning(choice) {
  const edit=activeTranslationEdit;
  if(!edit||!edit.sourceLanguage.startsWith('es-')||edit.purpose!=='everyday'||!edit.targetLanguage.startsWith('en')||edit.source!==$('#translator-input').value.trim()||edit.sourceLanguage!==sourceLanguage||edit.targetLanguage!==targetLanguage)return;
  const wordMeaning=HablaSpanishContext.wordMeanings(edit.source,{source:edit.sourceLanguage,target:edit.targetLanguage,purpose:edit.purpose}).find(item=>item.id===choice);
  if(wordMeaning){$('#natural-result').textContent=wordMeaning.text;saveActiveTranslationEdit();return;}
  if(edit.sourceLanguage!=='es-MX')return;
  const draft=$('#natural-result').textContent.trim();
  const finding=HablaSpanishContext.residue(edit.source,draft,{region:edit.sourceLanguage,target:edit.targetLanguage}).find(item=>item.choices?.includes(choice));
  if(!finding)return;
  const corrected=HablaSpanishContext.chooseSlangMeaning(draft,choice);
  if(corrected!==draft){$('#natural-result').textContent=corrected;saveActiveTranslationEdit();}
}

/* The selected source language must match strongly detected input language.
   Never send Spanish text through an English-to-Spanish machine translation route. */
function translationInputLanguageMismatch(text) {
  if (!text || translationPurpose === "academic" || documentImportActive || musicListening || musicTranscriptReview) return null;
  const words = text.match(/[\p{L}\p{M}]+/gu) || [];
  if (words.length < 4) return null; // Do not guess the language of short or ambiguous phrases.
  const family = languageFamily(sourceLanguage);
  const expectedRole = family === "es" ? "spanish" : "english";
  const evidence = conversationLanguageEvidence(text, expectedRole, sourceLanguage);
  return evidence.confident && evidence.family !== family ? evidence.family : null;
}

function showTranslationLanguageWarning(family) {
  const notice = $("#source-language-warning");
  if (!notice) return;
  notice.hidden = !family;
  if (!family) return;
  const found = family === "es" ? "Spanish / español" : "English / inglés";
  $("#source-language-warning-message").textContent =
    `The text looks like ${found}, but From is set to ${languageLabel(sourceLanguage)}. Change the source language before translating. / El texto parece estar en ${found}, pero el idioma de origen está configurado como ${languageLabel(sourceLanguage)}. Cambia el idioma de origen antes de traducir.`;
  $("#correct-source-language").textContent = family === "es"
    ? "Use Spanish as source / Usar español como origen"
    : "Use English as source / Usar inglés como origen";
}

function correctTranslationSourceLanguage() {
  const input = $("#translator-input")?.value || "";
  const detected = translationInputLanguageMismatch(input);
  if (!detected) return;
  cancelMusicListening();
  saveActiveTranslationEdit();
  const previousSource = sourceLanguage;
  sourceLanguage = languageFamily(targetLanguage) === detected
    ? targetLanguage
    : detected === "es" ? "es-EC" : "en-US";
  targetLanguage = previousSource;
  preservedCulturalContext = null;
  translationRequest += 1;
  syncLanguagePair();
  // Intentionally preserve the original words verbatim.
  renderTranslation();
}

async function renderTranslation({allowImported=false, allowMusic=false}={}) {
  if (translatorDictationNeedsReview && !allowImported && !allowMusic) return;
  if (musicListening || (musicTranscriptReview && !allowMusic)) return;
  if (allowMusic) musicTranscriptReview = false;
  if ($("#compare-english")) $("#compare-english").disabled = true;
  if (documentImportActive && !allowImported) {
    translationRequest += 1;
    $("#translation-result").hidden = true;
    $("#no-result").hidden = true;
    $("#english-comparison").hidden = true;
    return;
  }
  $("#english-comparison") && ($("#english-comparison").hidden = true);
  const requestId = ++translationRequest;
  if ($("#retry-translation")) $("#retry-translation").hidden = true;
  const sourceText = $("#translator-input").value.trim();
  const requestContext = {source:sourceLanguage,target:targetLanguage,purpose:translationPurpose};
  const current = () => requestId === translationRequest
    && sourceText === $("#translator-input").value.trim()
    && requestContext.source === sourceLanguage && requestContext.target === targetLanguage
    && requestContext.purpose === translationPurpose;
  const musicInput=allowMusic || Boolean(musicCapturedText && musicCapturedText === sourceText && musicCapturedLanguage === sourceLanguage);
  const autoMusic=musicInput && translationPurpose !== "academic" && bilingualMusicEnabled();
  if(!autoMusic)renderSpanishContext(sourceText);
  else if($("#spanish-context"))$("#spanish-context").hidden=true;
  const preservedEntry = direction === "en-ec"
    && preservedCulturalContext
    && normalize(sourceText) === normalize(preservedCulturalContext.input)
      ? preservedCulturalContext.entry
      : null;
  if (preservedCulturalContext && direction === "en-ec" && !preservedEntry) preservedCulturalContext = null;
  const result = $("#translation-result");
  const missing = $("#no-result");
  if (!sourceText) {
    showTranslationLanguageWarning(null);
    lastCompletedTranslation = null;
    activeTranslationEdit = null;
    $("#natural-result").removeAttribute("contenteditable");
    updateTranslationEditUi();
    result.hidden = true;
    missing.hidden = true;
    return;
  }
  const wrongSourceFamily = !allowImported && !musicInput ? translationInputLanguageMismatch(sourceText) : null;
  showTranslationLanguageWarning(wrongSourceFamily);
  if (wrongSourceFamily) {
    lastCompletedTranslation = null;
    activeTranslationEdit = null;
    $("#natural-result").removeAttribute("contenteditable");
    updateTranslationEditUi();
    result.hidden = true;
    missing.hidden = true;
    return;
  }
  if (languageFamily(sourceLanguage) === languageFamily(targetLanguage) && !autoMusic) {
    renderRegionalTranslation(sourceText,result,missing);
    return;
  }
  const ecuadorLocalRoute = (direction === "en-ec" && targetLanguage === "es-EC") || (direction === "ec-en" && sourceLanguage === "es-EC");
  const phrase = translationPurpose === "academic" || autoMusic || !ecuadorLocalRoute ? null : preservedEntry || matchPhrase($("#translator-input").value);
  if (!phrase) {
    const embeddedSlang = autoMusic ? {text:sourceText,entries:[]} : prepareEmbeddedEcuadorianSlang(sourceText,direction);
    const onDevice = typeof HablaOffline !== "undefined" && HablaOffline.shouldUse();
    result.hidden = false;
    missing.hidden = true;
    $("#translation-result .result-label").textContent = translationPurpose === "academic"
      ? `${languageLabel(targetLanguage)} academic draft`
      : `${languageLabel(targetLanguage)} translation`;
    activeTranslationEdit = null;
    $("#natural-result").removeAttribute("contenteditable");
    $("#natural-result").textContent = "Translating…";
    updateTranslationEditUi();
    $("#literal-result").textContent = "";
    $("#usage-note").innerHTML = translationPurpose === "academic"
      ? `<strong>Research translation</strong><span>Preserving paragraph structure, citations, DOI links, and numerical references while preparing a formal draft.</span>`
      : `<strong>General translation</strong><span>${onDevice ? "Preparing the on-device model. This may take a moment." : "Checking the free translation service."} Regional naturalness has not yet been verified.</span>`;
    try {
      const inputType=importedDocument?.kind==='image'?'image':musicInput?'music':undefined;
      const translated = await requestGeneralTranslation(embeddedSlang.text,direction,{isCurrent:current,onDevice,inputType});
      if (!current()) return;
      setEditableTranslation(sourceText, translated, {culturalEntry:embeddedSlang.entries.length > 0,onDevice,musicSourceMode:autoMusic?"auto":"selected"});
      const referenceMatch = translationPurpose === "academic" && direction === "ec-en" ? findAcademicReference(sourceText) : null;
      const regionalReview = targetLanguage === "es-EC"
        ? "Ecuadorian review pending"
        : languageFamily(targetLanguage) === "es"
          ? `${languageLabel(targetLanguage)} review pending`
          : `${languageLabel(targetLanguage)} refinement pending`;
      $("#literal-result").textContent = translationPurpose === "academic"
        ? `${languageLabel(targetLanguage)} · ${referenceMatch ? "reference-based editorial draft" : "editable research draft"}`
        : `General draft · ${regionalReview}`;
      $("#usage-note").innerHTML = translationPurpose === "academic"
        ? referenceMatch
          ? ECUADOR_RESEARCH_REFERENCES.includes(referenceMatch.reference)
            ? `<strong>Ecuadorian research excerpt · expert review pending</strong><span>${escapeHtml(referenceMatch.reference.authors.join(" & "))} (${referenceMatch.reference.year}) · ${escapeHtml(referenceMatch.reference.region)} · ${escapeHtml(referenceMatch.reference.journal)}. Selected sentences stay local. ${escapeHtml(referenceMatch.reference.changes)} <a href="${referenceMatch.reference.url}" target="_blank" rel="noopener">${escapeHtml(referenceMatch.reference.title)} · DOI ${escapeHtml(referenceMatch.reference.doi)}</a> · <a href="${referenceMatch.reference.licenseUrl}" target="_blank" rel="noopener">${escapeHtml(referenceMatch.reference.licenseCode.replaceAll("-"," "))}</a>.</span>`
            : `<strong>Mexican Spanish research reference · expert review pending</strong><span>Escalante (2017), northern Mexico. Editorial wording uses requests, politeness, and head act; both groups of 30 and all four measures are retained. This matched abstract stays local and is analysed in its Mexican context, independently of Ecuadorian or Bolivian conversational rules.</span>`
          : `<strong>Academic machine draft · ${languageLabel(sourceLanguage)} source</strong><span>Headings, paragraph breaks, citations, DOI/URLs, and numbers are protected where possible. Specialist terminology follows the research context; conversational regional rewrites are not applied. Check terminology and claims before publication.</span>`
        : `<strong>General machine translation · regional review pending</strong><span>This works for text outside the local phrase library. The label names the requested variety without pretending the free engine guarantees that dialect.</span>`;
      // “Spanish-speaking” concerns language ability. The valid Ecuadorian
      // options hispanohablante and hispanoparlante must not be confused with
      // “español”, which can name the language or refer to Spain.
      const communityTerm=typeof HablaLanguageCommunity!=="undefined"
        ? HablaLanguageCommunity.lookup(sourceText,{source:sourceLanguage,target:targetLanguage}) : null;
      if(communityTerm!==null){
        $("#translation-result .result-label").textContent=`${languageLabel(targetLanguage)} · language community`;
        $("#literal-result").textContent="Language spoken · not nationality";
        $("#usage-note").innerHTML='<strong>Meaning preserved</strong><span>Preferred: hispanohablante. Also valid: hispanoparlante. In country/community contexts: de habla hispana. “Español” alone does not reliably mean “Spanish-speaking.”</span>';
      }
      if(inputType==='image'&&translationPurpose!=='academic')$("#usage-note").innerHTML+='<p>Image paragraphs are retained while screen line wraps are joined. Counting, dancing and volume wording can be clarified from context; figurative lyrics still need review.</p>';
      if(typeof HablaMixedTranslation!=='undefined' &&
         HablaMixedTranslation.detect(sourceText,{source:sourceLanguage,target:targetLanguage,purpose:translationPurpose,way:direction}).mixedDevelopment){
        const note=document.createElement("p");
        const lost=HablaMixedTranslation.lostMeaning(translated,sourceText,{source:sourceLanguage,target:targetLanguage,purpose:translationPurpose,way:direction});
        note.textContent=lost
          ? "Meaning warning: the original says developing the app. The draft may have lost that action. Check this English text before sharing."
          : "Spanish-English mixed input: ‘developing’ was interpreted as ‘desarrollando’ for translation. Your original words remain unchanged.";
        $("#usage-note").append(note);
      }
      const embeddedEntry = embeddedSlang.entries[0];
      if (embeddedEntry && translationPurpose !== "academic") {
        const literalMeaning = englishVariant === "uk" ? embeddedEntry.literalUk : embeddedEntry.literalUs;
        const regionalMeaning = englishVariant === "uk" ? embeddedEntry.uk : embeddedEntry.us;
        $("#translation-result .result-label").textContent = `${languageLabel(targetLanguage)} · context-aware work expression`;
        $("#literal-result").textContent = `Recognized ${languageLabel(sourceLanguage)} work expression: ${embeddedEntry.spanish} = ${regionalMeaning} · Literal word: ${literalMeaning}`;
        $("#usage-note").innerHTML = `<strong>Work expression recognized · ${escapeHtml(languageLabel(sourceLanguage))}</strong><span>${escapeHtml(embeddedEntry.note)} The sentence was translated after replacing the slang sense with neutral Spanish; the original text remains unchanged.</span>`;
      }
      const localVulgarity = HablaSpanishContext.translateEnglishVulgarity(sourceText,{source:sourceLanguage,target:targetLanguage,purpose:translationPurpose});
      const localIndifference = HablaSpanishContext.translateIndifferenceExpression(sourceText,{source:sourceLanguage,target:targetLanguage});
      const wordMeanings = HablaSpanishContext.wordMeanings(sourceText,{source:sourceLanguage,target:targetLanguage,purpose:translationPurpose});
      if(wordMeanings.length){
        $("#translation-result .result-label").textContent = `${languageLabel(targetLanguage)} · word meanings`;
        $("#literal-result").textContent = "Local editorial word lookup · context required";
        $("#usage-note").innerHTML = '<strong>Choose the intended meaning</strong><span>This isolated word can have different meanings. Review Context &amp; regional expressions below and choose the sense you intend. The choices edit your draft and stay on this device.</span>';
      }
      if (localVulgarity) {
        $("#translation-result .result-label").textContent = `${languageLabel(targetLanguage)} · vulgar counterpart`;
        $("#literal-result").textContent = "Local editorial phrase · shared Spanish · country review pending";
        $("#usage-note").innerHTML = `<strong>${escapeHtml(localVulgarity.register)}</strong><span>${escapeHtml(localVulgarity.note)} ${escapeHtml(localVulgarity.scope)} <a href="${escapeHtml(localVulgarity.url)}" target="_blank" rel="noreferrer">Spanish sense: RAE · DLE</a></span>`;
      }
      if(localIndifference) {
        $("#translation-result .result-label").textContent = `${languageLabel(targetLanguage)} · idiomatic meaning`;
        $("#literal-result").textContent = "Local editorial expression · source register retained";
        $("#usage-note").innerHTML = `<strong>${escapeHtml(localIndifference.register)}</strong><span>${escapeHtml(localIndifference.note)} ${escapeHtml(localIndifference.scope)} <a href="${escapeHtml(localIndifference.url)}" target="_blank" rel="noreferrer">Usage: ASALE</a></span>`;
      }
      if (onDevice && !referenceMatch && !localVulgarity && !localIndifference && !wordMeanings.length) {
        $("#literal-result").textContent += " · On-device machine draft";
        $("#usage-note").innerHTML += "<p>Translated on this device without the online service. Review regional wording and research terminology.</p>";
      }
    } catch (error) {
      if (!current()) return;
      activeTranslationEdit = null;
      $("#natural-result").removeAttribute("contenteditable");
      updateTranslationEditUi();
      result.hidden = true;
      missing.hidden = false;
      lastCompletedTranslation = null;
      const message = translationErrorMessage(error);
      $("#no-result p").textContent = message.title;
      $("#no-result small").textContent = message.help;
      $("#no-result").dataset.translationError = error.code || "service";
      if ($("#retry-translation")) $("#retry-translation").hidden = false;

    }
    return;
  }
  result.hidden = false;
  missing.hidden = true;
  const isCultural = phrase.culturalEntry === true;
  const isPreservedCultural = Boolean(preservedEntry);
  $("#translation-result .result-label").textContent = isPreservedCultural
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
    : literal
    ? `Literal/context alternatives: ${literal}`
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

function updateEcuadorResearchPaperLink() {
  const selected = $("#ecuador-research-source")?.value;
  const reference = ECUADOR_RESEARCH_REFERENCES.find(item => item.id === selected) || ECUADOR_RESEARCH_REFERENCE;
  const link = $("#read-ecuador-paper");
  if (link) {
    link.href = reference.url;
    link.setAttribute("aria-label", `Read full paper: ${reference.title}`);
  }
}

function closeImportedDocument() {
  wholeDocumentTools?.pause('Document closed. Completed progress is saved; reopen it under Saved document progress.');
  if(typeof HablaScreenshot!=='undefined')HablaScreenshot.clear();
  documentImportRequest += 1;
  documentImportActive = false;
  documentLoading = false;
  importedDocument = null;
  const preview = $("#document-preview");
  if (preview) preview.hidden = true;
  if ($("#document-file")) $("#document-file").value = "";
  if ($("#document-status")) $("#document-status").textContent = "";
  wholeDocumentTools?.refresh();
}

function safeDocumentSections(text) {
  return HablaDocument.sections(text).flatMap(section => {
    if (splitLongTranslationText(protectResearchTokens(section).text).filter(chunk => !chunk.separator).length <= 20) return [section];
    return HablaDocument.sections(section, Math.ceil(section.length / 2)).flatMap(safeDocumentSections);
  });
}

function selectDocumentSection(index) {
  if (!importedDocument) return;
  wholeDocumentTools?.pause('Paused while reviewing a section. Resume entire document when ready.');
  cancelMusicListening();
  musicTranscriptReview = false;
  musicCapturedText = "";
  updateMusicListenLabel();
  $("#translate-music").disabled = true;
  clearTimeout(translationTimer);
  translationRequest += 1;
  stopSpeechPlayback();
  documentImportActive = true;
  importedDocument.index = index;
  const image=importedDocument.kind==='image';
  $("#document-section-controls").hidden=image&&importedDocument.sections.length===1;
  $("#translate-document").textContent=image?'Translate image text':'Translate this section';
  $("#close-document").textContent=image?'Close image':'Close document';
  $("#compare-english").disabled = true;
  $("#translator-input").value = importedDocument.sections[index];
  $("#translation-result").hidden = true;
  $("#no-result").hidden = true;
  $("#english-comparison").hidden = true;
  $("#document-status").textContent = `${importedDocument.name} · section ${index + 1} of ${importedDocument.sections.length} · ${importedDocument.total.toLocaleString()} characters imported. Preview only; click Translate this section when ready.`;
  lastCompletedTranslation = null;
  activeTranslationEdit = null;
  wholeDocumentTools?.refresh();
  const saved=wholeDocumentTools?.section(index);
  if(saved?.translation)showDocumentSectionDraft(index,saved,{sourceLanguage,targetLanguage,onDevice:typeof HablaOffline!=='undefined'&&HablaOffline.shouldUse()});
}

function populateDocumentSections() {
  const select=$('#document-section');select.replaceChildren();
  importedDocument.sections.forEach((text,index)=>{
    const option=document.createElement('option');option.value=String(index);
    option.textContent=`Section ${index+1} of ${importedDocument.sections.length} · ${text.length.toLocaleString()} characters`;
    select.append(option);
  });
  documentLoading=false;$('#document-preview').hidden=false;$('#translate-document').disabled=false;
  selectDocumentSection(0);
}

function showDocumentSectionDraft(index,part,job) {
  if(!importedDocument || importedDocument.index!==index || importedDocument.sections[index].trim()!==part.source.trim()
    || sourceLanguage!==job.sourceLanguage || targetLanguage!==job.targetLanguage)return;
  setEditableTranslation(part.source.trim(),part.translation,{onDevice:job.onDevice,documentDraft:true});
  $('#translation-result').hidden=false;
  $('#translation-result .result-label').textContent=languageLabel(targetLanguage)+' document draft';
  $('#literal-result').textContent='Editable document translation · saved progress';
  $('#usage-note').textContent='Review terminology and wording against the source before sharing.';
}

function bindWholeDocumentTools() {
  if(typeof HablaWholeDocument==='undefined')return;
  wholeDocumentTools=HablaWholeDocument.bind({
    getDocument:()=>{
      if(!documentImportActive||!importedDocument||documentLoading||importedDocument.kind==='image')return null;
      importedDocument.sections[importedDocument.index]=$('#translator-input').value;
      return {name:importedDocument.name,sections:importedDocument.sections};
    },
    getRoute:()=>({sourceLanguage,targetLanguage,purpose:translationPurpose,onDevice:typeof HablaOffline!=='undefined'&&HablaOffline.shouldUse()}),
    label:languageLabel,
    formatError:error=>{const message=translationErrorMessage(error);return message.title+' '+message.help;},
    translate:(text,options)=>requestGeneralTranslation(text,languageFamily(options.sourceLanguage)==='en'?'en-ec':'ec-en',{
      source:options.sourceLanguage,target:options.targetLanguage,purpose:options.purpose,onDevice:options.onDevice,
      isCurrent:options.isCurrent,chunkProgress:options.chunkProgress}),
    onSection:showDocumentSectionDraft,
    openDocument:job=>{
      closeImportedDocument();cancelMusicListening();clearTimeout(translationTimer);translationRequest++;
      sourceLanguage=job.sourceLanguage;targetLanguage=job.targetLanguage;syncLanguagePair();
      setTranslationPurpose(job.purpose,false);
      importedDocument={name:job.name,sections:job.parts.map(part=>part.source),index:0,total:job.parts.reduce((n,part)=>n+part.source.length,0)};
      documentImportActive=true;populateDocumentSections();
    }
  });
}

function beginScreenshotImport() {
  wholeDocumentTools?.pause('Paused while opening an image. Document progress is saved.');
  cancelMusicListening();
  musicTranscriptReview = false;
  musicCapturedText = "";
  updateMusicListenLabel();
  $("#translate-music").disabled = true;
  return {token:++documentImportRequest,text:$("#translator-input").value};
}

function previewScreenshotText(extracted,guard) {
  if (guard.token !== documentImportRequest || $("#translator-input").value !== guard.text) return false;
  clearTimeout(translationTimer);
  translationRequest += 1;
  stopSpeechPlayback();
  documentLoading = false;
  documentImportActive = true;
  importedDocument = {name:"Image",kind:"image",sections:safeDocumentSections(extracted.text),index:0,total:extracted.text.length};
  const select = $("#document-section");
  select.replaceChildren();
  importedDocument.sections.forEach((text,index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `Section ${index+1} of ${importedDocument.sections.length}`;
    select.append(option);
  });
  $("#document-preview").hidden = false;
  $("#translate-document").disabled = false;
  selectDocumentSection(0);
  $("#document-status").textContent = `Image · ${extracted.text.length.toLocaleString()} characters read. Edit the text below to remove anything you do not want translated.`;
  return true;
}

function bindDocumentTools() {
  if (!$("#choose-document")) return;
  $("#compare-english").disabled = true;
  $("#choose-document").addEventListener("click", () => {wholeDocumentTools?.pause('Paused while choosing another document. Progress is saved.');$("#document-file").click();});
  $("#document-file").addEventListener("change", async event => {
    const file = event.target.files[0];
    if (!file) return;
    wholeDocumentTools?.pause('Paused while opening another document. Progress is saved.');
    cancelMusicListening();
    musicTranscriptReview = false;
    musicCapturedText = "";
    updateMusicListenLabel();
    $("#translate-music").disabled = true;
    if(typeof HablaScreenshot!=='undefined')HablaScreenshot.clear();
    const token = ++documentImportRequest;
    clearTimeout(translationTimer);
    translationRequest += 1;
    stopSpeechPlayback();
    documentImportActive = true;
    documentLoading = true;
    importedDocument = null;
    $("#document-preview").hidden = false;
    $("#document-section").replaceChildren();
    $("#translate-document").disabled = true;
    $("#translator-input").value = "";
    $("#translation-result").hidden = true;
    $("#english-comparison").hidden = true;
    $("#document-status").textContent = `Reading ${file.name} on your device…`;
    try {
      const extracted = await HablaDocument.extract(file);
      if (token !== documentImportRequest) return;
      importedDocument = {name:file.name, sections:safeDocumentSections(extracted.text), index:0, total:extracted.text.length};
      preservedCulturalContext = null;
      syncLanguagePair();
      setTranslationPurpose("academic", false);
      populateDocumentSections();
    } catch (error) {
      if (token !== documentImportRequest) return;
      documentLoading = false;
      $("#document-status").textContent = error.message || "This document could not be read. Try saving a .docx copy in Word.";
    } finally {
      if (token === documentImportRequest) event.target.value = "";
    }
  });
  $("#document-section").addEventListener("change", event => {
    if (!importedDocument) return;
    // Preserve source edits while moving between sections in this session.
    importedDocument.sections[importedDocument.index] = $("#translator-input").value;
    selectDocumentSection(Number(event.target.value));
  });
  $("#translate-document").addEventListener("click", async () => {
    if (!importedDocument) return;
    if(wholeDocumentTools?.runner.busy)return;
    clearTimeout(translationTimer);
    $("#document-status").textContent = `${importedDocument.name} · translating section ${importedDocument.index + 1} of ${importedDocument.sections.length}.`;
    lastCompletedTranslation = null;
    const document = importedDocument;
    const index = document.index;
    const text = $("#translator-input").value.trim();
    await renderTranslation({allowImported:true});
    if (importedDocument !== document || importedDocument.index !== index || $("#translator-input").value.trim() !== text) return;
    recordCurrentDocumentDraft();
    $("#document-status").textContent = `${document.name} · section ${index + 1} of ${document.sections.length} · ${lastCompletedTranslation?.source === text ? "draft ready. Compare U.K. / U.S. English below, or choose the next section." : "translation did not finish. Review the message below and try again."}`;
  });
  $("#close-document").addEventListener("click", () => {
    closeImportedDocument();
    translationRequest += 1;
    clearTimeout(translationTimer);
    $("#translator-input").value = "";
    renderTranslation();
  });
  $("#compare-english").addEventListener("click", () => {
    const completed = lastCompletedTranslation;
    if (!completed || completed.source !== $("#translator-input").value.trim() || completed.targetLanguage !== targetLanguage || completed.sourceLanguage !== sourceLanguage || languageFamily(completed.targetLanguage) !== "en") {
      showToast("Translate a section into English first, then compare.");
      return;
    }
    // Use the editable draft currently on screen; no second service request.
    const draft = $("#natural-result").textContent;
    comparisonContext = `comparison|${completed.sourceLanguage}|${completed.purpose}|${academicSourceFingerprint(completed.source)}`;
    comparisonChanges = [];
    comparisonPurpose = completed.purpose;
    ["uk", "us"].forEach(variant => {
      const target = variant === "uk" ? "en-GB" : "en-US";
      const adaptation = typeof HablaEnglish !== "undefined" ? HablaEnglish.adapt(draft,target,{source:completed.source,purpose:completed.purpose}) : {text:convertEnglishVariety(draft,target),changes:[]};
      const generated = adaptation.text;
      comparisonChanges.push(...adaptation.changes);
      const key = `${comparisonContext}|${variant}`;
      $("#comparison-" + variant).value = typeof translationEdits[key]?.text === "string" ? translationEdits[key].text : generated;
    });
    $("#english-comparison").hidden = false;
    updateEnglishComparisonDifferences();
  });
  ["uk", "us"].forEach(variant => $("#comparison-" + variant).addEventListener("input", event => {
    if (!comparisonContext) return;
    translationEdits[`${comparisonContext}|${variant}`] = {text:event.target.value, updatedAt:new Date().toISOString()};
    persistTranslationEdits();
    updateEnglishComparisonDifferences();
  }));
}

function updateEnglishComparisonDifferences() {
  if (typeof HablaEnglish === "undefined" || !$("#comparison-summary")) return;
  const uk = $("#comparison-uk").value, us = $("#comparison-us").value;
  const diff = HablaEnglish.differences(uk,us);
  $("#comparison-summary").textContent = diff.same ? "Same wording in both." : "Highlighted words differ between the two drafts. Your edits are included.";
  ["uk","us"].forEach(variant => {
    $("#comparison-highlight-" + variant).innerHTML = diff[variant].map(run => run.changed ? `<mark>${escapeHtml(run.text)}</mark>` : escapeHtml(run.text)).join("");
  });
  const notes = [], seen = new Set();
  if (comparisonPurpose === "academic") notes.push("Research mode keeps specialist vocabulary unchanged; quotations and reference strings are preserved during adaptation.");
  if (!diff.same) for (const change of comparisonChanges) {
    if (change.type !== "vocabulary" || seen.has(change.label)) continue;
    const terms = change.label.split(":").at(-1).trim().split(" / ");
    if (!terms.every(term => new RegExp(`\\b${term}s?\\b`,"i").test(uk + " " + us))) continue;
    seen.add(change.label);
    notes.push(`${change.label}: ${change.reason}`);
  }
  if (!diff.same && comparisonChanges.some(change=>change.type === "spelling")) notes.push("Spelling adaptations use common regional conventions. Both varieties can share the same wording.");
  $("#comparison-notes").innerHTML = notes.map(note=>`<p>${escapeHtml(note)}</p>`).join("");
}

function setTranslationPurpose(purpose, rerender=true) {
  if((purpose==='academic'?'academic':'everyday')!==translationPurpose)wholeDocumentTools?.pause('Paused because the translation purpose changed. Progress is saved.');
  translationPurpose = purpose === "academic" ? "academic" : "everyday";
  localStorage.setItem(TRANSLATION_PURPOSE_STORAGE_KEY, translationPurpose);
  $$('[data-purpose]').forEach(button => {
    const active = button.dataset.purpose === translationPurpose;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.body.classList.toggle("research-mode", translationPurpose === "academic");
  const note = $("#research-mode-note");
  if (note) {
    note.hidden = translationPurpose !== "academic";
    note.textContent = `Research context: ${languageLabel(sourceLanguage)}. Specialist terminology follows the paper’s field and source context, independently of Ecuadorian or Bolivian conversational rules. Longer passages retain paragraph breaks and protected reference strings. Drafts require expert review before publication.`;
  }
  const referenceTools = $("#research-reference-tools");
  if (referenceTools) referenceTools.hidden = translationPurpose !== "academic";
  if (translationPurpose === "academic") updateEcuadorResearchPaperLink();
  const input = $("#translator-input");
  if (input) {
    input.rows = translationPurpose === "academic" ? 8 : 4;
    input.placeholder = translationPurpose === "academic"
      ? `Paste ${languageLabel(sourceLanguage)} research text, an abstract, or several paragraphs…`
      : "Type or tap the microphone to speak…";
  }
  if (musicListening && musicListening.live.purpose !== translationPurpose) refreshMusicLiveRoute();
  wholeDocumentTools?.refresh();
  if (rerender && input?.value.trim()) renderTranslation();
}

// Existing local wording choices; tone is described only where the phrase supplies it.
function translationWordingAlternatives() {
  const completed=lastCompletedTranslation;
  if(!completed || completed.swapPair || translationPurpose==="academic"
    || completed.source!==$("#translator-input").value.trim()
    || completed.sourceLanguage!==sourceLanguage || completed.targetLanguage!==targetLanguage)return [];
  const localRoute=(sourceLanguage==="es-EC" && languageFamily(targetLanguage)==="en") || (targetLanguage==="es-EC" && languageFamily(sourceLanguage)==="en");
  const phrase=localRoute ? matchPhrase(completed.source) : null;
  if(!phrase)return [];
  const choices=languageFamily(targetLanguage)==="es"
    ? [{text:phrase.es,label:"Direct wording / Versión directa",note:"A direct version of the source. / Una versión directa del original."},
       {text:phrase.natural,label:"Conversational wording / Uso conversacional",note:phrase.note}]
    : [{text:phrase.us||phrase.en,label:"U.S. English / Inglés estadounidense",note:phrase.note},
       {text:phrase.uk||phrase.en,label:"U.K. English / Inglés británico",note:phrase.note}];
  const seen=new Set([$("#natural-result").textContent.trim()]);
  return choices.flatMap(choice=>typeof choice.text==="string" ? choice.text.split(" / ").map(text=>({...choice,text:text.trim()})) : [])
    .filter(choice=>choice.text && !seen.has(choice.text) && seen.add(choice.text));
}

function swapDirection() {
  cancelMusicListening();
  saveActiveTranslationEdit();
  const input=$("#translator-input"), completed=lastCompletedTranslation;
  const paired=activeTranslationEdit && completed && !$("#translation-result").hidden
    && completed.source===input.value.trim()
    && completed.sourceLanguage===sourceLanguage && completed.targetLanguage===targetLanguage
    && completed.purpose===translationPurpose;
  const original=input.value, translated=$("#natural-result").textContent;
  clearTimeout(translationTimer);
  translationRequest += 1; // Late responses from the old direction cannot replace the pair.
  [sourceLanguage,targetLanguage] = [targetLanguage,sourceLanguage];
  preservedCulturalContext = null;
  syncLanguagePair();
  setTranslationPurpose(translationPurpose,false);
  showTranslationLanguageWarning(null);
  if(paired && translated.trim()) {
    input.value=translated;
    setEditableTranslation(translated.trim(),original,{swapPair:true});
    $("#translation-result").hidden=false;
    $("#no-result").hidden=true;
    $("#translation-result .result-label").textContent=languageLabel(targetLanguage)+" · preserved text / texto conservado";
    $("#literal-result").textContent="Original text preserved / Texto original conservado";
    $("#usage-note").textContent="The completed text pair was switched without retranslating. / Se intercambió el par de textos sin volver a traducir.";
    if($("#english-comparison"))$("#english-comparison").hidden=true;
  } else {
    // Before a translation completes, only the language selectors can switch.
    // Do not submit unchanged text under the opposite source language.
    lastCompletedTranslation=null;activeTranslationEdit=null;
    $("#translation-result").hidden=true;
    $("#natural-result").removeAttribute("contenteditable");
    updateTranslationEditUi();
    if(input.value.trim())showToast("Languages switched. Check the source language before translating. / Idiomas cambiados. Revisa el idioma de origen antes de traducir.");
  }
}

function setMode(mode) {
  if (mode !== "translate") cancelMusicListening();
  if(mode !== "conversation") leaveConversation();
  else { conversationActive = true; syncConversationLocaleUi(); }
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

const SPANISH_CONVERSATION_HINTS = new Set(["a","al","algo","aqui","bien","como","con","cuando","de","del","despues","donde","el","ella","en","es","esta","estoy","gracias","hola","la","las","lo","los","me","mi","muy","no","para","pero","por","porque","que","quiero","se","si","soy","su","te","tengo","tu","un","una","vale","vamos","verga","voy","y","ya"]);
const ENGLISH_CONVERSATION_HINTS = new Set(["a","after","am","and","are","around","because","but","can","do","going","good","hello","here","how","i","in","is","it","me","my","no","not","of","on","please","so","thank","that","the","there","this","to","want","we","what","when","where","with","yes","you","your"]);

function conversationLanguageEvidence(text, expectedRole, expectedLocale=conversationLocales()[expectedRole]) {
  const clean = normalize(text);
  const words = clean.split(" ").filter(Boolean);
  let spanishScore = words.filter(word => SPANISH_CONVERSATION_HINTS.has(word)).length;
  let englishScore = words.filter(word => ENGLISH_CONVERSATION_HINTS.has(word)).length;
  if (/[¿¡ñáéíóúü]/i.test(text)) spanishScore += 3;
  if (words.some(word => /(?:ando|iendo|ción|ciones|mente)$/.test(word))) spanishScore += 2;
  if (/\b(?:i'm|i've|don't|can't|won't|it's|you're|we're|they're)\b/i.test(text)) englishScore += 3;
  if (spanishScore >= englishScore + 2 || (spanishScore > englishScore && /\b(?:hola|gracias|adios)\b/.test(clean))) return {family:"es",confident:true};
  if (englishScore >= spanishScore + 2 || (englishScore > spanishScore && /\b(?:hello|thanks|yes|goodbye)\b/.test(clean))) return {family:"en",confident:true};
  return {family:languageFamily(expectedLocale),confident:false};
}

function detectConversationLanguage(text, expectedRole) {
  return conversationLanguageEvidence(text,expectedRole).family;
}

function setConversationPlayback(value) {
  conversationPlayback = value === "text" ? "text" : "spoken";
  localStorage.setItem(CONVERSATION_PLAYBACK_KEY,conversationPlayback);
  if(conversationPlayback === "text")stopSpeechPlayback();
  $("#conversation-playback").value = conversationPlayback;
  $("#conversation-mode-status").textContent = conversationPlayback === "text"
    ? "Text only · translations stay silent. Use Hear translation when you choose."
    : "Conversation · completed, confirmed turns are spoken after the microphone closes.";
}

function leaveConversation() {
  if(!conversationActive)return;
  conversationActive = false;
  if(activeRecognitionButton?.dataset.speakerRole)cancelListening(true);
  stopSpeechPlayback();
  renderTurns();
}

function hearConversationTurn(index) {
  const turn=turns[index];
  if(!turn||turn.pending||turn.failed||recognition||liveConversationTurn)return;
  say(turn.translation,turn.target);
}

async function submitConversationText() {
  const input=$("#conversation-text"),text=input.value.trim();
  if(!text||conversationComposerBusy)return;
  if(recognition)return showToast("Finish the microphone turn before adding text.");
  conversationActive = true;
  const role=$("#conversation-text-speaker").value === "spanish" ? "spanish" : "english";
  const forcedRole=$("#conversation-text-language").value;
  const generation=conversationGeneration;
  conversationComposerBusy = true;
  $("#conversation-text-send").disabled = true;
  try {
    await handleConversationText(role,speakerName(role),text,true,{forcedRole,locales:conversationLocales()});
    if(generation===conversationGeneration&&input.value.trim()===text)input.value="";
  } finally {
    conversationComposerBusy = false;
    $("#conversation-text-send").disabled = false;
  }
}

function renderTurns() {
  const box = $("#conversation-turns");
  const visibleTurns = liveConversationTurn ? [...turns, liveConversationTurn] : turns;
  box.innerHTML = visibleTurns.map((turn,index) => `<article class="turn ${(turn.slot||turn.role) === "spanish" ? "spanish-speaker" : "english-speaker"} ${turn.pending ? "pending" : ""}"><small><span data-ui-content>${escapeHtml(turn.speaker)}</span> · ${escapeHtml(turn.languageLabel || (turn.role === "spanish" ? "Spanish" : "English"))}</small>${turn.sourceLocale ? `<small class="turn-route">${escapeHtml(languageLabel(turn.sourceLocale))} → ${escapeHtml(languageLabel(turn.target))}</small>` : ""}<p>${escapeHtml(turn.source)}</p><p class="translated">${escapeHtml(turn.translation || (turn.pending ? "Listening…" : ""))}</p>${!turn.pending&&!turn.failed ? `<button type="button" class="turn-hear" data-conversation-hear="${index}" ${recognition||liveConversationTurn ? "disabled" : ""}>🔊 Hear translation</button>` : ""}</article>`).join("");
  box.lastElementChild?.scrollIntoView({block:"nearest",behavior:"auto"});
}

function startConversation(role, button) {
  startListening(conversationOptions(role, button));
}

function conversationLocales() {
  const pair = [targetLanguage, sourceLanguage];
  return {
    spanish:conversationLocaleOverrides.spanish || pair.find(code => languageFamily(code) === "es") || "es-EC",
    english:conversationLocaleOverrides.english || pair.find(code => languageFamily(code) === "en") || (englishVariant === "uk" ? "en-GB" : "en-US")
  };
}

function speakerSlotLanguageLabel(role) {
  return languageFamily(conversationLocales()[role])==="es" ? "Español" : "English";
}
function syncConversationLocaleUi() {
  const locales=conversationLocales();
  for(const role of ['english','spanish']) {
    const select=$('#conversation-'+role+'-language');
    if(select)select.value=locales[role];
    const button=document.querySelector('[data-speaker-role="'+role+'"]');
    if(button?.dataset) {
      const spanish=languageFamily(locales[role])==='es';
      const hint=spanish ? 'Speak Spanish / Habla español' : 'Speak English / Habla inglés';
      button.dataset.idleHint=hint;
      button.dataset.activeHint="Listening… / Escuchando…";
      button.dataset.finishingHint="Finishing… / Terminando…";
      button.setAttribute('aria-label',speakerName(role)+' · '+(spanish ? 'Record Spanish; tap again to finish / Grabar español; toca otra vez para terminar' : 'Record English; tap again to finish / Grabar inglés; toca otra vez para terminar'));
      const text=button.querySelector?.('small:last-child');
      if(text && activeRecognitionButton!==button)text.textContent=hint;
    }
    syncSpeakerRegion(role);
    const textLabel=document.querySelector('[data-conversation-text-name="'+role+'"]');
    if(textLabel)textLabel.textContent=speakerName(role)+" · "+conversationProfileRegion(speakerName(role))+" · "+speakerSlotLanguageLabel(role);
  }
}
function setConversationLocale(role,locale,savePerson=true) {
  if(!['english','spanish'].includes(role)||!Object.hasOwn(TRANSLATOR_LANGUAGES,locale))return;
  if(activeRecognitionButton?.dataset?.speakerRole===role)cancelListening(true);
  if(savePerson) {
    const profile=speakerRegionProfile(speakerName(role));
    profile.locales[role]=locale;persistSpeakerProfile(speakerName(role),profile);
  }
  conversationLocaleOverrides[role]=locale;
  localStorage.setItem(CONVERSATION_LOCALES_KEY,JSON.stringify(conversationLocaleOverrides));
  syncConversationLocaleUi();
}
function conversationTranslationRoute(role,family,locales) {
  const other=role==='english'?'spanish':'english';
  const pair=[targetLanguage,sourceLanguage];
  const fallback=base=>pair.find(code=>languageFamily(code)===base)||(base==='es'?'es-EC':englishVariant==='uk'?'en-GB':'en-US');
  const targetFamily=family==='es'?'en':'es';
  return {
    source:[locales[role],locales[other],fallback(family)].find(code=>code&&languageFamily(code)===family),
    target:[locales[other],locales[role],fallback(targetFamily)].find(code=>code&&languageFamily(code)===targetFamily)
  };
}

function conversationOptions(role, button) {
  conversationActive = true;
  const name = speakerName(role);
  const locales = conversationLocales();
  const way = languageFamily(locales[role]) === "es" ? "ec-en" : "en-ec";
  const generation = conversationGeneration;
  const firstTurnIndex = turns.length;
  let captureError="";
  const unavailable=!(window.SpeechRecognition||window.webkitSpeechRecognition);
  $("#conversation-status").textContent = unavailable ? "Speech recognition is unavailable here. Write a turn below." : `Listening to ${name} · microphone set to ${languageLabel(locales[role])}…`;
  return {
    way, lang:locales[role], button, correctTranscript:false,
    onText:(text, final, metadata) => handleConversationText(role, name, text, final, {...metadata,locales}),
    onEnd:() => {
      if(generation !== conversationGeneration)return;
      renderTurns();
      if (generation === conversationGeneration && turns.length > firstTurnIndex) finishConversationTurn(turns[turns.length-1]);
      else $("#conversation-status").textContent = captureError || "No words captured. Try the microphone again or write a turn below.";
    },
    onError:error => { if(generation===conversationGeneration&&error!=="aborted") { captureError=recognitionErrorMessage(error)+" You can also write a turn below."; $("#conversation-status").textContent=captureError; } }
  };
}

function finishConversationTurn(turn) {
  if (!turn || turn.pending || recognition || liveConversationTurn || turns[turns.length-1] !== turn || turn.finished) return;
  turn.finished = true;
  if (conversationActive && conversationPlayback === "spoken" && !turn.provisional && !turn.failed && !turn.languageUncertain) say(turn.translation, turn.target);
  $("#conversation-status").textContent = turn.failed
    ? "Translation is temporarily unavailable, but your dictated text is still shown above."
    : `${turn.languageLabel}${turn.switched ? " · translation direction switched" : ""} · translation complete${turn.languageUncertain ? "; check the language before using it" : ""}.`;
}

async function handleConversationText(expectedRole, speaker, text, final, {provisional=false, locales=conversationLocales(),forcedRole}={}) {
  const generation = conversationGeneration;
  const manual=forcedRole === "spanish" || forcedRole === "english";
  const evidence=manual ? {family:forcedRole === "spanish" ? "es" : "en",confident:true} : conversationLanguageEvidence(text,expectedRole,locales[expectedRole]);
  const detectedFamily = evidence.family;
  const actualRole = detectedFamily === "es" ? "spanish" : "english";
  const way = actualRole === "spanish" ? "ec-en" : "en-ec";
  const languageLabel = `${detectedFamily === "es" ? "Spanish" : "English"} ${manual ? "chosen" : evidence.confident ? "from text" : "selected · language uncertain"}${provisional ? " · transcript needs checking" : ""}`;
  const switched = detectedFamily !== languageFamily(locales[expectedRole]);
  liveConversationTurn = {role:actualRole,slot:expectedRole,speaker,source:text,translation:final ? "Translating…" : "Listening…",languageLabel,pending:true};
  renderTurns();
  $("#conversation-status").textContent = `${languageLabel}${switched ? " · translation direction switched automatically" : ""}: ${text}`;
  if (!final) return;

  const route=conversationTranslationRoute(expectedRole,detectedFamily,locales);
  const target=route.target, sourceLocale=route.source;
  const turn = {role:actualRole,slot:expectedRole,speaker,source:text,sourceLocale,translation:"Translating…",languageLabel,pending:true,target,provisional,switched,languageUncertain:!evidence.confident};
  liveConversationTurn = null;
  turns.push(turn);
  renderTurns();
  const spanishLocale=detectedFamily==="es" ? sourceLocale : target;
  const englishLocale=detectedFamily==="en" ? sourceLocale : target;
  const phrase = spanishLocale === "es-EC" ? matchPhrase(text, way) : null;
  try {
    turn.translation = phrase
      ? way === "en-ec" ? phrase.natural : (englishLocale === "en-GB" ? phrase.uk : phrase.us) || phrase.en
      : await requestGeneralTranslation(text, way, {purpose:"everyday",source:sourceLocale,target,isCurrent:()=>generation===conversationGeneration&&turns.includes(turn)});
    if (generation !== conversationGeneration || !turns.includes(turn)) return;
    turn.pending = false;
    renderTurns();
    // Earlier turns may finish out of order. Keep their text without interrupting
    // a newer speaker or replacing the current turn's status.
    finishConversationTurn(turn);
  } catch {
    if (generation !== conversationGeneration || !turns.includes(turn)) return;
    turn.translation = "Translation is temporarily unavailable. Your dictated text was preserved.";
    turn.pending = false;
    turn.failed = true;
    renderTurns();
    finishConversationTurn(turn);
  }
}

function clearConversation() {
  conversationGeneration += 1;
  cancelListening();
  stopSpeechPlayback();
  turns = [];
  liveConversationTurn = null;
  renderTurns();
  if($("#conversation-text"))$("#conversation-text").value="";
  $("#conversation-status").textContent = "Conversation cleared. Nothing was stored.";
}

async function loadEvidence() {
  const status = $("#dictionary-status");
  if (!status) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(),10000);
  try {
    const paths = [
      "data/learner-entries-v1.json",
      "data/vocabulary.json",
      "data/candidate-lexicon.json",
      "data/sources.json",
      "data/review-queue.json",
      "data/ecuador-bolivia-comparisons-v1.json"
    ];
    const responses = await Promise.all(paths.map(path => fetch(path, {cache:"no-cache",signal:controller.signal})));
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
    status.textContent = "Source files could not load. Ecuadorian expressions are available; learner entries and additional evidence are unavailable. Reload to retry.";
  } finally {
    clearTimeout(timer);
  }
}

function initDictionary() {
  const root = $("#dictionary-view");
  if (!root || root.dataset.dictionaryBound) return;
  root.dataset.dictionaryBound = "true";
  $("#dictionary-search")?.addEventListener("input",renderDictionary);
  $$('[data-expression-filter]').forEach(button => button.addEventListener("click",() => {
    expressionFilter = button.dataset.expressionFilter;
    $$('[data-expression-filter]').forEach(item => item.classList.toggle("active",item === button));
    renderDictionary();
  }));
  $$('[data-evidence-filter]').forEach(button => button.addEventListener("click",() => {
    evidenceFilter = button.dataset.evidenceFilter;
    $$('[data-evidence-filter]').forEach(item => item.classList.toggle("active",item === button));
    renderDictionary();
  }));
  // These expressions are bundled in app.js. They must not wait on optional
  // media setup or the separately fetched learner/source JSON files.
  renderDictionary();
  loadEvidence();
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
  const index = root.closest(".slang-index");
  if (index) index.hidden = !["all","slang","idiom"].includes(expressionFilter);
  const entries = culturalExpressions.filter(entry => {
    if (!["slang", "idiom"].includes(entry.category)) return false;
    if (expressionFilter !== "all" && entry.category !== expressionFilter) return false;
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

function regionalSearchRecovery(options, entries) {
  if (entries.length) return {kind:"results"};
  const cleared = {...options,usage:"all",category:"all",tone:"all"};
  const local = HablaSpanishContext.dictionary(cleared);
  if (local.length) return {kind:"filters",count:local.length};
  let broader = {...cleared,region:options.region === "en-US" || options.region === "en-GB" ? options.region : "all",target:"all"};
  let matches = HablaSpanishContext.dictionary(broader);
  if (!matches.length && broader.region !== "all") {
    broader = {...broader,region:"all"};
    matches = HablaSpanishContext.dictionary(broader);
  }
  return matches.length ? {kind:"region",count:matches.length,region:broader.region} : {kind:"missing"};
}

function clearRegionalSearchFilters() {
  for (const selector of ["#regional-usage-type","#regional-dictionary-category","#regional-slang-tone"]) {
    const element = $(selector); if (element) element.value = "all";
  }
}

function bindRegionalSearchRecovery() {
  $("#regional-clear-filters")?.addEventListener("click", () => { clearRegionalSearchFilters(); renderRegionalSlang(); });
  $("#regional-broaden-search")?.addEventListener("click", () => {
    const region = $("#regional-broaden-search").dataset.region;
    clearRegionalSearchFilters();
    $("#regional-slang-region").value = region;
    $("#regional-slang-target").value = "all";
    renderRegionalSlang();
  });
  $("#regional-suggest-entry")?.addEventListener("click", () => {
    const term = $("#regional-slang-search").value.trim();
    if (!term) return;
    const region = $("#regional-slang-region").value;
    const countries = {"es-EC":"Ecuador","es-MX":"Mexico","es-BO":"Bolivia","es-VE":"Venezuela","es-PE":"Peru","es-CO":"Colombia","es-CU":"Cuba","en-US":"U.S. English","en-GB":"U.K. English",quito:"Ecuador",monterrey:"Mexico","mexico-city":"Mexico",bogota:"Colombia"};
    const cities = {quito:"Quito",monterrey:"Monterrey, Nuevo León","mexico-city":"Mexico City",bogota:"Bogotá"};
    const target = region.startsWith("en-") ? $("#regional-slang-target").selectedOptions[0].textContent : "";
    openView("review-view");
    const panel = $("#slang-contributions");
    if (panel) panel.open = true;
    document.dispatchEvent(new CustomEvent("habla-suggest-entry",{detail:{term,region:countries[region] || "Other / uncertain",city:cities[region] || "",target}}));
  });
}

function renderRegionalSlang() {
  const root = $("#regional-slang-results");
  cancelDictionaryPractice(root);
  if (!root) return;
  const region = $("#regional-slang-region").value;
  const englishLead = region === "en-US" ? "us" : region === "en-GB" ? "uk" : null;
  $("#regional-slang-target-label").hidden = !englishLead;
  const directionLabel = englishLead ? `${englishLead === "us" ? "U.S." : "U.K."} English → Spanish` : "U.S. & U.K. English";
  $("#regional-slang-search").placeholder = englishLead ? "English meaning or Spanish term…" : "Spanish term, English meaning, or city…";
  const options = {query:$("#regional-slang-search").value, region, tone:$("#regional-slang-tone").value,category:$("#regional-dictionary-category").value,usage:$("#regional-usage-type")?.value || "all",target:englishLead?$("#regional-slang-target").value:"all"};
  const entries = HablaSpanishContext.dictionary(options);
  const recovery = regionalSearchRecovery(options,entries);
  const emptyMessage = recovery.kind === "filters" ? `No entries match these filters. ${recovery.count} indexed matches are hidden by the usage, category or tone filters.`
    : recovery.kind === "region" ? `No entries match this regional view. ${recovery.count} indexed matches are available in other regional views.`
    : "No entries match this search across the current collection, even with filters cleared. Coverage is limited; this does not mean the expression is wrong or unused.";
  $("#regional-slang-count").textContent = entries.length ? `${entries.length} ${entries.length === 1 ? "entry" : "entries"} · ${directionLabel}` : emptyMessage;
  const activeFilters = ["#regional-dictionary-category","#regional-usage-type","#regional-slang-tone"].map(selector => $(selector)).filter(element => element && element.value !== "all");
  const filterNote = $("#regional-active-filters");
  if (filterNote) { filterNote.hidden = !activeFilters.length; filterNote.textContent = activeFilters.length ? "Active filters: " + activeFilters.map(element => element.selectedOptions[0].textContent).join(" · ") : ""; }
  const clear = $("#regional-clear-filters"); if (clear) clear.hidden = !activeFilters.length;
  const broaden = $("#regional-broaden-search");
  if (broaden) { broaden.hidden = recovery.kind !== "region"; broaden.dataset.region = recovery.region || "all"; }
  const suggest = $("#regional-suggest-entry"); if (suggest) suggest.hidden = !options.query.trim();
  root.innerHTML = entries.map(entry => {
    const caution = /vulgar|offensive|insult/i.test(entry.register);
    const spanishRegion = englishLead ? $("#regional-slang-target").value : region;
    const voice = spanishRegion.startsWith("es-") ? spanishRegion : ({quito:"es-EC", monterrey:"es-MX", "mexico-city":"es-MX", bogota:"es-CO"}[spanishRegion] || entry.regions[0]);
    const sources = [{name:entry.sourceName || (entry.url.includes("dem.colmex") ? "El Colegio de México · DEM" : entry.url.includes("dle.rae") ? "RAE · DLE" : entry.url.includes("cancer.gov") ? "NIH · National Cancer Institute" : entry.url.includes("medlineplus.gov") ? "NIH · MedlinePlus" : entry.url.includes("cancer.org") ? "American Cancer Society" : entry.url.includes("cun.es") ? "Clínica Universidad de Navarra" : "ASALE · Americanisms"), url:entry.url}, ...(entry.references || [])];
    return `<article class="expression-card regional-slang-card">
      <header><h3>${escapeHtml(englishLead ? entry[englishLead] : entry.term)}</h3><span class="slang-tone ${caution ? "caution" : ""}">${escapeHtml(entry.register)}</span></header>
      ${englishLead ? `<p class="regional-gloss"><b>${entry.shared ? "Spanish counterpart · country review pending" : "Spanish"}</b> ${escapeHtml(entry.term)}</p>` : ""}
      ${englishLead !== "us" ? `<p class="regional-gloss"><b>U.S.</b> ${escapeHtml(entry.us)}</p>` : ""}
      ${englishLead !== "uk" ? `<p class="regional-gloss"><b>U.K.</b> ${escapeHtml(entry.uk)}</p>` : ""}
      <div class="regional-usage-meta"><span>${escapeHtml(entry.usage.label)}</span><span>${escapeHtml(entry.category === "clinical" || (entry.category === "literal" && !entry.regionalSenseAttested) || entry.shared || /country-specific naturalness review pending/i.test(entry.scope) ? "Shared Spanish · regional naturalness not established" : "Entry covers: " + entry.usage.countries.join(" · "))}</span></div>
      ${entry.usage.cities.length ? `<p class="regional-usage-scope"><b>City evidence:</b> ${escapeHtml(entry.usage.cities.join(" · "))} · not an exclusivity claim</p>` : ""}
      <p class="regional-usage-scope"><b>Meaning by country / region:</b> ${escapeHtml(entry.scope)}</p>
      ${entry.shared ? `<p class="expression-note">Shared Spanish · country review pending</p>` : ""}
      ${entry.uncertainty ? `<p class="expression-note"><b>Evidence limit:</b> ${escapeHtml(entry.uncertainty)}</p>` : ""}
      <div class="dictionary-audio" aria-label="Hear dictionary meanings">
        <button type="button" data-regional-audio="${escapeHtml(entry.speech || entry.term)}" data-audio-lang="${voice}">🔊 Spanish</button>
        <button type="button" data-regional-audio="${escapeHtml(entry.us)}" data-audio-lang="en-US">🔊 U.S.</button>
        <button type="button" data-regional-audio="${escapeHtml(entry.uk)}" data-audio-lang="en-GB">🔊 U.K.</button>
      </div>
      ${entry.exampleEs ? `<div class="expression-example"><p>${escapeHtml(entry.exampleEs)}</p><small>U.S.: ${escapeHtml(entry.exampleUs)}<br>U.K.: ${escapeHtml(entry.exampleUk)}</small><button type="button" data-regional-audio="${escapeHtml(entry.exampleEs)}" data-audio-lang="${voice}">🔊 Example</button></div>` : ""}
      <details class="compact-info"><summary>Context &amp; sources</summary>
        <p>${escapeHtml(entry.scope)}</p><p>${escapeHtml(entry.note)}</p>
        ${entry.sourceSense ? `<p class="regional-search-help">Source sense: ${escapeHtml(entry.sourceSense)} · checked ${escapeHtml(entry.sourceChecked)}</p>` : ""}
        ${sources.map(source => `<a class="expression-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.name)}</a>`).join("")}
      </details>
      <button type="button" class="feedback-link" data-feedback-open data-feedback-topic="regional" data-feedback-reference="${escapeHtml(entry.term + ' — ' + entry.us)}">Report this entry</button>
    </article>`;
  }).join("");
  bindDictionaryPractice(root);
}

function renderExpressionLibrary(query="") {
  const root = $("#expression-results");
  cancelDictionaryPractice(root);
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
  window.HablaSongLesson?.render({locale:lessonTargetLocale,say,stop:stopSpeechPlayback});
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
  players.forEach(player => player.addEventListener("play", () => handleMusicPlayerPlay(player,players)));
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
  stopSpeechPlayback();
  const requestId = speechRequestId;
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
  cancelDictionaryPractice(root);
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

// Practice uses the card's existing Spanish playback strings, never new dictionary senses.
let dictionaryPracticeSession = null;

function dictionaryPracticeText(value) {
  // Ignore written accents/punctuation for word matching, but keep n and ñ distinct.
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/n\u0303/g,"ñ")
    .replace(/\p{M}/gu,"").replace(/[^\p{L}\p{N}]+/gu," ").trim();
}

function dictionaryPracticeComparison(expected, heard) {
  const expectedWords = expected.match(/[\p{L}\p{M}\p{N}]+/gu) || [];
  const heardWords = heard.match(/[\p{L}\p{M}\p{N}]+/gu) || [];
  const words = expectedWords.slice(0,200), actual = heardWords.slice(0,200);
  const a = words.map(dictionaryPracticeText), b = actual.map(dictionaryPracticeText);
  // Ordered word alignment avoids crediting one repeated word twice.
  const lengths = Array.from({length:a.length+1},() => new Uint16Array(b.length+1));
  for (let i=a.length-1;i>=0;i--) for (let j=b.length-1;j>=0;j--) {
    lengths[i][j] = a[i] === b[j] ? 1+lengths[i+1][j+1] : Math.max(lengths[i+1][j],lengths[i][j+1]);
  }
  const matched = new Set();
  for (let i=0,j=0;i<a.length&&j<b.length;) {
    if (a[i] === b[j]) { matched.add(i);i++;j++; }
    else if (lengths[i+1][j] >= lengths[i][j+1]) i++;
    else j++;
  }
  const first = words.findIndex((_,index) => !matched.has(index));
  const focus = first < 0 ? expected : words.slice(first,first+3).join(" ");
  const expectedCount = expectedWords.length, heardCount = heardWords.length;
  const wordScore = expectedCount && expectedCount <= 200 && heardCount <= 200
    ? Math.round(100*matched.size/Math.max(expectedCount,heardCount,1)) : null;
  return {words,matched,focus,wordScore,expectedCount,heardCount,exact:dictionaryPracticeText(expected) === dictionaryPracticeText(heard)};
}

function cancelDictionaryPractice(root) {
  const session = dictionaryPracticeSession;
  if (!session || (root && !root.contains(session.panel))) return;
  if (activeRecognitionButton === session.mic) cancelListening(false);
  else session.finish("Practice stopped. Your prompt and heard words are kept.");
}

function bindPracticeHold(button, {start, stop, cancel}) {
  let held = null;
  const panel = button.closest?.(".dictionary-practice");
  const begin = () => {
    panel?.classList.add("practice-held");
    const selection = window.getSelection?.();
    if (selection && !selection.isCollapsed && panel?.contains(selection.anchorNode)) selection.removeAllRanges();
    start();
  };
  const release = (cancelled=false) => {
    const previous = held;
    if (!previous) return;
    held = null;
    panel?.classList.remove("practice-held");
    if (previous.type === "pointer") {
      try { button.releasePointerCapture(previous.id); } catch {}
    }
    if (cancelled) cancel();
    else stop();
  };
  button.addEventListener("pointerdown",event => {
    if (event.button !== 0 || event.isPrimary === false || button.disabled || held) return;
    event.preventDefault();
    held = {type:"pointer",id:event.pointerId};
    try { button.setPointerCapture(event.pointerId); } catch {}
    begin();
  });
  button.addEventListener("pointerup",event => {
    if (held?.type === "pointer" && held.id === event.pointerId) release();
  });
  for (const type of ["pointercancel","lostpointercapture"]) button.addEventListener(type,event => {
    if (held?.type === "pointer" && held.id === event.pointerId) release(true);
  });
  button.addEventListener("contextmenu",event => event.preventDefault());
  // iOS may begin native text selection despite cancelling pointerdown. Keep
  // the touch default and selection disabled for this held practice panel.
  button.addEventListener("touchstart",event => event.preventDefault(),{passive:false});
  panel?.addEventListener("selectstart",event => { if (held) event.preventDefault(); });
  button.addEventListener("keydown",event => {
    if (event.code !== "Space" || button.disabled) return;
    event.preventDefault();
    if (held || event.repeat) return;
    held = {type:"keyboard"};
    begin();
  });
  button.addEventListener("keyup",event => {
    if (event.code !== "Space") return;
    event.preventDefault();
    if (held?.type === "keyboard") release();
  });
  button.addEventListener("blur",() => release(true));
  // Enter and assistive activation retain a start/stop toggle. A pointer's
  // trailing click must never start a second recording after finger release.
  button.addEventListener("click",event => {
    if (event.detail === 0 && !held && !button.disabled) start();
  });
  return () => release(true);
}

function bindDictionaryPractice(root) {
  if (!root) return;
  $$(".expression-card, .evidence-card",root).forEach(card => {
    if (card.querySelector(".dictionary-practice")) return;
    const prompts = [];
    if (card.dataset.practiceText) prompts.push({text:card.dataset.practiceText,lang:card.dataset.practiceLang || "es-EC"});
    $$('[data-dictionary-audio], [data-regional-audio]',card).forEach(button => {
      const lang = button.dataset.audioLang || "es-EC";
      if (!lang.startsWith("es-")) return;
      const text = button.dataset.dictionaryAudio || button.dataset.regionalAudio || "";
      text.replace(/\s+\((?:noun|verb|literal|vulgar anatomy)\)$/i,"").split(/\s*\/\s*/).filter(part => part.trim()).forEach(part => {
        const phrase = part.trim();
        if (!prompts.some(prompt => prompt.text === phrase && prompt.lang === lang)) prompts.push({text:phrase,lang});
      });
    });
    if (!prompts.length) return;
    const panel = document.createElement("details");
    panel.className = "compact-info dictionary-practice";
    panel.innerHTML = `<summary>🎙 Speaking practice</summary>
      <label class="dictionary-practice-choice">Choose a word or example<select aria-label="Spanish practice prompt">${prompts.map((prompt,index) => `<option value="${index}">${escapeHtml(prompt.text)}</option>`).join("")}</select></label>
      <p class="dictionary-practice-whole" hidden></p><p class="dictionary-practice-target" lang="${escapeHtml(prompts[0].lang)}"></p>
      <div class="dictionary-practice-actions"><button type="button" class="dictionary-practice-hear">🔊 Hear model</button><button type="button" class="dictionary-practice-mic push-to-talk" aria-pressed="false" aria-keyshortcuts="Space Enter" aria-label="Hold to speak; release to finish. Enter or screen reader: start or stop.">🎙 Hold to speak</button></div>
      <p class="dictionary-practice-status" role="status"></p>
      <div class="dictionary-practice-response" hidden><small>I heard</small><p class="dictionary-practice-heard" lang="es"></p><p class="dictionary-practice-feedback"></p><p class="dictionary-practice-score" aria-live="polite" hidden></p><p class="dictionary-practice-progress-label"></p><div class="dictionary-practice-progress"></div><div class="dictionary-practice-coach" hidden><p></p><div class="dictionary-practice-actions"><button type="button" class="dictionary-practice-focus-hear">🔊 Hear this part</button><button type="button" class="dictionary-practice-focus-try">Practice this part</button></div></div></div>
      <p class="dictionary-practice-limit">Word scoring checks recognized words, including order, omissions and extras; it does not grade accent or individual sounds.</p>`;
    const audioControls = card.querySelector(".dictionary-audio");
    if (audioControls) audioControls.after(panel);
    else card.append(panel);
    const select = $("select",panel), target = $(".dictionary-practice-target",panel);
    const mic = $(".dictionary-practice-mic",panel), hear = $(".dictionary-practice-hear",panel);
    const status = $(".dictionary-practice-status",panel), response = $(".dictionary-practice-response",panel);
    const heard = $(".dictionary-practice-heard",panel), feedback = $(".dictionary-practice-feedback",panel);
    const score = $(".dictionary-practice-score",panel);
    const progress = $(".dictionary-practice-progress",panel), progressLabel = $(".dictionary-practice-progress-label",panel);
    const coach = $(".dictionary-practice-coach",panel), whole = $(".dictionary-practice-whole",panel);
    const basePromptCount = prompts.length;
    let focusText = "";
    const available = () => Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    const refresh = () => {
      cancelDictionaryPractice(panel);
      const prompt = prompts[Number(select.value) || 0];
      $(".dictionary-practice-choice",panel).hidden = Boolean(card.dataset.practiceText && prompts.length === 1);
      target.textContent = prompt.text;
      target.lang = prompt.lang;
      whole.hidden = !prompt.fullText; whole.textContent = prompt.fullText ? `Full prompt: ${prompt.fullText}` : "";
      coach.hidden = true; focusText = ""; progress.replaceChildren(); progressLabel.textContent = "";
      response.hidden = true; score.hidden = true; score.textContent = ""; heard.textContent = feedback.textContent = "";
      mic.disabled = !available();
      status.textContent = available() ? "Hold to speak; release to finish. Wait for Microphone ready before speaking." : "Speech recognition is unavailable here. You can still hear the model.";
    };
    refresh();
    select.addEventListener("change",refresh);
    panel.addEventListener("toggle",() => { if (!panel.open && dictionaryPracticeSession?.panel === panel) cancelDictionaryPractice(panel); });
    hear.addEventListener("click",() => {
      cancelDictionaryPractice();
      const prompt = prompts[Number(select.value) || 0];
      say(prompt.text,prompt.lang,hear);
    });
    $(".dictionary-practice-focus-hear",panel).addEventListener("click",event => {
      cancelDictionaryPractice();
      if (focusText) say(focusText,prompts[Number(select.value) || 0].lang,event.currentTarget);
    });
    $(".dictionary-practice-focus-try",panel).addEventListener("click",() => {
      if (!focusText) return;
      const prompt = prompts[Number(select.value) || 0];
      const focus = {text:focusText,lang:prompt.lang,fullText:prompt.fullText || prompt.text};
      if (prompts.length > basePromptCount) select.lastElementChild.remove();
      prompts[basePromptCount] = focus;
      const option = document.createElement("option"); option.value = String(basePromptCount); option.textContent = `Focus: ${focus.text}`;
      select.append(option); select.value = String(basePromptCount); refresh();
    });
    let releaseHold = () => {};
    const togglePractice = () => {
      if (dictionaryPracticeSession?.panel === panel) return dictionaryPracticeSession.stop();
      cancelDictionaryPractice();
      if (!available()) return refresh();
      const prompt = prompts[Number(select.value) || 0];
      const session = {panel,mic,error:"",heard:false,ready:false,finishing:false,startTimer:null,timer:null,endTimer:null};
      const current = () => dictionaryPracticeSession === session && panel.isConnected;
      session.finish = message => {
        if (dictionaryPracticeSession !== session) return;
        clearTimeout(session.startTimer); clearTimeout(session.timer); clearTimeout(session.endTimer);
        dictionaryPracticeSession = null;
        releaseHold();
        select.disabled = false; mic.disabled = false;
        setListeningButton(mic,false); mic.textContent = "🎙 Hold to speak"; delete mic.dataset.captureReady;
        status.textContent = message || session.error || (session.heard ? "Practice finished. Your words are below; hear the model and try again." : "The speech service returned no transcript. This attempt was not scored.");
      };
      session.stop = () => {
        if (!current() || session.finishing) return;
        session.finishing = true;
        clearTimeout(session.startTimer);
        if (!session.ready) {
          session.error ||= "The microphone was still starting. This attempt was not scored.";
          return cancelListening(false);
        }
        mic.disabled = true;
        status.textContent = "Finishing your response…";
        // Release the microphone even if a recognition provider never sends end.
        session.endTimer = setTimeout(() => { if (current()) cancelListening(true); },3000);
        stopListening();
      };
      const microphoneReady = () => {
        if (!current() || session.finishing || session.ready) return;
        session.ready = true;
        clearTimeout(session.startTimer);
        session.timer = setTimeout(session.stop,20000);
        mic.dataset.captureReady = "true";
        status.textContent = "Microphone ready. Speak now; release to finish.";
      };
      dictionaryPracticeSession = session;
      select.disabled = true; response.hidden = true; score.hidden = true; score.textContent = ""; coach.hidden = true; focusText = ""; heard.textContent = feedback.textContent = "";
      status.textContent = "Starting microphone… allow access if asked.";
      mic.dataset.captureReady = "false";
      // A service 'start' event is not proof that the browser is capturing audio.
      // Give the learner the full speaking window only after capture is ready.
      session.startTimer = setTimeout(() => {
        if (!current() || session.ready) return;
        session.error = "The microphone did not become ready. This attempt was not scored.";
        cancelListening(false);
      },8000);
      const practiceError = error => error === "no-speech" ? "The speech service returned no transcript. This attempt was not scored." : recognitionErrorMessage(error);
      startListening({lang:prompt.lang,button:mic,correctTranscript:false,formatError:practiceError,continuous:true,commitOnEnd:true,
        onStart:() => {
          if (!current() || session.finishing) return;
          // The installed native bridge has one ready event, rather than the
          // browser's separate service-start and audio-start events.
          if (typeof window.__hablaNativeSpeech === "function") microphoneReady();
          else if (!session.ready) status.textContent = "Speech service started. Waiting for the microphone…";
        },
        onAudioStart:microphoneReady,
        onSpeechStart:() => {
          microphoneReady();
          if (current() && !session.finishing && !session.heard) status.textContent = "Speech detected. Waiting for recognized words…";
        },
        onText:(text,final,metadata={}) => {
          if (!current()) return;
          microphoneReady();
          session.heard = Boolean(text.trim());
          if (session.heard && !session.finishing) status.textContent = "Words received. Release when you finish speaking.";
          heard.textContent = text; response.hidden = !session.heard;
          const comparison = dictionaryPracticeComparison(prompt.text,text);
          score.hidden = !final || Boolean(metadata.provisional) || comparison.wordScore === null;
          score.textContent = score.hidden ? "" : `Recognized-word score: ${comparison.wordScore}% · ${comparison.matched.size} matched, ${comparison.expectedCount} expected, ${comparison.heardCount} heard. This is not a pronunciation score.`;
          progressLabel.textContent = final && !metadata.provisional ? "Word matches in the recognized text:" : "Tentative word matches — still unconfirmed:";
          progress.replaceChildren(...comparison.words.map((word,index) => {
            const chip = document.createElement("span");chip.textContent = word;
            const matched = comparison.matched.has(index);
            chip.className = matched ? "word-heard" : "word-pending";
            chip.setAttribute("aria-label",`${word}: ${matched ? "recognized" : "not matched"}${final && !metadata.provisional ? "" : ", unconfirmed"}`);
            return chip;
          }));
          coach.hidden = !final || Boolean(metadata.provisional) || comparison.exact;
          if (!coach.hidden) {
            focusText = comparison.focus;
            $("p",coach).textContent = `Try this part: ${focusText}. Hear it, say it on its own, then return to the full prompt.`;
          }
          feedback.textContent = !final ? "Words heard so far…"
            : metadata.provisional ? "These words were unconfirmed. Listen to the model and try again."
            : comparison.exact
              ? "Recognized words match the prompt. Compare your pronunciation with the model."
              : "The recognized words differ. Hear the model and try again; recognition can miss regional words.";
        },
        onError:error => { if (current() && error !== "aborted") { session.error = practiceError(error); session.stop(); } },
        onEnd:() => session.finish(),
        onCancel:() => session.finish(session.error || "Practice stopped. Your prompt and heard words are kept.")
      });
    };
    releaseHold = bindPracticeHold(mic,{
      start:togglePractice,
      stop:() => { if (dictionaryPracticeSession?.panel === panel) dictionaryPracticeSession.stop(); },
      cancel:() => cancelDictionaryPractice(panel)
    });
  });
}

function bindDictionaryAudio() {
  $$('[data-dictionary-audio]').forEach(button => {
    if (button.dataset.audioBound) return;
    button.dataset.audioBound = "true";
    button.addEventListener("click", () => {
      cancelDictionaryPractice();
      say(button.dataset.dictionaryAudio, button.dataset.audioLang || "es-EC");
    });
  });
  bindDictionaryPractice($("#expression-results"));
  bindDictionaryPractice($("#dictionary-results"));
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
    <button type="button" id="review-clear-rating" ${saved.rating ? "" : "disabled"}>Clear rating</button>
    <p class="status">Clearing a rating keeps your notes, region and other reviews. Reviews stay on this device unless you share them.</p>
    <label>Region or city <span>(optional)</span><input id="review-region" value="${escapeHtml(saved.region || "")}" placeholder="e.g. Quito, Guayaquil, Cuenca"></label>
    <label>Preferred wording or notes <span>(optional)</span><textarea id="review-notes" rows="3" placeholder="What would you say instead?">${escapeHtml(saved.notes || "")}</textarea></label>
  </article>`;
  $("#review-prev").disabled = reviewIndex === 0;
  $("#review-next").disabled = reviewIndex === entries.length - 1;
  $$('[data-review-choice]').forEach(button => button.addEventListener("click", () => saveCurrentReview({rating:button.dataset.reviewChoice})));
  $("#review-clear-rating").addEventListener("click", clearCurrentReviewRating);
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

function clearCurrentReviewRating() {
  const entry = reviewEntries()[reviewIndex];
  if (!entry) return;
  const pack = readReviewPackage();
  const saved = pack.reviews[entry.id];
  if (!saved?.rating) return;
  pack.reviews[entry.id] = {...saved};
  delete pack.reviews[entry.id].rating;
  try { writeReviewPackage(pack); }
  catch { showToast("Rating could not be cleared. Device storage is unavailable; your review is unchanged."); return; }
  renderReview();
  showToast("Rating cleared. This entry is unreviewed; your notes are kept.");
}

function reviewSummary() {
  const pack = readReviewPackage();
  const ui=text=>typeof HablaUI!=="undefined"?HablaUI.t(text):text;
  const labels = {natural:"Natural in Ecuador",awkward:"Understandable but awkward",regional:"Regional / depends where",correction:"Needs correction"};
  const lines = [ui("Habla Ecuador — Ecuadorian usage review"), `${ui("Reviewer:")} ${pack.reviewer || ui("Not provided")}`, `${ui("Exported:")} ${new Date().toISOString()}`, ""];
  reviewEntries().forEach(entry => {
    const item = pack.reviews[entry.id];
    if (!item?.rating) return;
    lines.push(`${entry.spanish} — ${ui(labels[item.rating] || item.rating)}`);
    if (item.region) lines.push(`${ui("Region/city:")} ${item.region}`);
    if (item.notes) lines.push(`${ui("Notes:")} ${item.notes}`);
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

function recordedTranscriptRoute() {
  return {
    target:englishVariant === "uk" ? "en-GB" : "en-US",
    onDevice:typeof HablaOffline !== "undefined" && HablaOffline.shouldUse()
  };
}

let sourcePracticeIndex = 0;

function renderSourcePractice() {
  const root = $("#source-practice");
  if (!root || typeof HablaRegionalPractice === "undefined") return;
  cancelDictionaryPractice(root);
  if (lessonTargetLocale() !== "es-EC") { root.hidden = true; return; }
  const lesson = HablaRegionalPractice, source = lesson.source;
  const index = Math.max(0,Math.min(sourcePracticeIndex,lesson.items.length-1));
  sourcePracticeIndex = index;
  const item = lesson.items[index];
  const meaning = englishVariant === "uk" ? item.uk : item.us;
  root.hidden = false;
  $("#source-practice-content").innerHTML = `
    <p>${escapeHtml(lesson.description)}</p>
    <p class="source-practice-count">Phrase ${index+1} of ${lesson.items.length}</p>
    <article class="expression-card source-practice-card" data-practice-text="${escapeHtml(item.spanish)}" data-practice-lang="${escapeHtml(item.locale)}">
      <h3>${escapeHtml(item.title)}</h3>
      <p class="source-practice-meaning">${escapeHtml(meaning)}</p>
      <p class="source-practice-cue"><strong>Pronunciation focus</strong><br>${escapeHtml(item.coaching)}</p>
      <details class="compact-info"><summary>Meaning &amp; regional context</summary><p>${escapeHtml(item.register)}</p><p>${escapeHtml(item.context)}</p><p>${escapeHtml(item.role)}</p>${item.adapted ? "<p>Adapted from a longer line in the script.</p>" : ""}</details>
    </article>
    <div class="source-practice-navigation"><button type="button" id="source-practice-previous" ${index===0?"disabled":""}>← Previous phrase</button><button type="button" id="source-practice-next" ${index===lesson.items.length-1?"disabled":""}>Next phrase →</button></div>
    <p class="source-practice-model-note">Hear model uses your device's available Spanish voice. The original actors' audio is available through the source, when its host is working.</p>
    <details class="compact-info source-practice-attribution"><summary>Source &amp; learning notes</summary>
      <p>${escapeHtml(source.credit)}</p><a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)} · original script &amp; audio link</a>
      <p>${escapeHtml(source.changes)}</p><a href="${escapeHtml(source.licenseUrl)}" target="_blank" rel="license noreferrer">${escapeHtml(source.license)}</a>
      <p>${escapeHtml(source.limits)}</p><a href="${escapeHtml(source.pronunciationSource)}" target="_blank" rel="noreferrer">Stress guidance: RAE–ASALE</a>
    </details>`;
  bindDictionaryPractice(root);
  $(".dictionary-practice",root).open = true;
  $("#source-practice-previous").addEventListener("click",() => { sourcePracticeIndex -= 1; renderSourcePractice(); });
  $("#source-practice-next").addEventListener("click",() => { sourcePracticeIndex += 1; renderSourcePractice(); });
  if (!root.dataset.bound) {
    root.dataset.bound = "true";
    root.addEventListener("toggle",() => { if (!root.open) cancelDictionaryPractice(root); });
  }
}

function renderLesson() {
  if (activeRecognitionButton?.id === "lesson-mic") cancelListening(false);
  const content = $("#lesson-content");
  const locale = lessonTargetLocale(), english = locale !== "es-EC";
  content.dataset.targetLanguage = locale;
  if ($("#lesson-language")) $("#lesson-language").value = ["es-EC","en-US","en-GB"].includes(lessonLanguagePreference) ? lessonLanguagePreference : "";
  $$(".lesson-card .card-kicker").forEach(el => { el.textContent = english ? "A1 English speaking lesson" : "A1 speaking lesson"; });
  if ($("#lesson-learning-goal")) $("#lesson-learning-goal").textContent = english ? "Learn English with Spanish meanings." : "Learn Ecuadorian Spanish with English meanings.";
  if (typeof HablaQuickLessons !== "undefined") HablaQuickLessons.setLearningLanguage(locale);
  const recorded = $("#recorded-practice");
  if (recorded && typeof HablaRecordedPractice !== "undefined") HablaRecordedPractice.setLearningLanguage(locale);
  if ($("#source-practice")) $("#source-practice").hidden = english;
  $("#lesson-step-count").textContent = `${lessonStep}/4`;
  $("#lesson-progress-bar").style.width = `${lessonStep * 25}%`;
  if (english) { renderEnglishLesson(content,locale); bindLesson(); return; }
  if (lessonStep === 1) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Scene first</p><h1 id="lesson-title">Make a plan before sunset.</h1><p class="lead">You want to meet someone while there is still daylight. Hear the natural question before you say it.</p><div class="scene" aria-label="Sunset over Ecuador">🌄</div><div class="phrase-card"><button class="play-button" id="lesson-play" aria-label="Hear the Spanish phrase">▶</button><p class="spanish">¿A qué hora se pone el sol?</p><p class="english">What time does the sun set?</p></div><button class="primary-button" id="lesson-next">Now say it</button></div>`;
  if (lessonStep === 2) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Guided speaking</p><h1 id="lesson-title">Ask the question aloud.</h1><p class="lead">Read along as you speak. Aim for clear key words: <em>hora</em>, <em>pone</em>, and <em>sol</em>.</p><div class="mic-practice"><div id="lesson-speaking-prompt"><p class="spanish" lang="es-EC">¿A qué hora se pone el sol?</p><p class="english" lang="en">What time does the sun set?</p></div><button id="lesson-mic" class="push-to-talk" aria-label="Start or stop speaking" aria-describedby="lesson-speaking-prompt lesson-mic-instructions">🎙️</button><p id="lesson-mic-instructions">Tap the microphone to start. Tap again when finished.</p><div id="lesson-heard" aria-live="polite"></div></div><button class="primary-button" id="lesson-next">Continue</button></div>`;
  if (lessonStep === 3) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Naturalness check</p><h1 id="lesson-title">What would you say in conversation?</h1><p class="lead">Choose the most natural everyday way to ask about sunset.</p><div class="choice-list"><button class="choice" data-correct="true">¿A qué hora se pone el sol?</button><button class="choice">¿A qué hora ocurre el ocaso?</button><button class="choice">¿Cuál es la hora de la puesta solar?</button></div><button class="primary-button" id="lesson-next" disabled>See the language map</button></div>`;
  if (lessonStep === 4) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Language map</p><h1 id="lesson-title">One idea, several useful forms.</h1><div class="language-map"><article class="map-card"><header><h2>Sunset · conversational</h2><button data-say="Se pone el sol">🔊</button></header><p><span>se pone el sol</span> · the sun sets</p></article><article class="map-card"><header><h2>Sunset · noun</h2><button data-say="puesta del sol">🔊</button></header><p><span>puesta del sol</span> · sunset. <em>Ocaso</em> is more literary.</p></article><article class="map-card"><header><h2>Sunrise · conversational</h2><button data-say="sale el sol">🔊</button></header><p><span>sale el sol / ver salir el sol</span> · the sun rises / watch the sunrise.</p></article><article class="map-card"><header><h2>Dawn</h2><button data-say="antes de que amanezca">🔊</button></header><p><span lang="es-EC">antes de que amanezca</span> · before dawn</p><p><span>amanecer</span> · dawn or daybreak. <em>Orto</em> is formal or technical.</p></article></div><p class="lead">Ecuador-first guidance; broader regional nuance should still be reviewed by multiple Ecuadorian speakers.</p><button class="primary-button orange" id="lesson-finish">Finish lesson</button></div>`;
  bindLesson();
}

function renderEnglishLesson(content,locale) {
  const phrase = `<p class="english lesson-target" lang="${locale}" data-ui-content>What time does the sun set?</p><p class="spanish lesson-meaning" lang="es-EC" data-ui-content>¿A qué hora se pone el sol?</p>`;
  if (lessonStep === 1) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Scene first</p><h1 id="lesson-title">Make a plan before sunset.</h1><p class="lead">Hear the English question, then practise it aloud. The Spanish meaning stays underneath.</p><div class="scene" aria-label="Sunset over Ecuador">🌄</div><div class="phrase-card"><button class="play-button" id="lesson-play" aria-label="Hear the English phrase">▶</button>${phrase}</div><button class="primary-button" id="lesson-next">Now say it</button></div>`;
  if (lessonStep === 2) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Guided speaking</p><h1 id="lesson-title">Ask the question aloud.</h1><p class="lead">Practise the English question. Listen for the key words time, sun and set.</p><div class="mic-practice"><div id="lesson-speaking-prompt">${phrase}</div><button id="lesson-mic" class="push-to-talk" aria-label="Start or stop speaking" aria-describedby="lesson-speaking-prompt lesson-mic-instructions">🎙️</button><p id="lesson-mic-instructions">Tap the microphone to start. Tap again when finished.</p><div id="lesson-heard" aria-live="polite"></div></div><button class="primary-button" id="lesson-next">Continue</button></div>`;
  if (lessonStep === 3) content.innerHTML = `
    <div class="lesson-stage"><p class="eyebrow">Naturalness check</p><h1 id="lesson-title">What would you say in conversation?</h1><p class="lead">Choose the most natural everyday English question about sunset.</p><div class="choice-list"><button class="choice" data-correct="true"><span lang="${locale}" data-ui-content>What time does the sun set?</span></button><button class="choice"><span lang="${locale}" data-ui-content>At what hour does the sun set?</span></button><button class="choice"><span lang="${locale}" data-ui-content>What is the hour of solar setting?</span></button></div><button class="primary-button" id="lesson-next" disabled>See the language map</button></div>`;
  if (lessonStep === 4) {
    const forms = [
      ["Sunset · conversational","The sun sets","El sol se pone"],
      ["Sunset · noun","sunset","puesta del sol"],
      ["Sunrise · conversational","The sun rises","El sol sale"],
      ["Dawn","before dawn","antes de que amanezca"]
    ];
    content.innerHTML = `<div class="lesson-stage"><p class="eyebrow">Language map</p><h1 id="lesson-title">One idea, several useful forms.</h1><div class="language-map">${forms.map(([title,en,es])=>`<article class="map-card"><header><h2>${title}</h2><button data-say="${en}" data-say-lang="${locale}">🔊</button></header><p><span lang="${locale}" data-ui-content>${en}</span> · <span lang="es-EC" data-ui-content>${es}</span></p></article>`).join("")}</div><p class="lead">English model playback uses the variety you selected for this lesson.</p><button class="primary-button orange" id="lesson-finish">Finish lesson</button></div>`;
  }
}

function bindLesson() {
  const locale = lessonTargetLocale(), english = locale !== "es-EC";
  $("#lesson-play")?.addEventListener("click", event => say(english ? "What time does the sun set?" : "¿A qué hora se pone el sol?",locale,event.currentTarget));
  $("#lesson-next")?.addEventListener("click", () => { if (lessonStep < 4) { lessonStep += 1; renderLesson(); } });
  bindPushToTalk($("#lesson-mic"), button => ({lang:locale,button,onText:text => {
    const heard = normalize(text);
    const words = new Set(heard.match(/[\p{L}\p{N}]+/gu) || []);
    const understood = (english ? ["time","sun","set"] : ["hora","pone","sol"]).filter(word => words.has(word)).length >= 2;
    const feedback = understood ? "✓ Understood — your key words came through." : english ? "Try again and make time, sun and set clear." : "Try again and make hora, pone, and sol clear.";
    const host = $("#lesson-heard");
    if (host) host.innerHTML = `<div class="heard"><small>I heard</small><p lang="${locale}" data-ui-content>${escapeHtml(text)}</p><p>${feedback}</p></div>`;
  }}));
  $$(".choice").forEach(button => button.addEventListener("click", () => {
    selectedChoice = button.textContent;
    $$(".choice").forEach(item => { item.classList.toggle("selected", item === button); const old = $("small", item); if (old) old.remove(); });
    const note = document.createElement("small");
    note.textContent = english ? button.dataset.correct ? "✓ Natural everyday English." : "Understandable, but less natural for everyday conversation." : button.dataset.correct ? "✓ Natural and conversational in Ecuador." : "Correct Spanish, but not the ordinary conversational choice.";
    button.append(note);
    $("#lesson-next").disabled = false;
  }));
  $$('[data-say]').forEach(button => {
    button.setAttribute("aria-label", `Hear: ${button.dataset.say}`);
    button.addEventListener("click", () => say(button.dataset.say,button.dataset.sayLang || locale,button));
  });
  $("#lesson-finish")?.addEventListener("click", () => { lessonStep = 1; selectedChoice = ""; openView("home-view"); showToast("Lesson complete — ¡bien hecho!"); });
}

function escapeHtml(value) {
  const span = document.createElement("span");
  span.textContent = value;
  return span.innerHTML;
}

function initializeOptionalFeature(name, setup) {
  const failed = error => {
    console.warn("Could not initialize " + name,error);
    showToast("Some features could not start. Reload to retry.");
  };
  try {
    const result = setup();
    result?.catch?.(failed);
  } catch (error) { failed(error); }
}

function init() {
  const launchQuery = new URLSearchParams(location.search);
  const standaloneTranslator = location.pathname.endsWith("/translator.html") || launchQuery.get("standalone") === "translator";
  // The installed companion launches translator.html, but it needs the full
  // app's five tabs. Reuse that interface without changing the signed wrapper.
  if (standaloneTranslator && typeof window.__hablaNativeSpeech === "function") {
    const fullApp = new URL("index.html", location.href);
    fullApp.searchParams.set("start", "translate");
    const interfaceChoice=new URLSearchParams(location.search).get("ui");
    if(["en","es"].includes(interfaceChoice)) fullApp.searchParams.set("ui",interfaceChoice);
    location.replace(fullApp.href);
    return;
  }
  // Navigation must work even if an optional import/media module fails setup.
  $$('[data-open]').forEach(button => button.addEventListener("click", () => openView(button.dataset.open)));
  $("#home-button").addEventListener("click", () => openView("home-view"));
  $$(".mode").forEach(button => button.addEventListener("click", () => setMode(button.dataset.mode)));
  initializeOptionalFeature("offline tools",() => HablaOffline.bind());
  initializeOptionalFeature("image import",() => HablaScreenshot.bind({begin:beginScreenshotImport,commit:previewScreenshotText}));
  localStorage.removeItem("habla-ecuador-ios-voice-correction-v1");
  queueMicrotask(()=>{
    bindTranslationTextTools();
    initializeOptionalFeature("complete text viewer",()=>HablaFullReader.bind());
  });
  bindAppSharing();
  bindRegionalSearchRecovery();
  initializeOptionalFeature("source practice",renderSourcePractice);
  if (typeof HablaRecordedPractice !== "undefined") initializeOptionalFeature("recorded practice",() => HablaRecordedPractice.render());
  if ("speechSynthesis" in window) {
    initializeOptionalFeature("speech voices",refreshSpeechVoices);
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
  initializeOptionalFeature("document import",bindDocumentTools);
  initializeOptionalFeature("document translation",bindWholeDocumentTools);
  initializeOptionalFeature("saved papers",() => window.HablaPaper?.bind({speak:say, stop:stopSpeechPlayback, pause:toggleSpeechPause}));
  $("#retry-translation")?.addEventListener("click", retryTranslation);
  syncLanguagePair({persist:false});
  setTranslationPurpose(translationPurpose, false);
  $("#swap-button").addEventListener("click", swapDirection);
  $("#correct-source-language")?.addEventListener("click", correctTranslationSourceLanguage);
  $("#source-language-select")?.addEventListener("change", event => {
    cancelMusicListening();
    sourceLanguage = event.target.value;
    updateMusicListenLabel();
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
    refreshMusicLiveRoute();
    renderTranslation();
    renderDictionary();
  });
  $('#spanish-context-notes')?.addEventListener('click',event=>{
    const button=event.target.closest?.('[data-slang-meaning]');
    if(button)applySlangMeaning(button.dataset.slangMeaning);
  });
  $("#translator-input").addEventListener("beforeinput", claimSourceTextEdit);
  $("#translator-input").addEventListener("compositionstart", claimSourceTextEdit);
  $("#translator-input").addEventListener("input", () => {
    // Editing the words is an explicit review of an uncertain dictated draft.
    translatorDictationNeedsReview = false;
    setTranslatorMicFeedback("");
    wholeDocumentTools?.pause('Paused because the source text changed. Saved progress keeps the previous source.');
    // An edit owns the input now; late recognition cannot overwrite it.
    claimSourceTextEdit();
    if (musicCapturedText && musicCapturedLanguage === sourceLanguage) {
      musicCapturedText = $("#translator-input").value.trim();
      musicCapturedConfirmedText = musicCapturedText;
      musicCapturedTentativeText = "";
      updateMusicListenLabel();
    }
    if (musicTranscriptReview) {
      musicCapturedText = $("#translator-input").value.trim();
      updateMusicListenLabel();
      $("#translate-music").disabled = !$("#translator-input").value.trim();
      return;
    }
    if ($("#compare-english")) $("#compare-english").disabled = true;
    if (documentImportActive) {
      translationRequest += 1;
      lastCompletedTranslation = null;
      $("#translation-result").hidden = true;
      $("#english-comparison").hidden = true;
      wholeDocumentTools?.refresh();
    }
    if (documentLoading) {
      documentLoading = false;
      documentImportRequest += 1;
      $("#document-status").textContent = "Document reading cancelled because you changed the text. Choose the document again to import it.";
    }
    if (preservedCulturalContext && normalize($("#translator-input").value) !== normalize(preservedCulturalContext.input)) preservedCulturalContext = null;
    clearTimeout(translationTimer);
    const local = translationPurpose === "academic" ? null : matchPhrase($("#translator-input").value);
    if (local) renderTranslation();
    else translationTimer = setTimeout(renderTranslation, 550);
  });
  $("#input-mic")?.addEventListener("click", event => { event.preventDefault(); startInputMicrophone(); });
  $("#translator-mic-add")?.addEventListener("click", event=>{
    event.preventDefault();
    if(recognition && activeRecognitionButton===$("#input-mic"))return stopListening();
    // This mode intentionally preserves source text and appends the next
    // recognizer session. It never guesses missing content.
    startInputMicrophone({append:true});
  });
  $("#translator-mic-confirm")?.addEventListener("click",()=>{
    if (!$("#translator-input")?.value.trim()) return;
    translatorDictationNeedsReview = false;
    setTranslatorMicFeedback("Draft accepted. Translating…");
    renderTranslation();
  });
  $("#translator-mic-keyboard")?.addEventListener("click",()=>{
    // Browsers cannot press the system keyboard's dictation key. Focus only;
    // the learner chooses Apple's keyboard microphone and language themselves.
    setTranslatorMicFeedback("Tap your keyboard microphone, if available. Check the keyboard language.");
    $("#translator-input")?.focus();
  });
  $("#music-listen")?.addEventListener("click", startMusicListening);
  $("#new-music-song")?.addEventListener("click", newMusicSong);
  updateMusicSourceHelp();
  $("#music-live-translation")?.addEventListener("change", event => setMusicLiveEnabled(event.target.checked));
  $("#music-source-mode")?.addEventListener("change", () => {
    saveActiveTranslationEdit();
    translationRequest += 1; musicReviewRequest += 1;
    const status=$("#music-language-status");
    if(status) status.textContent=bilingualMusicEnabled()
      ? "Automatic Spanish/English text routing · experimental. Speech capture still uses From; check missed language switches."
      : "Using the selected From language for music translation.";
    if(musicListening) refreshMusicLiveRoute();
  });
  if($("#music-live-update-mode"))$("#music-live-update-mode").value=localStorage.getItem("habla-ecuador-music-live-update-v1") === "quick" ? "quick" : "confirmed";
  $("#music-live-update-mode")?.addEventListener("change",event=>setMusicLiveUpdateMode(event.target.value));
  $("#music-live-retry")?.addEventListener("click",retryMusicLiveDraft);
  $("#music-review-passage")?.addEventListener("change", event => {
    musicReviewRequest += 1;
    selectedMusicPassage = Number(event.target.value);
    syncMusicReview();
  });
  $("#music-review-source")?.addEventListener("input", editMusicPassage);
  $("#music-review-draft")?.addEventListener("input", editMusicPassage);
  $("#music-review-translate")?.addEventListener("click", translateReviewedMusicPassage);
  $("#offline-use")?.addEventListener("change", refreshMusicLiveRoute);
  $("#music-playback-source")?.addEventListener("change", updateMusicSourceHelp);
  $("#translate-music")?.addEventListener("click", translateCapturedMusic);
  document.addEventListener("visibilitychange", () => { if (document.hidden) cancelDictionaryPractice(); if (document.hidden && !window.__hablaSystemAudioCaptureActive) cancelMusicListening(); });
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
  $("#load-research-reference")?.addEventListener("click", () => {
    closeImportedDocument();
    sourceLanguage = "es-MX";
    if (languageFamily(targetLanguage) !== "en") targetLanguage = "en-US";
    preservedCulturalContext = null;
    syncLanguagePair();
    setTranslationPurpose("academic",false);
    $("#translator-input").value = PRAGMATICS_REFERENCE.sourceEs + "\n\n" + PRAGMATICS_REFERENCE.sentences[4].es;
    renderTranslation();
  });
  $("#ecuador-research-source")?.addEventListener("change", updateEcuadorResearchPaperLink);
  $("#load-ecuador-research-reference")?.addEventListener("click", () => {
    closeImportedDocument();
    sourceLanguage = "es-EC";
    if (languageFamily(targetLanguage) !== "en") targetLanguage = "en-US";
    preservedCulturalContext = null;
    syncLanguagePair();
    setTranslationPurpose("academic",false);
    const selected = $("#ecuador-research-source")?.value;
    const reference = ECUADOR_RESEARCH_REFERENCES.find(item => item.id === selected) || ECUADOR_RESEARCH_REFERENCE;
    $("#translator-input").value = reference.sentences.map(item => item.es).join("\n\n");
    renderTranslation();
  });
  $("#hear-result").addEventListener("click", () => say($("#natural-result").textContent,targetSpeechLocale()));
  $("#pause-result")?.addEventListener("click", toggleSpeechPause);
  $("#pause-conversation")?.addEventListener("click", toggleSpeechPause);
  updateSpeechPauseControls();
  $("#share-result")?.addEventListener("click", shareTranslation);
  $("#natural-result").addEventListener("input", event => {
    if (!event.isComposing) saveActiveTranslationEdit({allowEmpty:true});
  });
  $("#natural-result").addEventListener("compositionend", () => saveActiveTranslationEdit({allowEmpty:true}));
  $("#natural-result").addEventListener("blur", () => saveActiveTranslationEdit());
  $("#restore-translation").addEventListener("click", restoreGeneratedTranslation);
  const suggestions = ["Maybe another time.","Can you say it more slowly?","I'm so fucking tired!","Do you want to go fishing with me?","I miss you.","That's cool!","What time does the sun set?"];
  $("#suggestion-list").innerHTML = suggestions.map(item => `<button>${item}</button>`).join("");
  $$("#suggestion-list button").forEach(button => button.addEventListener("click", () => { closeImportedDocument(); preservedCulturalContext = null; $("#translator-input").value = button.textContent; renderTranslation(); }));
  syncSpeakerNames();
  document.querySelector('#people-region-search')?.addEventListener('input',renderSpeakerRegionIndex);
  document.querySelector('[data-people-index-results]')?.addEventListener('click',event=>{
    const edit=event.target.closest('[data-edit-person]');
    if(edit) {
      const name=edit.dataset.editPerson;
      const role=speakerRegionKey(speakerName('english'))===speakerRegionKey(name) ? 'english' : 'spanish';
      const input=document.querySelector('[data-speaker-name="'+role+'"]');
      if(input)input.value=name;
      saveSpeakerName(role,name);
      const country=document.querySelector('[data-person-country="'+role+'"]');
      country?.scrollIntoView({block:'center'});country?.focus({preventScroll:true});
      return;
    }
    const button=event.target.closest('[data-index-person]');
    if(button && ['english','spanish'].includes(button.dataset.indexRole)) {
      const {indexRole,indexPerson}=button.dataset;
      const input=document.querySelector('[data-speaker-name="'+indexRole+'"]');
      if(input)input.value=indexPerson;
      saveSpeakerName(indexRole,indexPerson);
      const replacement=Array.from(document.querySelectorAll('[data-index-person]')).find(item=>item.dataset.indexRole===indexRole && item.dataset.indexPerson===indexPerson);
      replacement?.focus({preventScroll:true});
    }
  });
  for(const role of ['english','spanish']) {
    const profile=speakerRegionProfile(speakerName(role));
    if(profile.locales[role])applySpeakerLocale(role);
  }
  document.querySelectorAll('[data-location-options]').forEach(panel=>{
    panel.addEventListener('input',event=>{
      if(!event.target.matches('[data-location-search]'))return;
      const query=normalize(event.target.value);
      let matches=0;
      panel.querySelectorAll('[data-location-pick]').forEach(button=>{
        button.hidden=Boolean(query)&&!normalize(button.textContent).includes(query);
        if(!button.hidden)matches++;
      });
      panel.querySelector('[data-location-empty]').hidden=matches>0;
    });
    panel.addEventListener('click',event=>{
      const button=event.target.closest('[data-location-pick]');
      if(!button)return;
      const role=button.dataset.locationRole,kind=button.dataset.locationPick,value=button.dataset.locationValue;
      const country=$('[data-person-country="'+role+'"]');
      const region=$('[data-person-region="'+role+'"]');
      const city=$('[data-person-city="'+role+'"]');
      const chosen=kind==='city'&&value ? speakerCityOptions(country.value,city.value,region.value).find(place=>place.city===value) : null;
      saveSpeakerRegion(role,kind==='country'?value:country.value,kind==='city'?value:city.value,kind==='region'?value:chosen?.region||region.value);
      // Keep the available choices visible when clearing; close after choosing.
      panel.open=!value;
      if(value)panel.querySelector('summary').focus({preventScroll:true});
    });
  });
  document.querySelectorAll('[data-person-region-choice]').forEach(control=>control.addEventListener('change',()=>{
    const role=control.dataset.personRegionChoice;
    const region=control.value;
    saveSpeakerRegion(role,$('[data-person-country="'+role+'"]').value,$('[data-person-city="'+role+'"]').value,region);
  }));
  document.querySelectorAll('[data-person-country],[data-person-region],[data-person-city]').forEach(control=>control.addEventListener('change',()=>{
    const role=control.dataset.personCountry||control.dataset.personRegion||control.dataset.personCity;
    saveSpeakerRegion(role,$('[data-person-country="'+role+'"]').value,$('[data-person-city="'+role+'"]').value,$('[data-person-region="'+role+'"]').value);
  }));
  document.querySelectorAll('[data-conversation-profile]').forEach(button => button.addEventListener('click',()=>{
    const role=button.dataset.conversationProfile,name=button.dataset.profileName;
    const input=document.querySelector('[data-speaker-name="'+role+'"]');
    if(input)input.value=name;
    saveSpeakerName(role,name);
  }));
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
  $("#clear-conversation").addEventListener("click", clearConversation);
  setConversationPlayback(conversationPlayback);
  syncConversationLocaleUi();
  $("#conversation-playback").addEventListener("change",event=>setConversationPlayback(event.target.value));
  for(const role of ['english','spanish'])$('#conversation-'+role+'-language').addEventListener('change',event=>setConversationLocale(role,event.target.value));
  $("#conversation-text-speaker").addEventListener('change',event=>{
    const [role,name]=event.target.value.split('::');
    if(name&&['english','spanish'].includes(role)){
      const input=document.querySelector('[data-speaker-name="'+role+'"]');
      if(input)input.value=name;
      saveSpeakerName(role,name);
      event.target.value=role;
    }
    syncSpeakerRegion(role);
  });
  $("#conversation-text-form").addEventListener("submit",event=>{event.preventDefault();submitConversationText();});
  $("#conversation-turns").addEventListener("click",event=>{const button=event.target.closest?.('[data-conversation-hear]');if(button)hearConversationTurn(Number(button.dataset.conversationHear));});
  $("#regional-slang-search").addEventListener("input", renderRegionalSlang);
  $("#regional-slang-region").addEventListener("change", () => {
    const context = $("#shared-app-context");
    if (context) context.hidden = true;
    renderRegionalSlang();
  });
  $("#regional-slang-tone").addEventListener("change", renderRegionalSlang);
  $("#regional-dictionary-category").addEventListener("change", renderRegionalSlang);
  $("#regional-usage-type")?.addEventListener("change", renderRegionalSlang);
  $("#regional-slang-target").addEventListener("change", renderRegionalSlang);
  $("#regional-slang-results").addEventListener("click", event => {
    const button = event.target.closest?.("[data-regional-audio]");
    if (button) { cancelDictionaryPractice(); say(button.dataset.regionalAudio, button.dataset.audioLang); }
  });
  renderRegionalSlang();
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
  const updateLessonLanguage = () => {
    if ($("#lesson-content")?.dataset.targetLanguage === lessonTargetLocale()) return;
    lessonStep = 1; selectedChoice = "";
    stopSpeechPlayback();
    renderLesson(); renderSourcePractice();
  };
  $("#lesson-language")?.addEventListener("change",event => {
    lessonLanguagePreference = event.target.value;
    try { localStorage.setItem("habla-lesson-language-v1",lessonLanguagePreference); } catch {}
    updateLessonLanguage();
    renderMusic();
  });
  document.addEventListener("habla-ui-language-change",()=>{updateLessonLanguage();renderMusic();});
  renderMusic();
  if (standaloneTranslator) {
    document.body.classList.add("standalone-translator");
  }
  const invitedRegion = sharedAppRegion(launchQuery);
  if (!standaloneTranslator && invitedRegion) {
    $("#regional-slang-region").value = invitedRegion;
    renderRegionalSlang();
    const context = $("#shared-app-context");
    if (context) {
      context.textContent = invitedRegion === "es-VE" && launchQuery.get("city") === "caracas"
        ? "Invite for Caracas, Venezuela: showing country-attested entries. Caracas-specific review is pending."
        : invitedRegion === "es-CU" ? "Invite for Cuba: starter dictionary entries; Holgu\u00edn / Oriente-specific review pending." : invitedRegion === "monterrey" ? "Invite for Monterrey, Nuevo León." : invitedRegion === "es-VE" ? "Invite for Venezuela." : "Country selected: "+(TRANSLATOR_LANGUAGES[invitedRegion]?.label||invitedRegion)+". Local dictionary coverage may be limited.";
      context.hidden = false;
    }
    openView("dictionary-view");
  } else if (launchQuery.get("start") === "music") {
    // Direct link to BYE BYE's music player, including in the native web companion.
    openView("music-view");
  } else if (standaloneTranslator || launchQuery.get("start") === "translate") {
    openView("translator-view");
    setMode("translate");
  }
  // The first visit gets a small optional invitation; help can be replayed
  // from any tab, without altering text fields, voice choices or recordings.
  if (typeof HablaTutorial !== "undefined") {
    initializeOptionalFeature("bilingual tutorial",() =>
      HablaTutorial.bind({navigate:openView,launchQuery}));
  }
  const updateRegistration = "serviceWorker" in navigator
    ? navigator.serviceWorker.register("sw.js?v=182", {updateViaCache:"none"}).catch(() => null)
    : Promise.resolve(null);
  if(typeof HablaUpdates!=="undefined") HablaUpdates.start({version:APP_VERSION,registration:updateRegistration,isProtected:()=>Boolean(
    recognition || activeRecognitionButton || dictionaryPracticeSession || lessonStep > 1 || musicListening || musicCapturedText || musicPassages.length
    || conversationActive || conversationComposerBusy || turns.length || liveConversationTurn
    || documentImportActive || documentLoading || importedDocument || wholeDocumentTools?.runner?.busy
    || musicReviewBusy || translationSharePending || translationCopyPending || appSharePending || activeSpeechPlayback
    || (typeof HablaRecordedPractice!=="undefined" && (HablaRecordedPractice.isPlaying() || HablaRecordedPractice.isProtected()))
    || (typeof HablaQuickLessons!=="undefined" && HablaQuickLessons.isProtected())
    || (typeof HablaOffline!=="undefined" && HablaOffline.busy)
    || (typeof HablaTutorial!=="undefined" && HablaTutorial.isOpen())
    || (typeof HablaFullReader!=="undefined" && HablaFullReader.isOpen())
  )});
}

document.addEventListener("DOMContentLoaded", initDictionary);
document.addEventListener("DOMContentLoaded", init);
