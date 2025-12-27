export const calculateForeclosure = ({
    outstandingPrincipal,
    interestRate,
    remainingTenure, // in months
    foreclosureChargesPercent
}) => {
    const p = Number(outstandingPrincipal) || 0;
    const rateAnnual = Number(interestRate) || 0;
    const n = Number(remainingTenure) || 0;
    const penaltyPercent = Number(foreclosureChargesPercent) || 0;

    const r = rateAnnual / 12 / 100;

    if (p === 0 || n === 0) {
        return {
            foreclosureCost: p, // If 0 tenure, cost is just principal (immediate)
            penalty: 0,
            interestIfContinued: 0,
            totalIfContinued: p,
            emi: 0,
            netSavings: 0
        };
    }

    // 1. If continued (EMI Calc)
    let emi = 0;
    if (rateAnnual === 0) {
        emi = p / n;
    } else {
        emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalAmount = emi * n;
    const interestIfContinued = Math.max(0, totalAmount - p);

    // 2. If foreclosed
    const penalty = p * (penaltyPercent / 100);
    const foreclosureCost = p + penalty;

    // 3. Difference
    const netSavings = totalAmount - foreclosureCost;

    return {
        foreclosureCost,
        penalty,
        interestIfContinued,
        totalIfContinued: totalAmount,
        emi,
        netSavings
    };
};
