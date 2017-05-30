import test from 'tape'
import { getTr, setLanguage, getLanguage } from 'translite'


let pages = {

'form': {
  'This_field_is_required': {
    'v': 1,
    'en_1': 'This field is required',
    'es_0': 'Este campo es obligatorio',
  },

 'button zero': {
    'v': 1,
    'en_1': 'no buttons',
    'es_1': 'ningun boton',
  },

 'button one': {
    'v': 1,
    'en_1': 'one button',
    'es_1': 'un boton',
  },

 'button many': {
    'v': 1,
    'en_1': 'two or more buttons',
    'es_1': 'dos o mas botones',
  },
},

'welcome': {
 'Hi_user': {
    'v': 1,
    'en_1': 'Hi ${c.userName}!',
    'es_1': 'Hola ${c.userName}!',
  },

 'Good_morning': {
    'v': 1,
    'en_1': 'Good morning',
    'es_1': 'Buenos dias',
  },
}

}


test('Translate identifier to english', function (t) {
  setLanguage('en')
  t.equal('en', getLanguage());
  let {tr: tr, context: context} = getTr(pages['form']);
  t.equal(tr('This_field_is_required'), 'This field is required');
  t.end();
});


test('Translate identifier to spanish', function (t) {
  setLanguage('es')
  t.equal('es', getLanguage());

 let {tr: tr, context: context} = getTr(pages['form']);
  t.equal(tr('This_field_is_required'), 'Este campo es obligatorio');
  t.end();
});


test('Translate using context', function (t) {
  setLanguage('en')
  let {tr: tr, context: context} = getTr(pages['welcome']);
  context['userName'] = 'Maximilia'
  t.equal(tr('Hi_user'), 'Hi Maximilia!');
  t.end();
});

// Note that in reality this case doesn't throw but produces an error in the console (not sure how to test that)
test('Translate with missing context produces error', function (t) {
  setLanguage('en')
  let {tr: tr, context: context} = getTr(pages['welcome']);
  t.throws(function() {
    tr('Hi_user');
  });

 t.end();
});


test('Mark outdated translation as broken', function (t) {
  setLanguage('es');
  let options = { markBroken: true };
  let {tr: tr_es, context: context_es} = getTr(pages['form'], options);
  t.equal(
    tr_es('This_field_is_required'),
    '!Este campo es obligatorio!',
    'Since the spanish translation lacks behind the latest ' +
    'version it should be marked as broken.'
  );

 setLanguage('en');
  let {tr: tr_en, context: context_en} = getTr(pages['form'], options);
  t.equal(
    tr_en('This_field_is_required'),
    'This field is required',
    'Since the english translation does not lack behind the latest ' +
    'version it should be marked as broken.'
  );
  t.end();
});


test('Translate to unknown language', function (t) {
  setLanguage('xx')
  let {tr: tr, context: context} = getTr(pages['form']);
  t.equal(tr('This_field_is_required'), '!Unknown language: xx!');
  t.end();
});


test('Existing tr function is unaffected by setLanguage', function (t) {
  setLanguage('en')
  let {tr: tr, context: context} = getTr(pages['form']);
  setLanguage('es')
  t.equal(tr('This_field_is_required'), 'This field is required');
  t.end();
});


test('Translate to plural form', function (t) {
  setLanguage('en')
  let {tr: tr, context: context} = getTr(pages['form']);
  t.equal(tr('button', 0), 'no buttons');
  t.equal(tr('button', 1), 'one button');
  t.equal(tr('button', 2), 'two or more buttons');
  t.equal(tr('button', 5), 'two or more buttons');
  t.end();
});