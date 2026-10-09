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
  // Brief editorial glosses, checked 2026-10-09. References are not training data.
  const asale = term => `https://www.asale.org/damer/${encodeURIComponent(term)}`;
  const mexicoCity = {name:'Mexico City study · 2006',url:'https://tesiunamdocumentos.dgb.unam.mx/pd2006/0604892/0604892.pdf'};
  const bogota = {name:'Bogotá study · 2018',url:'https://revistas.udistrital.edu.co/index.php/enunc/article/view/12457/0'};
  const slangEntries = [
    {term:'huerco / huerca',pattern:'huerc[oa]s?',regions:['es-MX'],register:'Informal',scope:'Northern Mexico; Monterrey usage documented by SEP.',us:'kid / child',uk:'kid / child',note:'A child or young person, not a curse. It is not exclusive to Monterrey.',url:asale('huerco'),references:[{name:'Monterrey evidence · SEP',url:'https://chamakes.sep.gob.mx/Seccion_rosa/ComoLosLlaman.html'}]},
    {term:'güey / wey',pattern:'(?:guey|wey)',regions:['es-MX'],register:'Informal; can be offensive',scope:'Mexico; studied in Mexico City (2006).',us:'dude (friendly) / idiot (insult)',uk:'mate (friendly) / idiot (insult)',note:'Relationship and tone decide between friendly address and an insult. The animal sense also exists; never assume every use means dude.',url:'https://dem.colmex.mx/Ver/guey',references:[mexicoCity]},
    {term:'no mames',pattern:'no\\s+mames',regions:['es-MX'],register:'Vulgar',scope:'Mexico; surprise/incredulity documented in Mexico City (2006).',us:'no fucking way (surprise) / stop bullshitting (rebuke)',uk:'no fucking way (surprise) / stop bullshitting (rebuke)',note:'A rebuke or shocked reaction, not automatically a literal instruction. These English options depend on tone; no manches is a milder alternative.',url:'https://dem.colmex.mx/Ver/mamar',references:[mexicoCity]},
    {term:'chamo / chama',pattern:'cham[oa]s?',regions:['es-VE'],register:'Informal',scope:'Venezuela · country attestation; Caracas-specific review pending.',us:'kid / young person / friend',uk:'kid / young person / friend',note:'Age and relationship decide the reading. This term alone does not identify Caracas.',url:asale('chamo')},
    {term:'pana',pattern:'panas?',regions:['es-EC','es-MX','es-VE','es-BO'],register:'Informal',scope:'Shared usage including Ecuador, Mexico, Venezuela and western Bolivia.',us:'buddy / close friend',uk:'mate / close friend',note:'Friend sense; corduroy is a separate ordinary meaning. Western Bolivia attestation does not establish usage throughout Bolivia.',url:asale('pana')},
    {term:'coño de su madre',pattern:'coño\\s+de\\s+su\\s+madre',regions:['es-VE'],register:'Vulgar; potentially insulting',scope:'Venezuela · country attestation; Caracas-specific review pending.',us:'bastard (insult) / fuck! (anger or pain)',uk:'bastard (insult) / fuck! (anger or pain)',note:'An insult and an emotional exclamation are different uses. Do not assume a friendly tone or translate the anatomical words literally.',url:asale('coño')},
    {term:'coño',pattern:'coño',regions:['es-VE','es-EC'],register:'Vulgar in exclamations and anatomical uses',scope:'Venezuela: vulgar word for a person; Ecuador: a separate stingy sense.',us:'fuck! (exclamation) / guy (Venezuela; vulgar source) / stingy (Ecuador)',uk:'fuck! (exclamation) / bloke (Venezuela; vulgar source) / stingy (Ecuador)',note:'Also an anatomical vulgarity. The source meaning and strength need context; guy/bloke alone loses the source vulgarity.',url:'https://dle.rae.es/co%C3%B1o'},
    {term:'pata',pattern:'patas?',regions:['es-PE','es-EC','es-BO'],register:'Informal',scope:'Peru: close friend; Ecuador: a group of friends; southwestern Bolivia: close friend.',us:'buddy (Peru/SW Bolivia) / group of friends (Ecuador)',uk:'mate (Peru/SW Bolivia) / group of friends (Ecuador)',note:'Leg, paw and idioms remain possible. Peruvian country attestation is not Lima-specific validation.',url:asale('pata'),references:[{name:'Peruvian Academy',url:'https://apl.org.pe/palabra-del-dia/pata/'}]},
    {term:'ni huevón',pattern:'ni\\s+huevon',regions:['es-PE'],register:'Vulgar',scope:'Peru; also recorded in Chile.',us:'no fucking way (emphatic refusal)',uk:'no fucking way (emphatic refusal)',note:'Rejects a proposal; do not read it as a literal description of a person. Lima-specific review is pending.',url:asale('huevón')},
    {term:'huevón / huevona',pattern:'(?:huevon(?:a|es|as)?|guevon(?:a|es|as)?)',regions:['es-EC','es-BO','es-MX','es-VE','es-PE','es-CO'],register:'Vulgar; tone-sensitive',scope:'Mexico: lazy person; Ecuador/Bolivia/Peru/Venezuela/Colombia: fool senses are recorded.',us:'lazy person (Mexico) / idiot (insult elsewhere)',uk:'lazy person (Mexico) / idiot (insult elsewhere)',note:'Person/address senses also occur in some countries, sometimes affectionately. An English insult is not automatic; idiot/lazy person may understate the vulgarity.',url:asale('huevón')},
    {term:'parce / parcero',pattern:'(?:parce|parcer[oa]s?)',regions:['es-CO','es-EC'],register:'Informal',scope:'Colombia and Ecuador; parcero appears in Bogotá research (2018).',us:'buddy / close friend',uk:'mate / close friend',note:'Familiar address, not necessarily suitable for a stranger. Shared usage does not identify Bogotá.',url:asale('parcero'),references:[bogota]},
    {term:'gonorrea',pattern:'gonorrea',regions:['es-CO'],register:'Offensive insult; context-sensitive address',scope:'Colombia; youth address documented in Bogotá research (2018).',us:'a vile person (insult)',uk:'a vile person (insult)',note:'Gonorrhoea/gonorrhea remains the literal medical meaning. Youth address is not proof of friendliness or acceptability; tone and audience matter. This gloss may understate the insult.',url:asale('gonorrea'),references:[bogota]},
    {term:'chuta',pattern:'chuta',regions:['es-EC'],register:'Mild informal exclamation',scope:'Ecuador; surprise/annoyance and sympathy/disappointment are recorded.',us:'oh no / darn',uk:'oh no / what a shame',note:'Tone determines the reaction. It is milder than strong profanity.',url:asale('¡chuta!')},
    {term:'pucha',pattern:'pucha',regions:['es-EC','es-BO','es-VE','es-PE','es-CO'],register:'Mild euphemistic exclamation',scope:'Shared country attestation; admiration also recorded in Peru and Bolivia.',us:'darn / wow (admiration)',uk:'oh dear / wow (admiration)',note:'Frustration and admiration require different English reactions. It is not automatically strong profanity.',url:asale('¡pucha!')},
    {term:'¡puta!',pattern:'puta',regions:['es-MX','es-PE','es-BO'],register:'Vulgar',scope:'Surprise/displeasure exclamation recorded in Mexico, Peru and Bolivia.',us:'fuck! (exclamation)',uk:'fuck! (exclamation)',note:'The exclamation is different from a noun directed at a person, which can be a gendered insult. Do not automatically choose the exclamation reading.',url:asale('¡puta!')}
  ];
  function slang(text,{source='es-EC',purpose='everyday',target='en-GB'}={}) {
    if(!source.startsWith('es')||purpose==='academic')return [];
    // Keep ñ distinct from n: an ordinary cono must not trigger a profanity note.
    const value=plain(text.replace(/ñ/gi,'\uE000')).replace(/\uE000/g,'ñ'),findings=[],covered=[];
    for(const entry of slangEntries) {
      if(!entry.regions.includes(source))continue;
      const pattern=new RegExp(`(?<![\\p{L}\\p{N}_])(?:${entry.pattern})(?![\\p{L}\\p{N}_])`,'gu');
      const matches=[...value.matchAll(pattern)];
      if(!matches.some(match=>!covered.some(([start,end])=>match.index>=start&&match.index+match[0].length<=end)))continue;
      covered.push(...matches.map(match=>[match.index,match.index+match[0].length]));
      if(entry.term==='gonorrea'&&/\b(?:diagnostico|diagnosticada|diagnosticado|prueba|infeccion|bacteria|antibiotico|tratamiento|medico|medica)\b/.test(value)) {
        findings.push({term:entry.term,detail:`Medical context: ${target==='en-US'?'gonorrhea':'gonorrhoea'} is the literal disease term. The Colombian insult sense is not assumed. Check the clinical sentence; no wording is replaced.`,url:entry.url});
        continue;
      }
      const english=target==='en-US'?`U.S. options: ${entry.us}.`:target==='en-GB'?`U.K. options: ${entry.uk}.`:`U.S.: ${entry.us}. U.K.: ${entry.uk}.`;
      findings.push({term:entry.term,detail:`Source-attested · ${entry.register}. ${entry.scope} ${english} ${entry.note}`,url:entry.url,references:entry.references||[]});
    }
    return findings;
  }
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
  function analyse(text,{source='es-EC',purpose='everyday',image=false,target='en-GB'}={}) {
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
    return [...findings,...slang(text,{source,purpose,target})];
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
  return {analyse,refine,workSense,prepare,residue,slang};
})();
if(typeof module!=='undefined' && module.exports)module.exports=HablaSpanishContext;
