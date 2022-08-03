import { getLanguage } from './language';

export class Translator {
  options: any;

  constructor(options) {
    this.options = options;
  }

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

  translate = (id) => {
    let node = this.options.source[id];
    if (!node) {
      console.error('tr: unknown id ' + id);
      return null;
    }

    for (var version = node.v; version >= 0; version -= 1) {
      var result = {};
      if (this._translate(node, version, result)) {
        return version < node.v
          ? (result as any).brokenTranslation
          : (result as any).translation;
      }
    }
    return (
      '!Unknown language: ' + (this.options.language ?? getLanguage()) + '!'
    );
  };
}
