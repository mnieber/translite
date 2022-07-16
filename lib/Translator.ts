import { getLanguage } from './language';

export class Translator {
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

  _translate = (node, version, result) => {
    let key = (this.options.language ?? getLanguage()) + '_' + version;
    if (!node.hasOwnProperty(key)) {
      return false;
    }

    result.translation = node[key];
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

  translate = (id, count = null) => {
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
      if (this._translate(node, version, result)) {
        const translation =
          version < node.v
            ? (result as any).brokenTranslation
            : (result as any).translation;
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
