# Practice language coverage, draft build 238

**Draft only: not merged, published, or tested on a physical iPhone.** A country flag is not evidence of native-speaker audio or a validated regional lesson.

## Selectable varieties (39 total, plus automatic)

- **21 Spanish varieties:** Ecuador 🇪🇨 (existing main curriculum), Bolivia 🇧🇴, Mexico 🇲🇽, Venezuela 🇻🇪, Peru 🇵🇪, Colombia 🇨🇴, Cuba 🇨🇺, Argentina 🇦🇷, Chile 🇨🇱, Costa Rica 🇨🇷, Dominican Republic 🇩🇴, El Salvador 🇸🇻, Guatemala 🇬🇹, Honduras 🇭🇳, Nicaragua 🇳🇮, Panama 🇵🇦, Paraguay 🇵🇾, Puerto Rico 🇵🇷 (U.S. territory), Spain 🇪🇸, Uruguay 🇺🇾 and Equatorial Guinea 🇬🇶.
- **18 English country choices:** United States 🇺🇸, United Kingdom 🇬🇧, Canada 🇨🇦, Australia 🇦🇺, New Zealand 🇳🇿, Ireland 🇮🇪, Jamaica 🇯🇲, Bahamas 🇧🇸, Barbados 🇧🇧, Guyana 🇬🇾, Trinidad and Tobago 🇹🇹, Antigua and Barbuda 🇦🇬, Saint Kitts and Nevis 🇰🇳, Saint Lucia 🇱🇨, Saint Vincent and the Grenadines 🇻🇨, Grenada 🇬🇩, South Africa 🇿🇦 and Singapore 🇸🇬.

## Functional limits and integrity

- Both web entrypoints expose these 39 region choices in Practice, grouped by English pilots, English research previews and Spanish general-lesson previews. A separate automatic-selection option brings the picker to 40.
- All English region choices preserve the selected locale but use general English teaching content until national varieties are documented and validated. Voice synthesis requires a matching country locale and does not silently impersonate a missing accent.
- Spanish choices other than Ecuador show a general introductory Spanish exercise and explicitly hide Ecuador-only short lessons, regional recordings and source-practice material. They must not display Ecuador-specific expressions as if verified for Bolivia, Mexico or other countries.
- An exact matching speech voice is required to play model audio for those Spanish preview locales. Text lessons remain available without local speech support.
- The hands-free voice lab is a separate scripted A/B exchange. It does not retrain speech models or demand learner repetition.
- The Spanish interface dictionary includes country labels and warnings, and the service worker caches updated lesson modules.
- English status in a country varies: an official language does not necessarily mean a majority native language. Caribbean creoles are not interchangeable with standardized English. Singapore and South Africa are multilingual. Puerto Rico is a territory.

## Geographic research references (not regional pronunciation evidence)

- Social Work England language guidance: https://www.socialworkengland.org.uk/registration/overseas-applicant-guidance
- University of Sheffield majority native English-speaking countries guidance: https://sheffield.ac.uk/international/english-speaking-countries
- South African Government official languages: https://www.gov.za/about-sa/south-africas-people
- Singapore Constitution article 153A: https://sso.agc.gov.sg/Act/CONS1963?ProvIds=pr153A-&ViewType=Within

## Release gate

Static syntax and 39 flag/locale checks have been performed on the draft. Node and browser CI, actual iPhone voices, offline update, and interaction regressions are not yet verified. The PR stays draft until review. Never call build 238 live simply because the branch version was updated.
