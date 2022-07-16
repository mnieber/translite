// This is a special variation of the backticks operator that returns an
// array of strings and objects.
export function translateToArray(strings: any, ...values: any) {
  const result: any = [];
  let iString = 0;
  let iValue = 0;

  while (iString < strings.length || iValue < values.length) {
    if (iString < strings.length) {
      result.push(strings[iString]);
      iString++;
    }

    if (iValue < values.length) {
      result.push(values[iValue]);
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
  options: any;
  countString: string[] = ['zero', 'one', 'many'];

  constructor(options) {
    this.options = options;
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
    if (!this.options.source.hasOwnProperty(id)) {
      return false;
    }
    result.node = this.options.source[id];
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
    let key = (this.options.language ?? getLanguage()) + '_' + version;
    if (!node.hasOwnProperty(key)) {
      return false;
    }

    result.translation = renderTemplate(
      node[key],
      this.options.context,
      prefix
    );
    result.brokenTranslation =
      this.options.markBroken && this.options.markBroken === true
        ? '!' + result.translation + '!'
        : this.options.markBroken &&
          typeof this.options.markBroken === 'function'
        ? this.options.markBroken(result.translation)
        : !!this.options.markBroken
        ? '!' + result.translation + '!'
        : result.translation;

    return true;
  };

  translate =
    (prefix) =>
    (id, count = null) => {
      const firstChar = id.charAt(0);
      const firstCharLower = firstChar.toLowerCase();
      const isUpperCased = firstChar !== firstCharLower;
      const normalizedId = isUpperCased ? firstCharLower + id.slice(1) : id;

      let node = this._best_matching_node(normalizedId, count);
      if (!node) {
        return '';
      }

      for (var version = node.v; version >= 0; version -= 1) {
        var result = {};
        if (this._translate(node, version, prefix, result)) {
          if (version < node.v) {
            return (result as any).brokenTranslation;
          }
          const translation = (result as any).translation;
          return isUpperCased
            ? translation.charAt(0).toUpperCase() + translation.slice(1)
            : translation;
        }
      }
      return (
        '!Unknown language: ' + (this.options.language ?? getLanguage()) + '!'
      );
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

  if (Array.isArray(source)) {
    const sources = source;
    source = {};
    for (const x of sources) {
      if (process.env.NODE_ENV === 'development') {
        for (const k of Object.keys(x)) {
          if (source.hasOwnProperty(k)) {
            console.error('getTr: duplicate key ' + k);
          }
        }
      }
      Object.assign(source, x);
    }
  }

  let optionsExt = Object.assign({}, options, {
    source: source,
    context: hasProp('context') ? options['context'] : {},
    markBroken: hasProp('markBroken') ? options['markBroken'] : false,
  });

  let translator = new Translator(optionsExt);
  return {
    tr: translator.translate(''),
    tra: translator.translate('translateToArray'),
    context: optionsExt['context'],
  };
}
