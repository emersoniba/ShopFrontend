describe('Login incorrecto', () => {

    it('Debe mostrar error con credenciales inválidas', () => {

        cy.intercept('POST', 'http://localhost:8000/api/auth/login/')
            .as('loginRequest')

        cy.visit('http://localhost:4200/login')

        cy.get('input[formControlName="username"]')
            .type('usuario_fake')

        cy.get('input[formControlName="password"]')
            .type('password_fake')

        cy.get('button[type="submit"]')
            .click()

        cy.wait('@loginRequest')
            .its('response.statusCode')
            .should('eq', 401)

    })

})