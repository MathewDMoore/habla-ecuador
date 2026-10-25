// Public metadata generated as part of each Pages deployment, never user data.
const fs=require('node:fs'),path=require('node:path');
function metadata(root){
 const app=fs.readFileSync(path.join(root,'app.js'),'utf8'),sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
 const match=/const APP_VERSION = "(\d+\.\d+\.\d+) · build (\d+)"/.exec(app);
 if(!match)throw Error('Missing app version');
 const info={version:match[1],build:Number(match[2])};
 if(!sw.includes('const CACHE = "habla-ecuador-v'+info.build+'"'))throw Error('Service worker/app version mismatch');
 for(const file of ['index.html','translator.html'])if(!fs.readFileSync(path.join(root,file),'utf8').includes('v'+info.version+' · build '+info.build))throw Error('HTML/app version mismatch: '+file);
 return info;
}
if(require.main===module){const root=path.resolve(__dirname,'..');fs.writeFileSync(path.join(root,'app-version.json'),JSON.stringify(metadata(root))+'\n');}
module.exports={metadata};
