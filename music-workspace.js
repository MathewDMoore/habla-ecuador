/* Compact listening controls and a graph of observed transcript size, not audio amplitude. */
const HablaMusicWorkspace=(()=>{
 let panel,phaseLabel,countLabel,timeLabel,line,timer,startTime=0,elapsed=0,words=0,samples=[],phase='Idle';
 function paint(){if(!panel)return;phaseLabel.textContent=phase;countLabel.textContent=words+' words';timeLabel.textContent=elapsed+' s';const max=Math.max(1,...samples);line.setAttribute('points',samples.map((v,i)=>`${i*300/19},${48-v/max*44}`).join(' '));}
 function sample(){elapsed=Math.floor((Date.now()-startTime)/1000);samples.push(words);samples=samples.slice(-20);paint();}
 function bind(){
  const capture=document.querySelector('.music-capture'),input=document.querySelector('#translator-input')?.closest('.input-card');
  if(!capture||!input||document.querySelector('#music-session-data'))return;
  const actions=capture.querySelector('.music-capture-actions'),settings=document.createElement('details');settings.id='music-session-settings';
  const summary=document.createElement('summary');summary.textContent='Listening settings, recordings & history';settings.append(summary);
  const keep=new Set([actions,document.querySelector('#music-listening-status'),document.querySelector('#music-live-status'),document.querySelector('#music-live-pending'),document.querySelector('#music-live-retry'),document.querySelector('#music-capture-recovery')]);
  for(const child of [...capture.children])if(!keep.has(child))settings.append(child);
  for(const id of ['music-choose-recording','music-paste-recording']){const b=document.getElementById(id);if(b)settings.append(b);}
  const native=document.querySelector('#native-speech-details');if(native)settings.append(native);
  panel=document.createElement('section');panel.id='music-session-data';panel.setAttribute('aria-label','Recognition activity');
  panel.innerHTML='<div class="music-session-metrics"><strong data-phase>Idle</strong><span data-words>0 words</span><span data-time>0 s</span></div><svg viewBox="0 0 300 52" role="img" aria-label="Words in the captured transcript over the last 20 seconds"><path d="M0 49H300" stroke="#b4d1c0"/><polyline fill="none" stroke="#173f35" stroke-width="3" points=""/></svg><small>Transcript words · last 20 seconds. This is not an audio level meter.</small>';
  phaseLabel=panel.querySelector('[data-phase]');countLabel=panel.querySelector('[data-words]');timeLabel=panel.querySelector('[data-time]');line=panel.querySelector('polyline');
  capture.prepend(actions,panel);capture.append(settings);input.before(capture);paint();
  window.addEventListener('pagehide',()=>{clearInterval(timer);timer=null;});
 }
 function start(text=''){clearInterval(timer);words=text.trim()?text.trim().split(/\s+/u).length:0;samples=[words];elapsed=0;startTime=Date.now();phase='Starting';paint();timer=setInterval(sample,1000);}
 return{bind,start,phase:label=>{phase=label;paint();},words:text=>{words=text.trim()?text.trim().split(/\s+/u).length:0;paint();},stop:label=>{clearInterval(timer);timer=null;phase=label;paint();}};
})();
