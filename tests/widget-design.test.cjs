const assert = require('node:assert/strict');
const fs = require('node:fs');
const swift = fs.readFileSync('ios/HablaEcuadorWidget/HablaHomeWidget.swift','utf8');
const plist = fs.readFileSync('ios/HablaEcuadorWidget/Info.plist','utf8');
const project = fs.readFileSync('ios/HablaEcuador.xcodeproj/project.pbxproj','utf8');
const app = fs.readFileSync('ios/HablaEcuador/HablaEcuadorApp.swift','utf8');
const config = fs.readFileSync('ios/HablaEcuador/Info.plist','utf8');
const web = fs.readFileSync('app.js','utf8');
for(const text of [
 'Habla Ecuador 🇪🇨','¿Cómo estás?','How are you?','Translate','Practice','Dictionary',
 'HablaWidgetProvider','HablaWidgetBackground','HablaLandscape',
 '.systemSmall', '.systemMedium','StaticConfiguration','TimelineProvider',
 'hablaecuador://'
])assert.ok(swift.includes(text),text);
for(const i of ['translate','practice','dictionary']) {
 assert.ok(app.includes('"'+i+'"'),i+' native route');
 assert.ok(web.includes('launchQuery.get("start") === "'+i+'"'),i+' web route');
}
assert.ok(config.includes('<string>hablaecuador</string>'),'scheme registered for native app');
assert.ok(plist.includes('com.apple.widgetkit-extension'),'WidgetKit extension point');
assert.ok(project.includes('HablaEcuadorWidget.appex'),'embedded extension binary');
assert.ok(project.includes('Embed App Extensions'),'app includes extension product');
assert.ok(project.includes('com.mathewdmoore.HablaEcuador.widget'),'nested bundle id');
assert.ok(project.includes('HablaHomeWidget.swift'),'Swift file in WidgetKit target');
assert.ok(swift.includes('policy: .never'),'static snapshot does not pretend to deliver live data');
assert.ok(!/AVAudioEngine|SFSpeechRecognizer|SpeechAnalyzer/.test(swift),'widget never starts recording audio');
console.log('Widget identity, sizes, launch routing, app extension packaging and microphone privacy guards validated.');
