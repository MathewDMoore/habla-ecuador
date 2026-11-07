const assert = require('node:assert/strict');
const {test} = require('node:test');
const {regionalWording} = require('../spanish-context.js');

test('distinct documented clues can suggest each starter variety', () => {
  const examples = {
    EC: '¡Chuta! ¿Me acolitas con esto?',
    BO: 'Compramos unas salteñas con llajua.',
    MX: '¡Órale, no manches! ¿En serio?',
    CO: 'Sumercé, no dé papaya por ahí.',
    AR: 'Me tomo el bondi para ir al laburo.',
    CL: 'Qué fome. Mejor nos vamos al tiro.',
    ES: '¿Venís vosotros? Me mola la idea.'
  };
  for (const [region, text] of Object.entries(examples)) {
    const result = regionalWording(text);
    assert.equal(result.region, region, text);
    assert.ok(result.clues.every(clue => clue.regions.includes(region) && /^https:\/\//.test(clue.url)));
  }
});

test('shared wording, repeated cues and conflicting matches do not select a region', () => {
  const shared = regionalWording('¡Chuta! Ya me voy al laburo.');
  assert.equal(shared.region, null);
  assert.equal(shared.mixed, false);
  assert.equal(shared.clues.length, 2);
  assert.equal(regionalWording('Bondi, bondi, bondi.').region, null);
  assert.equal(regionalWording('¡Órale! No manches, qué fome.').mixed, true);
  assert.equal(regionalWording('Hola, ¿cómo estás?').clues.length, 0);
});

test('quotes, embedded words and punctuation do not create evidence', () => {
  for (const text of ['“Órale, no manches”', '«Órale, no manches»', 'ñbondi', 'fome42', 'No. Manches.']) {
    assert.equal(regionalWording(text).clues.length, 0, text);
  }
  assert.equal(regionalWording('Orale, no manchen.').region, 'MX');
});
