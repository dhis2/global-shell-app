import { pickHighlightRanges } from './highlighting.js'

describe('pickHighlightRanges', () => {
    describe('early returns', () => {
        it('returns matchedIndices unchanged when textToHighlight is empty', () => {
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
    })

    describe('single-word query', () => {
        it('keeps only the winning word and drops matches in other words', () => {
            // text: "Rust settings"
            //   "Rust"     positions 0-3
            //   "settings" positions 5-12
            // Simulated Fuse indices: "st" in Rust, "sett" in settings.
            // Top-1 winner: "settings" (longest range 4 > "Rust" 2).
            const result = pickHighlightRanges({
                textToHighlight: 'Rust settings',
                matchedIndices: [
                    [2, 3],
                    [5, 8],
                ],
                query: 'sett',
            })
            expect(result).toEqual([[5, 8]])
        })

        it('skips words with no overlapping ranges entirely', () => {
            // Indices only fall inside "World"; "Hello" and "Foo" are skipped.
            const result = pickHighlightRanges({
                textToHighlight: 'Hello World Foo',
                matchedIndices: [[6, 7]],
                query: 'wo',
            })
            expect(result).toEqual([[6, 7]])
        })
    })

    describe('multi-word query', () => {
        it('keeps the top N words where N is the number of words in query', () => {
            // Both words match — "Notifications" wins on length, "App" still kept.
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

        it('clips ranges that span word boundaries', () => {
            // text: "Notification Settings" (space at index 12)
            // Fuse returns one big span [0,20] covering both words.
            // The single span must be clipped into per-word pieces.
            const result = pickHighlightRanges({
                textToHighlight: 'Notification Settings',
                matchedIndices: [[0, 20]],
                query: 'notification settings',
            })
            expect(result).toEqual([
                [0, 11],
                [13, 20],
            ])
        })
    })

    describe('tie-breaking', () => {
        // Regression test: when two words have the same total matched
        // characters, the word with the longest contiguous range wins.
        // Without this rule, "Notification" would win for query "setting"
        // (it sorts first in the text) even though "Settings" has the
        // clearly-superior 7-char contiguous match.
        it('prefers longest contiguous range when totals are tied', () => {
            // Real Fuse output for "setting" against "Notification Settings":
            //   "Notification" (0-11): [[0,0],[2,3],[5,5],[8,9],[11,11]] — total 7, longest 2
            //   "Settings"     (13-19): [[13,19]]                         — total 7, longest 7
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

    describe('query word count defaults', () => {
        // Without these defaults, queryWordCount would be undefined and
        // slice(0, undefined) would keep every word — re-introducing the
        // "highlight scattered characters everywhere" bug.
        test.each([
            { query: undefined, label: 'undefined' },
            { query: '', label: 'empty string' },
            { query: '   ', label: 'whitespace only' },
        ])('defaults to 1 word when query is $label', ({ query }) => {
            const result = pickHighlightRanges({
                textToHighlight: 'Hello World',
                matchedIndices: [
                    [0, 4],
                    [6, 10],
                ],
                query,
            })
            expect(result).toHaveLength(1)
        })
    })
})
