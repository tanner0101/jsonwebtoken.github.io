module.exports = grunt => {
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-pug');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-exec');

  grunt.initConfig({
    clean: {
      website: [ 'dist/website' ],
      extension: ['dist/extension']
    },

    copy: {
      website: {
        files: [{
          expand: true,
          cwd: 'img/website',
          src: ['**'],
          dest: 'dist/website/img'
        }, {
          expand: true,
          src: ['fonts/**', 'opensearch.xml'],
          dest: 'dist/website'
        }, {
          expand: true,
          flatten: true,
          src: [
            'node_modules/bootstrap/dist/css/bootstrap.min.css',
            'node_modules/codemirror/lib/codemirror.css',
            'node_modules/codemirror/addon/lint/lint.css',
            'css/budicon.css',
            'css/google-roboto-mono.css'
          ],
          dest: 'dist/website/css/'
        }]
      },
      extension: {
        files: [{
          expand: true,
          flatten: true,
          src: ['manifest.json', 'html/extension/bg.html'],
          dest: 'dist/extension'
        }, {
          expand: true,
          cwd: 'img/extension',
          src: ['**'],
          dest: 'dist/extension/img'
        }, {
          expand: true,
          src: ['fonts/**'],
          dest: 'dist/extension'
        }, {
          expand: true,
          flatten: true,
          src: [
            'node_modules/bootstrap/dist/css/bootstrap.min.css',
            'node_modules/codemirror/lib/codemirror.css',
            'node_modules/codemirror/addon/lint/lint.css',
            'css/budicon.css',
            'css/google-roboto-mono.css'
          ],
          dest: 'dist/extension/css/'
        }]
      }
    }, 

    stylus: {
      website: {
        files: {
          'dist/website/css/index.css': 'stylus/website/index.styl'
        }
      },
      extension: {
        files: {
          'dist/extension/css/index.css': 'stylus/extension/index.styl'
        }
      }
    },

    pug: {
      website: {
        files: {
          'dist/website/index.html': 'views/website/index.pug',
          'dist/website/introduction/index.html': 
            'views/website/introduction.pug'
        }
      },
      extension: {
        files: {
          'dist/extension/index.html': 'views/extension/index.pug'          
        }
      }
    },

    webpack: {
      websiteProd: require('./webpack.website-prod.js'),
      websiteDev: require('./webpack.website-dev.js'),
      extensionProd: require('./webpack.extension-prod.js'),
      extensionDev: require('./webpack.extension-dev.js'),
      unitTests: require('./webpack.website-unit-tests.js')
    },

    watch: {
      websiteSrc: {
        files: ['src/*.js', 'src/website/**', 'src/editor/**'],
        tasks: 'webpack:websiteDev'
      },
      extensionSrc: {
        files: ['src/*.js', 'src/extension/**', 'src/editor/**'],
        tasks: 'webpack:extensionDev'
      },
      websiteImg: {
        files: [ 'img/website/**' ],
        tasks: 'copy:website'
      },
      extensionImg: {
        files: [ 'img/extension/**' ],
        tasks: 'copy:extension'
      },
      opensearch: {
        files: 'opensearch.xml',
        tasks: 'copy:website'
      },
      assets: {
        files: [
          'fonts/**',
          'node_modules/bootstrap/dist/css/bootstrap.min.css',
          'node_modules/codemirror/lib/codemirror.css',
          'node_modules/codemirror/addon/lint/lint.css',
          'css/budicon.css'
        ],
        tasks: 'copy'
      },
      websiteViews: {
        files: [
          'stylus/*.styl',
          'stylus/website/**',
          'views/*.pug',
          'views/website/**'
        ],
        tasks: ['build-website-views']
      },
      extensionViews: {
        files: [
          'stylus/*.styl',
          'stylus/extension/**',
          'views/*.pug',
          'views/extension/**'
        ],
        tasks: ['build-extension-views']
      }
    },

    mochaTest: {
      unit: {
        options: {},
        src: ['dist/test/unit-tests.js']
      },
      functional: {
        options: {
          // Higher default timeout to account for some animations
          timeout: 10000
        },
        src: ['test/functional/**.js']        
      }
    },

    connect: {
      functionalTests: {
        options: {
          hostname: '127.0.0.1',
          base: 'dist/website',
        }
      }
    },
  });

  grunt.registerTask('build-website-views', [
    'stylus:website',
    'pug:website'
  ]);

  grunt.registerTask('build-extension-views', [
    'stylus:extension',
    'pug:extension'
  ]);

  grunt.registerTask('build-website', [
    'clean:website',
    'copy:website',
    'build-website-views',
    'webpack:websiteProd'
  ]);

  grunt.registerTask('build-website-dev', [
    'clean:website',
    'copy:website',
    'build-website-views',
    'webpack:websiteDev'
  ]);

  grunt.registerTask('build-extension', [
    'clean:extension',
    'copy:extension',
    'build-extension-views',
    'webpack:extensionProd'
  ]);
  
  grunt.registerTask('build-extension-dev', [
    'clean:extension',
    'copy:extension', 
    'build-extension-views',
    'webpack:extensionDev'
  ]);
  
  grunt.registerTask('build', ['build-website', 'build-extension']);
  
  grunt.registerTask('build-dev', [
    'build-website-dev',
    'build-extension-dev'
  ]);

  grunt.registerTask('unit-tests', ['webpack:unitTests', 'mochaTest:unit']);
  
  grunt.registerTask('functional-tests', [
    'build-website-dev',
    'connect:functionalTests',        
    'mochaTest:functional'
  ]);

  grunt.registerTask('test', ['unit-tests', 'functional-tests']);
  
  grunt.registerTask('default', ['build-dev', 'watch']);
};
