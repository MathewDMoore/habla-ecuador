# Short English videos with Spanish learning support — build 129

Replaces build 128's five-minute VOA introductions and long EnglishClub documentary after Mathew's feedback: the U.K. video was too long and the U.S. English-only exchange was insufficient support for Spanish speakers.

The saved learning goal still controls English variety. Each variety now offers two selectable short videos, a visible duration, an original Spanish study guide, a related English phrase/Spanish meaning and the existing hold-to-speak practice. The last clip selection for each English variety survives switching within the page. These are practical phrases used across English varieties, not exclusive regional expressions. The selected variety determines device playback and microphone locale. No native-voice identity or exact regional scoring is claimed.

| Learning goal | Topic | Creator | Published length | Official source |
| --- | --- | --- | --- | --- |
| U.S. English | Ask for clarification | Inglés con el Güero | 54 seconds | https://www.youtube.com/watch?v=tvK67-n34C8 |
| U.S. English | Make a polite request | Inglés con el Güero | 56 seconds | https://www.youtube.com/watch?v=sXOmujeV3LI |
| U.K. English | Ask someone to repeat | Amigos Ingleses | 44 seconds | https://www.youtube.com/watch?v=aDZPOgdF_8Y |
| U.K. English | Say you are hungry | Amigos Ingleses | 27 seconds | https://www.youtube.com/watch?v=T0be2na0mOM |

## Selection evidence, October 25, 2026

The U.S. teacher's own site identifies him as a U.S. native speaker teaching Hispanic learners: https://www.inglesconelguero.com/. Its channel link identifies the official YouTube channel. The official channel's Shorts listing supplies both clips. Their public YouTube player metadata identifies the creator, durations, playable-in-embed status and Spanish automatic caption tracks. The polite-request description explicitly explains its English phrase in Spanish. These are teaching clips rather than a dialogue between two English speakers. Their descriptions also promote the creator's classes; Habla does not enroll users, reproduce promotions, or promise that external videos are advertisement-free.

Amigos Ingleses' own history describes its Cambridge origins and Phillip/Isabel's teaching project: https://www.amigosingleses.com/acerca-de. Its own site links the official YouTube channel, whose Shorts listing supplies both selected clips. Public player metadata confirms titles, durations, authorship and embed availability. The short correction/hunger examples replace the long documentary. No claim is made that every clip contains spoken Spanish: Habla supplies an explicit Spanish guide and meaning independently of the creator's spoken language. These are not full listening audits or validated pronunciation curricula.

Only publisher players/links are used. No video files, speaker recordings, third-party full transcripts or automatic captions are copied into the repository. The Spanish guide and related speaking sentences are separately authored and labeled, not presented as a synchronized transcript or quoted creator lesson. Provider captions remain provider-owned and may be unavailable or imperfect. Provider availability, embedded ads and runtime restrictions can change.

## App behavior

In ordinary browsers a portrait player loads only after Play. Changing clips, starting capture/device speech, closing the section, switching goal, leaving Practice or hiding the page stops/removes it. Playing video protects against automatic reload. A source link remains visible if embedding fails.

The currently signed iPhone companion allows same-site navigation and opens external URLs in the browser, including YouTube iframe navigation. To avoid an unusable blank embed or an unexpected navigation, its JavaScript bridge selects an explicit Watch short video link and explains that learners return to Habla for speaking practice. No Swift changes, native rebuild, or silent expansion of native navigation permissions are included.

## Validation

All 32 JavaScript suites pass locally. The video regression checks all four clips at 320/390px and with the native JavaScript bridge: selected phrase/Spanish guide/duration, en-US/en-GB capture locale, no autoplay, player cleanup, clip-change capture cancellation, retained per-variety choices, native source links, preserved Spanish regional choices and no horizontal overflow. Provider playback/recognition are mocked; actual human audio quality and physical iPhone playback still require device review. Existing bilingual lesson checks and Chromium/WebKit CI also run before release.

## Retired in build 130

Mathew found the replacement clip promotional as well. Build 130 removes all four English creator clips from the learning interface and replaces them with original in-app guided speaking lessons. See [Original English lessons](ORIGINAL_ENGLISH_LESSONS.md). The catalog above is historical and no longer used by the app.
