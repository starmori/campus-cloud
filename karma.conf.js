process.env.CHROME_BIN = require('puppeteer').executablePath();
process.env.CHROME_DEVEL_SANDBOX =
  '/home/oohlala/oohlalamobile/node_modules/puppeteer/.local-chromium/linux-599821/chrome-linux/chrome_sandbox';

var webpackConfig = require('./webpack.config');
const jasmineSeedReporter = require('./jasmine-seed-reporter.js');

var ENV = process.env.npm_lifecycle_event;
var isTestWatch = ENV === 'test-watch';

module.exports = function(config) {
  var _config = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    plugins: ['karma-*', jasmineSeedReporter],

    client: {
      jasmine: {
        random: true
        // seed: '35883'
      }
    },

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [{ pattern: './karma-shim.js', watched: false }],

    // list of files to exclude
    exclude: [],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './karma-shim.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    },

    webpackServer: {
      noInfo: true // please don't spam the console when running in karma!
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'mocha'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'jasmine-seed'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['ChromeHeadless'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  };

  if (!isTestWatch) {
    _config.reporters.push('coverage');

    _config.coverageReporter = {
      dir: 'coverage/',
      reporters: [
        {
          type: 'json',
          dir: 'coverage',
          subdir: 'json',
          file: 'coverage-final.json'
        }
      ]
    };
  }

  config.set(_config);
};
