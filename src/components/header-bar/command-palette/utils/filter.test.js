import Fuse from 'fuse.js'
import { filterItemsArray, fuseOptions } from './filter.js'

describe('filter helper functions', () => {
    const itemsToSearch = [
        { name: 'Médic' },
        { name: 'Medical Records' },
        { name: 'Import/Export App' },
        { name: 'Covid 19' },
        { name: "Facility's Dashboard" },
        { name: '{App}' },
    ]

    const getResults = (items, searchTerm) => {
        const fuseObject = new Fuse(items, fuseOptions)
        const filteredResults = filterItemsArray(fuseObject, searchTerm)
        return filteredResults.map(({ item }) => item)
    }

    test.each([
        {
            searchTerm: 'ed',
            expected: [{ name: 'Médic' }, { name: 'Medical Records' }],
        },
        {
            searchTerm: 'e',
            expected: [],
        },
        { searchTerm: "'", expected: [] },
        {
            searchTerm: 'FACILITYSDASHBOARD',
            expected: [{ name: "Facility's Dashboard" }],
        },
        { searchTerm: '/', expected: [] },

        { searchTerm: 'Covid19', expected: [{ name: 'Covid 19' }] },
        { searchTerm: 'Covid-19', expected: [{ name: 'Covid 19' }] },
        { searchTerm: '{', expected: [] },
        {
            searchTerm: ' ',
            expected: [],
        },
    ])(
        'filterItemsArray function handles search for $searchTerm',
        ({ searchTerm, expected }) => {
            expect(getResults(itemsToSearch, searchTerm)).toEqual(expected)
        }
    )

    test('filterItemsArray should consider both name and displayName', () => {
        const itemsToSearch = [
            { name: 'category options', displayName: 'فئات الخيارت' },
        ]
        expect(getResults(itemsToSearch, 'فئات')).toEqual(itemsToSearch)
        expect(getResults(itemsToSearch, 'category')).toEqual(itemsToSearch)
    })

    test('filterItemsArray should consider appName if it is available', () => {
        const itemsToSearch = [
            { name: 'category options', appName: 'Maintenance' },
            { name: 'Indicators', appName: 'Maintenance' },
            { name: 'notifications', appName: 'System Settings' },
        ]
        expect(getResults(itemsToSearch, 'maintenance')).toEqual(
            itemsToSearch.slice(0, 2)
        )
        expect(getResults(itemsToSearch, 'system')).toEqual(
            itemsToSearch.slice(-1)
        )
    })
})
