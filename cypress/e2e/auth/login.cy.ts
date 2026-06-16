describe('Login', () => {

  it('Login correcto', () => {

    cy.visit('http://localhost:4200/login')

    cy.get('input[formControlName="username"]')
      .type('eibanez')

    cy.get('input[formControlName="password"]')
      .type('123456')

    cy.get('button[type="submit"]')
      .click()

    cy.get('body').then(($body) => {
      console.log($body.html())
    })

    cy.window().then((window) => {

      const token = window.localStorage.getItem('tkn-almacen')

      expect(token).to.exist

    })

  })
})