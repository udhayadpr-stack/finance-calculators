import { numberInRange } from './validation';

const empty = { totalCorpus: 0, openingBalance: 0, employeeShare: 0, employerShare: 0, totalInterest: 0, epsContribution: 0, breakdown: [] };

export const calculatePF = ({ basicPay, currentAge, retirementAge, currentBalance,
    interestRate = 8.25, annualIncrement = 0, employeeContrRatio = 12, employerContrRatio = 12,
    epsEligible = true, epsWageCap = 15000, startYear = new Date().getFullYear(), startMonth = 4 } = {}) => {
    try {
        let basic = numberInRange(basicPay, 'Monthly basic pay');
        const age = numberInRange(currentAge, 'Current age', 0, 100);
        const endAge = numberInRange(retirementAge, 'Retirement age', 0, 100);
        const openingBalance = numberInRange(currentBalance, 'Opening balance');
        const rate = numberInRange(interestRate, 'Interest rate', 0, 100) / 1200;
        const increment = numberInRange(annualIncrement, 'Annual increment', 0, 100) / 100;
        const employeeRate = numberInRange(employeeContrRatio, 'Employee contribution', 0, 100) / 100;
        const employerRate = numberInRange(employerContrRatio, 'Employer contribution', 0, 100) / 100;
        const wageCap = numberInRange(epsWageCap, 'EPS wage ceiling');
        const year = numberInRange(startYear, 'Start year', 1900, 2200);
        const month = numberInRange(startMonth, 'Start month', 1, 12);
        if (!Number.isInteger(year) || !Number.isInteger(month)) throw new RangeError('Start year and month must be whole numbers.');
        if (endAge < age) throw new RangeError('Retirement age cannot be below current age.');
        const months = Math.round((endAge - age) * 12);
        let balance = openingBalance;
        let employeeShare = 0;
        let employerShare = 0;
        let epsContribution = 0;
        let totalInterest = 0;
        let accruedInterest = 0;
        const breakdown = [];
        for (let m = 0; m < months; m++) {
            if (m > 0 && m % 12 === 0) basic *= 1 + increment;
            const employee = basic * employeeRate;
            const employer = basic * employerRate;
            const ageAtMonth = age + m / 12;
            const eps = epsEligible && ageAtMonth < 58
                ? Math.min(employer, Math.round(Math.min(basic, wageCap) * 0.0833)) : 0;
            // Deposits earn from the following month. Interest is credited at March end,
            // so uncredited interest must not earn interest during the same financial year.
            const interest = balance * rate;
            accruedInterest += interest;
            totalInterest += interest;
            employeeShare += employee;
            employerShare += employer - eps;
            epsContribution += eps;
            balance += employee + employer - eps;
            const calendarMonth = (month - 1 + m) % 12 + 1;
            if (calendarMonth === 3 || m === months - 1) {
                balance += accruedInterest;
                accruedInterest = 0;
                breakdown.push({ age: Number((age + (m + 1) / 12).toFixed(2)),
                    year: year + Math.floor((month - 1 + m) / 12), month: calendarMonth,
                    basic, balance, interest: totalInterest, empShare: employeeShare, employerShare });
            }
        }
        return { totalCorpus: balance, openingBalance, employeeShare, employerShare, totalInterest, epsContribution, breakdown };
    } catch (error) {
        return { ...empty, error: error.message };
    }
};
