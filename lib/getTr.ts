import { getTranslate } from './getTranslate';

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

export const getTrWithContext = (
  prefix: string,
  context: any,
  tr: Function
) => {
  // @ts-ignore
  const c = context;
  return (id: string) => eval(prefix + '`' + tr(id) + '`');
};

export const getTr = (source: any, options: any) => {
  const context: any = {};
  const translate = getTranslate(source, options);
  return {
    context,
    tr: getTrWithContext('', context, translate),
    tra: getTrWithContext('translateToArray', context, translate),
  };
};
