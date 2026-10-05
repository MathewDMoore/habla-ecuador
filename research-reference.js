// Source supplied by Mathew; editorial English is distinct from the published translation.
// This is local reference retrieval and contextual terminology, not model fine-tuning.
const PRAGMATICS_REFERENCE = {
  "id": "escalante-2017-requests-abstract",
  "author": "Chelsea Escalante",
  "title": "Te lo pido por favor: Estrategias de cortesía de hablantes de herencia del español mexicano",
  "year": 2017,
  "doi": "10.7203/normas.v7i2.10607",
  "url": "https://dialnet.unirioja.es/descarga/articulo/6260555.pdf",
  "region": "Northern Mexico; not evidence of Ecuadorian or Bolivian usage",
  "status": "Editorial reference draft; subject-expert review pending",
  "sourceEs": "El presente estudio analiza la realización de peticiones de 30 alumnos universitarios que han adquirido el español como lengua de herencia y compara sus estrategias de cortesía lingüística con las estrategias producidas en las peticiones de 30 nativo-hablantes del norte de México. Este análisis se realiza en el momento en que estos alumnos se enfrentan con la tarea de escribir a interlocutores hipotéticos que representan diferentes grados de poder y distancia social. Las peticiones se analizan de acuerdo a cuatro medidas de cortesía lingüística: (1) la forma de tratamiento, (2) la franqueza del acto principal, (3) el uso de las estrategias de cortesía positiva y (4) el uso de las estrategias de cortesía negativa. Se observa que los participantes siguen la norma monolingüe en cuanto al tratamiento y la formación del acto principal de la petición, exhibiendo variación estilística según las dinámicas de poder y distancia social del interlocutor, pero que hay diferencias sutiles en el uso de estrategias positivas y negativas en comparación a los nativo-hablantes, lo cual apoya la inclusión de la instrucción pragmática explícita en la enseñanza de español como lengua de herencia.",
  "publishedEnglish": "The present study investigates the formation of petitions of 30 university students who have acquired Spanish as a heritage language, comparing their strategies of linguistic courtesy with those seen in the petitions of 30 native-speakers from northern Mexico. The formation of the petition is analyzed as they are faced with writing to hypothetical interlocutors using four different measures of linguistic courtesy: (1) form of address, (2) directness of the head act, (3) use of positive courtesy strategies, and (4) use of negative courtesy strategies. Results suggest that participants follow the monolingual norm with respect to form of address and the formation of the head act, exhibiting stylistic variation according to the dynamics of power and social distance of the interlocuters, but that there are subtle differences in the use of positive and negative strategies in comparison to the native-speakers, which supports the inclusion of explicit pragmatics instruction in the teaching of Spanish as a heritage language.",
  "publishedKeywords": "Key words: heritage speakers, heritage language, pragmatics, petition, courtesy",
  "sentences": [
    {
      "es": "El presente estudio analiza la realización de peticiones de 30 alumnos universitarios que han adquirido el español como lengua de herencia y compara sus estrategias de cortesía lingüística con las estrategias producidas en las peticiones de 30 nativo-hablantes del norte de México.",
      "en": "This study examines how 30 university students who acquired Spanish as a heritage language formulate requests and compares their linguistic politeness strategies with those used in requests by 30 native speakers from northern Mexico."
    },
    {
      "es": "Este análisis se realiza en el momento en que estos alumnos se enfrentan con la tarea de escribir a interlocutores hipotéticos que representan diferentes grados de poder y distancia social.",
      "en": "The analysis is conducted as these students undertake a writing task addressed to hypothetical interlocutors representing different degrees of power and social distance."
    },
    {
      "es": "Las peticiones se analizan de acuerdo a cuatro medidas de cortesía lingüística: (1) la forma de tratamiento, (2) la franqueza del acto principal, (3) el uso de las estrategias de cortesía positiva y (4) el uso de las estrategias de cortesía negativa.",
      "en": "Requests are analysed using four measures of linguistic politeness: (1) form of address, (2) directness of the head act, (3) use of positive politeness strategies, and (4) use of negative politeness strategies."
    },
    {
      "es": "Se observa que los participantes siguen la norma monolingüe en cuanto al tratamiento y la formación del acto principal de la petición, exhibiendo variación estilística según las dinámicas de poder y distancia social del interlocutor, pero que hay diferencias sutiles en el uso de estrategias positivas y negativas en comparación a los nativo-hablantes, lo cual apoya la inclusión de la instrucción pragmática explícita en la enseñanza de español como lengua de herencia.",
      "en": "The results indicate that participants follow the monolingual norm in their use of forms of address and formulation of the request head act, with stylistic variation according to the interlocutor’s power and social distance. However, subtle differences in the use of positive and negative politeness strategies compared with native speakers support the inclusion of explicit pragmatics instruction in Spanish heritage language teaching."
    },
    {
      "es": "Palabras clave: hablantes de herencia, lengua heredada, pragmática, petición, cortesía",
      "en": "Keywords: heritage speakers, heritage language, pragmatics, request, politeness"
    }
  ]
};

function researchReferenceKey(text) {
  // Repair PDF wrapping, including native-\n speakers, without discarding facts or punctuation.
  return text.normalize("NFC").replace(/-\s*\n\s*/g, "-").replace(/\s+/g, " ").trim();
}

