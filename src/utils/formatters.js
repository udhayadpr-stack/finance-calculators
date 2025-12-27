export const toINR = (val) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val || 0);

export const parseMoney = (val) => {
    if (typeof val === 'number') return Math.max(0, val);
    if (!val) return 0;
    // strict regex: digits only, optional single dot
    const clean = val.toString().replace(/[^0-9.]/g, '');
    if ((clean.match(/\./g) || []).length > 1) return 0;
    return Math.max(0, parseFloat(clean) || 0);
};
