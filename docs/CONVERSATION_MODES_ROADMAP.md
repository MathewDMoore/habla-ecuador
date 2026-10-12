# Conversation and listening modes

Product direction recorded October 11, 2026, from the requested listening,
conversation, text-only and custom-settings experience.

## Current state

Hosted v0.24.0 / build 93 includes two named speaker microphones, visible interim/final text, explicit source/target binding per turn, independent regional language settings, persistent spoken/text-only mode, per-turn Hear controls, and a typed-turn fallback with explicit language choice. Uncertain short text stays labelled and is not automatically spoken. Completed turns retain the settings captured at their start. Text-only changes and leaving the panel guard delayed playback.

Recognized-text language hints can switch direction; they do not provide bilingual audio recognition. The microphone uses the assigned language, and captured words are not silently rewritten. Reliable native/browser speech, continuous capture, conversation editing/history, private ear playback, stories and generated lessons still require work. Neither diagnostics nor automated tests validate physical-phone capture.

## Requested modes

| Mode | Intended experience | Remaining work |
| --- | --- | --- |
| Listening | Start once, see incoming speech and its English/Spanish translation, and hear short translated passages privately. | Reliable continuous capture, passage boundaries, latency measurement, bounded translation requests, and physical testing of private ear/headphone output. |
| Conversation | Two people take turns; show each original and translation, then speak the translation aloud. | Preset, explicit routing and capture/playback guards implemented in build 93; physical-phone handoffs and recognition need validation. |
| Text only | Show speech and translation while audio playback stays off. | Implemented in build 93, including delayed responses and explicit Hear controls; physical-device confirmation remains. |
| Custom settings | Choose speaker languages/regions, output behavior, voice and speed. | Names, language varieties and spoken/silent controls persist in build 93. Unified voice/rate and private output routing remain open. |

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
   editing, deletion and private backup controls. Build lessons from real
   conversations: review the user's original sentence, compare a corrected
   translation, explain one useful regional/contextual distinction, speak a
   reply, and revisit the phrase later. Keep private conversations local unless
   the user explicitly chooses to share them.

## Conversation, stories and music learning

The October 11 follow-up adds learning through actual conversation and short
stories as a product goal. Use original or appropriately licensed stories with
graded difficulty, a short spoken passage, comprehension, a conversational reply,
and a small set of useful phrases. Reading, listening and speaking should support
one another, with Ecuador first and regional/U.S./U.K. comparisons where useful.
Existing fixed practice lessons are a foundation; generated conversation lessons
and graded story features are not implemented or validated yet.

The immediate priority remains music translation practice and the unresolved
transcription work. Practise short user-supplied passages, checking the captured
words before interpreting affection, idioms, slang, vulgarity and regional clues.
Compare literal and contextual meanings, correct the editable draft and speak it
back. Use imported screenshots or typed passages when singing recognition misses
words. This should build from the existing capture/passage-review tools; it must
not publish user-supplied song lyrics or label uncertain transcripts as accurate.

## Constraints

No paid API, new account requirement, large media archive or GitHub storage
expansion is assumed. Device models require an explicit download and tested
availability; free online services require visible quota/error handling. Do not
claim zero latency, perfect interpretation, complete-song recognition, automatic
speaker identification, or unrestricted background listening. Keep source text
and translation editable, and do not publish imported private papers.

This roadmap distinguishes build 93 features from remaining work. No native speech, continuous listening, stories or private-output feature is marked released by this update.
