module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ['babel-preset-expo', {
          unstable_transformImportMeta: true
        }],
        "nativewind/babel"
      ],
      plugins: [
        'react-native-reanimated/plugin',
        ['module:react-native-dotenv', {
          moduleName: '@env',
          path: '.env',
        }]
      ]
    };
  };