import { test, expect } from '@playwright/test'

test('Login completo exitoso', async ({ page }) => {

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

    // Validar redirect
    await expect(page)
        .toHaveURL(/dashboard/)

    // Validar token
    const token = await page.evaluate(() => {

        return localStorage.getItem('access')

    })

    expect(token).not.toBeNull()

    // Validar formato JWT
    expect(token?.split('.').length).toBe(3)

})