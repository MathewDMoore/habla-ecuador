/* Original Habla micro-lessons, inspired by user-supplied teaching examples.
 * No third-party footage, presenter likeness, recording or transcript is bundled.
 */
(function(root){
'use strict';
const spanish=[
 {id:'solo-patterns',title:'Solo · solo si · solo por · solo con',
  explanation:'Use |solo| to mean “only” or “just” when it limits something. |Solo si| introduces a condition (“only if”). |Solo por| can introduce a reason or the thing someone came for (“just for”). |Solo con| points to a required resource or condition (“only with”). |Solo| also means “alone” as an adjective. In a condition, |si| has no accent. |Sí| with an accent means “yes”. Normally write |solo| without an accent.',
  examples:[['Solo necesito unos minutos.','I only need a few minutes.'],['Salgo contigo solo si deja de llover.','I will go out with you only if it stops raining.'],['Vine solo por la música.','I came just for the music.'],['Solo con paciencia vamos a aprender.','Only with patience are we going to learn.'],['Hoy quiero estar solo.','Today I want to be alone.']],
  situations:[{scene:'Tu amiga pregunta cuánto tiempo necesitas. Solo necesitas unos minutos.',phrase:'Solo necesito unos minutos.',meaning:'I only need a few minutes.'},{scene:'Te invitan a salir, pero afuera está lloviendo. Acepta con una condición.',phrase:'Salgo contigo solo si deja de llover.',meaning:'I will go out with you only if it stops raining.'},{scene:'Fuiste al festival para escuchar música y por ninguna otra razón.',phrase:'Vine solo por la música.',meaning:'I came just for the music.'},{scene:'Explícale a un amigo qué se necesita para aprender algo difícil.',phrase:'Solo con paciencia vamos a aprender.',meaning:'Only with patience are we going to learn.'}],
  checks:[
   {prompt:'_____ necesito unos minutos.',answer:'solo',options:['solo','solo si','solo por','solo con'],note:'Solo limits the amount of time. / Solo limita el tiempo.'},
   {prompt:'Salgo contigo _____ deja de llover.',answer:'solo si',options:['solo','solo si','solo por','solo con'],note:'Solo si introduces a condition. / Solo si introduce una condición.'},
   {prompt:'Vine _____ la música.',answer:'solo por',options:['solo','solo si','solo por','solo con'],note:'Solo por points to the reason for coming. / Solo por expresa el motivo.'},
   {prompt:'_____ paciencia vamos a aprender.',answer:'solo con',options:['solo','solo si','solo por','solo con'],note:'Solo con indicates what is needed. / Solo con indica lo necesario.'}
  ]},
 {id:'already-still',title:'Ya · todavía · todavía no',
  explanation:'Start with the situation: finished, continuing, or not finished yet. In these examples, |ya| marks completion, |todavía| marks something continuing, and |todavía no| means not yet. These words have other uses too.',
  examples:[['Ya terminé.','I already finished.'],['Todavía estoy trabajando.','I am still working.'],['Todavía no he terminado.','I have not finished yet.']],
  situations:[{scene:'A friend asks if you are ready. Your work is finished.',phrase:'Ya terminé.',meaning:'I already finished.'},{scene:'Your friend is ready to leave, but you are continuing to work.',phrase:'Todavía estoy trabajando.',meaning:'I am still working.'},{scene:'Someone asks if you have eaten. You have not eaten yet.',phrase:'Todavía no he comido.',meaning:'I have not eaten yet.'}]},
 {id:'por-para',title:'Por · para: follow the meaning',
  explanation:'For these situations, |para| points to a recipient, destination or purpose. |Por| can give a cause or describe a route through a place. English “for” does not choose the Spanish word for you. This is a starting point for using |por| and |para.|',
  examples:[['Este café es para Ana.','This coffee is for Ana.'],['Voy para Quito.','I am heading to Quito.'],['Estudio para aprender.','I study in order to learn.'],['Gracias por tu ayuda.','Thank you for your help.'],['Camino por el parque.','I walk through the park.']],
  situations:[{scene:'You bought a coffee for Ana. Tell the server who will receive it.',phrase:'Este café es para Ana.',meaning:'This coffee is for Ana.'},{scene:'A friend helped you. Thank them for their help.',phrase:'Gracias por tu ayuda.',meaning:'Thank you for your help.'},{scene:'Describe your route: you walk through the park.',phrase:'Camino por el parque.',meaning:'I walk through the park.'}]},
 {id:'future',title:'Future plans: voy a · comeré',
  explanation:'For a plan, use |voy a| and the basic verb. For example, |voy a comer.| Spanish also has future endings. For example, |comeré.| Both can refer to the future. The choice depends on context. Learn the whole pattern, then change the activity.',
  examples:[['Voy a comer.','I am going to eat.'],['Voy a beber agua.','I am going to drink water.'],['Comeré más tarde.','I will eat later.']],
  situations:[{scene:'You have a plan to eat soon. Tell your friend what you are going to do.',phrase:'Voy a comer.',meaning:'I am going to eat.'},{scene:'You have your water bottle ready. Say you are going to drink water.',phrase:'Voy a beber agua.',meaning:'I am going to drink water.'},{scene:'You are busy now. Say that you will eat later.',phrase:'Comeré más tarde.',meaning:'I will eat later.'}]},
 {
  id:'everyday-comparisons',title:'Mejor, peor, mayor, menor',inspiration:'My Daily Spanish',
  explanation:'Use |mejor| and |peor| to say better and worse. For age, |mayor| can mean older and |menor| can mean younger. When you’re talking about physical size, |más grande| and |más pequeño| are natural choices. Use |que| before the thing or person you’re comparing with.',
  examples:[
   ['El pan de hoy está mejor que el de ayer.','Today’s bread is better than yesterday’s.'],
   ['El tráfico está peor que ayer.','Traffic is worse than it was yesterday.'],
   ['Mi hermana es dos años mayor que yo.','My sister is two years older than me.'],
   ['Mi primo es un año menor que yo.','My cousin is one year younger than me.'],
   ['Esta mochila es más grande que la mía.','This backpack is bigger than mine.'],
   ['Busco una mesa más pequeña.','I’m looking for a smaller table.']
  ],
  situations:[
   {scene:'Your old phone had a bad camera. Tell a friend the new camera is better.',phrase:'La cámara nueva es mejor.',meaning:'The new camera is better.'},
   {scene:'The bus took even longer today. Compare today’s traffic with yesterday’s.',phrase:'El tráfico está peor que ayer.',meaning:'Traffic is worse than it was yesterday.'},
   {scene:'Tell someone your sister is two years older than you.',phrase:'Mi hermana es dos años mayor que yo.',meaning:'My sister is two years older than me.'},
   {scene:'Tell a friend your cousin is one year younger than you.',phrase:'Mi primo es un año menor que yo.',meaning:'My cousin is one year younger than me.'}
  ],
  checks:[
   {prompt:'La cámara nueva toma mejores fotos. Es _____ que la anterior.',answer:'mejor',options:['peor','mejor','mayor','menor'],note:'Mejor compares quality. / Mejor compara la calidad.'},
   {prompt:'Ayer el viaje fue malo. Hoy fue aún _____ (even worse).',answer:'peor',options:['mayor','menor','peor','mejor'],note:'Peor means worse here. / Aquí, peor compara negativamente.'},
   {prompt:'Mi hermana tiene 30 años y yo 28. Ella es _____ que yo.',answer:'mayor',options:['mayor','menor','mejor','peor'],note:'Mayor refers to the older person. / Mayor indica quién tiene más años.'},
   {prompt:'Mi primo tiene 19 años y yo 20. Él es _____ que yo.',answer:'menor',options:['mejor','peor','mayor','menor'],note:'Menor refers to the younger person. / Menor indica quién tiene menos años.'}
  ]
 },
 {
  id:'how-often',title:'¿Con qué frecuencia? · How often?',inspiration:'My Daily Spanish',
  explanation:'In Spanish, |nunca| and |siempre| mark the two ends of the scale. |Rara vez| and |raramente| mean rarely. |Ocasionalmente| means occasionally, and |frecuentemente| means often, like |a menudo.| These expressions describe habits without assigning exact percentages. In a question about experience, |¿alguna vez…?| means “have you ever…?”',
  examples:[
   ['Nunca tomo café por la noche.','I never drink coffee at night.'],
   ['Rara vez salgo los lunes.','I rarely go out on Mondays.'],
   ['A veces voy al mercado a pie.','Sometimes I walk to the market.'],
   ['De vez en cuando cocino con mis amigos.','Every now and then I cook with my friends.'],
   ['A menudo escucho música mientras cocino.','I often listen to music while I cook.'],
   ['Normalmente almuerzo en casa.','I usually eat lunch at home.'],
   ['Casi siempre llego temprano.','I almost always arrive early.'],
   ['Siempre llevo agua.','I always carry water.'],
   ['¿Alguna vez has visitado Cuenca?','Have you ever visited Cuenca?']
  ],
  situations:[
   {scene:'You never drink coffee at night. Tell a friend who offers you a cup.',phrase:'Nunca tomo café por la noche.',meaning:'I never drink coffee at night.'},
   {scene:'You cook with friends every now and then. Describe that habit.',phrase:'De vez en cuando cocino con mis amigos.',meaning:'Every now and then I cook with my friends.'},
   {scene:'Say that you often listen to music while cooking.',phrase:'A menudo escucho música mientras cocino.',meaning:'I often listen to music while I cook.'},
   {scene:'Ask a friend if they have ever been to Cuenca.',phrase:'¿Alguna vez has visitado Cuenca?',meaning:'Have you ever visited Cuenca?'}
  ],
  checks:[
   {prompt:'_____ tomo café por la noche. (Never.)',answer:'Nunca',options:['Siempre','A veces','Nunca','A menudo'],note:'Nunca means never. / Nunca indica que no ocurre en ninguna ocasión.'},
   {prompt:'_____ cocino con mis amigos. (Every now and then.)',answer:'De vez en cuando',options:['De vez en cuando','Nunca','Siempre','Casi siempre'],note:'De vez en cuando describes an occasional habit. / De vez en cuando indica un hábito ocasional.'},
   {prompt:'_____ escucho música mientras cocino. (Often.)',answer:'A menudo',options:['Nunca','A menudo','Siempre','Rara vez'],note:'A menudo means often. / A menudo significa con frecuencia.'},
   {prompt:'¿_____ has visitado Cuenca? (Have you ever…?)',answer:'Alguna vez',options:['Siempre','Normalmente','A menudo','Alguna vez'],note:'Alguna vez asks whether it happened at least once. / Alguna vez pregunta si ocurrió al menos una vez.'}
  ]
 },
 {
  id:'everyday-actions',title:'Acciones de todos los días · Everyday actions',inspiration:'My Daily Spanish',
  explanation:'Learn the verb with what it acts on. You can |levantar pesas, arrastrar| a heavy chair, |subir| or |bajar| the volume, |poner| an alarm and |guardar| your shoes. Practice the whole phrase so the right verb comes to mind in context.',
  examples:[
   ['Levanto pesas los martes.','I lift weights on Tuesdays.'],
   ['Arrastra la silla hasta la pared.','Drag the chair over to the wall.'],
   ['¿Puedes subir un poquito el volumen?','Can you turn the volume up a little?'],
   ['Voy a bajar el volumen para que puedas dormir.','I’ll turn the volume down so you can sleep.'],
   ['Tengo que poner la alarma para las seis.','I have to set the alarm for six.'],
   ['Voy a guardar los zapatos en el clóset.','I’m going to put my shoes away in the closet.']
  ],
  situations:[
   {scene:'You can’t hear the song. Ask a friend to turn it up a little.',phrase:'¿Puedes subir un poquito el volumen?',meaning:'Can you turn the volume up a little?'},
   {scene:'Someone is trying to sleep. Offer to turn the volume down.',phrase:'Voy a bajar el volumen.',meaning:'I’ll turn the volume down.'},
   {scene:'You need to wake up at six. Say what you have to do.',phrase:'Tengo que poner la alarma para las seis.',meaning:'I have to set the alarm for six.'},
   {scene:'Your shoes are by the door. Say where you’ll put them away.',phrase:'Voy a guardar los zapatos en el clóset.',meaning:'I’m going to put my shoes away in the closet.'}
  ],
  checks:[
   {prompt:'No oigo la canción. ¿Puedes _____ el volumen?',answer:'subir',options:['bajar','guardar','subir','poner'],note:'Subir el volumen means turn it up. / Subir el volumen hace que se oiga más fuerte.'},
   {prompt:'El bebé duerme. Voy a _____ el volumen.',answer:'bajar',options:['bajar','subir','guardar','poner'],note:'Bajar el volumen means turn it down. / Bajar el volumen hace que se oiga más bajo.'},
   {prompt:'Tengo que levantarme a las seis. Voy a _____ la alarma.',answer:'poner',options:['guardar','bajar','subir','poner'],note:'Poner la alarma means set the alarm. / Poner la alarma significa programarla.'},
   {prompt:'Voy a _____ los zapatos en el clóset. (Put the shoes away.)',answer:'guardar',options:['subir','guardar','poner','bajar'],note:'Guardar means put away for later. / Guardar es dejar algo en su sitio para usarlo después.'}
  ]
 },
 {
  id:'llevar-traer-tenses',title:'Llevar y traer · Yesterday, today, tomorrow',inspiration:'My Daily Spanish',
  explanation:'In these examples, use |llevar| for taking something to another place and |traer| for bringing it here. For I, practice |llevé, llevo, llevaré| and |traje, traigo, traeré.| The past form |traje| has no written accent. You can usually leave out |yo| when the subject is clear.',
  examples:[
   ['Ayer llevé pan a la reunión.','Yesterday I took bread to the meeting.'],
   ['Hoy llevo fruta al trabajo.','Today I’m taking fruit to work.'],
   ['Mañana llevaré café a la oficina.','Tomorrow I’ll take coffee to the office.'],
   ['Ayer traje pan a casa.','Yesterday I brought bread home.'],
   ['Siempre traigo mis llaves cuando vengo aquí.','I always bring my keys when I come here.'],
   ['Mañana traeré café para todos.','Tomorrow I’ll bring coffee for everyone.']
  ],
  situations:[
   {scene:'You took bread to yesterday’s meeting. Tell a coworker.',phrase:'Ayer llevé pan a la reunión.',meaning:'Yesterday I took bread to the meeting.'},
   {scene:'You’re at home. Say that you brought bread home yesterday.',phrase:'Ayer traje pan a casa.',meaning:'Yesterday I brought bread home.'},
   {scene:'You’re leaving home for work with fruit. Say what you’re taking.',phrase:'Hoy llevo fruta al trabajo.',meaning:'Today I’m taking fruit to work.'},
   {scene:'You’re at the office. Tell your coworkers you’ll bring coffee here tomorrow.',phrase:'Mañana traeré café para todos.',meaning:'Tomorrow I’ll bring coffee for everyone.'}
  ],
  checks:[
   {prompt:'Ayer _____ pan a la reunión. (I took.)',answer:'llevé',options:['llevaré','llevé','traje','traigo'],note:'Llevé is the completed past form of llevo. / Llevé está en pretérito.'},
   {prompt:'Ayer _____ pan a casa. (I brought.)',answer:'traje',options:['llevé','traigo','traeré','traje'],note:'Traje is the completed past form of traigo. / Traje está en pretérito.'},
   {prompt:'Hoy _____ fruta al trabajo. (I’m taking.)',answer:'llevo',options:['llevo','llevé','traeré','traigo'],note:'Llevo is present tense and the fruit goes to work. / Llevo está en presente y la fruta va al trabajo.'},
   {prompt:'Mañana _____ café para todos. (I’ll bring it here.)',answer:'traeré',options:['traje','llevaré','traeré','traigo'],note:'Traeré puts the action in the future. / Traeré está en futuro.'}
  ]
 },
 {
  id:'cooking-actions',title:'En la cocina · Cooking actions',inspiration:'My Daily Spanish',
  explanation:'Describe what you do in order. |Sacar la tabla| means to get the cutting board out. |Pelar| removes the skin, |cortar| cuts something and |picar| usually means to chop it into small pieces. Use |primero, después| and |al final| to connect the steps.',
  examples:[
   ['Primero saco la tabla y el cuchillo.','First I get out the cutting board and the knife.'],
   ['Pelo una zanahoria con el pelador.','I peel a carrot with the peeler.'],
   ['Después pico media cebolla.','Then I chop half an onion.'],
   ['Corto la manzana en rodajas.','I slice the apple.'],
   ['Pico los champiñones para la sopa.','I chop the mushrooms for the soup.'],
   ['Al final, agrego la zanahoria a la sopa.','At the end, I add the carrot to the soup.']
  ],
  situations:[
   {scene:'You’re getting ready to cook. Say what you get out first.',phrase:'Primero saco la tabla y el cuchillo.',meaning:'First I get out the cutting board and the knife.'},
   {scene:'Explain how you remove the skin from a carrot.',phrase:'Pelo una zanahoria con el pelador.',meaning:'I peel a carrot with the peeler.'},
   {scene:'You want apple slices for a snack. Say what you do.',phrase:'Corto la manzana en rodajas.',meaning:'I slice the apple.'},
   {scene:'You’re making soup. Say that you chop the mushrooms.',phrase:'Pico los champiñones para la sopa.',meaning:'I chop the mushrooms for the soup.'}
  ],
  checks:[
   {prompt:'Primero _____ la tabla del cajón. (I get it out.)',answer:'saco',options:['corto','pico','pelo','saco'],note:'Saco means I take out. / Saco indica que la tabla sale del cajón.'},
   {prompt:'_____ la zanahoria con el pelador. (I peel it.)',answer:'Pelo',options:['Pelo','Saco','Pico','Agrego'],note:'Pelar removes the outer layer. / Pelar es quitar la cáscara o la piel.'},
   {prompt:'_____ la manzana en rodajas. (I cut it into slices.)',answer:'Corto',options:['Pelo','Corto','Saco','Agrego'],note:'Cortar en rodajas means to slice. / En rodajas indica la forma de los cortes.'},
   {prompt:'_____ los champiñones. (I chop them into small bits.)',answer:'Pico',options:['Agrego','Saco','Pico','Pelo'],note:'Picar is to chop into small pieces. / Picar es cortar en pedacitos.'}
  ]
  },
  {
   id: 'forms-of-address',
   title: 'Tú · usted · vos',
   explanation: 'All four examples ask “Are you working tomorrow?” Choose a form based on the person and the situation. ' +
    '|Tú| is a familiar form. |Usted| can express courtesy at work or warmth among friends and family, as researchers observed in Azogues. ' +
    'In one study of university students, |vos| could signal closeness among classmates in Cuenca and sound disrespectful among classmates in Quito. ' +
    'Listen for the stress in |trabajas| (tra-BA-jas) and |trabajás| (tra-ba-JÁS). Both patterns occur in Ecuador. ' +
    'In Bolivia, |vos trabajas| illustrates a pattern in the Andes and |vos trabajás| illustrates one in the north and east.',
   examples: [
    ['¿Tú trabajas mañana?', 'Familiar tú · a coworker you already address as tú.'],
    ['¿Usted trabaja mañana?', 'Courteous usted · a supervisor you already address as usted.'],
    ['¿Vos trabajas mañana?', 'Ecuadorian Sierra · vos with the tú verb form.'],
    ['¿Vos trabajás mañana?', 'Ecuadorian Costa · vos with stress on the last syllable of trabajás.']
   ],
   situations: [
    {scene: 'Ask a coworker you already call tú if they’re working tomorrow.', phrase: '¿Tú trabajas mañana?', meaning: 'Are you working tomorrow?'},
    {scene: 'Ask a supervisor you already call usted the same question.', phrase: '¿Usted trabaja mañana?', meaning: 'Are you working tomorrow?'},
    {scene: 'Try a pattern documented in Ecuador’s Sierra. Use vos and put the stress on BA in trabajas.', phrase: '¿Vos trabajas mañana?', meaning: 'Are you working tomorrow?'},
    {scene: 'Try a pattern documented on Ecuador’s coast. Use vos and put the stress on JÁS in trabajás.', phrase: '¿Vos trabajás mañana?', meaning: 'Are you working tomorrow?'}
   ],
   sources: [
    ['Quito and Cuenca study', 'https://repositorio.puce.edu.ec/items/26309eea-55e4-480c-891c-dc262057c153'],
    ['Azogues study', 'https://ebuah.uah.es/xmlui/bitstream/handle/10017/34173/usted_lavender_LIN_2017_15.pdf?isAllowed=y&sequence=1'],
    ['RAE–ASALE on voseo', 'https://www.rae.es/dpd/voseo']
   ]
  }
];
const english=[
 {id:'only-patterns',title:'Only · only if · just for · only with',
  explanation:'La palabra |only| limita una cantidad o una acción. |Only if| introduce una condición, |just for| indica el motivo y |only with| indica lo que hace falta. Fíjate en el orden de las palabras. Por ejemplo, |only with patience can we improve.| En español, estas expresiones suelen corresponder a solo, solo si, solo por y solo con. Traduce el sentido completo.',
  examples:[['I only need a few minutes.','Solo necesito unos minutos.'],['I will join you only if it stops raining.','Te acompaño solo si deja de llover.'],['I came just for the music.','Vine solo por la música.'],['Only with patience can we improve.','Solo con paciencia podemos mejorar.']],
  situations:[{scene:'Solo necesitas unos minutos. Díselo a tu amigo en inglés.',phrase:'I only need a few minutes.',meaning:'Solo necesito unos minutos.'},{scene:'Está lloviendo. Dile a tu amiga que irás con ella únicamente si deja de llover.',phrase:'I will join you only if it stops raining.',meaning:'Te acompaño solo si deja de llover.'},{scene:'Fuiste al festival únicamente por la música. Explícalo en inglés.',phrase:'I came just for the music.',meaning:'Vine solo por la música.'},{scene:'Explica en inglés que la paciencia es necesaria para mejorar.',phrase:'Only with patience can we improve.',meaning:'Solo con paciencia podemos mejorar.'}],
  checks:[
   {prompt:'I _____ need a few minutes.',answer:'only',options:['only','only if','just for','only with'],note:'Only limits how much time is needed. / Only limita el tiempo.'},
   {prompt:'I will join you _____ it stops raining.',answer:'only if',options:['only','only if','just for','only with'],note:'Only if gives a condition. / Only if expresa una condición.'},
   {prompt:'I came _____ the music.',answer:'just for',options:['only','only if','just for','only with'],note:'Just for identifies the reason. / Just for indica el motivo.'},
   {prompt:'_____ patience can we improve.',answer:'only with',options:['only','only if','just for','only with'],note:'Only with introduces what is necessary. / Only with indica lo necesario.'}
  ]},
 {id:'already-still',title:'Already · still · not yet',
  explanation:'Piensa en la situación: algo ya terminó, continúa o todavía no ha ocurrido. |Already| indica que algo ya pasó. |Still| indica que continúa. |Not yet| significa todavía no. Aprende las expresiones completas.',
  examples:[["I've already eaten.",'Ya he comido.'],["I'm still eating.",'Todavía estoy comiendo.'],["I haven't eaten yet.",'Todavía no he comido.']],
  situations:[{scene:'Te ofrecen comida, pero ya comiste. Explica por qué no necesitas comer.',phrase:"I've already eaten.",meaning:'Ya he comido.'},{scene:'Tu amistad quiere salir, pero sigues comiendo. Explica qué pasa.',phrase:"I'm still eating.",meaning:'Todavía estoy comiendo.'},{scene:'Te preguntan si ya comiste. Todavía no lo has hecho.',phrase:"I haven't eaten yet.",meaning:'Todavía no he comido.'}]},
 {id:'purpose',title:'For · to: destinatario y propósito',
  explanation:'Para indicar quién recibe algo, usa |for.| Por ejemplo, |this is for Ana.| Para expresar un propósito con una acción, usa |to| y el verbo. Por ejemplo, |to learn.| No traduzcas cada por o para con la misma palabra. Fíjate en lo que quieres comunicar.',
  examples:[['This coffee is for Ana.','Este café es para Ana.'],['I study to learn English.','Estudio para aprender inglés.'],['Thank you for your help.','Gracias por tu ayuda.']],
  situations:[{scene:'Compraste un café para Ana. Indica quién lo recibirá.',phrase:'This coffee is for Ana.',meaning:'Este café es para Ana.'},{scene:'Explica tu propósito al estudiar: aprender inglés.',phrase:'I study to learn English.',meaning:'Estudio para aprender inglés.'},{scene:'Una amistad te ayudó. Dale las gracias por su ayuda.',phrase:'Thank you for your help.',meaning:'Gracias por tu ayuda.'}]},
 {id:'future',title:'Planes: going to · will',
  explanation:'Para comunicar un plan, practica |I am going to| y un verbo. |Will| también sirve para hablar del futuro, por ejemplo al tomar una decisión en ese momento. Estas formas tienen más usos. Practica el contexto además de la estructura.',
  examples:[["I'm going to eat.",'Voy a comer.'],["I'm going to drink some water.",'Voy a beber agua.'],["I'll have tea, please.",'Tomaré té, por favor.']],
  situations:[{scene:'Ya tienes un plan para comer pronto. Cuenta qué vas a hacer.',phrase:"I'm going to eat.",meaning:'Voy a comer.'},{scene:'Tienes tu botella lista. Di que vas a beber agua.',phrase:"I'm going to drink some water.",meaning:'Voy a beber agua.'},{scene:'Te ofrecen café o té. Decides pedir té en ese momento.',phrase:"I'll have tea, please.",meaning:'Tomaré té, por favor.'}]}
];
const catalog={'es-EC':spanish,'en-US':english,'en-GB':english};
// Text between pairs of | characters is in the language being studied.
function explanationPassages(text,locale,englishLocale){
 const support=locale==='es-EC'?englishLocale:'es-EC';
 return text.split('|').map((text,index)=>({text,lang:index%2?locale:support}));
}
let locale='es-EC',selected={},situation=0,recall=false;
function leave(){const host=document.getElementById('quick-lessons');if(host){root.cancelDictionaryPractice(host);root.stopSpeechPlayback();}}
function setLearningLanguage(next){
 const host=document.getElementById('quick-lessons');if(!host)return;
 next=catalog[next]?next:'es-EC';
 if(host.dataset.learningLanguage===next)return;
 leave();locale=next;situation=0;recall=false;host.dataset.learningLanguage=next;render();
 if(!host.dataset.bound){host.dataset.bound='true';host.addEventListener('toggle',()=>{if(!host.open)leave();});}
}
function render(){
 const host=document.getElementById('quick-lessons'),content=document.getElementById('quick-lessons-content');if(!host||!content)return;
 const items=catalog[locale],item=items.find(i=>i.id===selected[locale])||items[0],cue=item.situations[situation],esc=root.escapeHtml;
 selected[locale]=item.id;
 const support=locale==='es-EC'?'en':'es-EC';
 const explanation=()=>explanationPassages(item.explanation,locale,typeof englishVariant!=='undefined'&&englishVariant==='uk'?'en-GB':'en-US');
 content.innerHTML=`<label>Choose a short lesson<select id="quick-lesson-select">${items.map(i=>`<option value="${i.id}" ${i.id===item.id?'selected':''} data-ui-content>${esc(i.title)}</option>`).join('')}</select></label>
 <p id="quick-explanation" lang="${support}" data-ui-content>${explanation().map(({text,lang},index)=>index%2?`<span lang="${lang}">${esc(text)}</span>`:esc(text)).join('')}</p>
 <button type="button" id="quick-explanation-hear" class="secondary-button">🔊 Hear explanation</button>
 <div class="quick-lesson-examples">${item.examples.map(([phrase,meaning])=>`<div><strong lang="${locale}" data-ui-content>${esc(phrase)}</strong><p lang="${support}" data-ui-content>${esc(meaning)}</p><button type="button" class="secondary-button" data-quick-hear="${esc(phrase)}">🔊 Hear example</button></div>`).join('')}</div>
 <h3>Use it in a situation</h3><p lang="${support}" data-ui-content>${esc(cue.scene)}</p>
 <button type="button" id="quick-recall" class="secondary-button" aria-pressed="${recall}">${recall?'Show me the phrase':'Try without reading'}</button>
 <div id="quick-lesson-model" ${recall?'hidden':''}><article class="expression-card" data-practice-text="${esc(cue.phrase)}" data-practice-lang="${locale}"><p lang="${locale}" data-ui-content><strong>${esc(cue.phrase)}</strong></p><p lang="${support}" data-ui-content>${esc(cue.meaning)}</p></article></div>
 ${item.checks?(()=>{const check=item.checks[situation%item.checks.length];return `<section class="quick-grammar-check" aria-labelledby="quick-grammar-check-title"><h3 id="quick-grammar-check-title">Fill in the blank / Completa la frase</h3><p id="quick-grammar-prompt" lang="${locale}" data-ui-content>${esc(check.prompt)}</p><div id="quick-grammar-choices" role="group" aria-label="Choose the missing expression / Elige la expresión que falta">${check.options.map(choice=>`<button type="button" class="quick-grammar-choice" data-quick-answer="${esc(choice)}" aria-pressed="false" lang="${locale}">${esc(choice)}</button>`).join('')}</div><p id="quick-grammar-feedback" role="status" aria-live="polite"></p></section>`;})():''}
 <p>Different replies can work. Speaking feedback below compares recognized words with this model; it does not judge whether another reply communicates your meaning.</p>
 <button type="button" id="quick-next" class="primary-button">Try another situation →</button>
 <p>Original Habla lesson · device voices</p>
  ${item.sources ? `<p class="quick-lesson-sources">${item.sources.map(([title, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-ui-content>${esc(title)}</a>`).join(' · ')}</p>` : ''}
 ${item.inspiration?`<p>Inspired by ${esc(item.inspiration)}.</p>`:''}`;
 content.querySelector('#quick-lesson-select').addEventListener('change',event=>{leave();selected[locale]=event.target.value;situation=0;recall=false;render();});
 content.querySelector('#quick-explanation-hear').addEventListener('click',event=>{root.cancelDictionaryPractice();root.say(explanation(),undefined,event.currentTarget);});
 content.querySelectorAll('[data-quick-hear]').forEach(button=>button.addEventListener('click',()=>{root.cancelDictionaryPractice();root.say(button.dataset.quickHear,locale,button);}));
 content.querySelector('#quick-recall').addEventListener('click',()=>{
  leave();recall=!recall;
  content.querySelector('#quick-lesson-model').hidden=recall;
  content.querySelector('.quick-lesson-examples').hidden=recall;
  const button=content.querySelector('#quick-recall');button.setAttribute('aria-pressed',String(recall));button.textContent=recall?'Show me the phrase':'Try without reading';
 });
 if(item.checks){
  const check=item.checks[situation%item.checks.length],feedback=content.querySelector('#quick-grammar-feedback');
  content.querySelectorAll('[data-quick-answer]').forEach(button=>button.addEventListener('click',()=>{
   const correct=button.dataset.quickAnswer===check.answer;
   content.querySelectorAll('[data-quick-answer]').forEach(choice=>{choice.setAttribute('aria-pressed',String(choice===button));choice.classList.toggle('is-correct',correct&&choice===button);choice.classList.toggle('is-incorrect',!correct&&choice===button);});
   feedback.dataset.correct=String(correct);
   feedback.textContent=correct?'✓ Correct / ¡Correcto! '+check.note:'Try again / Inténtalo de nuevo. Revisa el significado de cada expresión.';
  }));
 }
 content.querySelector('#quick-next').addEventListener('click',()=>{leave();situation=(situation+1)%item.situations.length;render();});
 root.bindDictionaryPractice(host);content.querySelector('.dictionary-practice').open=true;
 content.querySelector('.quick-lesson-examples').hidden=recall;
}
const api={catalog,setLearningLanguage,leave,isProtected:()=>Boolean(document.getElementById('quick-lessons')?.open&&document.getElementById('quick-lessons')?.closest('.view')?.classList.contains('active'))};
if(typeof module==='object'&&module.exports)module.exports=api;else root.HablaQuickLessons=api;
})(typeof window==='object'?window:globalThis);
