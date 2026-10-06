const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.join(__dirname, '..');
const helper = require('../document-import.js');
let network = 0;
function element() {
  return {value:'', textContent:'', hidden:false, disabled:false, children:[], handlers:{}, dataset:{},
    addEventListener(name, cb) { this.handlers[name] = cb; },
    setAttribute() {}, removeAttribute() {}, classList:{toggle(){}},
    append(value) { this.children.push(value); }, replaceChildren() { this.children=[]; }};
}
const elements = {};
const get = key => elements[key] ||= element();
const context = vm.createContext({console, setTimeout, clearTimeout, AbortController, HablaDocument:helper,
  localStorage:{getItem:()=>null,setItem:()=>{}},
  document:{addEventListener(){},querySelector:get,querySelectorAll:()=>[],body:{classList:{toggle(){}}},createElement:element},
  window:{}, fetch:async()=>{network++;throw new Error('unexpected service request');}});
vm.runInContext(fs.readFileSync(path.join(root,'research-reference.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),context);
const run = code => vm.runInContext(code,context);
async function main() {
  for (const text of ['uno\n\ndos', 'texto con palabras. '.repeat(1800), 'a\n\n'.repeat(4000), 'a'.repeat(17000)]) {
    assert.equal(helper.sections(text).join(''), text, 'no extracted text dropped');
    context.testText=text;
    const parts=run('safeDocumentSections(testText)');
    assert.equal(parts.join(''),text);
    for (const part of parts) {
      assert.ok(part.length<=3000);
      context.part=part;
      assert.ok(part.length<=430 || run('splitLongTranslationText(protectResearchTokens(part).text).filter(c=>!c.separator).length')<=20);
    }
  }
  const loaded=await helper.extract({name:'prueba.txt',size:20,text:async()=> 'Hola\r\n\r\nEcuador.'});
  assert.equal(loaded.text,'Hola\n\nEcuador.');
  await assert.rejects(helper.extract({name:'old.doc',size:2}),/older .doc/);
  await assert.rejects(helper.extract({name:'wrong.exe',size:2}),/Choose a Word/);
  await assert.rejects(helper.extract({name:'huge.docx',size:11*1024*1024}),/10 MB/);
  await assert.rejects(helper.extract({name:'empty.txt',size:1,text:async()=> ' '}),/No readable/);
  context.window.mammoth={extractRawText:async()=>({value:'<script>literal text</script>\n\nEspaña.'})};
  const wordContext=vm.createContext({window:context.window});
  vm.runInContext(fs.readFileSync(path.join(root,'document-import.js'),'utf8'),wordContext);
  const word=await context.window.HablaDocument.extract({name:'word.docx',size:1,arrayBuffer:async()=>new ArrayBuffer(0)});
  assert.ok(word.text.startsWith('<script>'), 'raw text never executed');
  run('bindDocumentTools(); documentImportActive=true;');
  get('#translator-input').value='Texto no enviado';
  await run('renderTranslation()');
  assert.equal(network,0, 'preview never calls translation engine');
  assert.equal(get('#translation-result').hidden,true);
  run('sourceLanguage="es-MX"; targetLanguage="en-GB"; direction="ec-en"; translationPurpose="academic"; importedDocument={name:"paper.docx", sections:["uno","dos"],index:0,total:6};');
  run('selectDocumentSection(1)');
  assert.equal(get('#translator-input').value,'dos');
  assert.ok(get('#document-status').textContent.includes('2 of 2'));
  run('lastCompletedTranslation={source:"dos",targetLanguage:"en-GB",sourceLanguage:"es-MX",purpose:"academic"};');
  get('#natural-result').textContent='The organization analyzed color and behavior.';
  get('#compare-english').handlers.click();
  assert.equal(get('#comparison-uk').value,'The organisation analysed colour and behaviour.');
  assert.equal(get('#comparison-us').value,'The organization analyzed color and behavior.');
  assert.equal(network,0,'comparison does not request a second translation');
  get('#comparison-uk').handlers.input({target:{value:'My UK edit'}});
  get('#compare-english').handlers.click();
  assert.equal(get('#comparison-uk').value,'My UK edit','comparison edits persist separately');
  // A closed import cannot overwrite the next user's text when it finishes.
  let finish;
  context.HablaDocument={...helper,extract:()=>new Promise(resolve=>finish=resolve)};
  const pending=get('#document-file').handlers.change({target:{files:[{name:'slow.docx'}],value:'slow.docx'}});
  run('closeImportedDocument()');
  get('#translator-input').value='User text after cancellation';
  finish({text:'Late document'});
  await pending;
  assert.equal(get('#translator-input').value,'User text after cancellation');
  for(const name of ['index.html','translator.html']) {
    const html=fs.readFileSync(path.join(root,name),'utf8');
    assert.ok(html.indexOf('document-import.js?v=58')<html.indexOf('app.js?v=58'));
    assert.equal((html.match(/id="choose-document"/g)||[]).length,1);
  }
  console.log('Document import checks passed: lossless sections, engine limits, preview privacy, raw text, errors, stale imports, UK/US comparisons and saved edits.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
