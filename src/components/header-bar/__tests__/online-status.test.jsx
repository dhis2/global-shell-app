import { render } from '@testing-library/react'
import React from 'react'
import { OnlineStatus } from '../online-status.jsx'

const mockConnection = { isConnected: true }
const mockMessage = { onlineStatusMessage: undefined }

jest.mock('@dhis2/app-runtime', () => ({
    useDhis2ConnectionStatus: () => mockConnection,
    useOnlineStatusMessage: () => mockMessage,
}))

const pillOf = (container) =>
    container.querySelector('[data-test="headerbar-online-status"] .pill')

describe('OnlineStatus', () => {
    afterEach(() => {
        mockConnection.isConnected = true
        mockMessage.onlineStatusMessage = undefined
    })

    it('shows the glyph and the word in the pill', () => {
        const { container } = render(<OnlineStatus />)
        const pill = pillOf(container)
        expect(pill.querySelector('svg.icon.online')).not.toBeNull()
        expect(pill.querySelector('.label').textContent).toBe('Online')
        expect(pill.querySelector('.info')).toBeNull()
        expect(pill.classList.contains('has-message')).toBe(false)
    })

    it("puts an app's message inside the pill, before the glyph", () => {
        mockMessage.onlineStatusMessage = '2 changes saved locally'
        const { container } = render(<OnlineStatus />)
        const pill = pillOf(container)
        expect(pill.classList.contains('has-message')).toBe(true)
        expect(pill.firstElementChild.classList.contains('info')).toBe(true)
        expect(pill.firstElementChild.textContent).toBe(
            '2 changes saved locally'
        )
        expect(pill.firstElementChild.nextElementSibling.tagName).toBe('svg')
    })

    it('shows offline with the message in the pill', () => {
        mockConnection.isConnected = false
        mockMessage.onlineStatusMessage = '12 changes saved locally'
        const { container } = render(<OnlineStatus />)
        const pill = pillOf(container)
        expect(pill.classList.contains('offline')).toBe(true)
        expect(pill.querySelector('svg.icon.offline')).not.toBeNull()
        expect(pill.querySelector('.info').textContent).toBe(
            '12 changes saved locally'
        )
        expect(pill.querySelector('.label').textContent).toBe('Offline')
    })

    it('keeps the message after the word in the phone bar', () => {
        mockMessage.onlineStatusMessage = '2 changes saved locally'
        const { container } = render(<OnlineStatus dense />)
        const bar = container.querySelector(
            '[data-test="headerbar-online-status"].bar'
        )
        expect(bar.querySelector('.pill')).toBeNull()
        expect(bar.lastElementChild.previousElementSibling).toBe(
            bar.querySelector('.info-dense')
        )
    })
})
