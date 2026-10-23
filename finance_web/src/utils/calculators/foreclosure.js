import { numberInRange, monthlyPayment } from './validation';

const empty = { foreclosureCost: 0, penalty: 0, penaltyBase: 0, gst: 0, interestIfContinued: 0, totalIfContinued: 0, emi: 0, netSavings: 0 };

export const calculateForeclosure = ({ outstandingPrincipal, interestRate, remainingTenure, foreclosureChargesPercent, gstPercent = 18 } = {}) => {
    try {
        const principal = numberInRange(outstandingPrincipal, 'Outstanding principal');
        const rate = numberInRange(interestRate, 'Interest rate', 0, 100);
        const months = numberInRange(remainingTenure, 'Remaining months', 0, 1200);
        if (!Number.isInteger(months)) throw new RangeError('Remaining tenure must be a whole number of months.');
        const chargeRate = numberInRange(foreclosureChargesPercent, 'Foreclosure charge', 0, 100);
        const gstRate = numberInRange(gstPercent, 'GST rate', 0, 100);
        const emi = monthlyPayment(principal, rate, months);
        const totalIfContinued = months ? Math.max(principal, emi * months) : principal;
        const penaltyBase = principal * chargeRate / 100;
        const gst = penaltyBase * gstRate / 100;
        const penalty = penaltyBase + gst;
        const foreclosureCost = principal + penalty;
        return { foreclosureCost, penalty, penaltyBase, gst, emi, totalIfContinued,
            interestIfContinued: totalIfContinued - principal, netSavings: totalIfContinued - foreclosureCost };
    } catch (error) {
        return { ...empty, error: error.message };
    }
};
