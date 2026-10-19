export function clsx(...args) {
  let classes = [];

  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    if (!arg) continue;

    const argType = typeof arg;

    if (argType === 'string' || argType === 'number') {
      classes.push(arg);
    } else if (Array.isArray(arg)) {
      if (arg.length) {
        let inner = clsx.apply(null, arg);
        if (inner) {
          classes.push(inner);
        }
      }
    } else if (argType === 'object') {
      if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
        classes.push(arg.toString());
        continue;
      }

      for (let key in arg) {
        if (Object.hasOwn(arg, key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}

export default clsx;
