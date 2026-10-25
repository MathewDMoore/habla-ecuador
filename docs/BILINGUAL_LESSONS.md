# Learning direction — build 127

The four-step sunset lesson supports English learning as well as Ecuadorian Spanish. With the lesson goal set to Follow app language, a Spanish interface selects U.S. English learning, while an English interface selects Ecuadorian Spanish learning. The visible I want to learn selector can override this with Ecuadorian Spanish, U.S. English, or U.K. English. This choice is saved on the device independently of the translator's language pair.

English learning has an English target and Spanish meaning in listening and speaking, English choices with Spanish UI explanations, and an English language map with Spanish meanings. Target text is protected from interface translation. Model playback, speech recognition, and map playback explicitly use the chosen English locale. The device determines the actual available voice and recognition support; no paid service or recorded English speaker is added.

Changing the learning goal resets the lesson to step one and cancels any old lesson microphone. Moving to another step or leaving Lessons also closes that microphone. Explicit goals survive interface changes and reloads; automatic direction follows the interface. Translator text and drafts are retained. Spanish native-recording and radio-story pilots remain available under Spanish learning and are hidden for English learning.

Validation uses the real DOM at 320px and 390px, synthetic recognition for the browser and native JavaScript bridge, and mocked playback. It covers all four English steps, both English locales, retained target text, saved goals, automatic/manual direction changes, capture cleanup, and the unchanged Spanish lesson. Actual iPhone audio and voice quality remain unverified.
