/**
 * A darker shade of a colour that keeps the hue the eye sees.
 *
 * A black layer over a colour darkens each RGB channel by the same factor,
 * which makes some hues drift: yellow turns olive. Working in OKLCH instead,
 * only the lightness goes down, so the shade reads as a deeper version of
 * the same colour. Yellows can also turn a few degrees warmer, the way paint
 * darkens towards amber.
 *
 * OKLab conversion from Björn Ottosson, https://bottosson.github.io/posts/oklab/
 */

const parseHex = (hex) => {
    const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim())
    if (!match) {
        return null
    }
    const digits =
        match[1].length === 3
            ? match[1]
                  .split('')
                  .map((d) => d + d)
                  .join('')
            : match[1]
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16))
}

const toLinear = (channel) => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

const toChannel = (linear) => {
    const c =
        linear <= 0.0031308
            ? 12.92 * linear
            : 1.055 * Math.pow(linear, 1 / 2.4) - 0.055
    return Math.round(Math.min(1, Math.max(0, c)) * 255)
}

export const rgbToOklch = ([r, g, b]) => {
    const R = toLinear(r)
    const G = toLinear(g)
    const B = toLinear(b)
    const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B)
    const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B)
    const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B)
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
    return {
        l: L,
        c: Math.hypot(a, bb),
        h: ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360,
    }
}

const oklchToLinearRgb = ({ l: L, c, h }) => {
    const a = c * Math.cos((h * Math.PI) / 180)
    const b = c * Math.sin((h * Math.PI) / 180)
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3)
    const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3)
    const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3)
    return [
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ]
}

const inGamut = (rgb) => rgb.every((v) => v >= -0.0001 && v <= 1.0001)

/**
 * Converts to a hex colour, lowering chroma until it fits in sRGB so the
 * lightness and hue stay as asked
 */
export const oklchToHex = ({ l, c, h }) => {
    let rgb = oklchToLinearRgb({ l, c, h })
    if (!inGamut(rgb)) {
        let low = 0
        let high = c
        for (let i = 0; i < 24; i++) {
            const mid = (low + high) / 2
            if (inGamut(oklchToLinearRgb({ l, c: mid, h }))) {
                low = mid
            } else {
                high = mid
            }
        }
        rgb = oklchToLinearRgb({ l, c: low, h })
    }
    return (
        '#' +
        rgb.map((v) => toChannel(v).toString(16).padStart(2, '0')).join('')
    )
}

// Below this lightness a darker shade can't be told apart from the colour,
// so the shade goes lighter instead, to at least LIFTED_LIGHTNESS (about #222)
const MIN_LIGHTNESS = 0.2
const LIFTED_LIGHTNESS = 0.25

// Hues around yellow (95°) turn towards orange (55°) as they darken
const YELLOW = 95
const YELLOW_RANGE = 45
const ORANGE = 55

/**
 * Near-black colours have no room to go darker, so they get a lighter shade
 * instead.
 *
 * @param {string} hex The colour to darken, such as '#f5c518'
 * @param {object} options
 * @param {number} options.darken How much to lower OKLCH lightness (0 to 1)
 * @param {number} [options.saturation=1] Multiplies OKLCH chroma
 * @param {number} [options.warmYellows=0] Degrees yellows turn towards orange
 * @returns {string|null} A hex colour, or null if `hex` isn't one
 */
export const sameHueShade = (
    hex,
    { darken, saturation = 1, warmYellows = 0 }
) => {
    const rgb = parseHex(hex)
    if (!rgb) {
        return null
    }
    const { l, c, h } = rgbToOklch(rgb)
    let hue = h
    const yellowness = Math.max(0, 1 - Math.abs(h - YELLOW) / YELLOW_RANGE)
    if (warmYellows && yellowness > 0) {
        hue -=
            Math.sign(h - ORANGE) *
            Math.min(Math.abs(h - ORANGE), warmYellows * yellowness)
    }
    const darker = l - darken
    return oklchToHex({
        l:
            darker < MIN_LIGHTNESS
                ? Math.max(l + darken, LIFTED_LIGHTNESS)
                : darker,
        c: c * saturation,
        h: hue,
    })
}
