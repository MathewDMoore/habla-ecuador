/* Small local editorial rules and usage clues, not a country classifier. */
const HablaSpanishContext = (() => {
  const plain = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const unquoted = text => text.replace(/"[^"\n]*"|“[^”]*”|`[^`]*`/g, match=>' '.repeat(match.length));
  const address = /\b(?:baila|ven|escucha|espera|mira|dime|hola)\s*,\s*coraz[oó]n\s*[,!?]/i;
  const touch = /\b(?:besos?|caricias?|abrazos?)\b|\bmanos?\b.{0,60}\bcuerpo\b/i;
  const otherRico = /\b(?:comida|comer|sopa|cafe|chocolate|sabor|postre|dinero|millonario|riqueza|sueldo|salario|no|nunca)\b/;
  const nameContext = /\b(?:nombre|apellido|apodo|marca|restaurante|bar|llamado|llamada|llama)\b/i;
  const smallObject = /\b(?:carritos?|carros?|mesas?|cajas?|libros?|casas?|vasos?|muebles?|objetos?|juguetes?)\b/i;
  const sizeDescription = text => /\b(?:carritos?|carros?|mesas?|cajas?|libros?|casas?|vasos?|muebles?|objetos?|juguetes?)(?:\s+de\s+(?:madera|plastico|carton|metal|vidrio|papel))?\s+(?:(?:son|es)\s+)?(?:(?:muy|tan)\s+)?chiquit[oa]s?\b/.test(plain(text));
  function prepare(text,{purpose='everyday'}={}) {
    if(purpose==='academic')return text;
    return text.replace(/\bchiquit[oa]s?\b/gi,(word,index,whole)=>{
      const start=whole.slice(0,index).split(/[.!?\n]/).at(-1),end=whole.slice(index+word.length).split(/[.!?\n]/)[0];
      const clause=start+word+end;
      if(!sizeDescription(clause)||nameContext.test(clause)||unquoted(whole).slice(index,index+word.length).trim()==='')return word;
      const replacement=word.toLowerCase().replace('chiquit','pequeñ');
      return word===word.toUpperCase()?replacement.toUpperCase():/^[A-Z]/.test(word)?replacement[0].toUpperCase()+replacement.slice(1):replacement;
    });
  }
  function residue(source,draft,{purpose='everyday',target='en-GB'}={}) {
    if(purpose==='academic'||!target.startsWith('en')||nameContext.test(source))return [];
    const sourceWords=new Set(plain(unquoted(source)).match(/[a-zñ]+/g)||[]);
    const watch=/\b(?:chiquit[oa]s?|pequeñ[oa]s?|cansad[oa]s?|arrepentimientos|demasiado|despacio|madera|siempre|trasero)\b/gi;
    const words=[...new Set((unquoted(draft).match(watch)||[]).filter(word=>sourceWords.has(plain(word))))];
    return words.length?[{term:'Possible untranslated words',detail:`Still in Spanish: ${words.join(', ')}. Review the draft; names and borrowed words can be intentional. This limited check does not certify translation accuracy.`}]:[];
  }
  function pleasure(text) {
    const source=unquoted(text);
    return (source.match(/\bqu[eé]\s+rico\b/gi)||[]).length===1 && touch.test(source) && !otherRico.test(plain(source));
  }
  function causalAddress(text) {
    const value=unquoted(text);
    return address.test(value)?value.match(/\b(baila|ven|espera|escucha)\s*,?\s+que\s+(?:te\s+quiero\b|ya\s+es\b)/i):null;
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
    if(causalAddress(value))add('que after an invitation','Here que introduces a reason for the invitation: because or for. Other uses of que can mean that or which.','https://dle.rae.es/que');
    if(/\bqu[eé]\s+rico\b/i.test(value))add('qué rico',pleasure(value)?'The touch or affection context suggests pleasure: that feels so good. Food, wealth and irony require different readings.':'Could express delicious taste, pleasure or another evaluation. Review the surrounding meaning; this expression alone does not identify a country.','https://dle.rae.es/rico');
    if(/\bte\s+quiero\b/i.test(value))add('te quiero','Often I love you in an affectionate exchange; wanting someone is another possible reading. Review the relationship and tone before editing.','https://dle.rae.es/querer');
    if(/\bcamello\b/i.test(value))add('camello',`Ecuador, Mexico and Colombia record a work or job sense; Bolivia also records a shoemaking tool. The animal meaning remains possible. ${workSense(value)?'Employment context supports the work sense.':'No clear employment context was found.'}`,'https://www.asale.org/damer/camello');
    if(/(?:^|\s)ñañ[oa](?=$|[\s,.!?])/i.test(value))add('ñaño / ñaña','Sibling usages occur in Ecuador and Bolivia; friend usages also occur in Peru and parts of Bolivia. A single word cannot establish the speaker’s country.','https://www.asale.org/damer/ñaño');
    if(/\bguagua\b/i.test(value))add('guagua','Baby or child in Ecuador and Bolivia; bus in some Caribbean usages. Keep the source variety that you know and check the sentence.','https://www.asale.org/damer/guagua');
    if(/\bch[eé]vere\b/i.test(value))add('chévere','Can describe something great or pleasant, or a friendly person. These usages are shared by Venezuela, Peru, Colombia, Ecuador and other regions; the word alone does not identify a city or country.','https://www.asale.org/damer/chévere');
    if(/\bchiquit[oa]s?\b/i.test(value)&&smallObject.test(value)&&!nameContext.test(value))add('chiquito / chiquita','In a size description, small or little is the likely meaning. The original source remains editable; check adjective agreement and any affectionate nuance.','https://dle.rae.es/chiquito');
    if(/\bcarritos?\b/i.test(value))add('carrito','Can mean a small cart or a car-related object. Toy cars may fit a toy context; the word alone does not settle the object.','https://dle.rae.es/carro');
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
    if(pleasure(value)) {
      const stage=text;
      text=stage.replace(/\((?:how (?:rich|delicious|tasty)|so (?:rich|delicious|tasty))\)/gi,(whole,offset)=>{
        if(unquoted(stage).slice(offset,offset+whole.length).trim()==='')return whole;
        changes.push('Pleasure in context: that feels so good');return '(that feels so good)';
      });
    }
    const causal=causalAddress(value);
    if(causal) {
      const verb={baila:'dance',ven:'come',espera:'wait',escucha:'listen'}[causal[1].toLowerCase()];
      const pattern=new RegExp(`\\b(${verb}\\s+)that(?=\\s+(?:I love you\\b|it (?:is|'s) (?:already )?(?:late|time)\\b))`,'gi');
      const stage=text;
      text=stage.replace(pattern,(whole,start,offset)=>{
        if(unquoted(stage).slice(offset,offset+whole.length).trim()==='')return whole;
        changes.push('Reason for invitation: that → because');return start+'because';
      });
    }
    return {text,changes};
  }
  return {analyse,refine,workSense,prepare,residue};
})();
if(typeof module!=='undefined' && module.exports)module.exports=HablaSpanishContext;
