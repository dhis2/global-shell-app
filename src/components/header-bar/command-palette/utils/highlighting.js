// Highlighting functionality:
// For every returned search result, we only highlight the parts of the word/phrase that match most with the filter/query

// TODO: see if new TokenSearch feature in fuse js library can be used - https://www.fusejs.io/token-search.html

export const pickHighlightRanges = ({
    textToHighlight,
    matchedIndices,
    query,
}) => {
    if (!matchedIndices?.length || !textToHighlight) {
        return matchedIndices
    }

    // for every word in the text to highlight, find its matched ranges
    // find the longest range or the one with the most matched characters to determine what to highlight
    const wordsWithMatches = []
    const allWordsInText = textToHighlight.matchAll(/\S+/g)

    for (const word of allWordsInText) {
        const wordStart = word.index
        const wordEnd = wordStart + word[0].length - 1

        const rangesInWord = matchedIndices
            .map(([rangeStart, rangeEnd]) => [
                Math.max(rangeStart, wordStart),
                Math.min(rangeEnd, wordEnd),
            ])
            .filter(([rangeStart, rangeEnd]) => rangeStart <= rangeEnd)
        if (rangesInWord.length === 0) {
            continue
        }

        // longestRangeLength = length of the longest contiguous matched range
        // totalMatchedChars = sum of all matched character lengths in this word
        let longestRangeLength = 0
        let totalMatchedChars = 0
        for (const [rangeStart, rangeEnd] of rangesInWord) {
            const rangeLength = rangeEnd - rangeStart + 1
            if (rangeLength > longestRangeLength) {
                longestRangeLength = rangeLength
            }
            totalMatchedChars += rangeLength
        }
        wordsWithMatches.push({
            ranges: rangesInWord,
            longestRangeLength,
            totalMatchedChars,
        })
    }

    // ranking words: longest range > total matched characters
    wordsWithMatches.sort(
        (a, b) =>
            b.longestRangeLength - a.longestRangeLength ||
            b.totalMatchedChars - a.totalMatchedChars
    )

    // highlight as many words as those entered into the filter/query
    const queryWordCount = query?.match(/\S+/g)?.length || 1
    const wordsToHighlight = wordsWithMatches.slice(0, queryWordCount)

    const rangesToHighlight = wordsToHighlight.flatMap((word) => word.ranges)

    return rangesToHighlight
}
