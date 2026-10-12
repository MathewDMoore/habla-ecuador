# Dictionary recording review — 12 October 2026

Mathew supplied two reference recordings for Habla Ecuador. They show another dictionary, not a Habla capture test. Reviewed the local copies visually: the 01:34 recording lasts 24.47 seconds; the 18:15 recording lasts 171.37 seconds. No claim is made about their audio or that they validate the current speech recognizer.

The first searches `verdga`, with `verga` among the results. The second browses a genitalia category containing neutral anatomy, operations, vulgar vocabulary and jokes. The useful design distinction is literal meaning versus figurative expression versus clinical terminology. The recordings are discovery leads; the app stores original brief editorial glosses linked to independent sources, not a copy of the displayed dictionary or its recordings.

## Implemented in build 91

- Two separate verga headwords: neutral object senses and vulgar anatomy.
- Three expression entries: de la verga, valer/importar verga, ni verga/ni vergas. Mexican evidence is not silently applied to Ecuador; ni verga has a separately scoped Bolivian reading.
- Exclamatory ¡verga! with country and sense distinctions.
- Cojón/cojones with U.S./U.K. options and a clinical register comparison.
- Nine neutral clinical entries: testículo, escroto, uretra, vagina, vulva, labios mayores, labios menores, glande del pene and histerectomía.
- Category filtering; neutral clinical vocabulary remains searchable with vulgarity excluded. Existing device speech controls remain available.

At build 91, the dictionary has 46 entries. A clinical term available under Ecuador or Bolivia is shared clinical Spanish, not a claim about local slang. Added entries do not alter automatic sentence translation, speech recognition, or academic translation rules.

## Remaining discovery leads

| Recording headword or pattern | Next verification |
| --- | --- |
| crotolamo | Treat as a joke/wordplay candidate, not a standard anatomy term; verify origin and register before adding. |
| pene de carne / pene de sangre | Informal grower/shower comparison; regional usage evidence and nonclinical labeling remain pending. |
| clitoral hood, clitoromegalia, corona glandis penis | Verify preferred clinical Spanish and English labels; avoid substituting slang. |
| micropene / micropenis | Check terminology and clinical label; do not add diagnostic thresholds as vocabulary facts. |
| monte de Venus, meato urinario | Check shared anatomy equivalents. |
| falocéntrico, penile, testicular, vaginal, vaginalmente | Keep adjectives and adverbs distinct from the related organ nouns. |
| vaginoplastia, yoni | Verify surgery terminology separately from cultural/religious vocabulary. |
| other verga senses in the recording | Check each construction and country; do not assign every sense to Ecuador or Bolivia. |

## Independent references checked

- [RAE — verga](https://dle.rae.es/verga), [cojón](https://dle.rae.es/coj%C3%B3n).
- [El Colegio de México — verga](https://dem.colmex.mx/Ver/verga).
- [ASALE — verga](https://www.asale.org/damer/verga), [¡verga!](https://www.asale.org/damer/%C2%A1verga%21).
- NIH National Cancer Institute Spanish dictionary: [testículo](https://www.cancer.gov/espanol/publicaciones/diccionarios/diccionario-cancer/def/testiculo), [escroto](https://www.cancer.gov/espanol/publicaciones/diccionarios/diccionario-cancer/def/escroto), [uretra](https://www.cancer.gov/espanol/publicaciones/diccionarios/diccionario-cancer/def/uretra), [vagina](https://www.cancer.gov/espanol/publicaciones/diccionarios/diccionario-cancer/def/vagina), [vulva](https://www.cancer.gov/espanol/publicaciones/diccionarios/diccionario-cancer/def/vulva).
- [American Cancer Society — vulvar anatomy](https://www.cancer.org/es/cancer/tipos/cancer-de-vulva/si-usted-tiene-cancer-de-vulva.html).
- [Clínica Universidad de Navarra — glande](https://www.cun.es/diccionario-medico/terminos/glande).
- [NIH MedlinePlus — histerectomía](https://medlineplus.gov/spanish/hysterectomy.html).

All glosses are editorial vocabulary aids; no source is represented as certifying a full translated passage or a country-specific accent. No native-speaker validation or model training is claimed.

## Follow-up recording — build 92

The 02:03:23 recording (14.13 seconds) shows the actual app: Ecuadorian Spanish → U.S. English, Research selected, on-device status, input `“Me vale verga`, output `“I'm worth a dick`. This establishes a translation error, not a spelling error or music-capture failure.

The exact indifference construction now has a local translation in both purposes. ASALE's [valer](https://www.asale.org/damer/valer) entry explicitly records valerle verga in Ecuador, Bolivia and Mexico. Build 92 handles complete me/te/nos utterances (plus agreeing A mí me), preserves outer quotes and punctuation, and adds one dictionary entry. The reported input is tested through the actual general-translation and rendered-result paths. Negations, longer passages and ambiguous le/les remain outside this rule rather than being guessed. This is a bounded idiom correction, not model training or a general academic translation fix.
