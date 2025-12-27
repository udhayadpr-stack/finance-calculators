export const calculateMF = ({
    type = 'sip',
    amount,
    rate,
    years
}) => {
    const p = Number(amount) || 0;
    const rateAnnual = Number(rate) || 0;
    const durationYears = Number(years) || 0;

    const r = rateAnnual / 100;
    const i = r / 12; // Monthly rate
    const n = Math.round(durationYears * 12); // Total months

    let invested = 0;
    let totalValue = 0;

    if (p === 0 || durationYears === 0) {
        return { invested: 0, estReturns: 0, totalValue: 0 };
    }

    if (type === 'sip') {
        invested = p * n;
        if (i === 0) {
            totalValue = invested;
        } else {
            // SIP Formula (Annuity Due): P * [ (1+i)^n - 1 ] / i * (1+i)
            totalValue = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
        }
    } else {
        // Lumpsum (Annual Compounding)
        invested = p;
        totalValue = p * Math.pow(1 + r, durationYears);
    }

    const estReturns = totalValue - invested;

    return {
        invested,
        estReturns,
        totalValue
    };
};
