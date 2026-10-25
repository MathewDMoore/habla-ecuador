"""Time the four public SPE transcripts using audio-derived ordered anchors.
Run tests/prepare-recorded-practice-media.py first. Requires ffmpeg/ffprobe, node
and spanish-subtitles-requirements.txt. --reuse-timing reads the raw timing JSONs
from /tmp. No user audio accepted. Human timing review remains pending.
"""
import argparse,difflib,hashlib,json,re,subprocess,textwrap,unicodedata
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
MODEL='Systran/faster-whisper-base'
REVISION='ebe41f70d5b6dfa9166e2c581c45c9c0cfc57b66'
DIGESTS={
'beg05d':'4d1117963ec85c9562921237bfaaf9bfe560cf1ea9ab705142f6fdb23a958d16',
'adv06c':'7c17b974617f9ec61fa2238fb39aca3ed54d2fd21803535af522e96b2997734b',
'beg05a':'a8373f3b7bb1d1502389939c32e6234f06b4bc65d4e18cbb483a83a8369b0f1e',
'beg03c':'e04e445230fa65c8827a4a8683aea1c287bf5682d8af012d891a5dda0f324507'}
def norm(w):return re.sub(r'[^\w]','',unicodedata.normalize('NFD',w.lower())).replace('_','')
def stamp(s):
 ms=round(s*1000)
 return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}'
parser=argparse.ArgumentParser();parser.add_argument('--reuse-timing',action='store_true');args=parser.parse_args()
items=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./recorded-transcripts.js').items))"],cwd=ROOT,text=True))
model=None
if not args.reuse_timing:
 import numpy as np
 from faster_whisper import WhisperModel
 from huggingface_hub import snapshot_download
 model_path=snapshot_download(MODEL,revision=REVISION,cache_dir='/tmp/habla-caption-models',allow_patterns=['config.json','model.bin','tokenizer.json','vocabulary.txt'])
 model=WhisperModel(model_path,device='cpu',compute_type='int8',cpu_threads=4)
manifest={'sourceCredit':'Orlando Kelm / COERLL / The University of Texas at Austin, Spanish Proficiency Exercises',
'sourceLicense':'CC BY (as listed by publisher)','licenseSource':'https://coerll.utexas.edu/coerll/oer/spanish-proficiency-exercises/',
'method':'faster-whisper 1.2.1; multilingual base int8 CPU; Spanish word timestamps; ordered transcript anchors',
'model':MODEL,'modelRevision':REVISION,'reviewStatus':'automatic-timing-human-review-pending','videos':{}}
for clip,source in items.items():
 media=Path('/tmp/habla-'+clip+'.mp4')
 if hashlib.sha256(media.read_bytes()).hexdigest()!=DIGESTS[clip]:raise RuntimeError('Public video changed: '+clip)
 duration=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','default=noprint_wrappers=1:nokey=1',str(media)],text=True))
 raw=Path('/tmp/habla-'+clip+'-timing.json')
 if model is not None:
  audio=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(media),'-f','f32le','-ac','1','-ar','16000','-']),dtype=np.float32)
  segments,_=model.transcribe(audio,language='es',word_timestamps=True,beam_size=5,condition_on_previous_text=False,vad_filter=False)
  words=[{'start':w.start,'end':w.end,'word':w.word,'probability':w.probability} for segment in segments for w in segment.words]
  raw.write_text(json.dumps(words,ensure_ascii=False,indent=2)+'\n')
 words=json.loads(raw.read_text());sw=source['text'].split()
 matcher=difflib.SequenceMatcher(None,[norm(w) for w in sw],[norm(w['word']) for w in words],autojunk=False)
 anchors={i+k:words[j+k] for i,j,n in matcher.get_matching_blocks() for k in range(n)}
 coverage=len(anchors)/len(sw)
 if coverage<.95:raise RuntimeError('Insufficient ordered anchors: '+clip)
 timings={}
 for i in range(len(sw)):
  if i in anchors:timings[i]=(anchors[i]['start'],anchors[i]['end']);continue
  prev=max((a for a in anchors if a<i),default=-1);nxt=min((a for a in anchors if a>i),default=len(sw))
  left=anchors[prev]['end'] if prev>=0 else 0;right=anchors[nxt]['start'] if nxt<len(sw) else duration
  if right<left:raise RuntimeError('Ambiguous timing gap: '+clip)
  step=(right-left)/(nxt-prev-1);timings[i]=(left+(i-prev-1)*step,left+(i-prev)*step)
 groups=[];current=[]
 for i,word in enumerate(sw):
  if current and (len(current)>=12 or len(' '.join(sw[j] for j in current+[i]))>74):groups.append(current);current=[]
  current.append(i)
  if re.search(r'[.!?]$',word) and len(current)>1:groups.append(current);current=[]
 if current:groups.append(current)
 cues=[];previous=0
 for group in groups:
  start=max(previous,timings[group[0]][0]);end=min(duration,max(start+.08,timings[group[-1]][1]))
  if end<=start:raise RuntimeError('Empty cue: '+clip)
  text=' '.join(sw[i] for i in group)
  cues.append({'start':start,'end':end,'text':'\n'.join(textwrap.wrap(text,width=42,break_long_words=False,break_on_hyphens=False))});previous=end
 if ' '.join(c['text'].replace('\n',' ') for c in cues)!=source['text']:raise RuntimeError('Transcript loss: '+clip)
 header='WEBVTT\n\nNOTE\nSpanish text: Orlando Kelm / COERLL / The University of Texas at Austin; CC BY.\nAutomatic audio-derived timing by Habla Ecuador; human review pending.\n\n'
 vtt=header+'\n\n'.join(str(n)+'\n'+stamp(c['start'])+' --> '+stamp(c['end'])+'\n'+c['text'].replace('&','&amp;').replace('<','&lt;').replace('>','&gt;') for n,c in enumerate(cues,1))+'\n'
 (ROOT/'captions'/(clip+'.es.vtt')).write_text(vtt)
 manifest['videos'][clip]={'source':source['source'],'sourceTextSha256':source['textSha256'],'mediaSha256':DIGESTS[clip],
 'duration':duration,'sourceWords':len(sw),'matchedAnchors':len(anchors),'anchorCoverage':coverage,'interpolatedWords':len(sw)-len(anchors),
 'cues':len(cues),'firstCue':cues[0]['start'],'lastCue':cues[-1]['end'],'timingOutputSha256':hashlib.sha256(raw.read_bytes()).hexdigest()}
 print(clip,len(cues),'cues; source words',len(sw),'anchors',len(anchors),flush=True)
(ROOT/'captions'/'spanish-subtitles.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
