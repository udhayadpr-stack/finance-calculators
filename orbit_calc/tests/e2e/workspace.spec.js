import { test, expect } from '@playwright/test';

test('static export loads, recalculates dependencies and persists the worksheet', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/');
    const lines = page.getByRole('textbox', {name: 'Math expression'});
    await expect(lines).toHaveCount(1);
    await lines.first().fill('a = 7');
    await page.getByRole('button', {name: 'Add new line'}).click();
    await lines.nth(1).fill('a * 3');
    await expect(page.getByText('21', {exact:true})).toBeVisible();
    await page.reload();
    await expect(page.getByText('21', {exact:true})).toBeVisible();
    await lines.first().fill('a = 8');
    await expect(page.getByText('24', {exact:true})).toBeVisible();
    await page.getByRole('button', {name:'Delete line'}).first().click();
    await expect(page.getByText(/Undefined symbol a/)).toBeVisible();
    await page.getByRole('button', {name:'Delete line'}).click();
    await expect(lines).toHaveCount(1);
    await expect(lines).toHaveValue('');
    expect(errors).toEqual([]);
});

test('recovers from corrupt stored workspace in a phone viewport', async ({ page }) => {
    await page.setViewportSize({width:393,height:851});
    await page.addInitScript(() => localStorage.setItem('orbit-workspace', 'broken'));
    await page.goto('/');
    await expect(page.getByText(/Saved workspace could not be loaded/)).toBeVisible();
    const line = page.getByRole('textbox', {name:'Math expression'});
    await line.fill('2+2');
    await expect(page.getByText('4', {exact:true})).toBeVisible();
});
