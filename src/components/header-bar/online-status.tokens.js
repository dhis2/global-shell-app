/**
 * Every value behind the connection status in the header bar, in one place.
 * The Connection Status Design lab exports this whole file, so tweaks made
 * there can be pasted straight back in.
 *
 * The badge is a small pill holding a glyph and the word "Online" or
 * "Offline". The glyph is two arrows passing each other: data going to and
 * coming back from the server. When the server can't be reached, the arrows
 * break. An app's status message (such as Data Entry's changes saved
 * locally) sits inside the pill, before the glyph.
 */
export const onlineStatusTokens = {
    glyph: {
        viewBox: '0 0 16 16',
        // 'stroke' draws the paths as lines; 'fill' fills them as shapes
        mode: 'fill',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        // One or more paths for each state
        paths: {
            online: [
                'M3.33301 6L2.80268 5.46967C2.58818 5.68417 2.52401 6.00676 2.6401 6.28701C2.75618 6.56727 3.02966 6.75 3.33301 6.75V6ZM12.667 6.75C13.0812 6.75 13.417 6.41421 13.417 6C13.417 5.58579 13.0812 5.25 12.667 5.25V6V6.75ZM6.53034 3.86333C6.82323 3.57044 6.82323 3.09556 6.53034 2.80267C6.23744 2.50978 5.76257 2.50978 5.46968 2.80267L6.00001 3.333L6.53034 3.86333ZM3.33301 6V6.75H12.667V6V5.25H3.33301V6ZM3.33301 6L3.86334 6.53033L6.53034 3.86333L6.00001 3.333L5.46968 2.80267L2.80268 5.46967L3.33301 6Z',
                'M12.667 10L13.1973 10.5303C13.4118 10.3158 13.476 9.99324 13.3599 9.71299C13.2438 9.43273 12.9704 9.25 12.667 9.25V10ZM3.33301 9.25C2.91879 9.25 2.58301 9.58579 2.58301 10C2.58301 10.4142 2.91879 10.75 3.33301 10.75V10V9.25ZM9.46968 12.1367C9.17678 12.4296 9.17678 12.9044 9.46968 13.1973C9.76257 13.4902 10.2374 13.4902 10.5303 13.1973L10 12.667L9.46968 12.1367ZM12.667 10V9.25H3.33301V10V10.75H12.667V10ZM12.667 10L12.1367 9.46967L9.46968 12.1367L10 12.667L10.5303 13.1973L13.1973 10.5303L12.667 10Z',
            ],
            offline: [
                'M3 5.25H6.5A0.75 0.75 0 0 1 6.5 6.75H3A0.75 0.75 0 0 1 3 5.25ZM12 5.25H13A0.75 0.75 0 0 1 13 6.75H12A0.75 0.75 0 0 1 12 5.25Z',
                'M3 9.25H4A0.75 0.75 0 0 1 4 10.75H3A0.75 0.75 0 0 1 3 9.25ZM9.5 9.25H13A0.75 0.75 0 0 1 13 10.75H9.5A0.75 0.75 0 0 1 9.5 9.25Z',
            ],
        },
    },

    badge: {
        height: 24,
        paddingInlineStart: 4,
        paddingInlineEnd: 6,
        borderRadius: 4,
        // Space between the end of the badge and the next header item
        marginInlineEnd: 8,
        glyphSize: 16,
        // In viewBox units, when glyph.mode is 'stroke'
        strokeWidth: 1.5,
        // Moves the glyph down (or up, below 0) in px
        glyphOffsetY: 0,
        gapToLabel: 3,
        label: {
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: 0.1,
            // Moves the word down (or up, below 0) in px
            offsetY: 0.5,
        },
        message: {
            fontSize: 12,
            fontWeight: 400,
            // From the end of the message to the glyph
            gap: 8,
            // Opacity of the message text
            opacity: { onWhite: 0.9, onBlack: 0.8 },
        },
    },

    // The bar shown below the header on screens narrower than 480px
    dense: {
        minHeight: 24,
        paddingInline: 4,
        glyphSize: 16,
        strokeWidth: 1.5,
        gapToLabel: 4,
        fontSize: 13,
        messageFontSize: 12,
        messageGap: 12,
    },

    // Behind the badge and the bar
    background: {
        // On the default header
        default: '#10436a',
        // On custom header colours: the header's own colour, darker in OKLCH
        // lightness so the hue holds (see same-hue-shade.js). Keyed by the
        // header's text colour.
        tone: {
            darkenOnWhite: 0.065,
            darkenOnBlack: 0.04,
            saturation: 1.2,
            // Degrees yellows turn towards orange instead of olive
            warmYellows: 4,
        },
    },

    motion: {
        // "Offline" fading and sliding in beside the glyph
        labelEnterMs: 0,
        labelEnterDistance: 0,
        labelEnterEasing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    },
}
