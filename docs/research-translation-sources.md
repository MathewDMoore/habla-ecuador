# Habla Ecuador — bilingual research translation sources

_Last reviewed: 2026-10-05_

## Purpose

This registry identifies English–Spanish scientific material that can strengthen Habla Ecuador's **Research** translator without assuming that “free to read” means “permitted for model training.”

For the current GitHub Pages prototype, the safest and most useful first implementation is:

1. bilingual terminology and translation memory;
2. retrieval of approved examples;
3. automated quality checks and evaluation;
4. only then, optional offline model training if the dataset license expressly permits it.

Large source corpora must **not** be committed to this repository. They should be fetched by a reproducible build script into ignored local/cache storage. This preserves the owner's GitHub Free space.

## License status key

- **APPROVED** — a source page provides a reusable license suitable for the stated use, subject to attribution.
- **FILTER REQUIRED** — the collection is reusable only after checking each item's license.
- **HOLD** — useful, but do not ingest until the missing or ambiguous corpus-level permission is resolved.
- **EVALUATION ONLY** — keep out of training; use only if its terms permit benchmarking.

## Source registry

### 1. SciELO full-text scientific parallel corpus — APPROVED

- Languages: English, Spanish, Portuguese
- Content: aligned full-text scientific articles collected from SciELO
- Use: research translation memory, supervised examples, terminology extraction, evaluation split
- Dataset record: https://figshare.com/articles/dataset/A_Large_Parallel_Corpus_of_Full-Text_Scientific_Articles/5382757
- License shown on dataset record: **CC BY 4.0**
- Size shown on record: approximately 965 MB
- Required handling:
  - preserve dataset and article attribution;
  - record dataset version and DOI;
  - keep a permanent held-out test set;
  - run alignment and language-quality checks before use;
  - do not store the archive in GitHub.

This is the best first corpus because it is genuinely scientific, contains Spanish–English parallel full text, and has an explicit reusable dataset license.

### 2. SciELO biomedical titles and abstracts corpus — HOLD pending corpus-license confirmation

- Languages: English–Spanish, English–Portuguese, English–French
- Content: about 95,000 Spanish/English biomedical document pairs; titles and abstracts
- Repository: https://github.com/biomedical-translation-corpora/scielo
- Paper: https://aclanthology.org/L16-1470/
- Value: strong biomedical register; the authors report at least 79% correct sentence alignment in a 200-document manual review
- Problem: the repository page does not show an explicit corpus-level license. The paper's license does not automatically license the underlying dataset.
- Decision: do not train on it until the corpus license is confirmed or each source article is license-filtered.

### 3. SciELO Network articles — FILTER REQUIRED

- Source policy: https://www.scielo.org/en/about-scielo/open-access-statement/
- Format: structured JATS-style XML plus article metadata
- Policy: CC BY became the standard SciELO indexing license in 2015; journals indexed before 2015 may retain earlier licenses.
- Use:
  - admit only articles with a machine-readable license accepted by our policy;
  - prefer exact bilingual versions of the same article;
  - retain DOI, authors, journal, year, language, license URL, and source URL for attribution.
- Safe default: allow **CC0** and **CC BY**. Quarantine all missing, custom, NC, SA, or ND licenses until specifically reviewed.

### 4. PubMed Central Open Access Subset — FILTER REQUIRED

- Source: https://pmc.ncbi.nlm.nih.gov/tools/openftlist/
- Content: machine-readable biomedical and life-sciences full text
- Retrieval: use only PMC Cloud, OAI-PMH, E-Utilities, or BioC APIs, as NLM requires
- License rule: terms vary article by article
- Use:
  - download only through an approved PMC interface;
  - admit only machine-readable **CC0** or **CC BY** items at first;
  - retain PMCID, DOI, license code/URL, publication metadata, and attribution;
  - find English–Spanish pairs only when they are demonstrably versions of the same work.

PMC is an excellent source of domain language and evaluation material, but the license filter is mandatory.

### 5. AGROVOC — APPROVED for bilingual terminology

- Source: https://www.fao.org/agrovoc/index.php/maintenance
- Download/API information: https://www.fao.org/agrovoc/index.php/access
- Languages include English and Spanish
- License for FAO-language content: **CC BY 4.0**
- Use: bilingual concepts, preferred terms, synonyms, broader/narrower concepts, and agriculture/food/environment terminology
- Required attribution: FAO / AGROVOC, license link, and an indication of changes

