# translite
Small no-db translation library for js, supporting controlled contexts, versioning and plural forms.

## Features

Below we'll describe the features of this translation library. The example translations file at the bottom of this file helps to clarify how these features are used.
The input to the translation function is a string that we call the "identifier".  The output is the translation of the identifier into the selected language. Note that the identifier itself is never used as a translation (in other words: if you target English as one of the output languages, you will write an English translation for each identifier).
My personal preference is to create identifiers by concatenating the first words of the english translation, e.g.
"Welcome-to-this-webpage". Of course, you can also use regular english words and sentences as the identifier, but the use of hyphens or underscores makes it clear that it's only used as an *input*.


### No database: all translations are grouped in javascript dictionaries

The use of javascript files for storing the translations allows you to manage the translations and source code together in source control.
Declaring multiple translation dictionaries in these javascript files makes it possible to group related translations, and to translate the same string differently in each group. This has the advantage that the context (provided by the group) helps to clarify the intention behind each translated string. In the following example, the `form` and `welcome` groups are used:

    ```javascript
    import { pages } from 'translations'
    import { getTr } from 'translite'

    let {tr: tr, context: context} = getTr(groups['form']);
    console.log(tr('message'))

    let {tr: tr2, context: context2} = getTr(group['welcome']);
    console.log(tr2('Good-morning'))
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
    context['userName'] = "Maximilia"
    // outputs: Hi Maximilia!
    console.log(tr('Hi-user'))
    ```

### Translations can have plural forms (zero, one, many)

In the example below, the translation depends on the value of `nrOfMessages`:

    ```javascript
    let {tr: tr, context: context} = getTr(groups['form']);

    const nrOfMessages = 3;
    // Outputs: two or more messages
    console.log(tr('message', nrOfMessages))
    ```

### Example of translation groups

    ```javascript
    let groups = {

    'form': {
      'This-field-is-required': {
        'v': 1,
        'en_1': 'This field is required',
        'es_0': 'Este campo es obligatorio',
      },

     'message zero': {
        'v': 1,
        'en_1': 'no messages',
        'es_1': 'ningun mensaje',
      },

     'message one': {
        'v': 1,
        'en_1': 'one message',
        'es_1': 'un mensaje',
      },

     'message many': {
        'v': 1,
        'en_1': 'two or more messages',
        'es_1': 'dos o mas mensajes',
      },
    },

    'welcome': {
     'Hi-user': {
        'v': 1,
        'en_1': 'Hi ${c.userName}!',
        'es_1': 'Hola ${c.userName}!',
      },

     'Good-morning': {
        'v': 1,
        'en_1': 'Good morning',
        'es_1': 'Buenos dias',
      },
    }

    }
    ```
