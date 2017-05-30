import React from 'react'

class Translator {
  constructor(options) {
    this.context = options.context;
    this.source = options.source;
    this.language = options.language;
    this.markBroken = options.markBroken;

    this.count_string = [
      "zero",
      "one",
      "many",
    ];

    this.translate = this.translate.bind(this);
    this._best_matching_node = this._best_matching_node.bind(this);
    this._id = this._id.bind(this);
  }

  _normalize_count(count) {
    if (count !== null && count > 2) {
      return 2;
    }
    return count;
  }

  _id(id, count) {
    if (count === null) {
      return id;
    }
    return id + " " + this.count_string[count];
  }

  _node(id, count, result) {
    var id = this._id(id, count);
    if (!this.source.hasOwnProperty(id)) {
      return false;
    }
    result.node = this.source[id];
    return true;
  }

  _error(id, count) {
    console.error("tr: unknown id " + id + ", count=" + count);
    return null;
  }

  _best_matching_node(id, count) {
    let result = {};

    count = this._normalize_count(count);
    if (this._node(id, count, result)) {
      return result.node;
    }
    else if (count == null) {
      return this._error(id, count);
    }

    for (var count_alt = 2; count_alt >= 0; count_alt -= 1) {
      if (this._node(id, count_alt, result)) {
        return result.node;
      }
    }

    return this._error(id, count);
  }

  _eval_in_context(s) {
    let c = this.context;
    return eval('`' + s + '`');
  }

  _translate(node, version, result) {
    let key = this.language + '_' + version;
    if (!node.hasOwnProperty(key)) {
      return false;
    }

    result.translation = this._eval_in_context(node[key]);
    result.brokenTranslation = this.markBroken
      ? ("!" + result.translation + "!")
      : result.translation;

    // todo count nr of undefineds...
    result.hasUndefinedReference = result.translation.includes("undefined");

    return true;
  }

  translate(id, count=null) {
    let node = this._best_matching_node(id, count);
    if (!node) {
      return "";
    }

    for (var version = node.v; version >= 0; version -= 1) {
      var result = {};
      if (this._translate(node, version, result)) {
        if (result.hasUndefinedReference) {
          console.error("tr: undefined variable in '" + node[key] + "'");
          return result.brokenTranslation;
        }
        if (version < node.v) {
          return result.brokenTranslation;
        }
        return result.translation;
      }
    }
    return '!' + this.language + '!';
  }
}

let _language = 'en'

export function getLanguage() {
  return _language;
}

export function setLanguage(language) {
  _language = language;
}

export function getTr(source, options={}) {
  function hasProp(x) { return options.hasOwnProperty(x); }

  if (!source) {
    console.error("getTr: empty translation source")
  }

  let optionsExt = Object.assign({}, options, {
    source: source,
    context: hasProp('context') ? options['context'] : {},
    language: hasProp('language') ? options['language'] : getLanguage(),
    markBroken: hasProp('markBroken') ? options['markBroken'] : false,
  });

  let translator = new Translator(optionsExt);
  return {tr: translator.translate, context: optionsExt['context']};
}