AGROVOC should feed a terminology layer, not act as prose training by itself.

### 6. EuroSciVoc — APPROVED for research-domain classification; verify asset notice before redistribution

- Source: https://op.europa.eu/en/web/eu-vocabularies/euroscivoc
- CORDIS explanation: https://cordis.europa.eu/about/euroscivoc
- Languages: English, Spanish, French, German, Italian, Polish
- Content: more than 1,000 science-field categories plus research keywords
- Format: SKOS in RDF/XML and Turtle
- Use:
  - identify a passage's discipline;
  - select discipline-specific terminology;
  - tag evaluation sets;
  - avoid translating one scientific term differently across a document.

The source explicitly publishes the taxonomy in open semantic formats for reuse. Capture the exact asset-level reuse notice with each downloaded release before redistributing a copy.

### 7. CORDIS project data — HOLD for text training; useful metadata/taxonomy now

- Services: https://cordis.europa.eu/about/services
- Data tools: https://cordis.europa.eu/about/dataextractions
- Content: EU research project titles, descriptions, results, classifications, and links to publications in multiple languages
- Availability: free, open, machine-readable formats, subject to copyright conditions
- Decision:
  - use EuroSciVoc and clearly reusable metadata now;
  - do not treat all project prose as training data until the applicable CORDIS/EU reuse notice is stored with the extraction.

### 8. MeSpEn biomedical corpora — HOLD

- Record: https://zenodo.org/records/3562536
- Content: English–Spanish health and biomedical corpora aggregated from IBECS, SciELO, PubMed, and MedlinePlus
- Intended purpose stated by the creators: training and evaluation of Spanish↔English medical machine translation
- Problem: the Zenodo record currently shows a Rights/License heading without a visible license value, and the component sources have different terms.
- Decision: do not ingest the bundle. Individual components may be admitted later only after their own licenses are checked.

### 9. WHO bilingual material — FILTER REQUIRED

- Open-access policy: https://www.who.int/about/policies/publishing/open-access
- WHO publishes multilingual technical material, including English and Spanish.
- License treatment varies by item; some material is CC BY 3.0 IGO, while other resources use NC, SA, or ND conditions.
- Use:
  - admit only matched English/Spanish items with an explicit compatible license;
  - keep the IGO license and attribution with every record;
  - exclude **NoDerivatives (ND)** material from training or adaptation;
  - never imply WHO endorsement.

### 10. Ecuadorian university research — per-item filtering; three papers integrated

USFQ's ACI Avances en Ciencias e Ingenierías publishes scientific material in Spanish and English. Check each article and version: its current journal policy does not establish the license of every older paper or HTML/PDF version.

- **Integrated:** Sellers and Espinoza (2017), Cuenca air-quality monitoring, DOI `10.18272/aci.v9i15.300`. The article's copyright notice links **CC BY 3.0**; its older footer links CC BY 4.0. Both permit attribution-based adaptation. Retain the article-specific CC BY 3.0 notice.
- Published Spanish and English abstract text: https://revistas.usfq.edu.ec/index.php/avances/en/article/download/300/2521/13087
- License evidence: https://revistas.usfq.edu.ec/index.php/avances/article/view/300
- Only two nonconsecutive abstract sentences are included, alongside their published English and separate editorial English. They are labeled as an excerpt, not the complete abstract. Regional context is Cuenca, Ecuador; scientific register is preserved. No slang is injected, and buen vivir remains visible rather than being reduced to a causal health claim.
- The sample powers **local translation memory** in Research mode. It is not model fine-tuning and is not held out for unbiased evaluation. Changed facts or unmatched passages cannot retrieve its remembered output.
- Source, authors, title, DOI, license, attribution, modifications, review status, and the source-excerpt SHA-256 are stored in `data/research-source-manifest.json`. Subject-expert review of the editorial English is pending.
- **Quarantined:** ACI article 3736 (2026), ethylene production in Ecuador. Its landing page says CC BY-NC 4.0 while its HTML version says CC BY 4.0. No article text was ingested; the manifest records this disagreement. Other ACI articles need the same item-level check.

This small sample adds no external service, paid translation API, downloaded corpus, or copied version archive. A later corpus intake must follow the gate below and keep large downloads outside GitHub.

## Proposed ingestion gate

Every candidate record must have all of these fields before entering the usable corpus:

