import { oklchToHex, rgbToOklch, sameHueShade } from './same-hue-shade.js'

const parse = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

describe('sameHueShade', () => {
    it('converts to OKLCH and back without changing the colour', () => {
        for (const hex of ['#165c92', '#1e7b45', '#f5c518', '#eef1f4']) {
            expect(oklchToHex(rgbToOklch(parse(hex)))).toBe(hex)
        }
    })

    it('lowers lightness by the amount asked and keeps the hue', () => {
        const before = rgbToOklch(parse('#1e7b45'))
        const shade = sameHueShade('#1e7b45', { darken: 0.065 })
        const after = rgbToOklch(parse(shade))
        expect(after.l).toBeCloseTo(before.l - 0.065, 2)
        expect(Math.abs(after.h - before.h)).toBeLessThan(1.5)
    })

    it('turns yellows warmer, and leaves blues alone', () => {
        const yellow = rgbToOklch(parse('#f5c518'))
        const warmed = rgbToOklch(
            parse(sameHueShade('#f5c518', { darken: 0.04, warmYellows: 4 }))
        )
        expect(warmed.h).toBeLessThan(yellow.h - 2)

        const blue = rgbToOklch(parse('#165c92'))
        const shaded = rgbToOklch(
            parse(sameHueShade('#165c92', { darken: 0.04, warmYellows: 4 }))
        )
        expect(Math.abs(shaded.h - blue.h)).toBeLessThan(1.5)
    })

    it('fits saturated colours into sRGB by lowering chroma, not hue or lightness', () => {
        const red = rgbToOklch(parse('#ff0000'))
        const shade = rgbToOklch(
            parse(sameHueShade('#ff0000', { darken: 0.05, saturation: 1.6 }))
        )
        expect(shade.l).toBeCloseTo(red.l - 0.05, 2)
        expect(Math.abs(shade.h - red.h)).toBeLessThan(1.5)
    })

    it('goes lighter on near-black colours, where darker would not show', () => {
        for (const hex of ['#000000', '#0a0a0a', '#0b1f3a']) {
            const before = rgbToOklch(parse(hex))
            const after = rgbToOklch(
                parse(sameHueShade(hex, { darken: 0.065 }))
            )
            expect(after.l).toBeGreaterThan(before.l)
            expect(after.l).toBeGreaterThanOrEqual(0.249)
        }
    })

    it('accepts short hex and returns null for anything else', () => {
        expect(sameHueShade('#fff', { darken: 0.1 })).toMatch(/^#[0-9a-f]{6}$/)
        expect(sameHueShade('rgb(0, 0, 0)', { darken: 0.1 })).toBeNull()
        expect(sameHueShade(undefined, { darken: 0.1 })).toBeNull()
    })
})
