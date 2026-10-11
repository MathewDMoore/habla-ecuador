# Conversation and listening modes

Product direction recorded October 11, 2026, from the requested listening,
conversation, text-only and custom-settings experience.

## Current state

Hosted v0.23.3 / build 88 already has a Conversation tab with two named speaker
buttons, tap-to-start/finish capture, visible interim/final text, language-family
checks, translated turns, automatic playback after a completed turn, and Pause.
These are implemented behaviors, not a claim of dependable live recognition on
every device. The reported live music transcription problem remains unresolved.

The app has no listening-mode preset, private phone-to-ear playback control,
conversation text-only preset, or unified custom mode settings. Native microphone
diagnostics do not establish reliable continuous transcription or ear routing.

## Requested modes

| Mode | Intended experience | Remaining work |
| --- | --- | --- |
| Listening | Start once, see incoming speech and its English/Spanish translation, and hear short translated passages privately. | Reliable continuous capture, passage boundaries, latency measurement, bounded translation requests, and physical testing of private ear/headphone output. |
| Conversation | Two people take turns; show each original and translation, then speak the translation aloud. | Simple preset, dependable handoffs, correct explicit source/target per turn, and prevention of playback being recaptured as speech. |
| Text only | Show speech and translation while audio playback stays off. | Explicit preset and enforcement across automatic and delayed playback; keep deliberate Hear controls available. |
| Custom settings | Choose speaker languages/regions, output behavior, voice and speed. | One compact settings disclosure, persistence on the device, and clear indication of active settings. |

Ecuadorian Spanish stays the default, with independent Spanish-region and
U.S./U.K. English choices. Regional labels must not promise an unavailable accent
or automatically identify a person's origin. Ambiguous slang needs contextual
options; vulgarity must retain its intended meaning and strength.

## Development order and acceptance

1. **Capture reliability.** Start/Stop must behave consistently, preserve final
   words, expose interruption/no-word states, and allow a retry without losing
   the transcript. Test clear speech in both language directions on a physical
   phone before relying on continuous or sung input. Retain both external Alexa
   playback and the later same-phone/Bluetooth use case.
2. **Conversation and text-only presets.** Reuse the existing turn-taking flow.
   Bind the actual source and target to every turn rather than relying on global
   translator selections. Check delayed responses, opposite-language speech,
   silent mode, playback handoff, pause/resume and changed settings.
3. **Continuous listening.** Keep capture and translation states distinct, show
   what was actually heard, retain missed/uncertain passages for editing, measure
   latency, and avoid overlapping requests or exhausting free-service quota.
4. **Private playback and custom controls.** Verify routing, volume, audio
   interruptions and recovery on physical hardware. Keep the shareable web app
   usable across phones; identify native-only behavior clearly when necessary.
5. **Learning and history.** Add the separately requested searchable, local
   translation history and optional review/practice from saved phrases, with
   editing, deletion and private backup controls.

## Constraints

No paid API, new account requirement, large media archive or GitHub storage
expansion is assumed. Device models require an explicit download and tested
availability; free online services require visible quota/error handling. Do not
claim zero latency, perfect interpretation, complete-song recognition, automatic
speaker identification, or unrestricted background listening. Keep source text
and translation editable, and do not publish imported private papers.

This file records requirements and acceptance checks. It does not mark any of
the unimplemented presets as released or change the hosted/native build number.
