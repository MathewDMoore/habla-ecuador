/* Local, conservative ES/EN text routing. No audio or text leaves this detector. */
(function(root){
  'use strict';
  const es=new Set('yo tú él ella usted nosotros ustedes ellos ellas estoy estás está estamos están soy eres somos son tengo tienes tiene tenemos tienen quiero quieres quiere queremos puedo puedes puede podemos debo debes debe debemos voy vas vamos van fui fue fuimos será será quiero contigo conmigo gracias hola adiós porque aunque pero cuando donde quién qué cómo para sin del los las una unos unas muy también todavía aquí allí ahora nunca siempre mañana noche nuestro nuestra tus mis mi tu te que'.split(' '));
  const en=new Set("i you he she we they i'm you're he's she's we're they're i've don't doesn't didn't can't won't isn't aren't wasn't weren't my your our their am are is was were have has had want wants need needs love loves know knows going come comes leave stay go goes feel feels never always tonight tomorrow hello thanks goodbye because although but when where who what how with without from this that these those the an and not will would could should".split(' '));
  const family=locale=>String(locale||'').split('-')[0];
  function tokens(text){return [...text.matchAll(/[\p{L}]+(?:['’][\p{L}]+)?/gu)].map(match=>{
    const word=match[0].toLowerCase().replace(/’/g,"'");
    return {start:match.index,end:match.index+match[0].length,language:es.has(word)&&!en.has(word)?'es':en.has(word)&&!es.has(word)?'en':null};
  });}
  function clause(text,fallback){
    const words=tokens(text), anchors=words.filter(word=>word.language);
    const groups=[];
    for(const anchor of anchors){const last=groups.at(-1);if(last?.language===anchor.language)last.words.push(anchor);else groups.push({language:anchor.language,words:[anchor]});}
    // A lone cue/name/borrowed word is insufficient to establish a language switch.
    const supported=groups.filter(group=>group.words.length>=2);
    if(!supported.length)return [{text,language:fallback,uncertain:true}];
    const merged=[];
    for(const group of supported){const last=merged.at(-1);if(last?.language===group.language)last.words.push(...group.words);else merged.push({...group,words:[...group.words]});}
    let start=0;
    return merged.map((group,index)=>{
      const end=index+1<merged.length?merged[index+1].words[0].start:text.length;
      const part={text:text.slice(start,end),language:group.language,uncertain:groups.some(other=>other.words.length<2) || anchors.length/words.length<0.5};
      start=end;return part;
    });
  }
  function plan(text,{source='es-EC',target='en-US'}={}){
    const fallback=['es','en'].includes(family(source))?family(source):'es';
    const parts=[];
    // Keep punctuation and whitespace exact, including empty lines and choruses.
    for(const piece of String(text).split(/(\r?\n+|(?<=[.!?;])\s+)/u)){
      if(!piece)continue;
      if(!/\p{L}/u.test(piece))parts.push({text:piece,language:null,uncertain:false});
      else parts.push(...clause(piece,fallback));
    }
    const languages=[...new Set(parts.filter(part=>part.language).map(part=>part.language))];
    return {parts,languages,uncertain:parts.some(part=>part.uncertain),target:family(target)};
  }
  function label(result){
    const language=result.languages.length>1?'Spanish + English':result.languages[0]==='en'?'English':'Spanish';
    return result.uncertain?`${language} clues · uncertain detection; check or choose selected From language.`:`Likely ${language} from text · experimental; check language switches.`;
  }
  root.HablaBilingualMusic={plan,label};
  if(typeof module!=='undefined')module.exports=root.HablaBilingualMusic;
})(typeof window!=='undefined'?window:globalThis);
