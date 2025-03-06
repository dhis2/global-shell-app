const pwaApps = [
    'dhis-web-dashboard',
    'dhis-web-data-visualizer',
    'dhis-web-maps',
    'dhis-web-line-listing',
    'api/apps/line-listing',
    'dhis-web-aggregate-data-entry',
]

/**
 * This is intended to fix a problem where the index.html file that servicer
 * workers in PWA apps try to fetch actually gets redirected to the global shell
 * index.html, which doesn't work with the rest of the app's assets. The result
 * is a blank page after reloading the app
 *
 * The strategy is to fetch the _correct_ index.html file, using
 * `?redirect=false` in the URL, then replacing the cache entry with the correct
 * HTML file
 */
export const patchPwaApps = async () => {
    // Get keys of app precaches
    const allKeys = await caches.keys()
    const precacheKeys = allKeys.filter((key) =>
        pwaApps.some((app) => key.includes(app))
    )

    const results = await Promise.all(
        precacheKeys.map(async (precacheKey) => {
            const cache = await caches.open(precacheKey)
            const appUrl = precacheKey.replace('workbox-precache-v2-', '')
            const correctIndexHtml = await fetch(
                `${appUrl}index.html?redirect=false`
            )
            const cacheKeys = await cache.keys()
            const indexHtmlKey = cacheKeys.find((key) =>
                key.url.includes('index.html')
            )
            if (indexHtmlKey) {
                await cache.put(indexHtmlKey.url, correctIndexHtml)
                console.log(`Patched ${appUrl}index.html`)
                return true
            }
        })
    )

    if (results.some((r) => r)) {
        console.log('Reloading to apply changes')
        window.location.reload()
    }
}
