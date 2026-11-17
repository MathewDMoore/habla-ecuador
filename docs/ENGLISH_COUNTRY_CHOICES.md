# English-speaking countries, flags, and supported Habla functionality

Research date: 2026-11-17. This distinguishes the existence of an English-speaking community, the official legal status of English, and the specific level of Habla's language technology.

## Selectable now in proposed build 236

| Country | Flag | Locale | Capability |
| --- | --- | --- | --- |
| United States | 🇺🇸 | en-US | Existing English translation and US spelling/wording comparison |
| United Kingdom | 🇬🇧 | en-GB | Existing English translation and UK spelling/wording comparison |
| Canada | 🇨🇦 | en-CA | General English translation draft; request local device speech voice if available |
| Australia | 🇦🇺 | en-AU | General English translation draft; request local device speech voice if available |
| New Zealand | 🇳🇿 | en-NZ | General English translation draft; request local device speech voice if available |
| Ireland | 🇮🇪 | en-IE | General English translation draft; request local device speech voice if available |

The four new locale codes do **not** certify country-specific vocabulary, pronunciation, idioms, or translation. Existing generic English baselines (US for Canada; UK for Australia, New Zealand and Ireland) are editorial fallbacks, not research findings about equivalence. This feature preserves each selected country code and requests a matching system speech locale when available. No new speech package, paid service, local slang dictionary, or country-language model is bundled.

## Research candidates, not yet selectable as separate translation dialects

- Caribbean: 🇯🇲 Jamaica, 🇧🇸 Bahamas, 🇧🇧 Barbados, 🇬🇾 Guyana, 🇹🇹 Trinidad and Tobago, 🇦🇬 Antigua and Barbuda, 🇰🇳 Saint Kitts and Nevis, 🇱🇨 Saint Lucia, 🇻🇨 Saint Vincent and the Grenadines, 🇬🇩 Grenada, plus several territories and islands.
- Africa: 🇿🇦 South Africa has English among twelve official languages; this does not imply that it is every resident's home language.
- Asia: 🇸🇬 Singapore is among countries recognized by Social Work England for English language assessment. Distinct local English varieties must be studied separately.

Do not equate English with local creoles, especially in the Caribbean; do not mark any phrase as distinctively Jamaican, Singaporean, South African, etc., without region-specific evidence. The Social Work England regulator's eligibility list is **not** a dialect-dictionary corpus. Nor does first-language/official-language status establish that most citizens speak it natively.

## Sources

1. Social Work England, *Overseas applicant guidance*, Annex 1 (current regulator categorization; expressly distinguishes first/native from official): https://www.socialworkengland.org.uk/registration/overseas-applicant-guidance
2. Government of Canada, *Improving your English and French*: https://www.canada.ca/en/immigration-refugees-citizenship/services/settle-canada/language-skills.html
3. Irish Constitution, article 8 (English recognized as a second official language): https://www.irishstatutebook.ie/eli/cons/en/html
4. New Zealand, English Language Act 2026 (in force 7 August 2026): https://www.legislation.govt.nz/act/public/2026/49/en/latest
5. South African Government, *People of South Africa*, official languages: https://www.gov.za/about-sa/south-africas-people

## Acceptance boundaries

- Both web entry points show correct flags and labels in translation from/to and both conversation spoken-language selectors.
- Country locale selection survives the existing saved language-pair mechanism, and remains an English-family route.
- The selected speech locale is requested without claiming that the iPhone has a voice for it.
- The whole-document tool accepts the same four new country locale codes without changing document contents or publishing research.
- Existing Practice lessons, UK/US comparative editors, and Dictionary remain explicitly limited to their validated tracks. Do not silently represent general English output as verified regional expressions.
- Update the service-worker shell and release identifiers together. Test JavaScript, existing language direction tests, feedback validation, whole-document tests, and iPhone voice behavior before merging. No live-site or physical-device verification is claimed in this branch.
