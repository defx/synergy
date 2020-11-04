module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadless'],
    files: [
      { pattern: 'src/*.js', type: 'module' },
      { pattern: config.grep ? config.grep : 'test/*.js', type: 'module' },
    ],
    frameworks: ['esm', 'mocha', 'chai'],
    plugins: [require.resolve('@open-wc/karma-esm'), 'karma-*'],
    preprocessors: { '**/src/*.js': 'coverage' },
    reporters: ['progress', 'coverage'],
    singleRun: true,
    esm: {
      coverage: true,
    },
    coverageReporter: {
      type: 'lcov',
      dir: 'coverage/',
      subdir: function (browser) {
        return browser.toLowerCase().split(/[ /-]/)[0];
      },
    },
    logLevel: config.LOG_INFO,
  });
};
