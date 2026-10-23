import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MoneyInput } from '../../src/components/ui/MoneyInput';
import { ThemeToggle } from '../../src/components/ui/ThemeToggle';
import EMICalculator from '../../src/components/calculators/EMICalculator';
import InHandSalary from '../../src/components/calculators/InHandSalary';

function InputHarness() {
    const [amount, setAmount] = useState(12345);
    return <MoneyInput label="Amount" value={amount} onChange={setAmount} />;
}
afterEach(() => vi.restoreAllMocks());
describe('Input and display regressions', () => {
    it('allows clearing, decimal editing and formatted blur without effect-driven state', () => {
        render(<InputHarness />);
        const input = screen.getByRole('textbox', {name: 'Amount'});
        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: ''}});
        expect(input).toHaveValue('');
        fireEvent.change(input, {target: {value: '1234.50'}});
        fireEvent.blur(input);
        expect(input).toHaveValue('1,234.5');
    });
    it('reports invalid input instead of reinterpreting a negative number', () => {
        render(<InputHarness />);
        const input = screen.getByRole('textbox', {name: 'Amount'});
        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: '-5'}});
        expect(input).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    it('keeps theme control functional when browser storage is blocked', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {throw new Error('Blocked');});
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {throw new Error('Blocked');});
        render(<ThemeToggle />);
        fireEvent.click(screen.getByRole('button'));
        expect(document.documentElement).toHaveClass('dark');
    });
    it('clears an EMI result without rendering NaN percentages', () => {
        const {container} = render(<EMICalculator />);
        const input = screen.getByRole('textbox', {name: 'Loan Amount'});
        fireEvent.focus(input);
        fireEvent.change(input, {target: {value: ''}});
        expect(container.textContent).not.toMatch(/NaN|Infinity/);
        expect(screen.getByRole('button', {name: /Export CSV/})).toBeDisabled();
    });
    it('shows both tax estimates and excludes PT from new-regime tax deductions', () => {
        render(<InHandSalary />);
        expect(screen.getByText('New regime annual tax')).toBeInTheDocument();
        expect(screen.getByText('Old regime annual tax')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', {name: 'Explain New Regime Tax'}));
        expect(screen.queryByText('Prof. Tax')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', {name: 'Old Regime'}));
        expect(screen.getByText('Prof. Tax')).toBeInTheDocument();
    });
});
