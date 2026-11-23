module.exports = function (api) {
    api.cache(true);
    return {
        // SDK 54 needs this for ESM dependencies such as Zustand middleware on web.
        presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    };
};
