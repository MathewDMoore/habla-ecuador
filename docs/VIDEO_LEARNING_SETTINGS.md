# Video lessons follow learning settings — build 128

The existing “I want to learn” selector now drives the video section as well as the four-step lesson. Follow app language resolves Spanish interface → U.S. English learning and English interface → Ecuadorian Spanish learning. Explicit Ecuadorian Spanish, U.S. English, and U.K. English choices persist independently of translator settings. An interface-only change does not replace a playing video when the explicit learning goal stays the same.

Spanish learning retains the four university regional recordings, publisher transcripts, Spanish caption tracks, and the last regional selection. U.S. English learning offers VOA Learning English's beginner “Welcome!” lesson, an English introduction prompt and Spanish meaning. U.K. English learning offers EnglishClub's “Encounters in the UK” using the publisher-supplied YouTube embed. This documentary features Cambridge hosts and international learners; it is explicitly labeled as several accents and documentary listening, rather than an A1 or uniform-accent model. The related practice sentence is Habla study content, not an attributed transcript excerpt. Device playback and recognition use en-US/en-GB respectively.

No English player requests its provider until Play. VOA streams its original video, with no preloading. The EnglishClub frame is created after Play and removed to stop playback. Starting microphone capture or device speech, leaving Lessons, closing the section, hiding the document, switching learning goal or starting other page media pauses video/removes the embed. Starting an English video cancels prior capture and device speech. Active English video/pending playback also protects against automatic reload. Provider controls and captions remain provider-owned; Spanish study meanings are not timed subtitles. A visible original-source link and the practice phrase remain available if streaming fails. Video content requires internet, and no user audio, video files, model or third-party transcript is added to Git.

## Sources checked October 25, 2026

- VOA official lesson: https://learningenglish.voanews.com/a/lets-learn-english-lesson-one/3111026.html — beginner lesson, published introduction phrase and direct 360p MP4 supplied by the publisher. Terms distinguish VOA-produced public-domain material from third-party content: https://learningenglish.voanews.com/p/6021.html. Attribution is visible in the lesson. Video stays on the provider host.
- EnglishClub original film and supplied embed: https://www.englishclub.com/esl-videos/encounters-in-the-uk/ — https://www.youtube.com/embed/3lzLacwh8Xc?rel=0. Publisher explicitly encourages embedding these films: https://www.englishclub.com/learning-english-video/about.php. No download or rehosting, editing, or wholesale transcript reproduction.

## Validation

`tests/video-lesson.browser.cjs` uses the real DOM at 320px/390px plus the companion JavaScript bridge. Provider playback and speech boundaries are simulated. It checks automatic/explicit learning goals, lazy players, U.S./U.K. microphone locales, video/capture exclusion, source fallback, navigation/close cleanup, preserved Spanish regional choices, and no horizontal overflow. The existing bilingual lesson regression now expects English video availability. Chromium and WebKit CI run both suites. Physical iPhone playback, YouTube availability, real speech recognition, and provider caption availability remain device checks; simulated playback does not establish media decoding.

## Superseded English selections in build 129

The long EnglishClub film and English-only VOA lesson above describe build 128. Build 129 replaces them with four short clips (27–56 seconds), Spanish study guides and a clip selector; see [Short bilingual videos](SHORT_BILINGUAL_VIDEOS.md) for the current catalog, selection evidence and signed-companion playback behavior.

## Current English lessons: build 130

External English videos are retired following Mathew's feedback about promotion. English learning now stays inside Habla with original Spanish explanations, English models/chunks and speaking practice: [Original English lessons](ORIGINAL_ENGLISH_LESSONS.md). The earlier video catalogs in this document are historical.
