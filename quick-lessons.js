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
   id: 'ordering-at-a-cafe',
   title: 'En un café · Ordering',
   inspiration: 'My Daily Spanish',
   explanation: 'In an Ecuadorian café, try |¿Me da…?| to order for yourself or |¿Nos trae…?| to ask for something for the table. ' +
    'Say |un poquito de leche| for a splash of milk. The |ñ| in |caña| sounds like the middle of “canyon.” ' +
    'In Spain, |una caña| can order a small beer on tap. In Ecuador, ask for |una cerveza de barril| if you want beer on tap.',
   examples: [
    ['¿Me da un café con un poquito de leche, por favor?', 'Could I have a coffee with a splash of milk, please?'],
    ['¿Nos trae un poco más de pan, por favor?', 'Could you bring us a bit more bread, please?'],
    ['Para mí, una cerveza de barril, por favor.', 'I’ll have a beer on tap, please.'],
    ['¿Me pone una caña, por favor?', 'Could I have a small glass of beer on tap, please?', 'es-ES']
   ],
   situations: [
    {scene: 'You’re at a café in Quito. Order a coffee with a splash of milk.',
     phrase: '¿Me da un café con un poquito de leche, por favor?', meaning: 'Could I have a coffee with a splash of milk, please?'},
    {scene: 'You’re sharing bread with a friend. Ask the server to bring you both a bit more.',
     phrase: '¿Nos trae un poco más de pan, por favor?', meaning: 'Could you bring us a bit more bread, please?'},
    {scene: 'The server in Ecuador asks what you’ll have. Order a beer on tap.',
     phrase: 'Para mí, una cerveza de barril, por favor.', meaning: 'I’ll have a beer on tap, please.'},
    {scene: 'You’re at a bar in Spain. Use caña to order a small glass of beer on tap.',
     phrase: '¿Me pone una caña, por favor?', meaning: 'Could I have a small glass of beer on tap, please?', locale: 'es-ES'}
   ],
   sources: [['RAE–ASALE · caña', 'https://dle.rae.es/ca%C3%B1a']]
  },
  {
   id: 'pie-expressions',
   title: 'Pie · a pie · de pie · en pie',
   inspiration: 'Spanish in my Pocket',
   explanation: 'Say |pie| in one syllable. |El pie| is your foot, and |ir a pie| means to walk somewhere. ' +
    'A person can |estar de pie| or |estar en pie| when standing. A bridge that |sigue en pie| is still standing. ' +
    'A meeting that |sigue en pie| is still on.',
   examples: [
    ['Me duele el pie izquierdo.', 'My left foot hurts.'],
    ['Voy al mercado a pie.', 'I walk to the market.'],
    ['Estoy de pie junto a la ventana.', 'I’m standing by the window.'],
    ['La reunión sigue en pie.', 'The meeting is still on.']
   ],
   situations: [
    {scene: 'You stepped on a stone. Say your left foot hurts.', phrase: 'Me duele el pie izquierdo.', meaning: 'My left foot hurts.'},
    {scene: 'The market is nearby. Say you walk there.', phrase: 'Voy al mercado a pie.', meaning: 'I walk to the market.'},
    {scene: 'Your friend is looking for you. Say you’re standing by the window.', phrase: 'Estoy de pie junto a la ventana.', meaning: 'I’m standing by the window.'},
    {scene: 'Someone asks if the meeting was canceled. Say it’s still on.', phrase: 'La reunión sigue en pie.', meaning: 'The meeting is still on.'}
   ],
   checks: [
    {prompt: 'Me duele _____ izquierdo. (My left foot hurts.)', answer: 'el pie', options: ['a pie', 'el pie', 'en pie', 'de pie'],
     note: 'El pie names the body part. / El pie nombra la parte del cuerpo.'},
    {prompt: 'Voy al mercado _____. (I walk there.)', answer: 'a pie', options: ['en pie', 'de pie', 'el pie', 'a pie'],
     note: 'A pie describes how you get there. / A pie indica cómo llegas.'},
    {prompt: 'Estoy _____ junto a la ventana. (I’m standing.)', answer: 'de pie', options: ['de pie', 'el pie', 'a pie', 'por pie'],
     note: 'Estoy de pie describes your posture. Estoy en pie can also mean this. / Estoy de pie describe tu postura. También puedes decir estoy en pie.'},
    {prompt: 'La reunión sigue _____. (It’s still on.)', answer: 'en pie', options: ['el pie', 'a pie', 'en pie', 'por pie'],
     note: 'The meeting is still scheduled. / La reunión se mantiene programada.'}
   ],
   sources: [['FundéuRAE · de pie y en pie', 'https://www.fundeu.es/consulta/como-se-dice-10/']]
  },
  {
   id: 'words-for-work',
   title: 'Trabajo · Words for work',
   explanation: '|Trabajo| works across regions. |Chamba| is informal and is recorded in Ecuador, Bolivia, Mexico and elsewhere. ' +
    'In Ecuador it can also mean an occasional job. |Laburo| is recorded in Ecuador, Bolivia and around the Río de la Plata, among other places. ' +
    'Listen for |curro| in Spain and |brete| in Costa Rica. Both are informal words for work in those places.',
   examples: [
    ['El lunes empiezo un trabajo nuevo.', 'I start a new job on Monday.'],
    ['Me salió una chamba para el sábado.', 'I picked up a gig for Saturday.'],
    ['Nos vemos después del laburo.', 'See you after work.', 'es-BO'],
    ['Mañana salgo temprano del curro.', 'I finish work early tomorrow.', 'es-ES'],
    ['¿Qué tal el brete nuevo?', 'How’s the new job going?', 'es-CR']
   ],
   situations: [
    {scene: 'Tell a friend in Ecuador that you start a new job on Monday.',
     phrase: 'El lunes empiezo un trabajo nuevo.', meaning: 'I start a new job on Monday.'},
    {scene: 'You picked up a one-off job for Saturday. Tell a friend using chamba.',
     phrase: 'Me salió una chamba para el sábado.', meaning: 'I picked up a gig for Saturday.'},
    {scene: 'A friend in Bolivia uses laburo. Tell them you’ll see them after work.',
     phrase: 'Nos vemos después del laburo.', meaning: 'See you after work.', locale: 'es-BO'},
    {scene: 'Tell a friend in Spain you’ll finish work early tomorrow. Try curro.',
     phrase: 'Mañana salgo temprano del curro.', meaning: 'I finish work early tomorrow.', locale: 'es-ES'},
    {scene: 'Ask a friend in Costa Rica how their new job is going. Try brete.',
     phrase: '¿Qué tal el brete nuevo?', meaning: 'How’s the new job going?', locale: 'es-CR'}
   ],
   sources: [
    ['ASALE · chamba', 'https://www.asale.org/damer/chamba'],
    ['ASALE · laburo', 'https://www.asale.org/damer/laburo'],
    ['RAE–ASALE · curro', 'https://dle.rae.es/curro'],
    ['ASALE · brete', 'https://www.asale.org/damer/brete']
   ]
  },
  {
   id: 'saying-no',
   title: 'Decir que no · Tone',
   inspiration: 'My Daily Spanish',
   explanation: 'Use |No, gracias| for a polite refusal. |No tengo ganas de salir| says you don’t feel like going out. ' +
    'In Spain you may hear |No me apetece salir| for the same feeling. |Ni hablar| is a firm no, and |Ni en sueños| can sound dismissive. ' +
    'The last example, |¡Y una mierda!|, is a vulgar refusal from Spain. Listen for the change in tone.',
   examples: [
    ['No, gracias. Esta vez paso.', 'No, thanks. I’ll pass this time.'],
    ['No tengo ganas de salir hoy.', 'I don’t feel like going out today.'],
    ['No me apetece salir esta noche.', 'I don’t feel like going out tonight.', 'es-ES'],
    ['Ni hablar. No te presto mi carro.', 'No way. I’m not lending you my car.'],
    ['¡Y una mierda! No voy a pagar tu parte.', 'Fuck that. I’m not paying your share.', 'es-ES']
   ],
   situations: [
    {scene: 'A friend offers you another coffee. Decline politely.', phrase: 'No, gracias. Esta vez paso.', meaning: 'No, thanks. I’ll pass this time.'},
    {scene: 'Your friend wants to go out. Say you don’t feel like going out today.', phrase: 'No tengo ganas de salir hoy.', meaning: 'I don’t feel like going out today.'},
    {scene: 'A friend in Spain asks about going out tonight. Try the softer reply with apetece.',
     phrase: 'No me apetece salir esta noche.', meaning: 'I don’t feel like going out tonight.', locale: 'es-ES'},
    {scene: 'Someone keeps asking to borrow your car. Give a firm refusal.', phrase: 'Ni hablar. No te presto mi carro.', meaning: 'No way. I’m not lending you my car.'},
    {scene: 'Someone expects you to pay their share. Practice a deliberately vulgar refusal from Spain.',
     phrase: '¡Y una mierda! No voy a pagar tu parte.', meaning: 'Fuck that. I’m not paying your share.', locale: 'es-ES'}
   ],
   sources: [['RAE–ASALE · apetecer', 'https://dle.rae.es/apetecer']]
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
  },
  {
   id: 'spanish-varieties',
   title: 'Compare Spanish varieties',
   explanation: '|Castellano| can name the whole Spanish language or refer more specifically to Spanish from Castile. ' +
    'Castilian and Canarian Spanish are varieties spoken in Spain. Andean Spanish includes highland speech in parts of Ecuador and Bolivia. ' +
    'In much of Castile, |casa| and |caza| sound different. In Ecuador and the Canaries, they share an s sound, a pattern called |seseo|. ' +
    'Compare how you would invite friends over in each variety.',
   examples: [
    ['¿Ustedes quieren venir a casa mañana?', 'Ecuadorian Andean Spanish · Ustedes is the plural form in Ecuador’s Sierra, as in Andean Bolivia.', 'es-EC'],
    ['¿Vosotros queréis venir a casa mañana?', 'Castilian Spanish · Vosotros is familiar plural in Castile and much of mainland Spain.', 'es-ES'],
    ['¿Ustedes quieren venir a casa mañana?', 'Canarian Spanish · Ustedes is usual for a group, including friends.', 'es-ES'],
    ['¿Vos querés venir a casa mañana?', 'Rioplatense Spanish · Vos querés is a familiar singular form heard around the Río de la Plata in Argentina and Uruguay.', 'es-AR']
   ],
   situations: [
    {scene: 'Ecuadorian Andean Spanish. Invite two friends over in Ecuador’s Sierra. Use ustedes.',
     phrase: '¿Ustedes quieren venir a casa mañana?', meaning: 'Do you all want to come over tomorrow?', locale: 'es-EC'},
    {scene: 'Castilian Spanish. Invite two friends over in Castile. Use vosotros.',
     phrase: '¿Vosotros queréis venir a casa mañana?', meaning: 'Do you all want to come over tomorrow?', locale: 'es-ES'},
    {scene: 'Canarian Spanish. Invite two friends over in the Canary Islands. Use ustedes.',
     phrase: '¿Ustedes quieren venir a casa mañana?', meaning: 'Do you all want to come over tomorrow?', locale: 'es-ES'},
    {scene: 'Rioplatense Spanish. Invite one friend over in Buenos Aires. Use vos.',
     phrase: '¿Vos querés venir a casa mañana?', meaning: 'Do you want to come over tomorrow?', locale: 'es-AR'}
   ],
   sources: [
    ['Meaning of castellano', 'https://www.rae.es/dpd/espa%C3%B1ol'],
    ['Ustedes and vosotros', 'https://www.rae.es/dpd/usted'],
    ['Seseo', 'https://www.rae.es/dpd/seseo'],
    ['Canarian Spanish', 'https://www.academiacanarialengua.org/consultas/2024/02/dialecto-habla-canaria/'],
    ['Andean and Rioplatense Spanish', 'https://www.rae.es/dpd/voseo']
   ]
  }
];
const englishGuides = {
 'solo-patterns': {
  id: 'only-patterns', title: 'Only · only if · just for · only with',
  explanation: 'Usa |only| para limitar algo, |only if| para poner una condición, |just for| para expresar el motivo y |only with| para indicar lo que hace falta. ' +
   'Fíjate en el orden de las palabras cuando la frase empieza con |only with|.',
  checks:[
   {prompt:'I _____ need a few minutes.',answer:'only',options:['only','only if','just for','only with'],note:'Only limits how much time is needed. / Only limita el tiempo.'},
   {prompt:'I will go out with you _____ it stops raining.',answer:'only if',options:['only','only if','just for','only with'],note:'Only if gives a condition. / Only if expresa una condición.'},
   {prompt:'I came _____ the music.',answer:'just for',options:['only','only if','just for','only with'],note:'Just for identifies the reason. / Just for indica el motivo.'},
   {prompt:'_____ patience can we improve.',answer:'only with',options:['only','only if','just for','only with'],note:'Only with introduces what is necessary. / Only with indica lo necesario.'}
  ],
  scenes: ['Tu amiga pregunta cuánto tiempo necesitas. Solo necesitas unos minutos.', 'Te invitan a salir, pero está lloviendo. Acepta con una condición.', 'Fuiste al festival solamente por la música. Explica por qué fuiste.', 'Dile a un amigo qué hace falta para aprender algo difícil.']
 },
 'already-still': {
  title: 'Already · still · not yet',
  explanation: '|Already| indica que algo ya pasó. |Still| indica que algo sigue ocurriendo. |Not yet| indica que todavía no ha pasado.',
  scenes: ['Un amigo te pregunta si estás listo. Ya terminaste el trabajo.', 'Tu amiga está lista para salir, pero tú sigues trabajando.', 'Te preguntan si ya comiste. Todavía no has comido.']
 },
 'por-para': {
  id: 'purpose', title: 'For · to · through',
  explanation: 'Usa |for| para indicar quién recibe algo, |to| para señalar un destino o propósito, y |through| para describir un recorrido que pasa por un lugar.',
  scenes: ['Compraste un café para Ana. Dile al mesero para quién es.', 'Una amistad te ayudó. Dale las gracias.', 'Describe tu ruta a pie por el parque.']
 },
 future: {
  title: 'Planes · going to y will',
  explanation: 'Usa |I am going to| para hablar de un plan y |I will| para decir lo que harás. En una conversación, también puedes decir |I’m going to| o |I’ll|.',
  scenes: ['Vas a comer pronto. Cuéntale a una amistad qué vas a hacer.', 'Ya tienes tu botella. Di que vas a beber agua.', 'Ahora estás ocupado. Di que comerás más tarde.']
 },
 'everyday-comparisons': {
  title: 'Better · worse · older · younger',
  explanation: 'Usa |better| y |worse| para comparar calidad, |older| y |younger| para la edad, y |bigger| o |smaller| para el tamaño.',
  scenes: ['La cámara de tu teléfono viejo era mala. Di que la nueva es mejor.', 'El bus tardó más hoy. Compara el tráfico de hoy con el de ayer.', 'Di que tu hermana es dos años mayor que tú.', 'Di que tu primo es un año menor que tú.']
 },
 'how-often': {
  title: 'How often? · Frecuencia',
  explanation: 'Palabras como |never|, |often| y |always| indican frecuencia. En una pregunta con |Have you ever…?|, preguntas si la otra persona ha hecho algo alguna vez.',
  scenes: ['Un amigo te ofrece café de noche. Dile que nunca lo tomas a esa hora.', 'Describe tu costumbre de cocinar con amigos de vez en cuando.', 'Di que a menudo escuchas música mientras cocinas.', 'Pregúntale a una amistad si alguna vez ha visitado Cuenca.']
 },
 'everyday-actions': {
  title: 'Everyday actions · Acciones diarias',
  explanation: 'Practica expresiones completas como |lift weights|, |turn up the volume|, |set the alarm| y |put your shoes away|.',
  scenes: ['No oyes bien la canción. Pide que suban un poquito el volumen.', 'Alguien está tratando de dormir. Ofrécete a bajar el volumen.', 'Necesitas levantarte a las seis. Di lo que tienes que hacer.', 'Tus zapatos están junto a la puerta. Di dónde los vas a guardar.']
 },
 'llevar-traer-tenses': {
  title: 'Take and bring · Yesterday, today, tomorrow',
  explanation: 'En estos ejemplos, usa |take| para llevar algo a otro lugar y |bring| para traerlo aquí. Practica los pasados |took| y |brought|.',
  scenes: ['Cuenta que ayer llevaste pan a la reunión.', 'Cuenta que ayer trajiste pan a casa.', 'Di que hoy llevas fruta al trabajo.', 'Di que mañana traerás café para todos.']
 },
 'cooking-actions': {
  title: 'Cooking actions · Acciones en la cocina',
  explanation: 'Practica |get out| para sacar los utensilios, |peel| para pelar, |slice| para cortar en rodajas y |chop| para picar.',
  scenes: ['Vas a cocinar. Di qué utensilios sacas primero.', 'Explica cómo pelas una zanahoria.', 'Quieres preparar rodajas de manzana. Di qué haces.', 'Vas a preparar sopa. Di que picas los champiñones.']
 },
 'ordering-at-a-cafe': {
  title: 'Ordering at a café · Hacer un pedido',
  explanation: 'Para pedir algo, prueba |Could I have…?| o |I’ll have…|. Usa |Could you bring us…?| para pedir algo para la mesa. ' +
   'La l de |could| es muda. Escucha cómo se unen |could I| en la pregunta.',
  scenes: [
   'Estás en un café en Quito. Pide un café con un poquito de leche.',
   'Compartes pan con una amistad. Pide que les traigan un poco más.',
   'Te preguntan qué vas a tomar. Pide una cerveza de barril.',
   'Estás en un bar en España. Pide un vaso pequeño de cerveza de barril.'
  ]
 },
 'pie-expressions': {
  title: 'Foot · walk · standing · still on',
  explanation: '|Foot| es el pie. Usa |on foot| o |walk| si vas a pie. |I’m standing| indica que estás de pie. ' +
   'Si la reunión sigue programada, di |The meeting is still on.| La l de |walk| es muda.',
  scenes: [
   'Pisaste una piedra. Di que te duele el pie izquierdo.',
   'El mercado queda cerca. Di que vas a pie.',
   'Una amistad te está buscando. Di que estás de pie junto a la ventana.',
   'Te preguntan si se canceló la reunión. Di que sigue en pie.'
  ],
  checks: [
   {prompt: 'My left _____ hurts. (Me duele el pie izquierdo.)', answer: 'foot', options: ['foot', 'walk', 'standing', 'still on'],
    note: 'Foot names the body part. / Foot nombra la parte del cuerpo.'},
   {prompt: 'I _____ to the market. (Voy a pie.)', answer: 'walk', options: ['foot', 'standing', 'still on', 'walk'],
    note: 'Walk tells how you get there. / Walk indica que vas caminando.'},
   {prompt: 'I’m _____ by the window. (Estoy de pie.)', answer: 'standing', options: ['walk', 'standing', 'foot', 'still on'],
    note: 'Standing describes your posture. / Standing describe tu postura.'},
   {prompt: 'The meeting is _____. (La reunión sigue en pie.)', answer: 'still on', options: ['standing', 'foot', 'still on', 'walk'],
    note: 'Still on means the meeting is going ahead. / Still on indica que la reunión sigue programada.'}
  ]
 },
 'words-for-work': {
  title: 'Work, a job, a gig · Trabajo',
  explanation: 'Usa |a job| para un empleo, |work| para hablar del trabajo en general y |a gig| para un trabajo puntual en una conversación informal. ' +
   'En |work|, escucha la vocal de tu variante de inglés y termina con el sonido de la k.',
  scenes: [
   'Cuéntale a una amistad que el lunes empiezas un trabajo nuevo.',
   'Te salió una chamba para el sábado. Cuéntaselo a una amistad.',
   'Dile a tu amistad en Bolivia que se ven después del trabajo.',
   'Dile a una amistad en España que mañana sales temprano del trabajo.',
   'Pregúntale a una amistad en Costa Rica cómo le va en el trabajo nuevo.'
  ]
 },
 'saying-no': {
  title: 'Saying no · Elegir el tono',
  explanation: '|No, thanks| es amable. |I don’t feel like going out| expresa que no tienes ganas. ' +
   '|No way| es un rechazo firme. |Fuck that| es vulgar. Para sonar firme con |No way|, marca la palabra |way|.',
  scenes: [
   'Te ofrecen otro café. Recházalo con amabilidad.',
   'Tu amistad quiere salir. Di que hoy no tienes ganas de salir.',
   'Una amistad te invita a salir esta noche. Di que no tienes ganas.',
   'Alguien insiste en que le prestes tu carro. Rechaza la petición con firmeza.',
   'Alguien espera que pagues su parte. Practica una respuesta deliberadamente vulgar.'
  ]
 }
};

