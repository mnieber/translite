import { Translator } from './Translator';
import { options as transliteOptions } from './options';

export function getTranslate(source, options: any = {}) {
  if (!source) {
    console.error('getTranslate: empty translation source');
  }

  if (Array.isArray(source)) {
    const sources = source;
    source = {};
    for (const x of sources) {
      if (transliteOptions.checkDuplicateKeys) {
        for (const k of Object.keys(x)) {
          if (source.hasOwnProperty(k)) {
            console.error('getTranslate: duplicate key ' + k);
          }
        }
      }
      Object.assign(source, x);
    }
  }

  return new Translator({
    ...options,
    source,
    markBroken: options.markBroken ?? false,
  }).translate;
}
