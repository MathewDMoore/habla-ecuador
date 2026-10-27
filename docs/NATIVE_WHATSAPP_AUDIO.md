# Native audio prototype — 0.1.5 (6)

This branch adds on-device voice-note file transcription and outgoing synthesized speech for compatible active calls. It does not receive or transcribe the remote WhatsApp participant's call audio, and does not provide two-way live translation. WhatsApp compatibility and audibility require physical-device verification. The public web app is unchanged.

## Voice notes

In the native app, open Translate → Native audio → Transcribe file. Select a voice note saved in Files. Speech authorization is requested; no microphone is opened. The selected file is copied into temporary storage (50 MB limit), processed only if on-device recognition is supported for the chosen source language, and removed after success, error, cancellation or timeout. There is no Apple-service fallback and no audio upload. Review the editable transcript, then explicitly choose Use text to translate. That last action uses the existing translator's text-processing behavior, including its configured online service.

## Outgoing call speech

Apple documents Add Audio in Calls for iOS 18.2+ and calling apps using Apple voice processing. The native UI requests the dedicated permission on explicit Enable, checks for a compatible active call and enables the spokenAudio injection preference. It never starts a WhatsApp call or captures its remote audio. Prepare a translation, review/edit the text to send, then explicitly press Speak translation into call. Maximum 2,000 characters. Disable stops synthesized speech and resets the injection preference; starting microphone capture or navigating the native web view also disables it. A permission response arriving after Disable/navigation is ignored.

Setup on the physical iPhone: Settings → Accessibility → Audio & Visual → Add Audio in Calls, then explicitly allow Habla Ecuador. Build/install native 0.1.5 (6) with the existing Xcode project/signing. A web refresh cannot install this native code. Neither a successful compile nor the browser bridge simulation proves incoming capture, WhatsApp compatibility, or audible output at either end of a real call.

## Verification

The native GitHub Actions workflow compiles against the iOS simulator SDK without signing/installing. The browser test exercises the real injected controls with a simulated native boundary; no call, recognition or physical microphone is used. Physical tests remain open: a saved Spanish/English voice note, unavailable/denied speech assets, cancellation, call permission denied/service disabled, compatible/incompatible calls, received audio and turn-taking. Receiving the other participant's audio has no implemented route in this prototype.

## Apple references

- https://developer.apple.com/documentation/speech/sfspeechurlrecognitionrequest
- https://developer.apple.com/documentation/avfaudio/adding-synthesized-speech-to-calls
- https://developer.apple.com/documentation/avfaudio/avaudiosession/setpreferredmicrophoneinjectionmode(_:)
