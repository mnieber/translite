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

export function executeTemplate(
  tagFunction: Function,
  template: string,
  context: any
) {
  // Split the template into strings and keys
  const strings: string[] = [];
  const keys: string[] = [];
  let lastIndex = 0;
  template.replace(/\${c.(.*?)}/g, (match, key: string, index) => {
    // Push the string before the placeholder
    strings.push(template.slice(lastIndex, index));
    // Push the key from the placeholder
    keys.push(key.trim());
    lastIndex = index + match.length;
    return match;
  });
  // Push the remaining string after the last placeholder
  strings.push(template.slice(lastIndex));

  // Compute the values from the keys and context
  const values = keys.map((key) => context[key]);

  // Call the tag function with the strings and values
  return tagFunction(strings, ...values);
}

export const getTrWithContext = (
  context: any,
  tr: Function,
  tagFunction?: Function
) => {
  // @ts-ignore
  const c = context;
  return tagFunction
    ? (id: string) => executeTemplate(tagFunction, tr(id), context)
    : (id: string) => eval('`' + tr(id) + '`');
};

export const getTr = (source: any, options: any) => {
  const context: any = {};
  const translate = getTranslate(source, options);
  return {
    context,
    tr: getTrWithContext(context, translate),
    tra: getTrWithContext(context, translate, translateToArray),
  };
};
