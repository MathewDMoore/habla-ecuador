const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
test('recognition graph uses sampled transcript counts and stops its timer',()=>{
 let now=0,tick,timers=0;
 const code=fs.readFileSync('music-workspace.js','utf8');
 const context=vm.createContext({Date:{now:()=>now},setInterval(fn){tick=fn;timers++;return 1;},clearInterval(id){if(id)timers--;},document:{querySelector:()=>null}});
 vm.runInContext(code,context);
 // Inject just the UI references, leaving production timer/state code intact.
 vm.runInContext(code.replace('return{bind,start,phase:', 'globalThis.fields={phaseLabel:phaseLabel={},countLabel:countLabel={},timeLabel:timeLabel={},line:line={setAttribute(k,v){this[k]=v}}};panel={}; return{bind,start,phase:').replace('const HablaMusicWorkspace=','const UnderTest='),context);
 vm.runInContext('UnderTest.start();UnderTest.words("Hola amigo");UnderTest.phase("Receiving words")',context);
 assert.equal(context.fields.countLabel.textContent,'2 words');assert.equal(context.fields.phaseLabel.textContent,'Receiving words');
 now=1000;tick();assert.equal(context.fields.timeLabel.textContent,'1 s');assert.match(context.fields.line.points,/2\.0|15\.789|0,48|0,4/);
 vm.runInContext('UnderTest.words("Hola");',context);now=2000;tick();assert.equal(context.fields.countLabel.textContent,'1 words','revised transcript count is measured, never an invented audio level');
 vm.runInContext('UnderTest.stop("Capture error — see status")',context);assert.equal(timers,0);assert.match(context.fields.phaseLabel.textContent,/Capture error/);
});
