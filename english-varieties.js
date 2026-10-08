/* Local editorial adaptations, not independent translation engines. */
const HablaEnglish = (() => {
  const spellings = [["color","colour"],["colors","colours"],["center","centre"],["centers","centres"],["analyze","analyse"],["analyzes","analyses"],["organize","organise"],["organizes","organises"],["organized","organised"],["organizing","organising"],["analyzed","analysed"],["analyzing","analysing"],["organization","organisation"],["organizations","organisations"],["behavior","behaviour"],["behaviors","behaviours"],["labor","labour"],["favorite","favourite"],["favorites","favourites"],["traveling","travelling"],["traveled","travelled"]];
  const vocabulary = [
    {us:"apartment",uk:"flat",label:"Housing: flat / apartment",reason:"The source identifies a home, rather than a floor or a flat surface.",source:s=>/\bapartamentos?\b/.test(s) || (/\bdepartamentos?\b/.test(s) && !/\bdepartamento\s+(?:de|del)\b/.test(s)) || /\b(?:vivo|vive|vivimos|alquilo|alquilar|arriendo|arrendar)\b.{0,35}\bpisos?\b/.test(s) || /\b(?:live|living|rent|rented)\b.{0,35}\b(?:flat|apartment)s?\b/.test(s),guard:(text,index,word)=> !/^\s+(?:tyres?|tires?|surfaces?|rates?|feet|bread|out)\b/i.test(text.slice(index+word.length))},
    {us:"elevator",uk:"lift",label:"Building transport: lift / elevator",reason:"The source identifies an ascensor; lifting a weight is a different sense.",source:s=>/\bascensor(?:es)?\b/.test(s),guard:(text,index,word)=>word.toLowerCase().startsWith("elevator") || /\b(?:the|a|an|this|that|our|their|my|two|three)\s*$/i.test(text.slice(0,index))},
    {us:"vacation",uk:"holiday",label:"Time away: holiday / vacation",reason:"The source says vacaciones. Public holidays are left unchanged.",source:s=>/\bvacaciones\b/.test(s) && !/\b(?:feriado|festivo|navidad|independencia)\b/.test(s)},
    {us:"sidewalk",uk:"pavement",label:"Pedestrian path: pavement / sidewalk",reason:"The source identifies an acera or vereda, rather than a road surface.",source:s=>/\b(?:aceras?|veredas?)\b/.test(s)},
    {us:"gasoline",uk:"petrol",label:"Vehicle fuel: petrol / gasoline",reason:"The source identifies gasolina; gas is not assumed to mean petrol.",source:s=>/\bgasolina\b/.test(s)}
  ];
  function casing(original, replacement) {
    if (original === original.toUpperCase()) return replacement.toUpperCase();
    return original[0] === original[0].toUpperCase() ? replacement[0].toUpperCase()+replacement.slice(1) : replacement;
  }
  function protect(text) {
    const values=[];
    // Preserve quotations, reference strings, code, URLs and capitalised names.
    const pattern=/https?:\/\/[^\s)\]}]+|\b(?:doi\s*:\s*)?10\.\d{4,9}\/[^\s)\]}]+|`[^`]*`|"[^"\n]*"|“[^”]*”|‘[^’]*’|(?<!\w)'[^'\n]+'(?!\w)|\[[\d,;\s–-]+\]|\([^()\n]*\b(?:19|20)\d{2}[a-z]?[^()\n]*\)|\b(?:[A-Z][a-z]+\s+(?:(?:of|for|the|and)\s+)?){1,5}[A-Z][a-z]+\b/g;
    return {text:text.replace(pattern,value=>{values.push(value);return `ZXQVAR${values.length-1}ZXQ`;}),restore:result=>result.replace(/ZXQVAR(\d+)ZXQ/g,(_,index)=>values[Number(index)])};
  }
  const units=text=>text.split(/(?<=[.!?])(?=\s)|(\n+)/).filter(value=>value !== undefined);
  function adapt(text, target, {source="",purpose="everyday"}={}) {
    if (!['en-GB','en-US'].includes(target)) return {text,changes:[]};
    const protectedText=protect(text), parts=units(protectedText.text), sourceParts=units(protect(source).text).filter(part=>part.trim());
    const aligned=parts.filter(part=>part.trim()).length === sourceParts.length;
    const changes=[],seen=new Set();let sourceIndex=0;
    const note=(label,reason,type)=>{if(!seen.has(label)){seen.add(label);changes.push({label,reason,type});}};
    const result=parts.map(part=>{
      if(!part.trim()) return part;
      const context=aligned ? sourceParts[sourceIndex++].normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase() : "";
      let output=part;
      for(const [us,uk] of spellings) {
        const from=target==='en-GB'?us:uk,to=target==='en-GB'?uk:us;
        output=output.replace(new RegExp(`\\b${from}\\b`,'gi'),word=>{note(`${uk} / ${us}`,"Regional spelling preference; the meaning stays the same.","spelling");return casing(word,to);});
      }
      // A UK computer program is still a program. Ambiguous uses remain untouched.
      if(target==='en-GB' && /\b(?:educativo|televisivo|radio|education|television)\b/.test(context) && !/\b(?:software|computer|computadora|codigo|python|java)\b/.test(context+" "+part.toLowerCase())) output=output.replace(/\bprograms?\b/gi,word=>{note("programme / program","An educational or broadcast programme is identified in the source.","vocabulary");return casing(word,word.toLowerCase().endsWith('s')?'programmes':'programme');});
      if(target==='en-US') output=output.replace(/\bprogrammes?\b/gi,word=>{note("programme / program","U.S. spelling for this programme.","spelling");return casing(word,word.toLowerCase().endsWith('s')?'programs':'program');});
      if(purpose !== 'academic' && aligned) for(const rule of vocabulary) {
        if(!rule.source(context)) continue;
        const from=target==='en-GB'?rule.us:rule.uk,to=target==='en-GB'?rule.uk:rule.us;
        output=output.replace(new RegExp(`\\b${from}s?\\b`,'gi'),(word,index,whole)=>{
          if(rule.guard && !rule.guard(whole,index,word)) return word;
          note(rule.label,rule.reason,"vocabulary");
          return casing(word,to+(word.toLowerCase().endsWith('s')?'s':''));
        });
        if (rule.us === "apartment" || rule.us === "elevator") {
          const noun = target === 'en-GB' ? rule.uk : rule.us;
          const article = target === 'en-GB' ? 'a' : 'an';
          const fromArticle = target === 'en-GB' ? 'an' : 'a';
          output = output.replace(new RegExp(`\\b${fromArticle}(?=\\s+${noun}\\b)`, 'gi'), word=>casing(word,article));
        }
      }
      return output;
    }).join('');
    return {text:protectedText.restore(result),changes};
  }
  function differences(uk,us) {
    const a=uk.match(/\s+|[^\s]+/g)||[],b=us.match(/\s+|[^\s]+/g)||[];
    const left=[],right=[];
    // Bound memory for very long pasted/edited texts; preserve all text in grouped ranges.
    if(a.length*b.length>4000000) {
      let start=0,end=0;while(start<a.length&&start<b.length&&a[start]===b[start])start++;
      while(end<a.length-start&&end<b.length-start&&a[a.length-end-1]===b[b.length-end-1])end++;
      const runs=t=>[{text:t.slice(0,start).join(''),changed:false},{text:t.slice(start,t.length-end).join(''),changed:true},{text:end?t.slice(-end).join(''):'',changed:false}];
      return {uk:runs(a),us:runs(b),same:uk===us};
    }
    const width=b.length+1,table=new Uint16Array((a.length+1)*width);
    for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)table[i*width+j]=a[i]===b[j]?table[(i+1)*width+j+1]+1:Math.max(table[(i+1)*width+j],table[i*width+j+1]);
    let i=0,j=0;
    const push=(runs,text,changed)=>{if(runs.at(-1)?.changed===changed)runs.at(-1).text+=text;else runs.push({text,changed});};
    while(i<a.length||j<b.length){
      if(i<a.length&&j<b.length&&a[i]===b[j]){push(left,a[i++],false);push(right,b[j++],false);}
      else if(i<a.length&&(j===b.length||table[(i+1)*width+j]>=table[i*width+j+1]))push(left,a[i++],true);
      else push(right,b[j++],true);
    }
    return {uk:left,us:right,same:uk===us};
  }
  return {adapt,differences};
})();
if(typeof module !== 'undefined' && module.exports) module.exports=HablaEnglish;
