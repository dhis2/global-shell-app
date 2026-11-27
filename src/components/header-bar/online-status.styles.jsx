import css from 'styled-jsx/css'
import { useCustomColorContext } from './custom-color-context.jsx'
import { onlineStatusTokens } from './online-status.tokens.js'
import { sameHueShade } from './same-hue-shade.js'

const { badge, dense, background, motion } = onlineStatusTokens

const useOnlineStatusStyles = () => {
    const { hasCustomColor, color, bgColor } = useCustomColorContext()

    // The header's text colour is white or black, picked for contrast
    const onBlack = color === 'black'
    const ink = onBlack ? '0, 0, 0' : '255, 255, 255'
    const messageOpacity = onBlack
        ? badge.message.opacity.onBlack
        : badge.message.opacity.onWhite
    // On custom header colours, a darker shade of the header itself. If the
    // colour isn't hex, a light black layer over the header colour still sets
    // it apart, including in the phone bar, which has nothing behind it.
    const shade =
        hasCustomColor &&
        sameHueShade(bgColor, {
            darken: onBlack
                ? background.tone.darkenOnBlack
                : background.tone.darkenOnWhite,
            saturation: background.tone.saturation,
            warmYellows: background.tone.warmYellows,
        })
    const pillBackground = !hasCustomColor
        ? background.default
        : shade ||
          `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)) ${bgColor}`

    return css`
        .container {
            display: flex;
            align-items: center;
            flex-shrink: 0;
            color: rgb(${ink});
        }

        .unselectable {
            cursor: default;
            user-select: none;
        }

        /*
         * Glyph. styled-jsx doesn't scope the SVG, so its rules reach it with
         * :global() from inside the scoped container.
         */
        .container :global(.icon) {
            display: block;
            flex: none;
            overflow: visible;
        }

        /* Badge, in the header bar */
        .badge {
            margin-inline-end: ${badge.marginInlineEnd}px;
        }
        .pill {
            display: flex;
            align-items: center;
            gap: ${badge.gapToLabel}px;
            block-size: ${badge.height}px;
            padding-inline: ${badge.paddingInlineStart}px
                ${badge.paddingInlineEnd}px;
            border-radius: ${badge.borderRadius}px;
            background: ${pillBackground};
        }
        /* A message starts the pill with text, so it gets the text-side padding */
        .pill.has-message {
            padding-inline-start: ${badge.paddingInlineEnd}px;
        }
        .pill :global(.icon) {
            inline-size: ${badge.glyphSize}px;
            block-size: ${badge.glyphSize}px;
            stroke-width: ${badge.strokeWidth};
            translate: 0 ${badge.glyphOffsetY}px;
        }
        .pill .label {
            font-size: ${badge.label.fontSize}px;
            font-weight: ${badge.label.fontWeight};
            letter-spacing: ${badge.label.letterSpacing}px;
            white-space: nowrap;
            translate: 0 ${badge.label.offsetY}px;
        }
        .pill.offline .label {
            animation: label-enter ${motion.labelEnterMs}ms
                ${motion.labelEnterEasing};
        }
        :global([dir='rtl']) .pill.offline .label {
            animation-name: label-enter-rtl;
        }
        /* "Offline" comes out from the glyph's side */
        @keyframes label-enter {
            from {
                opacity: 0;
                transform: translateX(-${motion.labelEnterDistance}px);
            }
        }
        @keyframes label-enter-rtl {
            from {
                opacity: 0;
                transform: translateX(${motion.labelEnterDistance}px);
            }
        }
        .info {
            /* The pill's gap plus this makes message.gap */
            margin-inline-end: ${badge.message.gap - badge.gapToLabel}px;
            color: rgba(${ink}, ${messageOpacity});
            font-size: ${badge.message.fontSize}px;
            font-weight: ${badge.message.fontWeight};
            letter-spacing: ${badge.label.letterSpacing}px;
            white-space: nowrap;
        }

        /* Bar, below the header on narrow screens */
        .bar {
            display: none;
            justify-content: center;
            min-block-size: ${dense.minHeight}px;
            padding: 0 ${dense.paddingInline}px;
            background: ${pillBackground};
            font-size: ${dense.fontSize}px;
        }
        .bar :global(.icon) {
            inline-size: ${dense.glyphSize}px;
            block-size: ${dense.glyphSize}px;
            margin-inline-end: ${dense.gapToLabel}px;
            stroke-width: ${dense.strokeWidth};
        }
        .info-dense {
            margin-inline-start: ${dense.messageGap}px;
            font-size: ${dense.messageFontSize}px;
        }

        @media (max-width: 480px) {
            .container.badge {
                display: none;
            }
            .container.bar {
                display: flex;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .pill.offline .label,
            :global([dir='rtl']) .pill.offline .label {
                animation-name: label-fade;
            }
        }
        @keyframes label-fade {
            from {
                opacity: 0;
            }
        }
    `
}

export default useOnlineStatusStyles
