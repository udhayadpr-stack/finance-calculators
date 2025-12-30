export const calculateEMI = ({
    loanAmount,
    interestRate,
    tenureYears
}) => {
    // Input sanitization
    const p = Number(loanAmount) || 0;
    const rateAnnual = Number(interestRate) || 0;
    const years = Number(tenureYears) || 0;

    const r = rateAnnual / 12 / 100; // Monthly rate
    const n = Math.round(years * 12); // Total months

    if (p === 0 || n === 0) {
        return { emi: 0, totalInterest: 0, totalAmount: 0, schedule: [] };
    }

    // EMI Formula
    let emi = 0;
    if (rateAnnual === 0) {
        emi = p / n;
    } else {
        emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalAmount = emi * n;
    const totalInterest = totalAmount - p;

    // Amortization Schedule (Yearly summary)
    let balance = p;
    let schedule = [];
    let yearlyInterest = 0;
    let yearlyPrincipal = 0;

    for (let m = 1; m <= n; m++) {
        let interestForMonth = balance * r;
        let principalForMonth = emi - interestForMonth;

        // Final Adjustment for last month to avoid rounding drift
        if (m === n) {
            // Technically EMI might adjust slightly, but usually we adjust principal
            principalForMonth = balance;
            interestForMonth = emi - principalForMonth; // Recalculate interest for last month? 
            // Or typically, we pay the balance.
            // Code convention: EMI is constant. Balance might drop below 0 or float near 0.
            // Standard approach: Last principal = Remaining Balance.
        }

        balance -= principalForMonth;
        if (balance < 0) balance = 0;

        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;

        if (m % 12 === 0 || m === n) {
            schedule.push({
                year: Math.ceil(m / 12),
                interest: yearlyInterest,
                principal: yearlyPrincipal,
                balance: balance
            });
            yearlyInterest = 0;
            yearlyPrincipal = 0;
        }
    }

    return {
        emi,
        totalInterest,
        totalAmount,
        schedule
    };
};
