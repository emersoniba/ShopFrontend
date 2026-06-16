import { test } from '@playwright/test'

test('Ver localStorage', async ({ page }) => {

    await page.goto('http://localhost:4200/login')

    await page.fill(
        'input[formControlName="username"]',
        'eibanez'
    )

    await page.fill(
        'input[formControlName="password"]',
        '123456'
    )

    await page.click('button[type="submit"]')

    await page.waitForURL('**/dashboard/**')

    const storage = await page.evaluate(() => {

        return { ...localStorage }

    })

    console.log(storage)

})