function findPragmaticsReference(text) {
  const parts = text.trim().split(/(\n\s*\n)/);
  const translated = [];
  for (let part of parts) {
    if (/^\n\s*\n$/.test(part)) { translated.push(part); continue; }
    let heading = "";
    if (/^Resumen\s*(?:\n|:)/i.test(part)) {
      heading = "Abstract\n";
      part = part.replace(/^Resumen\s*(?:\n|:)\s*/i, "");
    }
    const key = researchReferenceKey(part);
    let found = null;
    for (let start=0; start<PRAGMATICS_REFERENCE.sentences.length; start++) {
      for (let end=start+1; end<=PRAGMATICS_REFERENCE.sentences.length; end++) {
        const span = PRAGMATICS_REFERENCE.sentences.slice(start,end);
        if (researchReferenceKey(span.map(item=>item.es).join(" ")) === key) {
          found = span.map(item=>item.en).join(" ");
          break;
        }
      }
      if (found !== null) break;
    }
    // An altered sample size, citation, region, or claim must never reuse the reference.
    if (found === null) return null;
    translated.push(heading + found);
  }
  return translated.join("");
}

function hasPragmaticsRequestContext(source) {
  return /cortes[ií]a ling[uü][ií]stica|(?:franqueza|directividad) del acto principal|estrategias de cortes[ií]a (?:positiva|negativa)/i.test(source)
    || (/pragm[aá]tica/i.test(source) && /petici[oó]n|peticiones/i.test(source));
}

function refinePragmaticsTerminology(text, source) {
  if (!hasPragmaticsRequestContext(source)) return text;
  const mappings = [
    [/\blinguistic courtesy\b/gi, "linguistic politeness"],
    [/\bpositive courtesy\b/gi, "positive politeness"],
    [/\bnegative courtesy\b/gi, "negative politeness"],
    [/\bcourtesy strategies\b/gi, "politeness strategies"],
    [/\bstrategies of courtesy\b/gi, "politeness strategies"],
    [/\bmeasures of courtesy\b/gi, "measures of politeness"],
    [/\bpetitions\b/gi, "requests"],
    [/\bpetition\b/gi, "request"],
    [/\bfrankness of the (?:head|main) act\b/gi, "directness of the head act"],
    [/\binterlocuters\b/gi, "interlocutors"]
  ];
  return mappings.reduce((result,[pattern,replacement]) => result.replace(pattern, match =>
    match === match.toUpperCase() ? replacement.toUpperCase()
      : /^[A-Z]/.test(match) ? replacement[0].toUpperCase()+replacement.slice(1)
      : replacement), text);
}

// Small, attributed translation memory. Published English is retained separately
// from our editorial draft; these examples are not a held-out evaluation set.
const ECUADOR_RESEARCH_REFERENCE = {
  id:"sellers-espinoza-2017-cuenca-air-quality",
  authors:["Chester Sellers", "Claudia Espinoza"],
  title:"Publicación de contaminantes atmosféricos de la estación de monitoreo de la ciudad de Cuenca, utilizando servicios estándares OGC",
  year:2017,
  doi:"10.18272/aci.v9i15.300",
  url:"https://revistas.usfq.edu.ec/index.php/avances/en/article/download/300/2521/13087",
  licenseEvidenceUrl:"https://revistas.usfq.edu.ec/index.php/avances/article/view/300",
  licenseCode:"CC-BY-3.0",
  licenseUrl:"https://creativecommons.org/licenses/by/3.0/",
  journal:"ACI Avances en Ciencias e Ingenierías · USFQ PRESS",
  sourceLanguage:"es-EC",
  region:"Cuenca, Ecuador",
  discipline:"Environmental monitoring",
  reviewedAt:"2026-10-05",
  role:"translation-memory",
  changes:"Two nonconsecutive abstract sentences selected; English edited for clarity and source fidelity. This is an excerpt, not the full abstract. Subject-expert review pending.",
  terminology:[
    {es:"gestión ambiental",en:"environmental management"},
    {es:"toma de decisiones",en:"decision-making"},
    {es:"buen vivir",en:"buen vivir (well-being)",note:"Keep the source's Ecuadorian concept visible; do not turn it into a causal health claim."}
  ],
  sentences:[
    {
      es:"La contaminación del aire amenaza gravemente a la salud humana y el ambiente, requiriendo acciones para el control y mitigación de sus impactos.",
      publishedEnglish:"Air pollution is a threat to human health and the environment. It requires taking action in control and mitigation of impacts.",
      en:"Air pollution seriously threatens human health and the environment, requiring action to control and mitigate its impacts."
    },
    {
      es:"Esta plataforma es una herramienta válida para la gestión ambiental y la toma de decisiones para el buen vivir de los cuencanos.",
      publishedEnglish:"This platform is a valid tool for environmental management and decision making contributing to the \"buen vivir” (well-being) of Cuenca.",
      en:"This platform is a useful tool for environmental management and decision-making in support of buen vivir (well-being) for the people of Cuenca."
    }
  ]
};

function findEcuadorResearchReference(text) {
  const parts = text.trim().split(/(\n\s*\n)/);
  const translated = [];
  for (let part of parts) {
    if (/^\n\s*\n$/.test(part)) { translated.push(part); continue; }
    let heading = "";
    if (/^Resumen\s*(?:\n|:)/i.test(part)) {
      heading = "Abstract\n";
      part = part.replace(/^Resumen\s*(?:\n|:)\s*/i, "");
    }
    const match = ECUADOR_RESEARCH_REFERENCE.sentences.find(item => researchReferenceKey(item.es) === researchReferenceKey(part));
    // Never supply remembered claims for changed facts or an unmatched passage.
    if (!match) return null;
    translated.push(heading + match.en);
  }
  return {text:translated.join(""),reference:ECUADOR_RESEARCH_REFERENCE};
}

function findAcademicReference(text) {
  const mexican = findPragmaticsReference(text);
  if (mexican !== null) return {text:mexican,reference:PRAGMATICS_REFERENCE};
  return findEcuadorResearchReference(text);
}
