import { Given, Then } from '@badeball/cypress-cucumber-preprocessor'

Given(/no app name contains a (.*)/, (character) => {
    // Needs to be wrapped, otherwise for some reason the wrong char is in the scope
    cy.all(
        () => cy.window(),
        () => cy.wrap(character)
    ).then(([win, char]) => {
        const { dataProviderData } = win
        const { modules } = dataProviderData['action::menu/getModules']
        const modulesWithSpecialChar = modules.filter(
            (module) => module.displayName.indexOf(char) !== -1
        )

        expect(modulesWithSpecialChar).to.have.length(0)
    })
})

Then('no results should be shown', () => {
    cy.get('[data-test="headerbar-list"] > a > .text-content .title').should(
        'not.exist'
    )
    cy.get('[data-test="headerbar-empty-search"]').should('exist')
})
