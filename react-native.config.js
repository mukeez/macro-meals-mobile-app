module.exports = {
  project: {
    ios: {},
    android: {},
  },
  assets: ['./assets/fonts/'],
  env: {
    development: {
      source: '.env.development',
    },
    staging: {
      source: '.env.staging',
    },
    production: {
      source: '.env.production',
    },
  },
}; 