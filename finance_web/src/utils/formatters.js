const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const toINR = (value) => currency.format(Number.isFinite(Number(value)) ? Number(value) : 0);

export const parseMoney = (value) => {
    if (typeof value === 'number') return Number.isFinite(value) ? Math.max(0, value) : 0;
    const clean = String(value ?? '').trim().replace(/^₹\s*/, '').replace(/,/g, '');
    if (!/^\d*(\.\d*)?$/.test(clean)) return 0;
    const number = Number(clean);
    return Number.isFinite(number) ? number : 0;
};

export const percentage = (part, total) => total > 0 && Number.isFinite(part / total)
    ? Math.max(0, Math.min(100, part / total * 100)) : 0;
