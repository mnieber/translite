var Translite = {};

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

    this._normalize_count = this._normalize_count.bind(this);
    this._id = this._id.bind(this);
    this._node = this._node.bind(this);
    this._error = this._error.bind(this);
    this._best_matching_node = this._best_matching_node.bind(this);
    this._eval_in_context = this._eval_in_context.bind(this);
    this._translate = this._translate.bind(this);
    this.translate = this.translate.bind(this);
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
    result.brokenTranslation =
      this.markBroken && this.markBroken === true
      ? ('!' + result.translation + '!')
      : this.markBroken && (typeof this.markBroken === "function")
      ? this.markBroken(result.translation)
      : !!this.markBroken
      ? ('!' + result.translation + '!')
      : result.translation;

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
        if (version < node.v) {
          return result.brokenTranslation;
        }
        return result.translation;
      }
    }
    return '!Unknown language: ' + this.language + '!';
  }
}

let _language = 'en'

Translite.getLanguage = function () {
  return _language;
}

Translite.setLanguage = function (language) {
  _language = language;
}

Translite.getTr = function (source, options={}) {
  function hasProp(x) { return options.hasOwnProperty(x); }

  if (!source) {
    console.error("getTr: empty translation source")
  }

  let optionsExt = Object.assign({}, options, {
    source: source,
    context: hasProp('context') ? options['context'] : {},
    language: hasProp('language') ? options['language'] : Translite.getLanguage(),
    markBroken: hasProp('markBroken') ? options['markBroken'] : false,
  });

  let translator = new Translator(optionsExt);
  return {tr: translator.translate, context: optionsExt['context']};
}

module.exports = Translite;
