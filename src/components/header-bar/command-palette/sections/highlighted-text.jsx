import { colors } from '@dhis2/ui-constants'
import PropTypes from 'prop-types'
import React from 'react'
import Highlighter from 'react-highlight-words'

const highlightStyle = {
    background: colors.yellow100,
    color: 'inherit',
    padding: 0,
    borderRadius: '2px',
}

function HighlightedText({ text, indices }) {
    if (!text) {
        return null
    }
    if (!indices || indices.length === 0) {
        return <>{text}</>
    }

    return (
        <Highlighter
            searchWords={[]}
            textToHighlight={text}
            findChunks={() =>
                indices.map(([start, end]) => ({ start, end: end + 1 }))
            }
            highlightTag="mark"
            highlightStyle={highlightStyle}
        />
    )
}

HighlightedText.propTypes = {
    indices: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.number.isRequired)
    ),
    text: PropTypes.string,
}

export default HighlightedText
