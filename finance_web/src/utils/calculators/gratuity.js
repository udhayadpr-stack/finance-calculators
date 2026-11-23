import { numberInRange } from './validation';

const empty = { payable: 0, eligible: false, taxExempt: 0, taxable: 0, limit: 2000000, wageBasis: 0, isWageIncreased: false, countedYears: 0 };

export const calculateGratuity = ({ basicPay, qualifyingRemuneration = 0, years, months = 0,
    isGovt = false, isFixedTerm = false, applyWageFloor = false, actualPayout, priorExemption = 0 } = {}) => {
    try {
        const basic = numberInRange(basicPay, 'Monthly qualifying wages');
        const remuneration = applyWageFloor && !isGovt ? numberInRange(qualifyingRemuneration, 'Qualifying monthly remuneration') : 0;
        const serviceYears = numberInRange(years, 'Years of service', 0, 60);
        const extraMonths = numberInRange(months, 'Additional months', 0, 11);
        if (!Number.isInteger(extraMonths)) throw new RangeError('Additional months must be a whole number.');
        const service = serviceYears + extraMonths / 12;
        if (service > 60) throw new RangeError('Service cannot exceed 60 years.');
        const wageBasis = !isGovt && applyWageFloor ? Math.max(basic, remuneration * 0.5) : basic;
        const prior = isGovt ? 0 : numberInRange(priorExemption, 'Previously claimed gratuity exemption', 0, 2000000);
        const limit = isGovt ? null : 2000000 - prior;
        const eligible = service >= (!isGovt && isFixedTerm ? 1 : 5);
        // Eligibility is checked BEFORE rounding service. Exactly six months is not rounded up.
        const completed = Math.floor(service);
        const countedYears = isFixedTerm && !isGovt ? service : completed + (service - completed > 0.5 + 1e-9 ? 1 : 0);
        let formulaAmount = 0;
        if (eligible) {
            formulaAmount = isGovt
                ? Math.min(wageBasis * Math.min(16.5, Math.floor(service * 2 + 1e-9) / 4), 2500000)
                : wageBasis * 15 * countedYears / 26;
        }
        const payable = eligible ? (actualPayout == null ? Math.min(formulaAmount, isGovt ? 2500000 : 2000000) : numberInRange(actualPayout, 'Actual gratuity payout')) : 0;
        const taxExempt = isGovt ? payable : Math.min(payable, formulaAmount, limit);
        return { payable, eligible, taxExempt, taxable: payable - taxExempt, limit,
            wageBasis, isWageIncreased: wageBasis > basic, countedYears, formulaAmount };
    } catch (error) {
        return { ...empty, error: error.message };
    }
};
