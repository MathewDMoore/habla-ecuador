# Habla Ecuador — Source and License Register

_Last verified: 2026-09-28_

This register controls whether external linguistic or cultural material may be used in Habla Ecuador. “Free to access,” “free app,” “publicly audible,” and “open source software” do **not** automatically grant permission to copy, redistribute, adapt, train on, or synthesize a person’s voice.

This is a product compliance record, not legal advice.

## Status legend

- **Approved per item** — May be used only after the specific item, license, creator/speaker, provenance, attribution, and source URL are recorded.
- **Reference only** — May guide independent research and original writing; do not copy or ship its audio/text.
- **Permission required** — Written permission from the rights holder and, for community language material, appropriate speaker/community consent are required before ingestion.
- **Restricted** — Do not ingest, redistribute, train on, or include in the app.

## Source audit

| Source | Material and owner/custodian | License evidence | App playback / redistribution | Model training / voice synthesis | Decision |
|---|---|---|---|---|---|
| **Lingua Libre recordings on Wikimedia Commons** | Individual speaker recordings uploaded through Lingua Libre; hosted by Wikimedia Commons | Commons states that every file has its own license. Reviewed Lingua Libre Spanish examples use **CC BY-SA 4.0**, while at least one reviewed item uses **CC BY 4.0**. License must therefore be checked per file, not assumed from the category. | **Allowed per item** when the file page authorizes reuse and all attribution/share-alike requirements are satisfied. Store file title, speaker/uploader, exact license/version, source URL, changes, and dialect/provenance evidence. | Do **not** use for voice cloning or a generative TTS voice. Corpus/model training is held pending a separate legal/ethical review because copyright permission does not by itself settle voice, identity, community-consent, attribution-at-scale, or output-license questions. | **Approved per item for pronunciation playback only.** |
| **Wikimedia Commons audio generally** | Audio from many independent uploaders and institutions | Commons’ reuse guide says audio/video may be reused, including commercially, but each media file has its own license and required credit. | **Allowed per item** after validation. Do not rely on search-result labels alone; archive the item description page and attribution. | No model training or speaker imitation without a separate approval record. | **Approved per item.** |
| **Lingua Libre Spanish category** | Approximately 19,000 Spanish pronunciation files at the review date | Category membership proves Spanish-language classification, not Ecuadorian/Bolivian provenance. | Do not label a clip “Ecuadorian” or “Bolivian” unless the speaker/dialect provenance is independently supported by structured metadata or the speaker’s own documented information. | Same restriction as above. | **Candidate index only.** |
| **AlliKichwa / Alli Kichwa** | Ecuadorian Kichwa learning app associated with David Tabi and community collaborators | A free/downloadable app and public project descriptions were found, but no explicit license authorizing reuse of its lesson text, illustrations, or recordings was located. | Do not copy, extract, or ship its audio or lessons. It may be studied as a product and contacted for collaboration. | No training, cloning, or corpus ingestion. | **Permission required.** Contact the project/creator before any reuse. |
| **Simi (Cochabamba Quechua app)** | Volunteer-built Cochabamba/Bolivian Quechua learning app from Laboratorio de Tecnologías Sociales | The project describes lessons with audio, illustration, and animation, but no content license authorizing third-party reuse was located. Public GitHub/profile references do not establish that the lesson corpus or voices are open. | Do not copy, extract, or redistribute audio, text, or artwork. Product research and direct collaboration inquiries are acceptable. | No training, cloning, or corpus ingestion without written permission and speaker/community consent. | **Permission required.** |
| **SimiGPT initiative** | Proposed Bolivian Quechua language-model/corpus initiative from Laboratorio de Tecnologías Sociales | Public project description emphasizes corpus, tools, methods, evaluation, and community agreements; no downloadable corpus license was confirmed. | Not an app-content source unless a separately licensed release appears or a collaboration agreement is made. | No ingestion. A future partnership may be valuable because the project explicitly recognizes community agreements. | **Collaboration prospect; permission required.** |
| **Southern Bolivian Quechua Living Dictionary / Living Dictionaries** | Community dictionary entries and named-speaker audio hosted by Living Dictionaries | Current Terms retain contributor ownership, provide only limited personal/educational/research/community use, prohibit systematic retrieval without written permission, restrict commercial exploitation, and preserve community/speaker removal rights. | Browsing for research is allowed. Do not scrape, bulk export, copy recordings, or redistribute entries in Habla Ecuador without written permission from the dictionary managers/rights holders and applicable community/speakers. | No training or voice synthesis. | **Reference only / permission required.** |
| **Oralidad Modernidad (Ecuador)** | Interdisciplinary Ecuadorian Indigenous-language documentation program; community narratives, interviews, audio/video, educational and lexical materials | The site footer states CC BY 4.0, but individual language-material pages expressly prohibit copying, distribution, publication, or any other use without prior authorization from oralidadmodernidad@gmail.com and limit use to cultural/academic, noncommercial purposes. The specific item restriction controls our intake decision. | Use as a scholarly/reference source and link to it. Do not ingest or redistribute recordings until written item-level authorization confirms the exact media, allowed app use, speaker consent, and community consent. | No training, cloning, biometric use, or generative voice use. | **Reference only / explicit prior permission required.** |
| **ABNB / CREM returned Bolivian recordings** | 157 historic recordings (1903–2001) returned by France’s CREM to Archivo y Biblioteca Nacionales de Bolivia (ABNB); Indigenous communities are central rights/ethical stakeholders | Reporting quoting ABNB’s archive head states that descendants/communities can obtain free copies, institutional consultation is for research, commercial use/reproduction is prohibited, and some communities do not want dissemination. No open license was identified. | Do not copy, stream, redistribute, or include in the app. A researcher may consult according to ABNB rules; community access is not a public reuse license. | No training, dataset creation, voice synthesis, or commercial/noncommercial app ingestion. | **Restricted.** |
| **Killkan Kichwa ASR dataset/code** | Roughly four hours of Kichwa audio, transcriptions, and Spanish translations derived from “Jaboneropak Ayllullaktapi” by Radialistas; maintained by ctaguchi | Repository states **CC BY 4.0**. The repository and paper document the dataset’s source and purpose. | Potentially reusable with attribution after confirming every bundled asset is covered, recording provenance is adequate, and project attribution is preserved. It is Kichwa ASR research data—not Ecuadorian Spanish TTS. | Copyright license is permissive, but voice-cloning use is outside Habla Ecuador’s approved purpose. Any ML use needs a documented purpose, provenance review, speaker/community-risk review, and attribution plan. | **Confirmed open candidate; not yet approved for production voice.** |

