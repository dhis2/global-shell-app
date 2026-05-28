import { pickHighlightRanges } from './highlighting.js'

describe('pickHighlightRanges function', () => {
    it('returns matchedIndices unchanged when text to highlight is empty', () => {
        expect(
            pickHighlightRanges({
                textToHighlight: '',
                matchedIndices: [[0, 1]],
                query: 'a',
            })
        ).toEqual([[0, 1]])
    })

    it('returns matchedIndices unchanged when matchedIndices is empty', () => {
        expect(
            pickHighlightRanges({
                textToHighlight: 'Hello',
                matchedIndices: [],
                query: 'a',
            })
        ).toEqual([])
    })

    it('returns undefined when matchedIndices is undefined', () => {
        expect(
            pickHighlightRanges({
                textToHighlight: 'Hello',
                matchedIndices: undefined,
                query: 'a',
            })
        ).toBeUndefined()
    })

    it('matches the same number of words in the query as in the text to highlight', () => {
        const result = pickHighlightRanges({
            textToHighlight: 'App Notifications',
            matchedIndices: [
                [0, 2],
                [4, 8],
            ],
            query: 'app notif',
        })
        expect(result).toEqual([
            [4, 8],
            [0, 2],
        ])
    })

    it('picks the longest contiguous range of matches and drops the rest', () => {
        // Fuse output for "setting" against "Notification Settings":
        // "Notification" (0-11): [[0,0],[2,3],[5,5],[8,9],[11,11]] — total matches: 7, longest contiguous match: 2
        // "Settings"     (13-19): [[13,19]] — total matches: 7, longest contiguous match: 7
        const result = pickHighlightRanges({
            textToHighlight: 'Notification Settings',
            matchedIndices: [
                [0, 0],
                [2, 3],
                [5, 5],
                [8, 9],
                [11, 11],
                [13, 19],
            ],
            query: 'setting',
        })
        expect(result).toEqual([[13, 19]])
    })
})
