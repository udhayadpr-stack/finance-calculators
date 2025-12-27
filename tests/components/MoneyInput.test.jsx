import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MoneyInput } from '../../src/components/ui/MoneyInput';

describe('MoneyInput Component', () => {
    it('renders with label', () => {
        render(<MoneyInput label="Test Amount" value={100} onChange={() => { }} />);
        expect(screen.getByText('Test Amount')).toBeInTheDocument();
        expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    });

    it('manual toggle updates attributes', () => {
        const handleToggle = vi.fn();
        render(
            <MoneyInput
                label="Toggle Test"
                value={100}
                onChange={() => { }}
                isManual={false}
                onToggleMode={handleToggle}
            />
        );

        const button = screen.getByRole('button', { name: /ensure manually/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(button);
        expect(handleToggle).toHaveBeenCalledTimes(1);
    });

    it('has accessible association between label and input', () => {
        render(<MoneyInput label="Accessible Input" value={500} onChange={() => { }} />);
        const label = screen.getByText('Accessible Input');
        const input = screen.getByDisplayValue('500');

        // Label should have htmlFor matching input's id
        expect(label).toHaveAttribute('for', input.id);
        expect(input.id).toBeTruthy();
    });
});