const english = spanish.filter(lesson => Object.hasOwn(englishGuides, lesson.id)).map(lesson => {
 const {scenes, ...guide} = englishGuides[lesson.id];
 return {
  id: lesson.id,
  ...guide,
  inspiration: lesson.inspiration,
  sources: lesson.sources,
  examples: lesson.examples.map(([phrase, meaning]) => [meaning, phrase]),
  situations: lesson.situations.map(({phrase, meaning}, index) => ({
   scene: scenes[index], phrase: meaning, meaning: phrase
  }))
 };
});
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
 const cueLocale = cue.locale ?? locale;
 const explanation=()=>explanationPassages(item.explanation,locale,typeof englishVariant!=='undefined'&&englishVariant==='uk'?'en-GB':'en-US');
 content.innerHTML=`<label>Choose a short lesson<select id="quick-lesson-select">${items.map(i=>`<option value="${i.id}" ${i.id===item.id?'selected':''} data-ui-content>${esc(i.title)}</option>`).join('')}</select></label>
 <p id="quick-explanation" lang="${support}" data-ui-content>${explanation().map(({text,lang},index)=>index%2?`<span lang="${lang}">${esc(text)}</span>`:esc(text)).join('')}</p>
 <button type="button" id="quick-explanation-hear" class="secondary-button">🔊 Hear explanation</button>
 <div class="quick-lesson-examples">${item.examples.map(([phrase, meaning, exampleLocale = locale]) => `<div>
  <strong lang="${exampleLocale}" data-ui-content>${esc(phrase)}</strong><p lang="${support}" data-ui-content>${esc(meaning)}</p>
  <button type="button" class="secondary-button" data-quick-hear="${esc(phrase)}" data-quick-locale="${exampleLocale}">🔊 Hear example</button>
 </div>`).join('')}</div>
 <h3>Use it in a situation</h3><p lang="${support}" data-ui-content>${esc(cue.scene)}</p>
 <button type="button" id="quick-recall" class="secondary-button" aria-pressed="${recall}">${recall?'Show me the phrase':'Try without reading'}</button>
 <div id="quick-lesson-model" ${recall?'hidden':''}><article class="expression-card" data-practice-text="${esc(cue.phrase)}" data-practice-lang="${cueLocale}"><p lang="${cueLocale}" data-ui-content><strong>${esc(cue.phrase)}</strong></p><p lang="${support}" data-ui-content>${esc(cue.meaning)}</p></article></div>
 ${item.checks?(()=>{const check=item.checks[situation%item.checks.length];return `<section class="quick-grammar-check" aria-labelledby="quick-grammar-check-title"><h3 id="quick-grammar-check-title">Fill in the blank / Completa la frase</h3><p id="quick-grammar-prompt" lang="${locale}" data-ui-content>${esc(check.prompt)}</p><div id="quick-grammar-choices" role="group" aria-label="Choose the missing expression / Elige la expresión que falta">${check.options.map(choice=>`<button type="button" class="quick-grammar-choice" data-quick-answer="${esc(choice)}" aria-pressed="false" lang="${locale}">${esc(choice)}</button>`).join('')}</div><p id="quick-grammar-feedback" role="status" aria-live="polite"></p></section>`;})():''}
 <p>Different replies can work. Speaking feedback below compares recognized words with this model; it does not judge whether another reply communicates your meaning.</p>
 <button type="button" id="quick-next" class="primary-button">Try another situation →</button>
 <p>Original Habla lesson · device voices</p>
  ${item.sources ? `<p class="quick-lesson-sources">${item.sources.map(([title, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" data-ui-content>${esc(title)}</a>`).join(' · ')}</p>` : ''}
 ${item.inspiration?`<p>Inspired by ${esc(item.inspiration)}.</p>`:''}`;
 content.querySelector('#quick-lesson-select').addEventListener('change',event=>{leave();selected[locale]=event.target.value;situation=0;recall=false;render();});
 content.querySelector('#quick-explanation-hear').addEventListener('click',event=>{root.cancelDictionaryPractice();root.say(explanation(),undefined,event.currentTarget);});
 content.querySelectorAll('[data-quick-hear]').forEach(button => button.addEventListener('click', () => {
  root.cancelDictionaryPractice();
  root.say(button.dataset.quickHear, button.dataset.quickLocale, button);
 }));
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
