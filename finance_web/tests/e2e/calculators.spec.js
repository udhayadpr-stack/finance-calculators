import { test, expect } from '@playwright/test';

test('all calculators support direct navigation, refresh and responsive layout', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const routes = [['/', 'Annual CTC'], ['/pf', 'PF Calculator'], ['/gratuity', 'Gratuity Calculator'], ['/emi', 'EMI Calculator'], ['/mf', 'Mutual Fund Returns'], ['/foreclosure', 'Loan Foreclosure']];
    for (const [route, heading] of routes) {
        await page.goto(route);
        await expect(page.getByRole('heading', {name: heading, exact: true})).toBeVisible();
        await page.reload();
        await expect(page.getByRole('heading', {name: heading, exact: true})).toBeVisible();
        await expect(page.locator('body')).not.toContainText(/NaN|Infinity/);
        const sizes = await page.evaluate(() => ({body: document.documentElement.scrollWidth, viewport: innerWidth}));
        expect(sizes.body).toBeLessThanOrEqual(sizes.viewport + 1);
    }
    expect(errors).toEqual([]);
});

test('loan zero state, invalid tenure and CSV export', async ({ page }) => {
    await page.goto('/emi');
    await page.getByRole('textbox', {name: 'Loan Amount', exact: true}).fill('1200');
    await page.getByRole('textbox', {name: 'Interest Rate (%)', exact: true}).fill('0');
    await page.getByRole('spinbutton', {name: 'Tenure in years'}).fill('1');
    await expect(page.getByText('₹100', {exact: true}).first()).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', {name: 'Export CSV'}).click();
    expect((await download).suggestedFilename()).toBe('loan-amortization.csv');
    await page.getByRole('spinbutton', {name: 'Tenure in years'}).fill('-1');
    await expect(page.getByRole('alert')).toContainText('Tenure in years');
    await page.getByRole('spinbutton', {name: 'Tenure in years'}).fill('1');
    await page.getByRole('textbox', {name: 'Loan Amount', exact: true}).fill('');
    await expect(page.locator('body')).not.toContainText('NaN');
    await expect(page.getByRole('button', {name: 'Export CSV'})).toBeDisabled();
});

test('theme persists, salary regimes switch and unknown routes recover', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', {name: 'Toggle Dark Mode'}).click();
    const theme = await page.locator('html').getAttribute('class');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('class', theme || '');
    await page.getByRole('button', {name: 'Old Regime', exact: true}).click();
    await expect(page.getByRole('textbox', {name: '80C total (incl. EPF)'})).toBeVisible();
    await page.getByRole('button', {name: 'New Regime', exact: true}).click();
    await expect(page.getByRole('textbox', {name: '80C total (incl. EPF)'})).toHaveCount(0);
    await page.goto('/missing');
    await expect(page.getByRole('heading', {name: 'Calculator not found'})).toBeVisible();
    await page.getByRole('link', {name: 'Return to salary calculator'}).click();
    await expect(page.getByRole('heading', {name: 'Annual CTC'})).toBeVisible();
});

test('gratuity service boundaries and SIP timing controls update results', async ({ page }) => {
    await page.goto('/gratuity');
    await page.getByRole('textbox', {name: 'Monthly qualifying wages', exact: true}).fill('26000');
    await expect(page.getByText('₹75,000', {exact: true}).first()).toBeVisible();
    await page.getByRole('spinbutton', {name: 'Additional completed months'}).fill('6');
    await expect(page.getByText('₹75,000', {exact: true}).first()).toBeVisible();
    await page.getByRole('spinbutton', {name: 'Additional completed months'}).fill('7');
    await expect(page.getByText('₹90,000', {exact: true}).first()).toBeVisible();
    await page.goto('/mf');
    const before = await page.locator('body').textContent();
    await page.getByRole('combobox', {name: 'Monthly deposit timing'}).selectOption('end');
    expect(await page.locator('body').textContent()).not.toBe(before);
});
