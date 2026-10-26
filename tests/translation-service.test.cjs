const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
function element(selector){if(!elements.has(selector))elements.set(selector,{value:'',textContent:'',hidden:false,dataset:{},children:[],replaceChildren(){this.children=[];},append(child){this.children.push(child);},classList:{toggle(){},add(){},remove(){}},setAttribute(){},removeAttribute(){}});return elements.get(selector);}
let handler,requests=[];
const context=vm.createContext({console,setTimeout,clearTimeout,AbortController,
 document:{querySelector:element,addEventListener(){},createElement:()=>({textContent:'',get innerHTML(){return this.textContent.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');},set innerHTML(v){this.value=v;}})},
 localStorage:{getItem:()=>null,setItem(){}},navigator:{onLine:true},
 fetch:async(url,options)=>{const text=new URL(url).searchParams.get('q');requests.push(text);assert.ok(Buffer.byteLength(text)<=500);return handler(text,options);}
});
for(const file of ['research-reference.js','spanish-context.js','language-community-terms.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const run=code=>vm.runInContext(code,context);
const ok=text=>({ok:true,status:200,json:async()=>({responseStatus:200,responseData:{translatedText:text}})});
const fresh=()=>{requests=[];run('translationChunkCache.clear()');};
async function main(){
 fresh();
 // A language ability term cannot be reduced to the language name "Español".
 handler=async()=>ok('Español');
 for(const source of ['en-US','en-GB'])for(const target of ['es-EC','es-BO','es-MX']){
  assert.equal(await run(`requestGeneralTranslation("Spanish-speaking","en-ec",{source:"${source}",target:"${target}"})`),'hispanohablante');
  assert.equal(await run(`requestGeneralTranslation("Spanish-speaking countries","en-ec",{source:"${source}",target:"${target}"})`),'países hispanohablantes');
 }
 for(const source of ['es-EC','es-BO','es-MX'])for(const target of ['en-US','en-GB']){
  assert.equal(await run(`requestGeneralTranslation("hispanoparlante","ec-en",{source:"${source}",target:"${target}"})`),'Spanish-speaking');
  assert.equal(await run(`requestGeneralTranslation("hispanohablante","ec-en",{source:"${source}",target:"${target}"})`),'Spanish-speaking');
  assert.equal(await run(`requestGeneralTranslation("países de habla hispana","ec-en",{source:"${source}",target:"${target}"})`),'Spanish-speaking countries');
 }
 assert.equal(requests.length,0,'reliable glossary words never request an external service');
 handler=async()=>ok('La comunidad española');
 assert.equal(await run('requestGeneralTranslation("The Spanish-speaking community","en-ec",{source:"en-US",target:"es-EC"})'),'La comunidad hispanohablante');
 assert.equal(requests.length,1,'non-glossary prose goes through normal translation with a bounded correction');
 fresh();
 // Recording regression: the final captured English clause ends in "on".
 run('sourceLanguage="en-US";targetLanguage="es-EC";direction="en-ec";translationPurpose="everyday";musicTranscriptReview=true');
 element('#translator-input').value='There are no commissions on';
 handler=async()=>ok('No hay comisiones sobre');
 await run('translateCapturedMusic()');
 assert.match(element('#music-listening-status').textContent,/Draft ready.*mid-phrase/);
 assert.doesNotMatch(element('#music-listening-status').textContent,/Translating/);
 assert.match(element('#translation-result .result-label').textContent,/incomplete captured text/);
 assert.match(element('#usage-note').innerHTML,/missing words/);
 assert.equal(element('#translator-input').value,'There are no commissions on');
 fresh();
 element('#translator-input').value='There are no commissions on your sales.';
 run('musicTranscriptReview=true');
 handler=async()=>{throw new TypeError('Failed to fetch');};
 await run('translateCapturedMusic()');
 assert.match(element('#music-listening-status').textContent,/could not finish/);
 assert.equal(element('#translate-music').disabled,false,'a failed full translation can be retried without restarting capture');
 assert.equal(run('musicTranscriptReview'),true);
 assert.equal(element('#translator-input').value,'There are no commissions on your sales.');
 handler=async()=>ok('No hay comisiones sobre tus ventas.');
 await run('retryTranslation()');
 assert.equal(element('#natural-result').textContent,'No hay comisiones sobre tus ventas.');
 assert.match(element('#music-listening-status').textContent,/Translation ready/);
 assert.doesNotMatch(element('#translation-result .result-label').textContent,/incomplete/);
 assert.equal(element('#translate-music').disabled,true,'a completed request no longer looks busy or retryable');
 fresh();
 element('#translator-input').value='The words may be uncertain.';
 run('musicTranscriptReview=true;musicCapturedText="The words may be uncertain.";musicCapturedLanguage="en-US";musicCapturedTentativeText="uncertain"');
 handler=async()=>ok('Las palabras pueden ser inciertas.');
 await run('translateCapturedMusic()');
 assert.match(element('#music-listening-status').textContent,/unconfirmed/);
 assert.match(element('#translation-result .result-label').textContent,/unconfirmed captured words/);
 assert.equal(element('#translator-input').value,'The words may be uncertain.');
 run('newMusicSong()');
 // The same completion handling applies to a local phrase with no API request.
 fresh();element('#translator-input').value="I don't understand.";run('musicTranscriptReview=true');
 await run('translateCapturedMusic()');
 assert.equal(requests.length,0);
 assert.match(element('#music-listening-status').textContent,/Translation ready/);
 // New song and an edited source must win over a late service response.
 fresh();let finishFull;
 handler=()=>new Promise(resolve=>{finishFull=()=>resolve(ok('Respuesta vieja.'));});
 element('#translator-input').value='A captured sentence for translation.';run('musicTranscriptReview=true');
 let pendingFull=run('translateCapturedMusic()');
 await run('translateCapturedMusic()');
 assert.equal(requests.length,1,'double taps do not send duplicate full translations');
 run('newMusicSong()');finishFull();await pendingFull;
 assert.equal(element('#translator-input').value,'');
 assert.match(element('#music-listening-status').textContent,/Ready for a new song/);
 assert.equal(element('#translation-result').hidden,true);
 fresh();element('#translator-input').value='Another captured source sentence.';run('musicTranscriptReview=true');
 pendingFull=run('translateCapturedMusic()');
 element('#translator-input').value='The user corrected the captured words.';
 element('#natural-result').textContent='Keep this current draft.';
 finishFull();await pendingFull;
 assert.equal(element('#natural-result').textContent,'Keep this current draft.','late output cannot render against changed source before the input debounce');
 assert.match(element('#music-listening-status').textContent,/text or language changed/);
 assert.equal(element('#translate-music').disabled,false);
 run('newMusicSong()');
 fresh();
 // The provider's actual response to the phone's dictated English sentence.
 handler=async()=>ok('Yo voy a trabajar manana');
 for(const source of ['en-US','en-GB'])for(const target of ['es-EC','es-BO','es-MX','es-VE','es-PE','es-CO'])for(const purpose of ['everyday','academic']) {
  assert.equal(await run(`requestGeneralTranslation("I'm going to work tomorrow.","en-ec",{source:"${source}",target:"${target}",purpose:"${purpose}"})`),'Yo voy a trabajar mañana');
 }
 assert.equal(requests.length,2,'cached provider drafts also receive the spelling correction');
 context.HablaOffline={shouldUse:()=>false,translate:async()=> 'Yo voy a trabajar manana'};
 assert.equal(await run('requestGeneralTranslation("I am going to work tomorrow.","en-ec",{source:"en-US",target:"es-EC",onDevice:true})'),'Yo voy a trabajar mañana');
 assert.equal(run('refineSpanishOrthography("Manana, MANANA y manana.","Tomorrow, tomorrow and tomorrow.")'),'Mañana, MAÑANA y mañana.');
 assert.equal(run('refineSpanishOrthography("Mañana y café; niño, año, pingüino.","Tomorrow.")'),'Mañana y café; niño, año, pingüino.');
 for(const draft of ['"manana"','“manana”','‘manana’','«manana»',"'manana'",'`manana`','https://example.com/manana','manana@example.com','@manana','#manana','manana-store','mananas','mananaño','ñmanana','manana\u0301']) {
  context.protectedDraft=draft;
  assert.equal(run('refineSpanishOrthography(protectedDraft,"Tomorrow.")'),draft,'literal tokens and Unicode word boundaries stay intact');
 }
 for(const source of ['I met Manana yesterday.','I will meet Manana tomorrow.','I will meet Mañana tomorrow.','The word "manana" appears tomorrow.','The source says tomorrowish.']) {
  context.literalSource=source;
  assert.equal(run('refineSpanishOrthography("Manana viene manana.",literalSource)'),'Manana viene manana.','ambiguous names and unrelated source text are not guessed');
 }
 run('sourceLanguage="en-US";targetLanguage="es-EC";direction="en-ec";translationPurpose="everyday"');
 element('#translator-input').value="I'm going to work tomorrow.";
 await run('renderTranslation()');
 assert.equal(element('#natural-result').textContent,'Yo voy a trabajar mañana','the rendered phone result receives the correction');
 assert.equal(element('#translator-input').value,"I'm going to work tomorrow.",'the dictated source remains unchanged');
 element('#natural-result').textContent='Mañana voy al trabajo.';run('saveActiveTranslationEdit()');
 await run('renderTranslation()');
 assert.equal(element('#natural-result').textContent,'Mañana voy al trabajo.','user-saved wording remains authoritative');
 run('restoreGeneratedTranslation()');
 assert.equal(element('#natural-result').textContent,'Yo voy a trabajar mañana');
 fresh();handler=async()=>ok('Meet Manana tomorrow.');
 assert.equal(await run('requestGeneralTranslation("Nos vemos mañana.","ec-en",{source:"es-EC",target:"en-US"})'),'Meet Manana tomorrow.','English output is never spell-corrected as Spanish');
 fresh();
 // Reproduce the phone recording: a pasted opening quote, Ecuadorian source,
 // Research selected and on-device translation. No model or service is needed.
 for(const source of ['es-EC','es-BO','es-MX'])for(const target of ['en-US','en-GB'])for(const purpose of ['everyday','academic']) {
  assert.equal(await run(`requestGeneralTranslation('“Me vale verga',"ec-en",{source:"${source}",target:"${target}",purpose:"${purpose}",onDevice:true})`),"“I don't give a fuck");
 }
 assert.equal(await run('requestGeneralTranslation("¡Me vale verga!","ec-en",{source:"es-EC",target:"en-US",purpose:"academic"})'),"I don't give a fuck!");
 assert.equal(requests.length,0,'known standalone idiom bypasses the broken literal translation in either mode');
 await assert.rejects(run('requestGeneralTranslation("Me vale verga","ec-en",{source:"es-EC",target:"en-US",isCurrent:()=>false})'),e=>e.code==='superseded');
 run('sourceLanguage="es-EC";targetLanguage="en-US";direction="ec-en";translationPurpose="academic"');
 element('#translator-input').value='“Me vale verga';
 await run('renderTranslation()');
 assert.equal(element('#natural-result').textContent,"“I don't give a fuck");
 assert.equal(element('#translator-input').value,'“Me vale verga','original pasted quote stays intact');
 assert.match(element('#translation-result .result-label').textContent,/idiomatic meaning/);
 assert.match(element('#usage-note').innerHTML,/Usage: ASALE/);
 assert.doesNotMatch(element('#literal-result').textContent,/On-device machine/);
 run('translationPurpose="everyday"');
 for(const source of ['en-US','en-GB']) {
  assert.equal(await run(`requestGeneralTranslation("Fuck off!","en-ec",{source:"${source}",target:"es-EC",purpose:"everyday"})`),'¡Vete a la mierda!');
 }
 assert.equal(await run('requestGeneralTranslation("Shit!","en-ec",{source:"en-US",target:"es-BO",purpose:"everyday",onDevice:true})'),'¡Mierda!');
 assert.equal(requests.length,0,'exact vulgar counterparts stay local without a model download or API');
 await assert.rejects(run('requestGeneralTranslation("Fuck off!","en-ec",{source:"en-US",target:"es-EC",isCurrent:()=>false})'),e=>e.code==='superseded');
 handler=async text=>ok(text);
 assert.equal(await run('requestGeneralTranslation("Fuck off!","en-ec",{source:"en-US",target:"es-EC",purpose:"academic"})'),'Fuck off!');
 assert.equal(requests.length,1,'academic text stays on the existing engine');
 fresh();
 const wordGloss=await run('requestGeneralTranslation("chinga","ec-en",{source:"es-MX",target:"en-US",purpose:"everyday",onDevice:true})');
 assert.match(wordGloss,/bother \/ annoy/);assert.match(wordGloss,/sexual sense/);assert.match(wordGloss,/punishing chore/);
 assert.equal(requests.length,0,'ambiguous isolated words offer local choices, not one guessed meaning');
 assert.equal(await run('requestGeneralTranslation("en chinga","ec-en",{source:"es-MX",target:"en-GB",purpose:"everyday"})'),'really fast / in a hurry');
 run('sourceLanguage="es-MX";targetLanguage="en-US";direction="ec-en";translationPurpose="everyday"');
 element('#translator-input').value='chinga';
 run('setEditableTranslation("chinga","fuck")');
 assert.match(element('#spanish-context-notes').innerHTML,/Use Bother \/ annoy/);
 run('applySlangMeaning("chingar-bother")');
 assert.equal(element('#natural-result').textContent,'bother / annoy');
 element('#translator-input').value='Different source';
 run('applySlangMeaning("chingar-sex")');
 assert.equal(element('#natural-result').textContent,'bother / annoy','stale input cannot change a selected meaning');
 fresh();
 assert.equal(run('imageParagraphText("Una frase\\ncon pantalla estrecha.\\n\\nOtro párrafo.")'),'Una frase con pantalla estrecha.\n\nOtro párrafo.');
 assert.equal(run('imageParagraphText("Espero que\\n\\nllegues pronto.\\n\\nOtro párrafo.")'),'Espero que llegues pronto.\n\nOtro párrafo.');
 run('sourceLanguage="es-MX";direction="ec-en";translationPurpose="everyday"');
 assert.equal(run('prepareEmbeddedEcuadorianSlang("Ya voy al camello.").text'),'Ya voy al trabajo.');
 assert.equal(run('prepareEmbeddedEcuadorianSlang("Tengo trabajo. El camello vive en el desierto.").text'),'Tengo trabajo. El camello vive en el desierto.');
 assert.equal(run('prepareEmbeddedEcuadorianSlang("El camello es grande.").text'),'El camello es grande.');
 run('sourceLanguage="es-BO"');
 assert.equal(run('prepareEmbeddedEcuadorianSlang("Ya voy al camello.").text'),'Ya voy al camello.');
 run('sourceLanguage="es-EC"');
 for(const region of ['es-VE','es-PE','es-CO']) {
  run(`sourceLanguage="${region}";targetLanguage="en-GB";syncLanguagePair({persist:false})`);
  assert.equal(run('translatorRoute()'),'ec-en');assert.equal(run('sourceSpeechLocale()'),region);
  run(`sourceLanguage="en-US";targetLanguage="${region}";syncLanguagePair({persist:false})`);
  assert.equal(run('translatorRoute()'),'en-ec');assert.equal(run('targetSpeechLocale()'),region);
 }
 run('sourceLanguage="es-CO";targetLanguage="en-GB";syncLanguagePair({persist:false})');
 assert.equal(run('prepareEmbeddedEcuadorianSlang("Ya voy al camello.").text'),'Ya voy al trabajo.');
 run('sourceLanguage="es-EC"');
 assert.equal(run('escapeRegExp("a.b+")'),'a\\.b\\+');
 handler=async()=>ok('Come, heart, listen.');
 assert.equal(await run('requestGeneralTranslation("Ven, corazón, escucha.","ec-en",{purpose:"everyday",target:"en-GB"})'),'Come, sweetheart, listen.');
 fresh();
 assert.equal(await run('requestGeneralTranslation("Ven, corazón, escucha.","ec-en",{purpose:"academic",target:"en-GB"})'),'Come, heart, listen.');
 fresh();
 handler=async text=>ok(text==='Las cajas pequeñas.'?'Small boxes.':text);
 assert.equal(await run('requestGeneralTranslation("Las cajas chiquitas.","ec-en",{purpose:"everyday",target:"en-GB"})'),'Small boxes.');
 assert.equal(requests[0],'Las cajas pequeñas.');
 fresh();handler=async text=>ok(text==='Ese niño viene.'?'That child is coming.':text);
 run('sourceLanguage="es-MX"');
 assert.equal(await run('requestGeneralTranslation("Ese huerco viene.","ec-en")'),'That child is coming.');
 assert.equal(requests[0],'Ese niño viene.');
 run('setEditableTranslation("¡No mames!","Do not suck!")');
 assert.match(element('#translation-edit-status').textContent,/Review the slang meaning/);
 element('#translator-input').value='¡No mames!';
 run('applySlangMeaning("rebuke")');
 assert.equal(element('#natural-result').textContent,'Stop bullshitting!');
 assert.doesNotMatch(element('#translation-edit-status').textContent,/Review the slang meaning/);
 run('restoreGeneratedTranslation()');
 assert.equal(element('#natural-result').textContent,'Do not suck!');
 element('#translator-input').value='Another source.';run('applySlangMeaning("surprise")');
 assert.equal(element('#natural-result').textContent,'Do not suck!','stale source blocks meaning choice');
 run('sourceLanguage="es-EC"');
 element('#translator-input').value='Las cajas chiquitas.';
 run('setEditableTranslation("Las cajas chiquitas.","Chiquitas boxes.")');
 assert.match(element('#spanish-context-notes').innerHTML,/Possible untranslated words/);
 element('#natural-result').textContent='Small boxes.';run('saveActiveTranslationEdit()');
 assert.doesNotMatch(element('#spanish-context-notes').innerHTML,/Possible untranslated words/);
 fresh();
 assert.equal(run('refineImageEnglish("Wait until the account of five.","Espera hasta la cuenta de cinco.")'),'Wait until the count of five.');
 assert.equal(run('refineImageEnglish("The account of five pesos.","La cuenta de cinco pesos.")'),'The account of five pesos.');
 assert.equal(run('refineImageEnglish("We dance on the track.","Bailamos en la pista.","La fiesta tiene salsa.")'),'We dance on the dance floor.');
 assert.equal(run('refineImageEnglish("An audio track.","Una pista de audio.","Esta música es salsa.")'),'An audio track.');
 assert.equal(run('refineImageEnglish("We dance beside the runway.","Bailamos cerca de la pista del aeropuerto.","Hay música.")'),'We dance beside the runway.');
 assert.equal(run('refineImageEnglish("Lift it up!","¡Súbele!","La música es bachata.")'),'Turn it up!');
 assert.equal(run('refineImageEnglish("Lift it up.","Súbele.","Levanta la caja.")'),'Lift it up.');
 assert.equal(run('refineImageEnglish("Raise the salary.","Súbele el sueldo.","Escuchamos música.")'),'Raise the salary.');
 assert.equal(run('refineImageEnglish("Do not change me.","No me cambies.","Hay música.")'),'Do not change me.','ambiguous lyrics are not guessed');
 handler=async text=>ok(text==='¡Súbele!'?'Lift it up!':text);
 assert.equal(await run('requestGeneralTranslation("¡Súbele!","ec-en",{inputType:"music",purpose:"everyday"})'),'Turn it up!','explicit music capture supplies the missing volume context');
 fresh();
 assert.equal(await run('requestGeneralTranslation("¡Súbele!","ec-en",{purpose:"everyday"})'),'Lift it up!','ordinary text retains its ambiguity');
 fresh();
 assert.equal(await run('requestGeneralTranslation("¡Súbele!","ec-en",{inputType:"music",purpose:"academic"})'),'Lift it up!','academic mode is not rewritten as lyrics');
 fresh();
 handler=async text=>ok(text);
 const imageSource='Primera línea\ncontinuada.\n\nSegunda estrofa.';context.imageSource=imageSource;
 assert.equal(await run('requestGeneralTranslation(imageSource,"ec-en",{inputType:"image",purpose:"everyday"})'),'Primera línea continuada.\n\nSegunda estrofa.');
 assert.equal(requests[0],'Primera línea continuada.','wrapped image lines reach engine as a whole phrase');
 fresh();
 assert.equal(await run('requestGeneralTranslation(imageSource,"ec-en",{inputType:"image",purpose:"academic"})'),imageSource,'research image line breaks remain unchanged');
 fresh();
 context.long='La educación requiere comprensión y análisis. '.repeat(24)+'Última oración completa.';
 const result=await run('requestGeneralTranslation(long,"ec-en",{purpose:"everyday",target:"en-GB"})');
 assert.equal(result,context.long,'long everyday input is no longer sliced to 500 characters');
 assert.ok(requests.length>1);
 for(const text of ['á'.repeat(650),'😀'.repeat(400),'La dosis es 1.5 mg. '+ 'Texto adicional. '.repeat(50)]){
  context.text=text;
  const chunks=run('splitLongTranslationText(text)');
  assert.equal(chunks.map(c=>c.text).join(''),text.trim());
  for(const c of chunks)if(!c.separator)assert.ok(Buffer.byteLength(c.text)<=430);
 }
 fresh();let failure=true;
 handler=async text=>{if(text.includes('FINAL')&&failure)throw new TypeError('Failed to fetch');return ok(text);};
 context.partial='primera '.repeat(80)+'FINAL';
 await assert.rejects(run('requestGeneralTranslation(partial,"ec-en")'),e=>e.code==='network');
 const first=JSON.stringify(requests);assert.ok(requests.length>1);
 failure=false;const before=requests.length;
 assert.equal(await run('requestGeneralTranslation(partial,"ec-en")'),context.partial);
 assert.equal(requests.length,before+1,'retry reuses successful chunks and requests only failed remainder');
 fresh();handler=async()=>({ok:true,status:200,json:async()=>({responseStatus:200,quotaFinished:true,responseData:{translatedText:'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY.'}})});
 await assert.rejects(run('requestGeneralTranslation("prueba nueva","ec-en")'),e=>e.code==='quota');
 assert.equal(run('translationChunkCache.size'),0,'quota warnings never become cached drafts');
 element('#translator-input').value='prueba nueva';run('sourceLanguage="es-EC";targetLanguage="en-GB";direction="ec-en";translationPurpose="academic";');
 await run('renderTranslation()');
 assert.equal(element('#no-result').dataset.translationError,'quota');assert.equal(element('#retry-translation').hidden,false);
 assert.match(element('#no-result p').textContent,/allowance/);
 fresh();handler=async()=>{throw new TypeError('Failed to fetch');};
 element('#translator-input').value='¡No mames, güey!';run('sourceLanguage="es-MX";translationPurpose="everyday";');
 await run('renderTranslation()');
 assert.equal(element('#translation-result').hidden,true);
 assert.equal(element('#spanish-context').hidden,false,'local guidance remains available after a service failure');
 assert.match(element('#spanish-context-notes').innerHTML,/Vulgar/);
 assert.match(element('#spanish-context-notes').innerHTML,/Mexico City study/);
 assert.equal(element('#translator-input').value,'¡No mames, güey!');
 fresh();handler=async()=>{const e=new Error('abort');e.name='AbortError';throw e;};
 await assert.rejects(run('requestGeneralTranslation("texto","ec-en")'),e=>e.code==='timeout');
 fresh();context.navigator.onLine=false;handler=async()=>{throw new TypeError('offline');};
 await assert.rejects(run('requestGeneralTranslation("texto","ec-en")'),e=>e.code==='offline');context.navigator.onLine=true;
 fresh();handler=async()=>({ok:true,status:200,json:async()=>{throw new SyntaxError('HTML');}});
 await assert.rejects(run('requestGeneralTranslation("texto","ec-en")'),e=>e.code==='invalid_response');
 fresh();handler=async()=>({ok:false,status:429,json:async()=>({responseStatus:429,responseDetails:'Too many requests'})});
 await assert.rejects(run('requestGeneralTranslation("texto","ec-en")'),e=>e.code==='rate_limit');
 fresh();context.current=true;handler=async text=>{context.current=false;return ok(text);};
 await assert.rejects(run('requestGeneralTranslation(long,"ec-en",{isCurrent:()=>current})'),e=>e.code==='superseded');
 assert.equal(requests.length,1,'superseded passage stops sending remaining segments');
 assert.ok(fs.readFileSync('sw.js','utf8').includes('new URL(event.request.url).origin !== self.location.origin'),'service worker does not replace API failures with cached HTML');
 console.log('Translation service checks passed: full input, UTF-8 limits, decimals, cached retries, quota warnings, timeout/offline/network/invalid responses, rate limits and stale batch cancellation.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