```json
{
  "source_id": "",
  "source_url": "",
  "title": "",
  "authors": [],
  "year": null,
  "domain": "",
  "source_language": "es",
  "target_language": "en",
  "license_code": "",
  "license_url": "",
  "attribution": "",
  "parallel_status": "exact|aligned|comparable",
  "alignment_score": null,
  "review_status": "approved|quarantined|rejected"
}
```

Reject or quarantine records when:

- the license is absent or ambiguous;
- the source and target are not versions of the same work;
- machine alignment is weak;
- references, units, chemical names, statistics, or negation do not match;
- OCR is corrupted;
- tables or equations are flattened incorrectly;
- personally identifying or confidential material appears;
- the Spanish is machine-generated rather than an authoritative translation.

## Quality plan

Habla Ecuador's Research mode should be judged separately from everyday conversation.

For each discipline:

1. preserve citations, section headings, equations, numbers, units, abbreviations, and named entities;
2. detect and lock accepted terminology before sentence translation;
3. produce faithful academic English or Spanish before any regional adaptation;
4. show alternatives only when meaning is genuinely ambiguous;
5. back-translate a sample for error detection, not as proof of correctness;
6. evaluate with native-language subject specialists when possible;
7. keep a permanent benchmark set that is never used for training.

Automatic metrics can compare candidate systems, but human review must assess terminology, omissions, false additions, negation, register, and scientific meaning.

## Ecuadorian-first scope

Scientific translation should remain faithful to international academic register. Ecuadorian identity should appear in:

- selectable Ecuadorian Spanish spelling, examples, UI, and speech;
- Ecuador-relevant subject vocabulary and locally published research;
- explanations of terms for Ecuadorian learners;
- carefully sourced Ecuadorian institutional terminology.

It should **not** inject slang or conversational regionalisms into an academic paper.

## Immediate implementation order

1. Build a small CC BY 4.0 SciELO sample outside GitHub.
2. Add AGROVOC English–Spanish terminology lookup.
3. Add EuroSciVoc discipline detection.
4. Create a locked evaluation set from unseen, license-approved article pairs.
5. Compare the current free translation engine against the reference set.
6. Add terminology constraints and structure preservation to Research mode.
7. Only consider model fine-tuning after quality gains from translation memory and terminology have been measured.

### Build 55: two more Ecuadorian references

- **Sangay freshwater biodiversity:** Fernando Anaguano-Yancha (2017), DOI `10.18272/aci.v9i15.294`. Source: https://revistas.usfq.edu.ec/index.php/avances/en/article/download/294/2468 ; license evidence: https://revistas.usfq.edu.ec/index.php/avances/en/article/view/294 . Two selected abstract sentences retain the 599 individuals, 16 species, six families and the reported abundance trend.
- **Morona Santiago mammal biodiversity:** Javier Fernández de Córdova, Carlos Nivelo-Villavicencio and Pedro X. Astudillo (2017), DOI `10.18272/aci.v9i15.770`. Source: https://revistas.usfq.edu.ec/index.php/avances/en/article/download/770/2471 ; license evidence: https://revistas.usfq.edu.ec/index.php/avances/en/article/view/770 . Two selected sentences retain the collection year (1998), Limón-Indanza locality, museum identity and donation year (2016).
- Both item-specific copyright notices link **CC BY 3.0**. The current journal-wide footer links **CC BY-NC 4.0**; the recorded basis for these 2017 works is the item-specific grant. Creative Commons explains that an existing CC BY grant cannot be revoked while its terms are followed: https://creativecommons.org/licenses/by/3.0/ . Newer ACI items still need independent review.
- Research mode now offers a paper selector. There are **three Ecuadorian papers and six sentence pairs**, with exact local retrieval, editable editorial English and source credit. Published English remains separately recorded. Changed claims and mixed-paper input fall back to the general engine.
- Scope remains an attributed translation memory; it does not train MyMemory or establish broad research-translation accuracy. No corpus archive or raw article files are committed to GitHub.

Additional discovery: the University of Cuenca's Maskana license policy records CC BY 4.0 for 2017–July 2023, with NC/SA terms in other periods (https://publicaciones.ucuenca.edu.ec/ojs/index.php/maskana/ethics). ESPOCH Perfiles item pages currently show CC BY-NC 4.0. These are research leads requiring per-item review, not automatic admissions to the memory.
