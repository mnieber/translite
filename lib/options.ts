export const options = {
  checkDuplicateKeys: true,
};

export const getOptions = () => options;

export const setOptions = (moreOptions) => {
  Object.assign(options, moreOptions);
};
