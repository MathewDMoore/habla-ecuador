/*
 * Work and friends: a script-based practice adaptation by Habla Ecuador.
 * Text source: Radialistas Apasionadas y Apasionados, "Camellar es lo primero",
 * from the series co-produced with Catholic Relief Services (CRS).
 * https://radialistas.net/capitulo-2-camellar-es-lo-primero/
 * This lesson data, including translations and learning notes, is distributed
 * under CC BY-SA 3.0 ES: https://creativecommons.org/licenses/by-sa/3.0/es/
 * Changes: short excerpts selected, one line shortened, English translations,
 * stress cues and guided-practice structure added. No source audio included.
 */
(function(root) {
  const lesson = {
    id:"work-and-friends", title:"Work & friends", locale:"es-EC",
    description:"Four short phrases from a radio story set in Ecuador, with Colombian and Ecuadorian characters.",
    source:{
      title:"Camellar es lo primero", url:"https://radialistas.net/capitulo-2-camellar-es-lo-primero/",
      seriesUrl:"https://radialistas.net/serie-kiubo-nano-vamos-pa-lante/",
      credit:"Radialistas Apasionadas y Apasionados; series co-produced with Catholic Relief Services (CRS).",
      license:"CC BY-SA 3.0 ES", licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/es/",
      checkedOn:"2026-10-23", pronunciationSource:"https://www.rae.es/dpd/tilde",
      limits:"Based on the published script. Actors' origins, recorded accents and audio timing have not been verified. The story's setting does not establish every speaker's regional pronunciation.",
      changes:"Short excerpts selected, one line shortened, English meanings and learning notes added by Habla Ecuador. This lesson data is shared under the source's license."
    },
    items:[
      {id:"find-work",title:"Looking for work",spanish:"Quiero camellar.",us:"I want to work.",uk:"I want to work.",
       locale:"es-CO",role:"Ángela · a Colombian character in the script",adapted:false,
       register:"Informal · work context",context:"Here the verb refers to working. This line does not establish an exclusively Ecuadorian expression.",
       coaching:"Stress the final syllable: ca-me-LLAR. Hear the model, repeat the last word, then say the whole phrase."},
      {id:"job-sign",title:"Reading a job sign",spanish:"Se busca mesera.",us:"Waitress wanted.",uk:"Waitress wanted.",
       locale:"es-CO",role:"A job sign quoted by the Colombian character",adapted:false,
       register:"Everyday · job advertisement",context:"The sign refers to a female server. It is a phrase quoted inside the dialogue, not a recording of the sign's author.",
       coaching:"Keep the middle syllable strong: me-SE-ra. Practise the last word, then join it smoothly to the first two words."},
      {id:"polite-wait",title:"A polite request to wait",spanish:"Espere un ratito ahí, por favor.",us:"Please wait there a moment.",uk:"Please wait there a moment.",
       locale:"es-EC",role:"A server in the Ecuador-set scene · actor origin unverified",adapted:false,
       register:"Polite · usted form",context:"The opening verb is a polite request to one person. The diminutive makes the wait sound brief.",
       coaching:"Stress the middle syllable in ra-TI-to. Take a short pause at the comma, then finish the polite request."},
      {id:"friendly-introduction",title:"Talking about a friend",spanish:"Tengo un pana bien bacán.",us:"I've got a really cool friend.",uk:"I've got a really cool mate.",
       locale:"es-EC",role:"Cangrejo's dialogue in the Ecuador-set scene · actor origin unverified",adapted:true,
       register:"Informal · friendly",context:"This practice line shortens a longer introduction. It describes a friend positively; it is not a universal translation for every context.",
       coaching:"Stress the final syllable in ba-CÁN. Practise the final two words together, then return to the full phrase."}
    ]
  };
  if (typeof module === "object" && module.exports) module.exports = lesson;
  else root.HablaRegionalPractice = lesson;
})(typeof window === "object" ? window : globalThis);
