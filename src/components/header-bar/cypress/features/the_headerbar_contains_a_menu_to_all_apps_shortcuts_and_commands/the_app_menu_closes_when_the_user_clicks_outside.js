import { When } from '@badeball/cypress-cucumber-preprocessor'

When('the user opens the menu', () => {
    cy.get('[data-test="headerbar-apps-icon"]').click()
})

When('the user clicks outside of the menu', () => {
    cy.get('.headerbar-apps-menu > dialog').click({ force: true })
})
