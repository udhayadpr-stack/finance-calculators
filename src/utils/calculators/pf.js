import { parseMoney } from '../formatters';

export const calculatePF = ({
    basicPay,
    currentAge,
    retirementAge,
    currentBalance,
    interestRate,
    annualIncrement,
    employeeContrRatio,
    employerContrRatio
}) => {
    let year = new Date().getFullYear();
    let balance = Number(currentBalance) || 0; // Ensure number
    let monthlyBasic = Number(basicPay) || 0;
    let age = Number(currentAge);
    const retAge = Number(retirementAge);

    // Trackers
    let totalInvestedEmployee = 0;
    let totalInvestedEmployer = 0;
    let totalInterest = 0;

    const breakdown = [];

    // EPS Cap is 15000 usually for calculation splitting
    const WAGE_CAP = 15000;

    // Safety check for infinite loop
    if (age >= retAge) {
        return {
            totalCorpus: balance,
            employeeShare: balance, // simplified
            employerShare: 0,
            totalInterest: 0,
            breakdown: []
        };
    }

    let totalMonths = (retAge - age) * 12;

    for (let m = 0; m < totalMonths; m++) {
        // Annual Increment logic (apply every 12th month relative to start, but AFTER the first year is done? 
        // Original logic: if (m > 0 && m % 12 === 0)
        if (m > 0 && m % 12 === 0) {
            monthlyBasic = monthlyBasic * (1 + (annualIncrement / 100));
            year++;
            age++;
        }

        // Calculate Contributions
        // Employee: Straight % of Basic
        let empShare = monthlyBasic * (employeeContrRatio / 100);

        // Employer: Split into EPS and EPF
        // EPS is 8.33% of Basic (capped at 15000 usually)
        let epsShare = 0;
        let epfShareEmployer = 0;

        // Standard rule: Employer pays 12%. 
        // 8.33% to EPS (max 1250), rest to EPF.
        let totalEmployerContribution = monthlyBasic * (employerContrRatio / 100);

        // EPS Calculation
        // EPS is 8.33% of Basic (capped at 15000)
        let epsBasis = Math.min(monthlyBasic, WAGE_CAP);
        // Correct calculation: 8.33% of capped wage, max 1250
        epsShare = Math.round(epsBasis * 0.0833);

        // EPF Employer = Total Employer Contribution - EPS
        // Note: Employer Contribution is 12% of Actual Basic (not capped for contribution usually, unless opted)
        // Ideally: (Basic * 12%) - EPS
        epfShareEmployer = totalEmployerContribution - epsShare;

        // Add to balance logic
        // Interest is usually credited annually on the opening balance + monthly additions
        // Simplified: Monthly interest compounding (though practically it's annual credit)
        // Rate is annual. Monthly rate = rate / 1200
        let monthlyInterest = (balance + empShare + epfShareEmployer) * (interestRate / 100 / 12);

        // Update trackers
        totalInvestedEmployee += empShare;
        totalInvestedEmployer += epfShareEmployer;
        totalInterest += monthlyInterest;

        balance += empShare + epfShareEmployer + monthlyInterest;

        // Record annual snapshot
        if ((m + 1) % 12 === 0 || m === totalMonths - 1) {
            breakdown.push({
                age,
                year,
                basic: monthlyBasic,
                balance,
                interest: totalInterest,
                empShare: totalInvestedEmployee,
                employerShare: totalInvestedEmployer
            });
        }
    }

    return {
        totalCorpus: balance,
        employeeShare: (Number(currentBalance) || 0) + totalInvestedEmployee,
        employerShare: totalInvestedEmployer,
        totalInterest,
        breakdown
    };
};