## Required intake record for every external recording

No external clip enters the app unless its record contains:

1. Exact file title and immutable source URL
2. Speaker/creator or uploader
3. Language and claimed dialect
4. Evidence for Ecuadorian/Bolivian provenance
5. Exact license and version
6. Required attribution text
7. Whether edits were made
8. Speaker/community consent or restriction notes
9. Approved use: playback, lesson example, research, or none
10. Explicit **no voice cloning** flag
11. Reviewer and review date
12. Removal/contact route

## Habla Ecuador implementation rule

- **Pronunciation playback:** permitted only from approved per-item recordings or newly commissioned/generated audio with documented rights.
- **Ecuadorian labeling:** requires provenance; a Latin American Spanish label is not enough.
- **Cultural/Indigenous material:** community authority and consent can be stricter than copyright. Respect both.
- **Training:** remains disabled for third-party voices unless a separate dataset/model approval is completed.
- **Removal:** every external audio item must be traceable and removable without an app rewrite.
- **Attribution:** the app must expose a human-readable credits page and a machine-readable source manifest.

## Evidence links

- Wikimedia Commons reuse guide: https://commons.wikimedia.org/wiki/Commons:Simple_media_reuse_guide
- Lingua Libre Spanish category: https://commons.wikimedia.org/wiki/Category:Lingua_Libre_pronunciation-spa
- Example Lingua Libre CC BY-SA 4.0 recording: https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-AdrianAbdulBaha-entusiasmar.wav
- Example Lingua Libre CC BY 4.0 recording: https://commons.wikimedia.org/wiki/File:LL-Q1321_(spa)-Elxavovel-ustedes.wav
- Living Dictionaries Terms: https://livingdictionaries.app/terms
- Oralidad Modernidad: https://oralidadmodernidad.org/
- Oralidad Modernidad — Voces y saberes ancestrales: https://oralidadmodernidad.org/saberes-ancestrales/
- AlliKichwa project profile: https://rising.globalvoices.org/lenguas/2018/08/22/allikichwa-app-para-aprender-kichwa-ecuatoriano/
- Simi project profile: https://labtecnosocial.org/app-simi-aprender-quechua/
- SimiGPT description: https://labtecnosocial.org/simigpt-modelo-de-lenguaje-para-el-fortalecimiento-del-quechua-boliviano/
- ABNB/CREM collection report: https://elpais.com/planeta-futuro/2024-12-28/el-retorno-de-francia-de-los-sonidos-ancestrales-grabaciones-historicas-devuelven-la-memoria-musical-a-los-pueblos-indigenas-de-bolivia.html
- Killkan repository: https://github.com/ctaguchi/killkan

## Next verification targets

1. Identify Lingua Libre speakers with documented Ecuadorian or Bolivian provenance.
2. Ask AlliKichwa whether any word/phrase recordings may be licensed individually for attribution-based app use.
3. Ask Simi/Laboratorio de Tecnologías Sociales about collaboration, corpus licensing, and community-consent governance.
4. Permission request prepared for Oralidad Modernidad at its stated authorization address; await written item-level approval and confirmation that participant/community consent covers third-party playback.
5. Treat ABNB/CREM recordings as unavailable unless ABNB and the relevant community provide a specific written authorization.


## Outreach status — 2026-09-28

Permission and collaboration requests are prepared for:

- David Tabi / AlliKichwa
- Laboratorio de Tecnologías Sociales / Simi and SimiGPT
- Oralidad Modernidad
- Living Tongues Institute / Living Dictionaries

The approved request text is stored in `docs/permissions/outreach-kit.md`. A speaker permission form and machine-readable audio source manifest schema were also added. No external audio has been ingested.
