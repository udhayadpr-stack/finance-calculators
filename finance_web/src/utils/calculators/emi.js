import { numberInRange, monthsFromYears, monthlyPayment } from './validation';

const empty = { emi: 0, totalInterest: 0, totalAmount: 0, schedule: [], monthlySchedule: [] };

export const calculateEMI = ({ loanAmount, interestRate, tenureYears } = {}) => {
    try {
        const principal = numberInRange(loanAmount, 'Loan amount');
        const rate = numberInRange(interestRate, 'Interest rate', 0, 100);
        const months = monthsFromYears(tenureYears);
        if (!principal || !months) return { ...empty };
        const emi = monthlyPayment(principal, rate, months);
        let balance = principal;
        let totalInterest = 0;
        let yearlyInterest = 0;
        let yearlyPrincipal = 0;
        const schedule = [];
        const monthlySchedule = [];
        for (let month = 1; month <= months; month++) {
            const interest = balance * rate / 1200;
            // Compute principal directly; EMI minus interest loses precision at extreme terms.
            const scheduledPrincipal = rate === 0 ? emi : emi * Math.exp(-(months - month + 1) * Math.log1p(rate / 1200));
            const repaid = month === months ? balance : Math.min(balance, scheduledPrincipal);
            balance = Math.max(0, balance - repaid);
            totalInterest += interest;
            yearlyInterest += interest;
            yearlyPrincipal += repaid;
            monthlySchedule.push({ month, payment: repaid + interest, principal: repaid, interest, balance });
            if (month % 12 === 0 || month === months) {
                schedule.push({ year: Math.ceil(month / 12), interest: yearlyInterest, principal: yearlyPrincipal, balance });
                yearlyInterest = 0;
                yearlyPrincipal = 0;
            }
        }
        return { emi, totalInterest, totalAmount: principal + totalInterest, schedule, monthlySchedule };
    } catch (error) {
        return { ...empty, error: error.message };
    }
};
