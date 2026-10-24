const assert=require('node:assert/strict'),fs=require('node:fs');
const native=fs.readFileSync('ios/HablaEcuador/NativeRecordingImport.swift','utf8'),app=fs.readFileSync('ios/HablaEcuador/HablaEcuadorApp.swift','utf8'),bridge=fs.readFileSync('ios/HablaEcuador/NativeSpeech.js','utf8');
assert.match(native,/request\.requiresOnDeviceRecognition = true/);assert.match(native,/recognizer\.supportsOnDeviceRecognition, recognizer\.isAvailable/);
assert.ok(!/AVAudioEngine|requestAccess\(for: \.audio\)|URLSession|uploadTask|print\(/.test(native),'no microphone, audio upload or transcript logging');
assert.match(native,/loadTracks\(withMediaType: \.audio\)/);assert.match(native,/let seconds = min\(60, duration - start\)/);assert.match(native,/signal else/);
assert.match(native,/defer \{ Self.removeStage\(video\) \}/);assert.match(native,/self\.token == current, self\.isActive/);assert.match(native,/requestID == id/);
assert.match(app,/case "import-recording":/);assert.match(app,/message\.frameInfo\.isMainFrame/);assert.match(app,/origin\.host == site\.host/);assert.match(app,/recordingImport\?\.cancel\(\)/);assert.match(app,/speech\.isCapturing == false/);
assert.match(bridge,/message\.type === "recording-import"/);assert.match(bridge,/message\.id !== recordingImportRequest/);assert.match(bridge,/recordingImportRequest\) throw new DOMException/);
console.log('Native recording import boundaries: on-device-only ASR, bounded extraction, no microphone/upload/logging, signal check, private temp cleanup, trusted origin and stale/cancel guards passed. Swift execution remains a Mac check.');
