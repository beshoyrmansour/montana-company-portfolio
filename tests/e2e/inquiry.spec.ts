import { expect, test } from '@playwright/test';

test('contact inquiry keeps the draft on failure and confirms successful retries', async ({
  page,
}) => {
  const submissions: Array<{ contentType: string | undefined; data: unknown }> = [];
  await page.route('**/api/contact', async (route) => {
    const request = route.request();
    submissions.push({
      contentType: request.headers()['content-type'],
      data: request.postDataJSON(),
    });
    if (submissions.length === 1) {
      await route.fulfill({ status: 502, json: { error: 'mail_failed' } });
    } else {
      await route.fulfill({ status: 200, json: { ok: true } });
    }
  });

  await page.goto('/en/contact');
  await page.getByRole('button', { name: 'Sample request' }).click();
  await page.getByLabel('Full name').fill('Test Visitor');
  await page.locator('#cf-company').fill('Test Company');
  await page.locator('#cf-email').fill('visitor@example.com');
  await page.getByLabel('Destination country').fill('Egypt');
  const message = page.getByLabel('Tell us a bit more');
  await message.fill('Please share the sample options.');
  await page.getByRole('checkbox').check();
  const submit = page.getByRole('button', { name: 'Send to the export desk' });

  await submit.click();
  await expect(page.getByText(/we couldn’t send your message/i)).toBeVisible();
  await expect(message).toHaveValue('Please share the sample options.');
  await expect(page.getByText('Message received.')).toHaveCount(0);
  await expect(page.getByRole('checkbox')).toBeChecked();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByText('Message received.')).toBeVisible();
  expect(submissions).toHaveLength(2);
  expect(submissions[0]).toMatchObject({
    contentType: 'application/json',
    data: { reason: 'sample', subject: 'sales', consent: true, country: 'Egypt' },
  });
  expect(submissions[1]).toEqual(submissions[0]);
});
