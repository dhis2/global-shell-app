const config = {
    type: 'app',
    name: 'global-app-shell', // This must be exact to be used as the global shell
    title: 'Global Shell',

    pwa: { enabled: true },
    direction: 'auto',

    entryPoints: {
        app: './src/App.jsx',
    },
}

module.exports = config
