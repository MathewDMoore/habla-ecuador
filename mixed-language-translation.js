/* Mixed Spanish-English translator guard.
   Source text is immutable; only the translation request is normalized. */
(function(root){
  'use strict';
  const blocked=/https?:\/\/[^\s]+|`[^`]*`|"[^"\n]*"|“[^”]*”|‘[^’]*’/gu;
  const skipQuoted=text=>String(text).replace(blocked,part=>' '.repeat(part.length));
  const isSpanishToEnglish=({source='es-EC',target='en-US',purpose='everyday',way='ec-en'}={})=>
    way==='ec-en' && /^es(?:-|$)/.test(source) && /^en(?:-|$)/.test(target) && purpose!=='academic';
  // The English progressive is meaningful as a verb, not a place name or UI command.
  const hasDevelopment=text=>/\b(?:continuar|seguir)\s+developing\b/iu.test(skipQuoted(text));
  const hasAppObject=text=>/\b(?:este|esta|mi|mis|the|this)\s+(?:app|aplicaci[oó]n)\b/iu.test(skipQuoted(text));
  function detect(text,options={}){
    const yes=isSpanishToEnglish(options)&&hasDevelopment(text);
    return {mixedDevelopment:yes,appObject:yes&&hasAppObject(text)};
  }
  function changeOutsideLiterals(text,transform){
    return String(text).split(/(https?:\/\/[^\s]+|`[^`]*`|"[^"\n]*"|“[^”]*”|‘[^’]*’)/gu)
      .map((part,i)=>i%2?part:transform(part)).join('');
  }
  function prepare(text,options={}){
    if(!detect(text,options).mixedDevelopment)return text;
    return changeOutsideLiterals(text,part=>part
      .replace(/\b(?:continuar|seguir)\s+developing\b/giu,'seguir desarrollando')
      .replace(/\bnecesito\s+voy\s+a\b/giu,'necesito ir a')
      .replace(/\bmis\s+computadora\b/giu,'mi computadora')
      .replace(/\b(?:este|esta)\s+app\b/giu,'esta aplicación')
      .replace(/\bnecesito\s+ir\s+a\s+mi\s+casa\b/giu,'necesito ir a casa'));
  }
  function refine(draft,text,options={}){
    const check=detect(text,options);
    if(!check.mixedDevelopment)return draft;
    // Use evidence in the speaker's original text, not a guess from the
    // service. Correct only a proven "developing app" --> "viewing app" loss.
    return changeOutsideLiterals(draft,part=>{
      let result=part;
      if(check.appObject){
        result=result.replace(/\b(?:continue|keep|carry\s+on)\s+(?:to\s+)?(?:view|see|watch|browse|look\s+at)\s+(this|that|the|my|our)\s+(app|application)\b/giu,(_,article,noun)=>
          'continue developing '+article+' '+noun);
      }
      if(/\b(?:necesito\s+voy\s+a|necesito\s+ir\s+a)\s+mi\s+casa\b/iu.test(skipQuoted(text))){
        result=result.replace(/\bgo\s+to\s+my\s+house\b/giu,'go home');
      }
      return result;
    });
  }
  function lostMeaning(draft,text,options={}){
    return detect(text,options).mixedDevelopment&&!/\bdevelop(?:ing|ment|s|ed)?\b/iu.test(skipQuoted(draft));
  }
  root.HablaMixedTranslation={detect,prepare,refine,lostMeaning};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.HablaMixedTranslation;
})(typeof window!=='undefined'?window:globalThis);
