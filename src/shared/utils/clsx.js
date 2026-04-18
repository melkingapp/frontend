export const clsx = (...args) => {
  return args
    .filter(Boolean)
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object' && !Array.isArray(arg)) {
        return Object.entries(arg)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ');
};
