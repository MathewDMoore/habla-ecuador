/* Small, source-aware glossary for language ability vs nationality.
   Isolated vocabulary terms are safe to translate locally, without a network
   service or a guessed nationality. Longer prose still goes through the
   sentence translator, with a guarded repair only for an unambiguous mismatch. */
(function(root){
  const enToEs=new Map(Object.entries({
    "spanish-speaking":"hispanohablante",
    "spanish speaking":"hispanohablante",
    "spanish speaker":"hispanohablante",
    "spanish speakers":"hispanohablantes",
    "spanish-speaking person":"persona hispanohablante",
    "spanish speaking person":"persona hispanohablante",
    "a spanish-speaking person":"una persona hispanohablante",
    "a spanish speaking person":"una persona hispanohablante",
    "spanish-speaking people":"personas hispanohablantes",
    "spanish speaking people":"personas hispanohablantes",
    "spanish-speaking country":"país hispanohablante",
    "a spanish-speaking country":"un país hispanohablante",
    "spanish-speaking countries":"países hispanohablantes",
    "spanish-speaking community":"comunidad hispanohablante",
    "a spanish-speaking community":"una comunidad hispanohablante",
    "spanish-speaking communities":"comunidades hispanohablantes",
    "spanish-speaking population":"población hispanohablante",
    "spanish-speaking populations":"poblaciones hispanohablantes"
  }));
  const esToEn=new Map(Object.entries({
    "hispanohablante":"Spanish-speaking",
    "hispanoparlante":"Spanish-speaking",
    "hispanohablantes":"Spanish speakers",
    "hispanoparlantes":"Spanish speakers",
    "de habla hispana":"Spanish-speaking",
    "persona hispanohablante":"Spanish-speaking person",
    "persona hispanoparlante":"Spanish-speaking person",
    "una persona hispanohablante":"A Spanish-speaking person",
    "una persona hispanoparlante":"A Spanish-speaking person",
    "personas hispanohablantes":"Spanish-speaking people",
    "personas hispanoparlantes":"Spanish-speaking people",
    "país hispanohablante":"Spanish-speaking country",
    "país hispanoparlante":"Spanish-speaking country",
    "país de habla hispana":"Spanish-speaking country",
    "países hispanohablantes":"Spanish-speaking countries",
    "países hispanoparlantes":"Spanish-speaking countries",
    "países de habla hispana":"Spanish-speaking countries",
    "comunidad hispanohablante":"Spanish-speaking community",
    "comunidad hispanoparlante":"Spanish-speaking community",
    "comunidad de habla hispana":"Spanish-speaking community",
    "población hispanohablante":"Spanish-speaking population",
    "población hispanoparlante":"Spanish-speaking population",
    "población de habla hispana":"Spanish-speaking population"
  }));
  function normalizedTerm(value){
    return String(value).normalize("NFC")
      .replace(/[‐‑‒–—]/g,"-").replace(/\s*[-]\s*/g,"-")
      .replace(/\s+/g," ").trim().toLocaleLowerCase();
  }
  function localeFamily(locale){return String(locale).split("-")[0].toLowerCase();}
  function splitAffixes(value) {
    const match=/^(\s*)(.*?)([.!?]+)?(\s*)$/s.exec(String(value));
    return {leading:match[1],core:match[2],trailing:match[3]||"",space:match[4]};
  }
  function lookup(value,{source="en-US",target="es-EC"}={}){
    const family=localeFamily(source)+"-"+localeFamily(target);
    if(family!=="en-es"&&family!=="es-en")return null;
    const {leading,core,trailing,space}=splitAffixes(value);
    const translated=(family==="en-es"?enToEs:esToEn).get(normalizedTerm(core));
    if(!translated)return null;
    // An isolated English adjective is not a claim of Spanish nationality.
    // Spanish common nouns/adjectives ordinarily remain lowercase.
    const loud=core.length>3&&core===core.toUpperCase();
    const wording=loud?translated.toLocaleUpperCase():translated;
    return leading+wording+trailing+space;
  }
  function refine(draft,sourceText,{source="en-US",target="es-EC"}={}){
    if(localeFamily(source)!=="en"||localeFamily(target)!=="es")return draft;
    const text=String(sourceText),result=String(draft);
    const occurrences=text.match(/\bspanish[-\s]speaking\b/gi)||[];
    if(occurrences.length!==1)return result;
    // More than one use of "Spanish" can identify a language, country or
    // nationality independently; avoid replacing such distinctions.
    if((text.match(/\bspanish\b/gi)||[]).length!==1)return result;
    if(/\bhispanohablantes?\b|\bhispanoparlantes?\b|\bde habla hispana\b|\b(?:habla|hablar|hablando)\s+español\b/i.test(result))return result;
    if(/\b(?:idioma|lengua)\s+español(?:a)?\b/i.test(result))return result;
    const adjective=/\bespañol(?:es|as|a)?\b/gi;
    const matches=result.match(adjective)||[];
    if(matches.length!==1)return result;
    return result.replace(adjective,old=>
      /(?:es|as)$/i.test(old)?"hispanohablantes":"hispanohablante"
    );
  }
  const api={lookup,refine,normalizedTerm};
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.HablaLanguageCommunity=api;
})(typeof globalThis!=="undefined"?globalThis:this);
