const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Esta linha garante que o Metro olhe para dentro de `node_modules` para transpilar o código.
config.watchFolders = [__dirname, ...config.watchFolders];

config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;