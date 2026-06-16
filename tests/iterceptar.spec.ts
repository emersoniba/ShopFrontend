import { test, expect } from '@playwright/test'

test('Login API', async ({ page }) => {

    const responsePromise = page.waitForResponse(
        'http://localhost:8000/api/auth/login/'
    )

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

    const response = await responsePromise

    expect(response.status()).toBe(200)

})