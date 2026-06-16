import { test, expect } from '@playwright/test'

test('Login API correcto', async ({ request }) => {

    const response = await request.post(
        'http://localhost:8000/api/auth/login/',
        {
            data: {
                username: 'eibanez',
                password: '123456'
            }
        }
    )

    expect(response.status()).toBe(200)

    const body = await response.json()

    // Validar estructura
    expect(body).toHaveProperty('message')
    expect(body).toHaveProperty('data')

    // Validar tokens
    expect(body.data).toHaveProperty('access')
    expect(body.data).toHaveProperty('refresh')

    // Validar usuario
    expect(body.data).toHaveProperty('user')
    expect(body.data.user.username).toBe('eibanez')

    console.log(body)

})