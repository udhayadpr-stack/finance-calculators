export const MAX_AMOUNT = 1e12;

export function numberInRange(value, label, min = 0, max = MAX_AMOUNT) {
    const number = value === '' || value == null ? 0 : Number(value);
    if (!Number.isFinite(number) || number < min || number > max) {
        throw new RangeError(`${label} must be a finite number between ${min.toLocaleString('en-IN')} and ${max.toLocaleString('en-IN')}.`);
    }
    return number;
}

export function monthsFromYears(value) {
    const years = numberInRange(value, 'Tenure in years', 0, 100);
    return Math.round(years * 12);
}

// log1p/expm1 avoid cancellation at very small positive rates and overflow at long tenures.
export function monthlyPayment(principal, annualRate, months) {
    if (!months || !principal) return 0;
    const rate = annualRate / 1200;
    return rate === 0 ? principal / months : principal * rate / -Math.expm1(-months * Math.log1p(rate));
}
