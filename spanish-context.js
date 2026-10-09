/* Small local editorial rules and usage clues, not a country classifier. */
const HablaSpanishContext = (() => {
  const plain = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const unquoted = text => text.replace(/"[^"\n]*"|“[^”]*”|`[^`]*`/g, match=>' '.repeat(match.length));
  const address = /\b(?:baila|ven|escucha|espera|mira|dime|hola)\s*,\s*coraz[oó]n\s*[,!?]/i;
  const touch = /\b(?:besos?|caricias?|abrazos?)\b|\bmanos?\b.{0,60}\bcuerpo\b/i;
  const otherRico = /\b(?:comida|comer|sopa|cafe|chocolate|sabor|postre|dinero|millonario|riqueza|sueldo|salario|no|nunca)\b/;
  function pleasure(text) {
    const source=unquoted(text);
    return (source.match(/\bqu[eé]\s+rico\b/gi)||[]).length===1 && touch.test(source) && !otherRico.test(plain(source));
  }
  function workSense(text) {
    const source=plain(unquoted(text));
    if(/\b(?:animal|desierto|joroba|zoo|zapateria|suela|tacon)\b/.test(source))return false;
    return /\b(?:voy|vamos|va|ir|llego|llegar|salgo|salir)\s+(?:a\s+el|al|del)\s+camello\b/.test(source)
      || /\b(?:empleo|trabajo|oficina|jefe|laboral|sueldo|salario)\b/.test(source);
  }
  function analyse(text,{source='es-EC',purpose='everyday',image=false}={}) {
    if(!source.startsWith('es') || purpose==='academic')return [];
    const value=unquoted(text),findings=[];
    const add=(term,detail,url)=>findings.push({term,detail,url});
    if(address.test(value))add('corazón','Likely an affectionate address: sweetheart or darling. This use is shared across Spanish-speaking regions; it does not identify a country.','https://www.rae.es/gramática/sintaxis/las-formas-de-tratamiento-ii-sustantivos-y-grupos-nominales');
    if(/\bqu[eé]\s+rico\b/i.test(value))add('qué rico',pleasure(value)?'The touch or affection context suggests pleasure: that feels so good. Food, wealth and irony require different readings.':'Could express delicious taste, pleasure or another evaluation. Review the surrounding meaning; this expression alone does not identify a country.','https://dle.rae.es/rico');
    if(/\bte\s+quiero\b/i.test(value))add('te quiero','Often I love you in an affectionate exchange; wanting someone is another possible reading. Review the relationship and tone before editing.','https://dle.rae.es/querer');
    if(/\bcamello\b/i.test(value))add('camello',`Ecuador and Mexico record a work or job sense; Bolivia also records a shoemaking tool. The animal meaning remains possible. ${workSense(value)?'Employment context supports the work sense.':'No clear employment context was found.'}`,'https://www.asale.org/damer/camello');
    if(/(?:^|\s)ñañ[oa](?=$|[\s,.!?])/i.test(value))add('ñaño / ñaña','Sibling usages occur in Ecuador and Bolivia; close-friend usages also occur in parts of Bolivia. A single word cannot establish the speaker’s country.','https://www.asale.org/damer/ñaño');
    if(/\bguagua\b/i.test(value))add('guagua','Baby or child in Ecuador and Bolivia; bus in some Caribbean usages. Keep the source variety that you know and check the sentence.','https://www.asale.org/damer/guagua');
    if(image && /\b(?:entre|para|de|con|que|y)\s*[.!?]*$/i.test(value.trim()))add('Incomplete ending','The image may cut off the sentence. Check the original or add the next image; missing words are not invented.');
    return findings;
  }
  function refine(draft,source,{purpose='everyday'}={}) {
    if(purpose==='academic')return {text:draft,changes:[]};
    const value=unquoted(source),changes=[];
    let text=draft;
    if(address.test(value) && (value.match(/\bcoraz[oó]n\b/gi)||[]).length===1 && !/\b(?:cardiaco|cardiologia|latido|organo|cirugia)\b/.test(plain(value))) {
      text=text.replace(/\b((?:dance|come|listen|wait|look|tell me|hello)\s*,\s*)heart(?=\s*[,!?])/gi,(whole,start,offset)=>{
        if(unquoted(draft).slice(offset,offset+whole.length).trim()==='')return whole;
        changes.push('Affectionate address: heart → sweetheart');return start+'sweetheart';
      });
    }
    if(pleasure(value))text=text.replace(/\((?:how (?:rich|delicious|tasty)|so (?:rich|delicious|tasty))\)/gi,(whole,offset)=>{
      if(unquoted(draft).slice(offset,offset+whole.length).trim()==='')return whole;
      changes.push('Pleasure in context: that feels so good');return '(that feels so good)';
    });
    return {text,changes};
  }
  return {analyse,refine,workSense};
})();
if(typeof module!=='undefined' && module.exports)module.exports=HablaSpanishContext;
