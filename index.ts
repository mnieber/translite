// This is a special variation of the backticks operator that returns an
// array of strings and objects.
export function translateToArray(strings: any, ...values: any) {
  const result: any = [];
  let iString = 0;
  let iValue = 0;

  while (iString < strings.length || iValue < values.length) {
    if (iString < strings.length) {
      const s = strings[iString];
      result.push(s.replaceAll(' ', '\u00A0'));
      iString++;
    }

    if (iValue < values.length) {
      const s = values[iValue];
      result.push(typeof s === 'string' ? s.replaceAll(' ', '\u00A0') : s);
      iValue++;
    }
  }
  return result;
}

const renderTemplate = function (templateString, templateVars, prefix) {
  // @ts-ignore
  const c = templateVars;
  return eval(prefix + '`' + templateString + '`');
};

class Translator {
  context: any;
  source: any;
  language: string;
  markBroken: any;
  countString: string[] = ['zero', 'one', 'many'];

  constructor(options) {
    this.context = options.context;
    this.source = options.source;
    this.language = options.language;
    this.markBroken = options.markBroken;
  }

  _normalize_count = (count) => {
    if (count !== null && count > 2) {
      return 2;
    }
    return count;
  };

  _id = (id, count) => {
    if (count === null) {
      return id;
    }
    return id + ' ' + this.countString[count];
  };

  _node = (id, count, result) => {
    var id = this._id(id, count);
    if (!this.source.hasOwnProperty(id)) {
      return false;
    }
    result.node = this.source[id];
    return true;
  };

  _error = (id, count) => {
    console.error('tr: unknown id ' + id + ', count=' + count);
    return null;
  };

  _best_matching_node = (id, count) => {
    let result: any = {};

    count = this._normalize_count(count);
    if (this._node(id, count, result)) {
      return result.node;
    }

    return this._error(id, count);
  };

  _translate = (node, version, prefix, result) => {
    let key = this.language + '_' + version;
    if (!node.hasOwnProperty(key)) {
      return false;
    }

    result.translation = renderTemplate(node[key], this.context, prefix);
    result.brokenTranslation =
      this.markBroken && this.markBroken === true
        ? '!' + result.translation + '!'
        : this.markBroken && typeof this.markBroken === 'function'
        ? this.markBroken(result.translation)
        : !!this.markBroken
        ? '!' + result.translation + '!'
        : result.translation;

    return true;
  };

  translate =
    (prefix) =>
    (id, count = null) => {
      let node = this._best_matching_node(id, count);
      if (!node) {
        return '';
      }

      for (var version = node.v; version >= 0; version -= 1) {
        var result = {};
        if (this._translate(node, version, prefix, result)) {
          if (version < node.v) {
            return (result as any).brokenTranslation;
          }
          return (result as any).translation;
        }
      }
      return '!Unknown language: ' + this.language + '!';
    };
}

let _language = 'en';

export function getLanguage() {
  return _language;
}

export function setLanguage(language) {
  _language = language;
}

export function getTr(source, options = {}) {
  function hasProp(x) {
    return options.hasOwnProperty(x);
  }

  if (!source) {
    console.error('getTr: empty translation source');
  }

  let optionsExt = Object.assign({}, options, {
    source: source,
    context: hasProp('context') ? options['context'] : {},
    language: hasProp('language') ? options['language'] : getLanguage(),
    markBroken: hasProp('markBroken') ? options['markBroken'] : false,
  });

  let translator = new Translator(optionsExt);
  return {
    tr: translator.translate(''),
    tra: translator.translate('translateToArray'),
    context: optionsExt['context'],
  };
}
