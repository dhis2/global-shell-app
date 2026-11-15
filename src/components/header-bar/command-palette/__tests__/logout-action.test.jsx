// Author: Morten Svanæs <msvanaes@dhis2.org>
import { clearSensitiveCaches } from '@dhis2/app-runtime'
import { fireEvent, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import React from 'react'
import { BrowserRouter } from 'react-router'
import CommandPalette from '../command-palette.jsx'
import {
    render,
    testApps,
    testCommands,
    testShortcuts,
} from './command-palette.test.jsx'

jest.mock('@dhis2/app-runtime', () => ({
    ...jest.requireActual('@dhis2/app-runtime'),
    clearSensitiveCaches: jest.fn(),
}))

describe('Command Palette - Logout action', () => {
    let submittedForms

    beforeAll(() => {
        // Testing environment does not support the <dialog> component yet so it has to mocked
        // linked issue: https://github.com/jsdom/jsdom/issues/3294
        HTMLDialogElement.prototype.showModal = jest.fn()
        HTMLDialogElement.prototype.close = jest.fn()
    })

    beforeEach(() => {
        submittedForms = []
        clearSensitiveCaches.mockResolvedValue(true)
        jest.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(
            function () {
                submittedForms.push(this)
            }
        )
    })

    afterEach(() => {
        jest.restoreAllMocks()
        clearSensitiveCaches.mockReset()
    })

    it('clears sensitive caches and then logs out with a POST', async () => {
        const user = userEvent.setup()
        const { container, queryByTestId } = render(
            <BrowserRouter>
                <CommandPalette
                    apps={testApps}
                    shortcuts={testShortcuts}
                    commands={testCommands}
                />
            </BrowserRouter>
        )

        // open modal with (Ctrl + k) keys
        fireEvent.keyDown(container, { key: 'k', ctrlKey: true })

        // the logout action is the last item of the home view
        await user.keyboard('{ArrowUp}')
        expect(queryByTestId('headerbar-logout')).toHaveClass('highlighted')
        await user.keyboard('{Enter}')

        await waitFor(() => expect(submittedForms).toHaveLength(1))
        expect(clearSensitiveCaches).toHaveBeenCalledTimes(1)
        expect(clearSensitiveCaches.mock.invocationCallOrder[0]).toBeLessThan(
            HTMLFormElement.prototype.submit.mock.invocationCallOrder[0]
        )
        const [form] = submittedForms
        expect(form.method).toBe('post')
        // useConfig falls back to the relative baseUrl '..' without a provider
        expect(form.getAttribute('action')).toBe(
            '../dhis-web-commons-security/logout.action'
        )
    })
})
