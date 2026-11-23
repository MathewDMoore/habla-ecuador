const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const start = source.indexOf('function reviewedMeaningTranslation(');
const end = source.indexOf('\nasync function requestGeneralTranslation(', start);
assert.ok(start >= 0 && end > start, 'Reviewed meaning translation must remain defined');
const context = {
  languageFamily: locale => String(locale).split('-')[0]
};
vm.runInNewContext(source.slice(start, end), context);
const review = (text, options={}) => context.reviewedMeaningTranslation(text,{
  source:'es-EC',target:'en-US',purpose:'everyday',...options
});
assert.equal(review('No soy increíblemente inteligente, pero no soy un imbécil.')?.text,
  "I'm not incredibly intelligent, but I'm not an idiot.");
assert.equal(review('No soy increiblemente inteligente pero no soy un imbecil!')?.text,
  "I'm not incredibly intelligent, but I'm not an idiot.");
assert.ok(review('No soy increíblemente inteligente, pero no soy un imbécil.')?.alternatives
  .some(option=>option.text.includes('fool')));
assert.equal(review('Eres un imbécil.'),null,'Do not rewrite unrelated insult contexts');
assert.equal(review('No soy increíblemente inteligente, pero no soy un imbécil.',{purpose:'academic'}),null,
  'Do not rewrite academic source text');
assert.equal(review('No soy increíblemente inteligente, pero no soy un imbécil.',{target:'es-BO'}),null,
  'Only applies to Spanish to English');
console.log('Reviewed Spanish insult meaning regression passed');
