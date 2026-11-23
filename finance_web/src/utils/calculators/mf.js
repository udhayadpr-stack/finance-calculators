import { numberInRange, monthsFromYears } from './validation';

const empty = { invested: 0, estReturns: 0, totalValue: 0 };

export const calculateMF = ({ type = 'sip', amount, rate, years, contributionTiming = 'beginning' } = {}) => {
    try {
        const principal = numberInRange(amount, 'Investment amount');
        const annualRate = numberInRange(rate, 'Expected return', -100, 100) / 100;
        const duration = numberInRange(years, 'Duration in years', 0, 100);
        if (!['sip', 'lumpsum'].includes(type)) throw new RangeError('Select SIP or lumpsum.');
        if (!['beginning', 'end'].includes(contributionTiming)) throw new RangeError('Select beginning or end of month.');
        const months = monthsFromYears(duration);
        let invested = principal;
        let totalValue = principal * Math.pow(1 + annualRate, duration);
        if (type === 'sip') {
            invested = principal * months;
            const monthlyRate = annualRate / 12;
            totalValue = monthlyRate === 0 ? invested : principal * Math.expm1(months * Math.log1p(monthlyRate)) / monthlyRate;
            if (contributionTiming === 'beginning') totalValue *= 1 + monthlyRate;
        }
        return { invested, totalValue, estReturns: totalValue - invested };
    } catch (error) {
        return { ...empty, error: error.message };
    }
};
