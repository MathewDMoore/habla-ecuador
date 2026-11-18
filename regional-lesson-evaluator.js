/* Habla Ecuador regional evidence evaluator, deterministic and offline.
 * Produces review candidates, never publishes translations or trains TTS.
 * A source URL is a reference, NOT proof that an external site was rechecked.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==="object" && module.exports)module.exports=api;
  else root.HablaRegionalEvaluation=api;
})(typeof window==="object"?window:globalThis,function(){
  "use strict";
  const RELATION={
    "meaning-contrast":{priority:95,kind:"different-meanings"},
    "shared-core-different-extensions":{priority:80,kind:"shared-with-extensions"},
    "shared-with-frequency-range-difference":{priority:70,kind:"register-or-range"},
    "related-senses":{priority:65,kind:"related-different-senses"},
    "shared":{priority:55,kind:"shared-not-exclusive"},
    "comparison-pending":{priority:20,kind:"evidence-gap"}
  };
  const norm=value=>String(value||"").normalize("NFKC").trim();
  const safeUrl=value=>{
    try{const u=new URL(value);return u.protocol==="https:"?u.href:null;}
    catch{return null;}
  };
  function evaluate({comparisons=[],entries=[],sources=[],checks=[]}={}){
    const index=new Map(entries.filter(x=>x&&x.id).map(x=>[x.id,x]));
    const sourceIndex=new Map(sources.filter(x=>x&&x.id).map(x=>[x.id,x]));
    const checkIndex=new Map(checks.filter(x=>x&&x.entryId).map(x=>[x.entryId,x]));
    const seen=new Set(),candidates=[],issues=[];
    for(const row of comparisons){
      if(!row || !row.entryId){issues.push({id:"unknown",reason:"missing-entry-id"});continue;}
      if(seen.has(row.entryId)){issues.push({id:row.entryId,reason:"duplicate-comparison"});continue;}
      seen.add(row.entryId);
      const entry=index.get(row.entryId);
      const relation=RELATION[row.relationship];
      if(!entry){issues.push({id:row.entryId,reason:"missing-learner-entry"});continue;}
      if(!relation){issues.push({id:row.entryId,reason:"unrecognized-relationship"});continue;}
      const url=safeUrl(row.sourceUrl);
      if(!url){issues.push({id:row.entryId,reason:"source-url-missing-or-untrusted"});continue;}
      const bibliographic=(entry.sources||[]).map(id=>sourceIndex.get(id)).filter(Boolean).map(src=>({
        id:src.id,name:src.name,url:safeUrl(src.url),referenceOnly:true
      }));
      const check=checkIndex.get(row.entryId);
      const externallyReviewed=Boolean(check && check.reviewed===true && check.sourceUrl===row.sourceUrl &&
        check.evidenceKind==="dictionary-entry" && /^\d{4}-\d{2}-\d{2}$/.test(check.reviewDate||""));
      const evidenceStatus=externallyReviewed?"source-page-reviewed":"reference-link-awaits-review";
      const pending=row.relationship==="comparison-pending";
      const contrast=norm(row.ecuador),bolivia=norm(row.bolivia);
      if(!contrast||!bolivia){issues.push({id:row.entryId,reason:"missing-contrast-text"});continue;}
      const linked=entry.comparisons?.some(comp=>comp.country==="Bolivia")||false;
      // No automatic acceptance: even a dictionary review does not establish frequency,
      // city-level usage, native pronunciation, or real-world lesson effectiveness.
      const warnings=[
        "Dictionary attestation does not establish usage frequency or exclusivity.",
        "No phoneme, audio or native-speaker verification was performed.",
        "Human editorial approval is required before publishing."
      ];
      if(!linked)warnings.push("Learner entry has no direct Bolivia comparison: check the alignment.");
      if(pending)warnings.push("Lack of evidence is not evidence of non-use in Bolivia.");
      if(!externallyReviewed)warnings.push("The source link must be independently rechecked.");
      const kind=relation.kind;
      const lessonType=pending?"research-queue":kind==="shared-not-exclusive"?"shared-vocabulary":kind==="different-meanings"?"meaning-contrast":"semantic-range";
      const objective=pending
        ? "Find a documented Bolivian sense before teaching a country comparison."
        : kind==="shared-not-exclusive"
          ? "Explain documented overlapping meanings without claiming Ecuadorian exclusivity."
          : "Compare the documented Ecuadorian and Bolivian senses without generalizing beyond cited regions.";
      candidates.push({
        id:"ec-bo-"+row.entryId,entryId:row.entryId,headword:norm(entry.spanish),
        locales:["es-EC","es-BO"],differenceKind:kind,relationship:row.relationship,
        priority:relation.priority,sourceStatus:evidenceStatus,
        status:pending?"needs-evidence":"editorial-review-required",
        publishable:false,automaticallyApproved:false,
        lesson:{type:lessonType,level:entry.level||"ungraded",objective,
          ecuadorMeaning:contrast,boliviaMeaning:bolivia,
          learnerAlert:norm(row.learnerAlert),exampleEs:norm(entry.exampleEs),
          exampleUs:norm(entry.exampleUs),exampleUk:norm(entry.exampleUk),
          // Examples belong to the original Ecuador learning entry, not Bolivia.
          exampleScope:"Existing Ecuador example; never re-label as Bolivian."},
        evidence:{primary:{url,source:"ASALE (link supplied by curated comparison table)",
          verification:evidenceStatus,regions:["es-EC","es-BO"]},
          bibliography:bibliographic,review:externallyReviewed?{
            reviewedOn:check.reviewDate,note:check.note||"Dictionary page reviewed."
          }:null},
        warnings
      });
    }
    // Stable order and no mutation: suitable for deterministic CI artifacts.
    candidates.sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
    return {schemaVersion:1,scope:"Ecuador–Bolivia lexical/sense comparisons",
      method:"deterministic-curated-evidence-evaluation",automaticPublication:false,
      counts:{candidates:candidates.length,reviewedSources:candidates.filter(x=>x.sourceStatus==="source-page-reviewed").length,
        evidenceGaps:candidates.filter(x=>x.status==="needs-evidence").length,issues:issues.length},
      candidates,issues};
  }
  return {evaluate,RELATION};
});
