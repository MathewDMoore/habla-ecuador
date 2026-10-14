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
  function prepare(text,{purpose='everyday',source='es-EC'}={}) {
    if(purpose==='academic')return text;
    const sizes=text.replace(/\bchiquit[oa]s?\b/gi,(word,index,whole)=>{
      const start=whole.slice(0,index).split(/[.!?\n]/).at(-1),end=whole.slice(index+word.length).split(/[.!?\n]/)[0];
      const clause=start+word+end;
      if(!sizeDescription(clause)||nameContext.test(clause)||unquoted(whole).slice(index,index+word.length).trim()==='')return word;
      const replacement=word.toLowerCase().replace('chiquit','pequeñ');
      return word===word.toUpperCase()?replacement.toUpperCase():/^[A-Z]/.test(word)?replacement[0].toUpperCase()+replacement.slice(1):replacement;
    });
    if(source!=='es-MX')return sizes;
    return sizes.replace(/\bhuerc[oa]s?\b/gi,(word,index,whole)=>{
      const clause=whole.slice(0,index).split(/[.!?\n]/).at(-1)+word+whole.slice(index+word.length).split(/[.!?\n]/)[0];
      const child=/\b(?:ese|esa|esos|esas|el|la|los|las|mi|mis|un|una|unos|unas)\s+huerc[oa]s?\b/i.test(clause);
      if(!child||nameContext.test(clause)||(/^[A-Z]/.test(word)&&word!==word.toUpperCase())||/\b(?:infierno|demonio|diablo|orco)\b/i.test(clause)||!unquoted(whole).slice(index,index+word.length).trim())return word;
      const replacement=word.toLowerCase().replace('huerc','niñ');
      return word===word.toUpperCase()?replacement.toUpperCase():/^[A-Z]/.test(word)?replacement[0].toUpperCase()+replacement.slice(1):replacement;
    });
  }
  function residue(source,draft,{purpose='everyday',target='en-GB',region='es-EC'}={}) {
    if(purpose==='academic'||!target.startsWith('en')||nameContext.test(source))return [];
    const sourceWords=new Set(plain(unquoted(source)).match(/[a-zñ]+/g)||[]);
    const watch=/\b(?:chiquit[oa]s?|pequeñ[oa]s?|cansad[oa]s?|arrepentimientos|demasiado|despacio|madera|siempre|trasero)\b/gi;
    const words=[...new Set((unquoted(draft).match(watch)||[]).filter(word=>sourceWords.has(plain(word))))];
    const findings=words.length?[{term:'Possible untranslated words',detail:`Still in Spanish: ${words.join(', ')}. Review the draft; names and borrowed words can be intentional. This limited check does not certify translation accuracy.`}]:[];
    if(region==='es-MX'&&/\bno\s+mames\b/i.test(source)&&!/\b(?:bebe|leche|lactancia|pecho|pene|verga)\b/.test(plain(source))&&/\b(?:don['’]t|do not)\s+(?:suck|breastfeed)\b/i.test(unquoted(draft))) {
      const choices=(source.match(/\bno\s+mames\b/gi)||[]).length===1&&(unquoted(draft).match(/\b(?:don['’]t|do not)\s+(?:suck|breastfeed)\b/gi)||[]).length===1?['surprise','rebuke']:[];
      findings.push({term:'Review literal slang wording',kind:'slang-literal',choices,detail:'The draft may have read no mames literally. For surprise, no fucking way may fit; for a rebuke, stop bullshitting may fit. Choose the intended tone; neither option is automatically selected. The rest of the draft still needs review.',url:'https://dem.colmex.mx/Ver/mamar'});
    }
    return findings;
  }
  function chooseSlangMeaning(draft,choice) {
    const replacement={surprise:'No fucking way',rebuke:'Stop bullshitting'}[choice];
    const pattern=/\b(?:don['’]t|do not)\s+(?:suck|breastfeed)\b/gi;
    if(typeof replacement!=='string'||(unquoted(draft).match(pattern)||[]).length!==1)return draft;
    return draft.replace(pattern,(whole,index)=>unquoted(draft).slice(index,index+whole.length).trim()?replacement:whole);
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
  function wordMeanings(text,{source='es-EC',target='en-US',purpose='everyday'}={}) {
    if(purpose==='academic'||!source.startsWith('es-')||!['en-US','en-GB'].includes(target))return [];
    const word=plain(unquoted(text)).trim().replace(/^[¡¿]|[.!?]+$/g,'').trim();
    const option=(id,text,label)=>({id,text,label});
    if(word==='chinga'||word==='chingar') {
      const options=[option('chingar-bother','bother / annoy','Bother / annoy'),option('chingar-sex','fuck (sexual sense)','Sexual meaning')];
      if(source==='es-MX'&&word==='chinga')options.push(option('chinga-burden','a punishing chore / a fucking grind','Punishing task'),option('chinga-beating','a beating','Beating'));
      return options;
    }
    if(source==='es-MX'&&word==='chingarse')return [option('chingar-failure','break / fail / get fucked up','Break / fail'),option('chingar-work','work extremely hard / work your ass off','Work extremely hard')];
    if(source==='es-MX'&&word==='en chinga')return [option('chinga-speed','really fast / in a hurry','Speed / hurry')];
    return [];
  }
  function analyse(text,{source='es-EC',purpose='everyday',image=false,target='en-GB'}={}) {
    if(!source.startsWith('es') || purpose==='academic')return [];
    const value=unquoted(text),findings=[];
    const add=(term,detail,url)=>findings.push({term,detail,url});
    if(/\bching(?:ar(?:se)?|a|as|an|amos|ando|ue|ues|uen|o)\b/i.test(plain(value))) {
      const meanings=wordMeanings(text,{source,target,purpose});
      const detail='Chinga can be a form of chingar, not just a noun. RAE records bothering/annoying and a sexual sense; in Mexico, chinga can also be a punishing obligation or beating, and en chinga means quickly. Mexican sexual senses can involve assault; do not infer consent. The full sentence and source variety decide the reading. Neutral bother/annoy can understate vulgar force; fuck with someone may fit a vulgar rebuke.';
      findings.push({term:'chingar / chinga',kind:meanings.length?'word-senses':'ambiguous-slang',detail,url:'https://dle.rae.es/chingar',references:[{name:'Mexican verb senses · DEM',url:'https://dem.colmex.mx/ver/chingar'},{name:'Mexican noun / speed · ASALE',url:asale('chinga')}],choices:meanings.length>1?meanings.map(item=>item.id):[],choiceLabels:Object.fromEntries(meanings.map(item=>[item.id,item.label]))});
    }
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
  // The browseable dictionary shares translator notes; extra headwords do not
  // change translation rules or turn country evidence into a city claim.
  const dictionaryExtras = [
    {term:'chulla',category:'slang',regions:['es-EC'],register:'Popular / cultural; context-sensitive',scope:'Ecuador: ASALE records both the literal “single or unmatched” senses and senses relative to Quito. The Quito social archetype is documented by the Academia Ecuatoriana de la Lengua and the Municipality of Quito.',us:'single / unmatched; Quito social archetype (context required)',uk:'single / unmatched; Quito social archetype (context required)',note:'An object can be the only one or the unmatched half of a pair. In Quito, chulla can identify a Quito-linked person or cultural archetype associated historically with apparent elegance, wit and social aspiration. It can also refer to Deportivo Quito. Do not force the social reading from the bare word.',uncertainty:'City-attested; not exclusive to Quito and not assumed universally current.',url:asale('chulla'),references:[{name:'Academia Ecuatoriana de la Lengua · el chulla quiteño',url:'https://www.academiaecuatorianadelalengua.org/el-chulla-y-la-sal-quitena-por-don-marco-antonio-rodriguez/'},{name:'Municipality of Quito · city culture',url:'https://www.quito.gob.ec/wp-content/uploads/2024/08/Edicio%CC%81n_noviembre.pdf'}]},
    {term:'chingar / chinga (verb)',regions:['es-MX'],register:'Vulgar / context-sensitive',scope:'Mexican verb usage; chinga can be a conjugated form or command.',us:'bother / fuck with someone; fuck (sexual sense)',uk:'bother / fuck with someone; fuck (sexual sense)',note:'A bare word does not select the meaning. RAE records annoying and sexual senses; the Mexican DEM includes serious harm and sexual assault. Context must establish the intended action and consent.',url:'https://dem.colmex.mx/ver/chingar',references:[{name:'RAE · chingar',url:'https://dle.rae.es/chingar'}]},
    {term:'chinga (noun)',regions:['es-MX'],register:'Vulgar',scope:'Mexico: an onerous situation or obligation, excessive mistreatment, or a beating.',us:'a punishing chore / a fucking grind / a beating (context required)',uk:'a punishing chore / a fucking grind / a beating (context required)',note:'A noun reading such as una chinga is different from the verb chinga. These are editorial options, not interchangeable translations.',url:asale('chinga')},
    {term:'en chinga',regions:['es-MX'],register:'Informal expression with a vulgar word',scope:'Mexico: quickly or in a hurry.',us:'really fast / in a hurry',uk:'really fast / in a hurry',note:'This fixed expression concerns speed, not a sexual act. Whether English needs a swear-word intensifier depends on the sentence and tone.',url:asale('chinga')},
    {term:'acolitar',regions:['es-EC','es-CO'],register:'Informal',scope:'Ecuador and Colombia: support or help.',us:'to help / back someone up',uk:'to help / back someone up',note:'Support with an activity or idea. Example: ¿Me acolitas con esto? — Can you give me a hand with this?',url:asale('acolitar')},
    {term:'camello',regions:['es-EC','es-MX','es-CO'],register:'Informal',scope:'Ecuador, Mexico and Colombia: work or job; Ecuador also records workplace.',us:'work / job (Ecuador also: workplace)',uk:'work / job (Ecuador also: workplace)',note:'The animal meaning is camel. Bolivia records a separate shoemaking tool sense. Employment context must support the slang reading. Example: Ya me voy al camello. — I am heading to work.',url:asale('camello')},
    {term:'chiro / chira',regions:['es-EC','es-MX'],register:'Informal',scope:'Ecuador: without money. Mexico: pretty, cute or very good.',us:'broke (Ecuador) / cute or great (Mexico)',uk:'broke (Ecuador) / cute or great (Mexico)',note:'Do not carry the Ecuadorian meaning into a Mexican sentence automatically. Ecuador example: Estoy chiro. — I am broke.',url:asale('chiro')},
    {term:'aniñado / aniñada',regions:['es-EC'],register:'Informal; can sound judgmental',scope:'Ecuador: upper-class associations or an elegant appearance.',us:'posh / upper-class / upscale',uk:'posh / upper-class / upmarket',note:'About a person this may sound teasing or critical. Example: Ese lugar es medio aniñado. — That place is a bit posh.',url:asale('aniñado')},
    {term:'ñaño / ñaña',regions:['es-EC','es-BO','es-PE'],register:'Familiar',scope:'Ecuador: brother or sister; Bolivia: brother, and close friend in central, southern and western areas; Peru: friend.',us:'sibling (Ecuador) / brother (Bolivia) / friend (Peru and parts of Bolivia)',uk:'sibling (Ecuador) / brother (Bolivia) / friend (Peru and parts of Bolivia)',note:'Family and friendship readings need context. A shared term cannot establish where someone is from.',url:asale('ñaño')},
    {term:'guagua',regions:['es-EC','es-BO','es-PE'],register:'Familiar',scope:'Ecuador and Bolivia: young child; Ecuador and rural Peru: nursing baby.',us:'young child (Ecuador/Bolivia) / baby (Ecuador/rural Peru)',uk:'young child (Ecuador/Bolivia) / baby (Ecuador/rural Peru)',note:'Some Caribbean varieties use guagua for a bus. The surrounding sentence and known source variety matter.',url:asale('guagua')}
  ];
  const dictionaryRegions = {
    'es-EC':'Ecuador', 'es-BO':'Bolivia', 'es-MX':'Mexico',
    'es-VE':'Venezuela', 'es-PE':'Peru', 'es-CO':'Colombia'
  };
  // Recording-inspired headwords, independently checked 2026-10-12.
  // Shared literal/clinical entries indicate availability, not local slang evidence.
  const sharedRegions = Object.keys(dictionaryRegions);
  const nci = term => `https://www.cancer.gov/espanol/publicaciones/diccionarios/diccionario-cancer/def/${term}`;
  const recordingEntries = [
    {term:'me vale verga',category:'slang',regions:['es-EC','es-BO','es-MX'],register:'Strong vulgarity',scope:'ASALE records valerle verga for complete indifference in Ecuador, Bolivia and Mexico, among other countries.',us:"I don't give a fuck",uk:"I don't give a fuck",note:'Me identifies the person who does not care. This expression is different from saying something is worthless. Strong source register is retained, including when quoted in research.',url:'https://www.asale.org/damer/valer'},
    {term:'verga (literal)',speech:'verga',category:'literal',regions:sharedRegions,register:'Neutral literal senses',scope:'General Spanish dictionary senses; not a regional slang claim.',us:'yard (sailing) / long thin rod / crossbow bow',uk:'yard (sailing) / long thin rod / crossbow bow',note:'The sailing word names the spar holding a sail. These object senses do not imply a sexual meaning.',url:'https://dle.rae.es/verga'},
    {term:'verga (vulgar anatomy)',speech:'verga',category:'slang',regions:sharedRegions,register:'Vulgar anatomical usage',scope:'General Spanish anatomical meaning; Mexican vulgar register checked in DEM. Country-specific naturalness review pending.',us:'dick / cock; neutral clinical word: penis',uk:'dick / cock; neutral clinical word: penis',note:'This anatomical reading is separate from the sailing object and fixed expressions. In a clinical translation, penis preserves the organ but loses the vulgar register.',url:'https://dem.colmex.mx/Ver/verga',references:[{name:'RAE · literal and anatomical senses',url:'https://dle.rae.es/verga'}]},
    {term:'de la verga',category:'slang',regions:['es-MX'],register:'Vulgar',scope:'Mexico · DEM phrase attestation.',us:'fucking awful / in terrible shape',uk:'fucking awful / in a terrible state',note:'An adverse evaluation or condition, not anatomy. Select wording using the complete sentence.',url:'https://dem.colmex.mx/Ver/verga'},
    {term:'valer / importar verga',category:'slang',regions:['es-MX'],register:'Vulgar',scope:'Mexico · DEM phrase attestation.',us:'not matter / not be worth shit',uk:'not matter / not be worth shit',note:'The subject and situation decide between indifference and lack of value; these options are not interchangeable.',url:'https://dem.colmex.mx/Ver/verga'},
    {term:'ni verga / ni vergas',category:'slang',regions:['es-MX','es-BO'],register:'Vulgar',scope:'Mexico: nothing or emphatic refusal (DEM); Bolivia: nothing (ASALE).',us:'nothing (strong emphasis); Mexico also: no fucking way',uk:'nothing (strong emphasis); Mexico also: no fucking way',note:'The plural form and refusal reading here are Mexican. Do not transfer that refusal reading to Bolivia automatically.',url:'https://www.asale.org/damer/verga',references:[{name:'El Colegio de México · DEM',url:'https://dem.colmex.mx/Ver/verga'}]},
    {term:'¡verga!',category:'slang',regions:['es-MX','es-VE','es-BO'],register:'Vulgar exclamation',scope:'Mexico/Venezuela: surprise or rejection (RAE); Bolivia: surprise (ASALE).',us:'fuck! / holy shit! (reaction)',uk:'fuck! / bloody hell! (reaction)',note:'Tone decides the English reaction and its force. Bolivian surprise evidence does not establish every Mexican or Venezuelan use there.',url:'https://www.asale.org/damer/%C2%A1verga%21',references:[{name:'RAE · DLE',url:'https://dle.rae.es/verga'}]},
    {term:'cojón / cojones',category:'slang',regions:sharedRegions,register:'Vulgar / colloquial',scope:'General Spanish dictionary entry; country-specific naturalness review pending.',us:'ball / balls (anatomy); fuck! (exclamation)',uk:'bollock / bollocks (anatomy); bloody hell! (exclamation)',note:'Clinical wording is testicle/testicles. The plural also works as an emotional exclamation; the body-part reading is not automatic.',url:'https://dle.rae.es/coj%C3%B3n'},
    ...[
      {term:'testículo',us:'testicle',note:'Clinical anatomical term. Cojón is a vulgar alternative, not the same register.',url:nci('testiculo')},
      {term:'escroto',us:'scrotum',note:'The sac containing the testicles; it is not a synonym for a testicle.',url:nci('escroto')},
      {term:'uretra',us:'urethra',note:'Carries urine out from the bladder. Do not confuse it with uréter (ureter).',url:nci('uretra')},
      {term:'vagina',us:'vagina',note:'The internal canal. Vulva names external structures; the two terms are not interchangeable.',url:nci('vagina')},
      {term:'vulva',us:'vulva',note:'External genital structures, including the labia and clitoris. Distinguish from the internal vagina.',url:nci('vulva')},
      {term:'labios mayores',us:'labia majora / outer labia',note:'Anatomical outer folds of the vulva. Here labios does not mean the lips of the mouth.',url:'https://www.cancer.org/es/cancer/tipos/cancer-de-vulva/si-usted-tiene-cancer-de-vulva.html'},
      {term:'labios menores',us:'labia minora / inner labia',note:'Anatomical inner folds of the vulva. Inner/outer identifies the structures, not their size in every person.',url:'https://www.cancer.org/es/cancer/tipos/cancer-de-vulva/si-usted-tiene-cancer-de-vulva.html'},
      {term:'glande del pene',us:'glans penis / head of the penis',note:'Names the head of the penis, not the entire organ.',url:'https://www.cun.es/diccionario-medico/terminos/glande'},
      {term:'histerectomía',us:'hysterectomy',note:'Surgery removing the uterus, wholly or partly. Do not infer removal of the ovaries from this word alone.',url:'https://medlineplus.gov/spanish/hysterectomy.html'}
    ].map(entry=>({...entry,uk:entry.us,category:'clinical',regions:sharedRegions,register:'Clinical / neutral',scope:'Shared clinical Spanish terminology; not regional slang.'}))
  ];
  const englishVulgarityPairs = [
    {term:'¡Mierda!',us:'Fuck! / Shit! (anger or frustration)',uk:'Fuck! / Shit! (anger or frustration)',aliases:['fuck!','shit!'],requireExclamation:true,url:'https://dle.rae.es/mierda',note:'An angry exclamation, not the sexual verb or a literal reference to excrement. The emotional force varies with the speaker.'},
    {term:'¡Vete a la mierda!',us:'Fuck off!',uk:'Fuck off!',aliases:['fuck off'],url:'https://dle.rae.es/mierda',note:'A forceful, insulting dismissal addressed to one person with informal tú. It is not a friendly instruction to leave.'},
    {term:'No me jodas.',us:"Don't fuck with me.",uk:"Don't fuck with me.",aliases:["don't fuck with me",'do not fuck with me'],url:'https://dle.rae.es/joder',note:'A vulgar rebuke meaning stop bothering or messing with me. This is not a literal sexual request.'},
    {term:'¿Qué carajo está pasando?',us:'What the fuck is going on?',uk:'What the fuck is going on?',aliases:['what the fuck is going on'],url:'https://dle.rae.es/carajo',note:'An angry or shocked question about what is happening. The English intensifier is retained as vulgar Spanish wording.'},
    {term:'¡Y una mierda!',us:'Not a fucking chance! (refusal)',uk:'Not a fucking chance! (refusal)',aliases:['not a fucking chance'],url:'https://dle.rae.es/mierda',note:'An emphatic vulgar refusal. Surprise and refusal are different uses; this pair is for rejecting a proposal.'},
    {term:'¡Jódete!',us:'Go fuck yourself!',uk:'Go fuck yourself!',aliases:['go fuck yourself'],url:'https://dle.rae.es/joder',note:'A hostile vulgar rebuke addressed to one person with informal tú. It does not describe a literal sexual act.'}
  ].map(entry=>({...entry,regions:Object.keys(dictionaryRegions),register:'Strong vulgarity',scope:'Shared Spanish editorial counterpart; country-specific naturalness review pending.',shared:true}));
  const englishPhraseKey = text => plain(text.trim()).replace(/[’]/g,"'").replace(/[.!?]+$/g,'').trim().replace(/\s+/g,' ');
  function translateEnglishVulgarity(text,{source='en-US',target='es-EC',purpose='everyday'}={}) {
    if(purpose==='academic'||!['en-US','en-GB'].includes(source)||!Object.hasOwn(dictionaryRegions,target))return null;
    const key=englishPhraseKey(text);
    const entry=englishVulgarityPairs.find(entry=>(!entry.requireExclamation||/!\s*$/.test(text))&&entry.aliases.some(alias=>englishPhraseKey(alias)===key));
    return entry?{text:entry.term,register:entry.register,note:entry.note,scope:entry.scope,url:entry.url}:null;
  }
  function translateIndifferenceExpression(text,{source='es-EC',target='en-US'}={}) {
    if(!['es-EC','es-BO','es-MX'].includes(source)||!['en-US','en-GB'].includes(target))return null;
    // Match a complete utterance, retaining outer quotes and punctuation. A
    // pasted opening quote alone is valid input, as in the reported recording.
    // Do not replace substrings, negations, or quoted phrases inside prose.
    const parts=text.trim().match(/^([“"'‘]?)([^“”"'‘’\n]+?)([”"'’]?)([.!?]*)$/u);
    if(!parts)return null;
    const [,open,body,close,after]=parts;
    if(open&&close&&({'“':'”','‘':'’','"':'"',"'":"'"}[open]!==close))return null;
    const punctuation=body.trim().match(/[.!?]+$/)?.[0]||'';
    const key=plain(body.trim().replace(/^[¡¿]/,'').replace(/[.!?]+$/,'')).trim().replace(/\s+/g,' ');
    const match=key.match(/^(?:(a mi) )?(me|te|nos) vale verga$/);
    if(!match||(match[1]&&match[2]!=='me'))return null;
    const subject={me:'I',te:'You',nos:'We'}[match[2]];
    return {text:`${open}${subject} don't give a fuck${punctuation}${close}${after}`,register:'Strong vulgarity',scope:'Indifference expression attested in Ecuador, Bolivia and Mexico by ASALE.',note:'The complete expression means not caring at all. Its vulgar register is retained in both everyday and research translation; it is not translated as anatomical worth.',url:'https://www.asale.org/damer/valer'};
  }
  const cityEvidence = {
    quito:['chulla'],
    monterrey:['huerco / huerca'],
    'mexico-city':['güey / wey','no mames'],
    bogota:['parce / parcero','gonorrea']
  };
  function dictionary({query='',region='es-EC',tone='all',target='all',category='all'}={}) {
    const search=plain(query.trim());
    const english=region==='en-US'?'us':region==='en-GB'?'uk':null;
    return [...slangEntries,...dictionaryExtras,...englishVulgarityPairs,...recordingEntries].filter(entry => {
      const caution=/vulgar|offensive|insult/i.test(entry.register);
      const regionMatches=english ? target==='all'||entry.regions.includes(target) : region==='all'||entry.regions.includes(region)||cityEvidence[region]?.includes(entry.term);
      const searchable=plain([entry.term,...(english?[entry[english]]:[entry.us,entry.uk]),entry.scope,entry.note,entry.register,...entry.regions.map(code=>dictionaryRegions[code])].join(' '));
      return regionMatches && (category==='all'||category===(entry.category||'slang')) && (tone==='all'||(tone==='caution'?caution:tone==='mild'&&!caution)) && (!search||searchable.includes(search));
    }).sort((a,b) => english ? a[english].localeCompare(b[english],'en') : (region==='all' ? Number(b.regions.includes('es-EC'))-Number(a.regions.includes('es-EC')) : 0) || a.term.localeCompare(b.term,'es')).map(entry => {
      const {pattern,aliases,requireExclamation,...publicEntry}=entry;
      return JSON.parse(JSON.stringify(publicEntry));
    });
  }
  return {analyse,refine,workSense,prepare,residue,slang,chooseSlangMeaning,dictionary,translateEnglishVulgarity,translateIndifferenceExpression,wordMeanings};
})();
if(typeof module!=='undefined' && module.exports)module.exports=HablaSpanishContext;
