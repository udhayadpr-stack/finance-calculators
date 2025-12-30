export const calculateGratuity = ({
    basicPay,
    totalCTC,
    years,
    isGovt,
    isFixedTerm = false // New Parameter
}) => {
    // Input sanitization
    const salaryInput = Number(basicPay) || 0;
    const ctcInput = Number(totalCTC) || 0;
    const n = Math.round(Number(years));
    const govtStatus = !!isGovt;
    const fixedTerm = !!isFixedTerm;

    // Derived Wage Basis (Code on Wages Rule: Basic must be at least 50% of CTC)
    // If Basic < 50% CTC, use 50% CTC as the wage basis for calculation.
    const wageBasis = Math.max(salaryInput, ctcInput * 0.5);
    const isWageIncreased = wageBasis > salaryInput;

    // Limits: Fully exempt for Govt, 20L for Private (as of FY 2025-26)
    const TAX_FREE_LIMIT = govtStatus ? Infinity : 2000000;

    // Eligibility check
    // Standard: 5 years. Fixed Term: 1 year.
    const minYears = fixedTerm ? 1 : 5;

    if (n < minYears) {
        return {
            payable: 0,
            eligible: false,
            taxExempt: 0,
            taxable: 0,
            limit: TAX_FREE_LIMIT,
            wageBasis,
            isWageIncreased
        };
    }

    // Gratuity Formula: (Wage * 15 * Years) / 26
    const gratuity = (wageBasis * 15 * n) / 26;

    // Tax Calculation
    const exempt = Math.min(gratuity, TAX_FREE_LIMIT);
    const taxable = Math.max(0, gratuity - exempt);

    return {
        payable: gratuity,
        eligible: true,
        taxExempt: exempt,
        taxable: taxable,
        limit: TAX_FREE_LIMIT,
        wageBasis,
        isWageIncreased
    };
};
