# Spanish interface and friend invitations — build 121

Habla Ecuador can open its own navigation, instructions, dictionary explanations, contribution/review controls, speech feedback and help in Spanish. The top-bar language selector switches between English and Spanish. This hosted update does not require a native rebuild.

## Language and region are independent

- `?ui=es` or `?ui=en` is allowlisted and takes precedence over `habla-ui-language-v1` in device storage. A supported URL choice is remembered; otherwise the saved choice applies, then English. Invalid values do not change the preference.
- Today’s app-sharing section defaults to Spanish invitations. The sender can explicitly choose English. Monterrey and Caracas invitations retain existing region/city routing and evidence limitations.
- Source/target translation languages, speech locales, dictionary regions, canonical form values, stored reviews and saved glosses are unchanged by UI language.
- Language switches preserve user input, selections, unsaved contribution edits, learning phrases and the existing video element. No editor replacement or synthetic typing is performed.
- Spanish contribution exports use Spanish field/enum labels while local JSON keeps its canonical values and original contributor text. Reports remain unverified and private until explicitly copied/shared.

## Implementation and boundaries

`interface-es.js` contains editorial Spanish UI text, including the curated regional dictionary’s context/register/uncertainty notes. `interface-language.js` applies reversible text/accessible-label updates, observes dynamic app/native-injected UI and protects editors, translations, English learning counterparts, examples, recognized words and private identities. Unknown strings remain visible in their source language. No remote translation service runs for UI localization.

English learning content remains English when it is the object being taught or translated. Proper names, citations and external source pages are not replaced. The OS keyboard, video controls, permission prompts and share sheet use device settings. New or unusual provider/native errors may retain their original wording; this is not a claim to translate external content or every future message.

The localizer uses reviewed source-string mappings as a compatibility layer for this existing multi-file app. New UI strings require dictionary entries or bounded dynamic formatters plus regression coverage. No dictionary sense, profanity mapping, audio recognizer, pronunciation algorithm or native signing setting changed.

## Validation

```sh
node --check app.js
node --check interface-es.js
node --check interface-language.js
node --check slang-contributions.js
for test in tests/*.test.cjs; do node "$test" || exit; done
HABLA_PLAYWRIGHT_MODULE=/path/to/playwright HABLA_NATIVE_SCRIPT=/tmp/habla-native16.js node tests/interface-language.browser.cjs
git diff --check
```

The interface browser fixture covers 390/320px in ordinary browser and native-16 companion-JavaScript simulation: Spanish invitation preference/region, all stable select values, language restoration, original source/output/term/meaning/example content, selected range, unsaved contribution edits, Spanish export, dynamic counts, visible practice prompt, video object retention and guided lesson stages. Synthetic browser recognition checks Spanish word-score feedback and its explicit non-pronunciation qualification. No real audio, translation-service call or message is sent.

Existing sharing, contribution, dictionary practice, regional practice, review reset, selection/composition, translation tools, speaking prompt and regional vocabulary browser regressions also run. Physical iPhone Spanish UI/QuickPath/audio/video-fullscreen verification remains pending; JavaScript bridge simulation is not a native build or device test.
