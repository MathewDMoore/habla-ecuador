const assert = require('node:assert/strict');
const fs = require('node:fs');
const swift = fs.readFileSync('ios/HablaEcuadorWidget/HablaHomeWidget.swift','utf8');
const plist = fs.readFileSync('ios/HablaEcuadorWidget/Info.plist','utf8');
const project = fs.readFileSync('ios/HablaEcuador.xcodeproj/project.pbxproj','utf8');
const app = fs.readFileSync('ios/HablaEcuador/HablaEcuadorApp.swift','utf8');
const config = fs.readFileSync('ios/HablaEcuador/Info.plist','utf8');
const web = fs.readFileSync('app.js','utf8');
for(const text of [
 'Habla Ecuador 🇪🇨','¿Cómo estás?','How are you?','Translate','Practice','Dictionary','Tutorial',
 'HablaWidgetProvider','HablaWidgetBackground','HablaLandscape',
 '.systemSmall', '.systemMedium','StaticConfiguration','TimelineProvider',
 'hablaecuador://'
])assert.ok(swift.includes(text),text);
for(const i of ['translate','practice','dictionary','tutorial']) {
 assert.ok(app.includes('"'+i+'"'),i+' native route');
 if(i!=='tutorial')assert.ok(web.includes('launchQuery.get("start") === "'+i+'"'),i+' web route');
 else assert.ok(fs.readFileSync('tutorial.js','utf8').includes('params.get("tour")==="1"'),'tour=1 reopens onboarding');
}
assert.ok(config.includes('<string>hablaecuador</string>'),'scheme registered for native app');
assert.ok(app.includes('WidgetLaunchRequest(url: url)'),'each widget tap creates a unique launch event');
assert.ok(app.includes('lastWidgetRouteID != request.id'),'same widget shortcut can be opened repeatedly');
assert.ok(app.includes('URLQueryItem(name: "tour", value: "1")'),'native Tutorial shortcut enters guided walkthrough');
assert.ok(swift.includes('shortcut("Tutorial"'),'medium widget visibly includes tutorial shortcut');
assert.ok(plist.includes('com.apple.widgetkit-extension'),'WidgetKit extension point');
assert.ok(project.includes('HablaEcuadorWidget.appex'),'embedded extension binary');
assert.ok(project.includes('Embed App Extensions'),'app includes extension product');
assert.ok(project.includes('com.mathewdmoore.HablaEcuador.widget'),'nested bundle id');
assert.ok(project.includes('HablaHomeWidget.swift'),'Swift file in WidgetKit target');
assert.ok(swift.includes('policy: .never'),'static snapshot does not pretend to deliver live data');
assert.ok(!/AVAudioEngine|SFSpeechRecognizer|SpeechAnalyzer/.test(swift),'widget never starts recording audio');
console.log('Widget identity, sizes, launch routing, app extension packaging and microphone privacy guards validated.');
