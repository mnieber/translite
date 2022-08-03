# translite

Small no-db translation library for js, supporting controlled contexts, versioning and plural forms.

## Synopsis

```javascript
import { getTr, setLanguage, getLanguage } from 'translite';

let pages = {
  form: {
    'This-field-is-required': {
      v: 1,
      en_1: 'This field is required',
      es_0: 'Este campo es obligatorio',
    },

    light: {
      v: 1,
      en_1: 'light',
      es_1: 'ligero',
    },
  },

  welcome: {
    'Hi-user': {
      v: 1,
      en_1: 'Hi ${c.userName}!',
      es_1: 'Hola ${c.userName}!',
    },

    light: {
      v: 1,
      en_1: 'light',
      es_1: 'luz',
    },
  },
};

// Translate identifier to english
setLanguage('en');
let { tr: tr } = getTr(pages['form']);
console.log(tr('This_field_is_required')); // "This field is required"

// Translate identifier to spanish
setLanguage('es');
let { tr: tr } = getTr(pages['form']);
console.log(tr('This_field_is_required')); // "Este campo es obligatorio"

// Translate using context
setLanguage('en');
let { tr: tr, context: context } = getTr(pages['welcome']);
context['userName'] = 'Maximilia';
console.log(tr('Hi_user')); // "Hi Maximilia!"

// Pass in a context
setLanguage('en');
let { tr: tr, context: context } = getTr(pages['welcome'], {
  context: { userName: 'Juan' },
});
console.log(tr('Hi_user')); // "Hi Juan!"

// Mark outdated translation as broken
setLanguage('es');
let { tr: tr_es } = getTr(pages['form'], {
  markBroken: function (x) {
    return '??' + x + '??';
  },
});
console.log(tr_es('This_field_is_required')); // "??Este campo es obligatorio??"
```

## Features

Below we'll describe the features of this translation library. The examples in the synopsis help to clarify how these features are used. The input to the translation function is a string that we call the "identifier". The output is the translation of the identifier into the selected language. In other words: if you target English as one of the output languages, then you will write an English translation for each identifier. Note that the identifier itself is never used as a translation.
My personal preference is to create identifiers by concatenating the first words of the english translation, e.g.
"Welcome-to-this-webpage". Of course, you can also use regular english words and sentences as the identifier, but the use of hyphens or underscores makes it clear that it's only used as an _input_.

### No database: all translations are grouped in javascript dictionaries

The use of javascript files for storing the translations allows you to manage the translations and source code together in source control. Typically you should declare multiple translation dictionaries: one for each group of related translations. Think of the group as the usage context: depending on the context, an ambiguous word such as "light" can have a different translation:

    ```javascript
    import { pages } from 'translations'
    import { getTr, setLanguage } from 'translite'

    setLanguage('es');

    let {tr: tr, context: context} = getTr(groups['form']);
    // outputs: 'ligero'
    console.log(tr('light'))

    let {tr: tr2, context: context2} = getTr(group['welcome']);
    // outputs: 'luz'
    console.log(tr2('light'))
    ```

### Translations are not split per language

Each group (mentioned above) contains the translation of the identifier into all the target languages. This helps to ensure that all the translations carry the same meaning. In addition, having all the translations together makes it easier to find translations that are no longer up-to-date.

### Identifiers and their translations have a version number

If the identifier and the translation are at the same version number, then the translation is up-to-date. Note that it's possible for none of the translations to be up-to-date.
It's future work to create a tool that automatically flags all translations that are not up-to-date.
In the example translations at the bottom of this text, the `This-field-is-required` identifier is at version 1, as is the english translation, but the spanish translation is lagging behind.

### Translations can refer to a context dictionary

The translation of the `Hi-user` identifier uses the ${c.userName} placeholder. This values comes from the provided context dictionary:

    ```javascript
    let {tr: tr, context: context} = getTr(groups['welcome']);
    context['userName'] = 'Maximilia'
    // outputs: Hi Maximilia!
    console.log(tr('Hi-user'))
    ```

You can initialize the context as follows:

    ```javascript
    const myContext = {
      userName: 'Juan'
    };
    let {tr: tr} = getTr(groups['welcome'], {context: myContext});

    // outputs: Hi Juan!
    console.log(tr('Hi-user'))
    ```

### Spot broken translations

If you supply a `markBroken` function in the options, then this function will be used to transform the translation output into something that is more easily recognizable as an outdated translation. For example:

    ```javascript
    let {tr: tr} = getTr(groups['welcome'], {
      markBroken: function(x) {return "___" + x + "___"}
    });

    // outputs: ___Este campo es obligatorio___
    console.log(tr('This-field-is-required'))
    ```

Note: for legacy reasons, it's also supported to set `markBroken: true` in the options. In this case, broken translations will be shown as `!<translated>!`.
