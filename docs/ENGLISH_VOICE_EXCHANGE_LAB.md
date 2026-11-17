# English voice exchange pilot (proposed build 237)

## What the user requested
The user does **not** want to repeat sentences into the microphone. The objective is to let Habla's English country voices interact with one another and, eventually, help the product find and refine evidence-supported regional lessons without recruiting speakers individually.

## Implemented in this draft
- Practice contains a collapsed **English voice exchange** card in both web app entrypoints.
- Choose two countries among 🇺🇸 US, 🇬🇧 UK, 🇨🇦 Canada, 🇦🇺 Australia, 🇳🇿 New Zealand, 🇮🇪 Ireland.
- Choose a four-turn original English scenario (meeting, coffee, directions, or schedule).
- **Start A ↔ B** plays A/B/A/B lines in order through the existing speech engine. The voices take turns with *different* sentences: no imitation/parrot task.
- A visible transcript labels each turn, speaker, country and language.
- Country voice lookup is exact-match on BCP-47 locale. Playback does not silently substitute a voice from another English country. A missing voice disables the exchange and gives an explanation.
- Swap speakers / Stop buttons, navigation and background stop, and listening-only interaction. There is **no microphone recording or requirement for the learner to speak**.
- No audio, transcript or device data is sent to a new service; scripted lines are local app content.
- Separate synthetic-speech labeling: this is **not** a human reference recording, automatic teacher feedback, native-accent certification, or machine-learning training.

## Technical boundary
A Web Speech SpeechSynthesisUtterance is a text-to-speech output: playing the output of two closed device voices **does not change their model weights**. This pilot uses a known four-turn script, not spontaneous LLM-generated dialogue or actual machine-to-machine acoustic evaluation.

Future autonomous quality workflows could:
1. identify licensed, provenance-tagged real-speaker examples for each claimed region;
2. compare phoneme/word recordings using a permitted ASR or signal-analysis engine, with clear limitations;
3. flag pronunciation, word choice or comprehension contrasts for evidence review;
4. accept reviewed, licensed examples into separate country-specific lesson packs;
5. avoid attempting to retrain Apple's built-in voices or to reuse recordings outside their licenses.

These follow-on steps are **not implemented** here.

## Validation
- Node regression tests assert six flags and locale choices, exact/no-fallback voice lookup, 4-turn alternation, absence of voice-lab microphone prompts, and build cache wiring.
- Existing English flag and dictionary practice checks are included in the proposed GitHub Actions job.
- JS syntax check is part of CI.
- Browser and actual iPhone audio availability, interruption, and voice output remain **unverified**. The PR is a draft, not a live release.

## Relationship to country flags
This change is based on PR #169, which registers 🇨🇦 🇦🇺 🇳🇿 🇮🇪 as general English **draft** varieties. Their country-specific translation, vocabulary, accent accuracy and published lessons remain unvalidated. Voice presence does not establish any of those features.
