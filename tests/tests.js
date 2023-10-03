const test = require('tape');
const { getTr, setLanguage, getLanguage } = require('../index');

let pages = {
  form: {
    'This-field-is-required': {
      v: 1,
      en_1: 'This field is required',
      es_0: 'Este campo es obligatorio',
    },

    button: {
      v: 1,
      en_1: 'one button',
      es_1: 'un boton',
    },
  },

  welcome: {
    'Hi-user': {
      v: 1,
      en_1: 'Hi ${c.userName}!',
      es_1: 'Hola ${c.userName}!',
    },

    'Good-morning': {
      v: 1,
      en_1: 'Good morning',
      es_1: 'Buenos dias',
    },
  },
};

test('Translate identifier to english', function (t) {
  setLanguage('en');
  t.equal('en', getLanguage());
  let { tr: tr } = getTr(pages['form']);
  t.equal(tr('This-field-is-required'), 'This field is required');
  t.end();
});

test('Translate identifier to spanish', function (t) {
  setLanguage('es');
  t.equal('es', getLanguage());

  let { tr: tr } = getTr(pages['form']);
  t.equal(tr('This-field-is-required'), 'Este campo es obligatorio');
  t.end();
});

test('Translate using context', function (t) {
  setLanguage('en');
  let { tr: tr, context: context } = getTr(pages['welcome']);
  context['userName'] = 'Maximilia';
  t.equal(tr('Hi-user'), 'Hi Maximilia!');
  t.end();
});

test('Missing values in context are rendered as "undefined"', function (t) {
  setLanguage('en');
  let { tr: tr } = getTr(pages['welcome']);
  t.equal(tr('Hi-user'), 'Hi undefined!');
  t.end();
});

test('Mark outdated translation as broken', function (t) {
  setLanguage('es');
  let options = {
    markBroken: function (x) {
      return '??' + x + '??';
    },
  };
  let { tr: trEs } = getTr(pages['form'], options);
  t.equal(
    trEs('This-field-is-required'),
    '??Este campo es obligatorio??',
    'Since the spanish translation lacks behind the latest ' +
      'version it should be marked as broken.'
  );

  setLanguage('en');
  let { tr: trEn } = getTr(pages['form'], options);
  t.equal(
    trEn('This-field-is-required'),
    'This field is required',
    'Since the english translation does not lack behind the latest ' +
      'version it should not be marked as broken.'
  );
  t.end();
});

test('Use markbroken = true to mark outdated translation as broken', function (t) {
  setLanguage('es');
  let { tr: trEs } = getTr(pages['form'], { markBroken: true });
  t.equal(
    trEs('This-field-is-required'),
    '!Este campo es obligatorio!',
    'Since the spanish translation lacks behind the latest ' +
      'version it should be marked as broken.'
  );

  let { tr: trEsBrokenFalse } = getTr(pages['form'], { markBroken: false });
  t.equal(
    trEsBrokenFalse('This-field-is-required'),
    'Este campo es obligatorio'
  );

  // support legacy
  let { tr: trEsBroken3 } = getTr(pages['form'], { markBroken: 3 });
  t.equal(trEsBroken3('This-field-is-required'), '!Este campo es obligatorio!');
  t.end();
});

test('Translate to unknown language', function (t) {
  setLanguage('xx');
  let { tr: tr } = getTr(pages['form']);
  t.equal(tr('This-field-is-required'), '!Unknown language: xx!');
  t.end();
});

test('Existing tr function is unaffected by setLanguage', function (t) {
  setLanguage('en');
  let { tr: tr } = getTr(pages['form']);
  setLanguage('es');
  t.equal(tr('This-field-is-required'), 'This field is required');
  t.end();
});

test('Translate using context with tra', function (t) {
  setLanguage('en');
  let { tra, context } = getTr(pages['welcome']);
  context['userName'] = 'Maximilia';
  t.deepEqual(tra('Hi-user'), ['Hi ', 'Maximilia', '!']);
  t.end();
});
