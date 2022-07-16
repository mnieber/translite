import { Translator } from './Translator';

export function getTranslate(source, options: any = {}) {
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

  return new Translator({
    ...options,
    source,
    markBroken: options.markBroken ?? false,
  }).translate;
}
