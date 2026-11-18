/* Read-only regional lesson evaluation queue.
 * Displays evidence-linked draft proposals, NEVER converts them to teaching
 * content, records learner speech, or asserts unverified city/voice claims.
 */
(function(root){
 "use strict";
 const q=id=>root.document.getElementById(id);
 async function render(){
   const host=q("regional-evaluation-results"),status=q("regional-evaluation-status");
   if(!host || !status)return;
   status.textContent="Loading draft comparisons / Cargando comparaciones en revisión…";
   try{
     const response=await root.fetch("./data/regional-lesson-proposals-v1.json",{cache:"no-store"});
     if(!response.ok)throw Error("review data unavailable");
     const report=await response.json();
     if(report.schemaVersion!==1 || !Array.isArray(report.candidates))throw Error("review data invalid");
     host.replaceChildren();
     for(const proposal of report.candidates){
       if(!proposal || !proposal.evidence?.primary?.url?.startsWith("https://"))continue;
       const article=root.document.createElement("article");article.className="expression-card";
       const title=root.document.createElement("h3");
       title.textContent=proposal.headword+" · "+proposal.lesson.type.replaceAll("-"," ");
       const ec=root.document.createElement("p");
       ec.textContent="🇪🇨 Ecuador: "+proposal.lesson.ecuadorMeaning;
       const bo=root.document.createElement("p");
       bo.textContent="🇧🇴 Bolivia: "+proposal.lesson.boliviaMeaning;
       const note=root.document.createElement("p");
       note.textContent=proposal.lesson.learnerAlert;
       const statusLabel=root.document.createElement("p");
       statusLabel.textContent="Review: "+proposal.status+" · Source: "+proposal.sourceStatus;
       const link=root.document.createElement("a");
       link.href=proposal.evidence.primary.url;
       link.target="_blank";link.rel="noopener noreferrer";
       link.textContent="Inspect dictionary evidence / Ver fuente";
       article.append(title,ec,bo,note,statusLabel,link);
       host.append(article);
     }
     status.textContent="Research review queue: "+report.counts.candidates+" candidates. Nothing here is a published or verified local lesson.";
   }catch(error){
     status.textContent="Review queue unavailable offline or not loaded. Existing lessons are unaffected.";
   }
 }
 function bind(){
  const panel=q("regional-evaluation-queue");
  if(!panel || panel.dataset.bound==="true")return;
  panel.dataset.bound="true";
  panel.addEventListener("toggle",()=>{if(panel.open)render();});
 }
 if(typeof module==="object"&&module.exports)module.exports={bind};
 else root.document.addEventListener("DOMContentLoaded",bind);
})(typeof window==="object"?window:globalThis);
