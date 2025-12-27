import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PFCalculator from '../../src/components/calculators/PFCalculator';

describe('PFCalculator Integration', () => {
    it('renders and calculates default values', () => {
        render(<PFCalculator />);

        // check for title
        expect(screen.getByText('PF Calculator')).toBeInTheDocument();

        // check for default basic pay input
        expect(screen.getByDisplayValue('50,000')).toBeInTheDocument();

        // check for result (approx corpus for default values)
        // Default: 50k basic, 25 age, 58 retirement.
        // Corpus should be visible.
        expect(screen.getByText(/Total Corpus/i)).toBeInTheDocument();
        // Just checking if some result is rendered (not "NaN")
        const results = screen.getAllByText(/₹/i);
        expect(results.length).toBeGreaterThan(0);
    });

    it('visualization bar is present', () => {
        render(<PFCalculator />);
        expect(screen.getByText(/Corpus Breakdown/i)).toBeInTheDocument();
        expect(screen.getByText(/You:/i)).toBeInTheDocument();
        expect(screen.getByText(/Employer:/i)).toBeInTheDocument();
    });
});
