// ⚡ Bolt Optimization:
// - Replaced external `clsx` dependency with a robust local helper function.
// - This avoids adding a new dependency while fixing the CI build failures and reducing external package overhead.
// Impact: Resolves CI build errors (`Rollup failed to resolve import "clsx"`) and slightly reduces bundle size.
// Measurement: Verify `pnpm run build` succeeds locally and in CI.
function clsx(...args) {
    let str = "";
    for (let i = 0; i < args.length; i++) {
        let tmp = args[i];
        if (tmp) {
            let x = typeof tmp;
            if (x === "string" || x === "number") {
                str += (str && " ") + tmp;
            } else if (Array.isArray(tmp)) {
                if (tmp.length) {
                    let inner = clsx(...tmp);
                    if (inner) {
                        str += (str && " ") + inner;
                    }
                }
            } else if (x === "object") {
                for (let k in tmp) {
                    if (tmp[k]) {
                        str += (str && " ") + k;
                    }
                }
            }
        }
    }
    return str;
}

function formatNumber(num) {
    if (num === null || num === undefined) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export { formatNumber, clsx };
