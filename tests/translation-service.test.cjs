const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();
function element(selector){if(!elements.has(selector))elements.set(selector,{value:'',textContent:'',hidden:false,dataset:{},classList:{toggle(){}},setAttribute(){},removeAttribute(){}});return elements.get(selector);}
let handler,requests=[];
const context=vm.createContext({console,setTimeout,clearTimeout,AbortController,
 document:{querySelector:element,addEventListener(){},createElement:()=>({set innerHTML(v){this.value=v;}})},
 localStorage:{getItem:()=>null,setItem(){}},navigator:{onLine:true},
 fetch:async(url,options)=>{const text=new URL(url).searchParams.get('q');requests.push(text);assert.ok(Buffer.byteLength(text)<=500);return handler(text,options);}
});
for(const file of ['research-reference.js','spanish-context.js','app.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
const run=code=>vm.runInContext(code,context);
const ok=text=>({ok:true,status:200,json:async()=>({responseStatus:200,responseData:{translatedText:text}})});
const fresh=()=>{requests=[];run('translationChunkCache.clear()');};
async function main(){
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
 assert.equal(run('refineImageEnglish("Wait until the account of five.","Espera hasta la cuenta de cinco.")'),'Wait until the count of five.');
 assert.equal(run('refineImageEnglish("The account of five pesos.","La cuenta de cinco pesos.")'),'The account of five pesos.');
 assert.equal(run('refineImageEnglish("We dance on the track.","Bailamos en la pista.","La fiesta tiene salsa.")'),'We dance on the dance floor.');
 assert.equal(run('refineImageEnglish("An audio track.","Una pista de audio.","Esta música es salsa.")'),'An audio track.');
 assert.equal(run('refineImageEnglish("We dance beside the runway.","Bailamos cerca de la pista del aeropuerto.","Hay música.")'),'We dance beside the runway.');
 assert.equal(run('refineImageEnglish("Lift it up!","¡Súbele!","La música es bachata.")'),'Turn it up!');
 assert.equal(run('refineImageEnglish("Lift it up.","Súbele.","Levanta la caja.")'),'Lift it up.');
 assert.equal(run('refineImageEnglish("Raise the salary.","Súbele el sueldo.","Escuchamos música.")'),'Raise the salary.');
 assert.equal(run('refineImageEnglish("Do not change me.","No me cambies.","Hay música.")'),'Do not change me.','ambiguous lyrics are not guessed');
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
