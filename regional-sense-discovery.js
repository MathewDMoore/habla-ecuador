/* Habla regional sense discovery: audited expression groups, not auto-asserted dialects.
 * Exact full speech key avoids comparing unrelated phrases with the same headword.
 * Differences are dictionary-record candidates; never proof of exclusivity or frequency.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 else root.HablaRegionalSenseDiscovery=api;
})(typeof window==="object"?window:globalThis,function(){
 "use strict";
 const normalize=value=>String(value||"").normalize("NFC").trim().toLowerCase()
   .replace(/[¡!¿?]+/g,"").replace(/\s+/g," ");
 const allowedLocale=value=>/^es-[A-Z]{2}$/.test(value);
 const validUrl=value=>typeof value==="string"&&/^https:\/\/[^/\s]+\/\S*/.test(value);
 function discover(records=[]){
   const groups=new Map(),issues=[];
   for(const row of records){
     if(!row||!row.id||!row.speech||!row.us){issues.push({id:row?.id||"unknown",reason:"missing-identifying-fields"});continue;}
     const locales=[...new Set((row.regions||[]).filter(allowedLocale))];
     if(!locales.length || !validUrl(row.url)){
       issues.push({id:row.id,reason:"missing-provenance-or-region"});continue;
     }
     const key=normalize(row.speech);
     const sense={
       id:row.id,display:row.term,expression:row.speech,
       gloss:row.us,ukGloss:row.uk||null,register:row.register||null,
       regionLabels:locales,scope:row.scope||null,
       source:{name:row.sourceName||"Source recorded in Habla vocabulary",url:row.url,
         sourceChecked:row.sourceChecked||null,referenceOnly:true},
       exampleEs:row.exampleEs||null,
       editorialStatus:"review-needed"
     };
     if(!groups.has(key))groups.set(key,[]);
     groups.get(key).push(sense);
   }
   const candidates=[];
   for(const [expression,group] of groups){
     if(group.length<2)continue;
     group.sort((a,b)=>a.id.localeCompare(b.id));
     const distinctGlosses=new Set(group.map(x=>normalize(x.gloss)));
     if(distinctGlosses.size<2)continue;
     const byLocale=new Map();
     for(const sense of group)for(const region of sense.regionLabels){
       if(!byLocale.has(region))byLocale.set(region,new Set());
       byLocale.get(region).add(sense.id);
     }
     const locales=[...byLocale.keys()].sort((a,b)=>a==="es-EC"?-1:b==="es-EC"?1:a.localeCompare(b));
     const differingPairs=[];
     for(let i=0;i<locales.length;i++)for(let j=i+1;j<locales.length;j++){
       const left=locales[i],right=locales[j];
       const leftIds=byLocale.get(left),rightIds=byLocale.get(right);
       const leftOnly=[...leftIds].filter(id=>!rightIds.has(id));
       const rightOnly=[...rightIds].filter(id=>!leftIds.has(id));
       if(leftOnly.length&&rightOnly.length)differingPairs.push({left,right,leftSenseIds:leftOnly,rightSenseIds:rightOnly});
     }
     // Overlapping regional senses are not region-exclusive: keep distinct
     // multi-sense records and flag them for human assessment.
     const kind=differingPairs.length?"regional-sense-candidate":"multi-sense-overlap";
     candidates.push({
       id:"sense-"+expression.replace(/[^\p{L}\p{N}]+/gu,"-"),
       expression,kind,priority:differingPairs.length?(locales.includes("es-EC")?90:75):40,
       regions:locales,senses:group,differingPairs,
       sourceStatus:"curated-dictionary-records-needing-independent-review",
       evidenceLevel:"source-cited-not-freshly-verified",
       lessonProposal:{
         title:"Compare meanings of "+expression,
         objective:differingPairs.length
           ?"Check the region-labeled meanings and teach the contextual difference without an exclusivity claim."
           :"Explain multiple documented senses without assigning an unproven country contrast.",
         type:differingPairs.length?"regional-meaning-comparison":"polysemy-check"
       },
       publishable:false,automaticallyApproved:false,
       warnings:[
         "Region labels are scoped to individual dictionary senses, not frequency or exclusivity.",
         "Overlapping senses can coexist in the same country.",
         "Source pages, registers and example sentences require editorial verification before lessons.",
         "No audio pronunciation or city-level claim is verified."
       ]
     });
   }
   candidates.sort((a,b)=>b.priority-a.priority||a.id.localeCompare(b.id));
   return {schemaVersion:1,method:"same-expression-region-tagged-sense-discovery",
     automaticallyPublished:false,
     counts:{records:records.length,candidates:candidates.length,
       regionalCandidates:candidates.filter(x=>x.kind==="regional-sense-candidate").length,
       overlapCandidates:candidates.filter(x=>x.kind==="multi-sense-overlap").length,
       issues:issues.length},candidates,issues};
 }
 return {discover,normalize};
});
