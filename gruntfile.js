// Gruntfile for the PublishTrelloWeb Project

var PROJECT           = 'Publish Trello';     // Project Name
var LANGUAGE          = 'en';                 // Language

var DEVELOPMENT_DIR   = 'interface';          // Development
var BUILD_DIR         = 'app/public';         // Build
var META_DIR          = 'meta';               // Meta Content
var TESTS_DIR         = 'tests';              // Tests
var IMAGES_DIR        = 'images';             // Content Images
var RESOURCES_DIR     = 'res';                // Resources (CSS, JavaScript, Fonts, etc.)
var TEMPLATES_DIR     = 'templates';          // Templates
var COMPONENTS_DIR    = 'components';         // Components

var INDEX_PAGE        = 'app.html';           // Index Page

var CRITICAL_DESK_W   = 1280;                 // Horizontal Fold on Desktop
var CRITICAL_DESK_H   = 800;                  // Vertical Fold on Desktop
var CRITICAL_MOBILE_W = 320;                  // Horizontal Fold on Mobile
var CRITICAL_MOBILE_H = 640;                  // Vertical Fold on Mobile

var CSS_IMAGES_DIR    = 'images';             // CSS Images (Sprites, Icons, etc.)
var SPRITES           = ['sprites.png'];      // CSS Images to Compile into Separate Sprite Sheets

var SASS_DIR          = 'sass';               // Sass
var CSS_DIR           = 'css';                // CSS
var CSS_FILENAME      = 'styles';             // CSS Filename

var JS_DEV_DIR        = 'js-dev';             // Development JavaScript
var JS_DIR            = 'js';                 // JavaScript
var JS_FILENAME       = 'scripts';            // JavaScript Filename
var SW_FILENAME       = 'service';            // Service Worker Filename

module.exports = function(grunt) {

  function spritesFolders() {
    var folders = [];
    var index = 0;
    var length = SPRITES.length;
    for (index; index < length; index += 1) {
      folders.push('!**/' + SPRITES[index].split('.')[0] + '/*.*', '!**/' + SPRITES[index].split('.')[0] + '@2x/*.*', '!**/' + SPRITES[index].split('.')[0] + '@3x/*.*');
    }
    return folders;
  }

  var project = {
    init: function() {
      var developmentDirCompiled = DEVELOPMENT_DIR + '/';
      var resourcesDirCompiled = developmentDirCompiled + RESOURCES_DIR + '/';
      var config = {
        name: PROJECT,
        language: LANGUAGE,
        dir: developmentDirCompiled,
        meta: META_DIR + '/',
        tests: TESTS_DIR + '/',
        images: developmentDirCompiled + IMAGES_DIR + '/',
        index: INDEX_PAGE,
        res: {
          dir: resourcesDirCompiled,
          templates: {
            dir: resourcesDirCompiled + TEMPLATES_DIR + '/',
            comp: resourcesDirCompiled + TEMPLATES_DIR + '/' + COMPONENTS_DIR + '/'
          },
          images: {
            dir: resourcesDirCompiled + CSS_IMAGES_DIR + '/',
            sprites: SPRITES,
            spritesDir: spritesFolders()
          },
          css: {
            dir: resourcesDirCompiled + CSS_DIR + '/',
            sass: resourcesDirCompiled + SASS_DIR + '/',
            filename: CSS_FILENAME
          },
          js: {
            dir: resourcesDirCompiled + JS_DIR + '/',
            devDir: resourcesDirCompiled + JS_DEV_DIR + '/',
            filename: JS_FILENAME,
            sw: SW_FILENAME
          }
        },
        build: {
          dir: BUILD_DIR + '/',
          critical: {
            widthDesktop: CRITICAL_DESK_W,
            heightDesktop: CRITICAL_DESK_H,
            widthMobile: CRITICAL_MOBILE_W,
            heightMobile: CRITICAL_MOBILE_H
          }
        }
      };
      return config;
    }
  }.init();

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({

    htmlhint: {
      options: {
        'htmlhintrc': '.htmlhintrc'
      },
      htmlHint: {
        cwd: project.dir,
        src: ['*.html'],
        expand: true
      }
    },
    arialinter: {
      options: {
        level: 'A'
      },
      ariaLinter: {
        cwd: project.build.dir,
        src: ['*.html'],
        expand: true
      }
    },
    scsslint: {
      scssLint: {
        cwd: project.res.css.sass,
        src: ['**/*.{scss,sass}'],
        expand: true
      }
    },
    csslint: {
      options: {
        csslintrc: '.csslintrc'
      },
      cssLint: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        expand: true
      }
    },
    csscss: {
      options: {
        shorthand: false,
        verbose: true
      },
      csscssTest: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        expand: true
      }
    },
    colorguard: {
      files: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        expand: true
      }
    },
    jscs: {
      options: {
        config: '.jscsrc'
      },
      jscs: {
        cwd: project.res.js.devDir,
        src: ['**/*.js'],
        expand: true
      }
    },
    jshint: {
      options: {
        'jshintrc': '.jshintrc'
      },
      jsHint: {
        cwd: project.res.js.devDir,
        src: ['**/*.js'],
        expand: true
      }
    },
    jsinspect: {
      jsInspect: {
        cwd: project.res.js.devDir,
        src: ['**/*.js'],
        expand: true
      }
    },

    analyzecss: {
      options: {
        outputMetrics: 'error',
        softFail: true,
        thresholds: grunt.file.readJSON('.analyzecssrc')
      },
      ananlyzeCSS: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        expand: true
      }
    },

    backstop: {
      options: {
        'backstop_path': 'node_modules/backstopjs',
        'test_path': project.tests + 'backstop'
      },
      test: {
        options: {
          setup: false,
          configure: false,
          'create_references': false,
          'run_tests': true
        }
      },
      ref: {
        options: {
          setup: false,
          configure: false,
          'create_references': true,
          'run_tests': false
        }
      }
    },
    mochaTest: {
      tests: {
        options: {
          quiet: false
        },
        cwd: project.tests,
        src: ['**/*.js'],
        expand: true
      }
    },

    sass: {
      options: {
        sourceMap: true,
        precision: 5
      },
      generateCSS: {
        cwd: project.res.css.sass,
        src: ['**/*.{scss,sass}'],
        dest: project.res.css.dir,
        ext: '.css',
        expand: true
      }
    },
    autoprefixer: {
      options: {
        map: true,
        browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'Explorer >= 7'],
        cascade: false
      },
      prefixCSS: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        dest: project.res.css.dir,
        expand: true
      }
    },

    'string-replace': {
      build: {
        options: {
          replacements: [{
            pattern: /@tx-title/gi,
            replacement: project.name
          }, {
            pattern: /@tx-language/gi,
            replacement: project.language
          }, {
            pattern: /(?:<span data-dev-note=".*?">)(.*)(?:<\/span>)/gi,
            replacement: '$1'
          }, {
            pattern: /\sdata-dev-note=".*?"/gi,
            replacement: ''
          }]
        },
        files: {
          './': [project.build.dir + '*.html']
        }
      }
    },

    browserify: {
      bundle: {
        options: {
          transform: [['babelify', {'presets': ['es2015']}]]
        },
        files: {
          bundleFiles: function() {
            var bundleFilesObject = {};
            bundleFilesObject[project.res.js.dir + project.res.js.filename + '.js'] = project.res.js.devDir + project.res.js.filename + '.js';
            return bundleFilesObject;
          }
        }.bundleFiles()
      }
    },
    uglify: {
      options: {
        preserveComments: false
      },
      jsMin: {
        cwd: project.res.js.dir,
        src: ['*.js'],
        dest: project.res.js.dir,
        expand: true
      },
      swMin: {
        cwd: project.res.js.devDir,
        src: [project.res.js.sw + '.js'],
        dest: project.res.js.dir,
        expand: true
      }
    },

    uncss: {
      cssOptimize: {
        options: {
          ignore: [/.*-is-.*/, /.*-has-.*/, /.*-are-.*/, /mdz-.*/, /js-.*/],
          timeout: 1000
        },
        files: {
          cssMinFiles: function() {
            var cssMinFilesObject = {};
            cssMinFilesObject[project.res.css.dir + project.res.css.filename + '.css'] = project.dir + project.index;
            return cssMinFilesObject;
          }
        }.cssMinFiles()
      }
    },
    cssc: {
      options: grunt.file.readJSON('.csscrc'),
      cssOptimize: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        dest: project.res.css.dir,
        expand: true
      }
    },
    critical: {
      cssCritical: {
        options: {
          css: project.res.css.dir + project.res.css.filename + '.css',
          dimensions: [{
            width: project.build.critical.widthDesktop,
            height: project.build.critical.heightDesktop,
          }, {
            width: project.build.critical.widthMobile,
            height: project.build.critical.heightMobile,
          }],
          minify: true,
          extract: false
        },
        cwd: project.build.dir,
        src: ['*.html'],
        dest: project.build.dir,
        expand: true
      }
    },
    cssmin: {
      cssMin: {
        cwd: project.res.css.dir,
        src: ['*.css'],
        dest: project.res.css.dir,
        expand: true
      }
    },

    processhtml: {
      options: {
        includeBase: project.res.templates.comp,
        commentMarker: '@tx-process',
        recursive: true
      },
      templates: {
        cwd: project.res.templates.dir,
        src: ['*.html', '!* copy.html', '!* - Copy.html'],
        dest: project.dir,
        expand: true
      }
    },
    htmlmin: {
      options: grunt.file.readJSON('.htmlminrc'),
      cleanup: {
        cwd: project.build.dir,
        src: ['*.html'],
        dest: project.build.dir,
        expand: true
      }
    },

    sprite: (function() {
      var tasks = {};
      var spritePath = project.res.images.dir;
      var imgPath = '../' + spritePath.replace(project.res.dir, '');
      project.res.images.sprites.forEach(function(sprite) {
        var name = sprite.split('.')[0];
        var ext = sprite.split('.')[1];
        if (grunt.file.exists(spritePath + name + '/')) {
          tasks[name] = {
            src: spritePath + name + '/*.' + ext,
            dest: spritePath + sprite,
            destCss: project.res.css.sass + 'project/tx/_' + name + '.scss',
            imgPath: imgPath + sprite,
            padding: 5,
            cssSpritesheetName: 'ssh-' + name,
            cssVarMap: function(sprite) {
              sprite.name = 'spt-' + sprite.name;
            },
            cssOpts: {
              functions: false,
              variableNameTransforms: []
            }
          };
        }
        if (grunt.file.exists(spritePath + name + '@2x/')) {
          tasks[name + '2x'] = {
            src: spritePath + name + '@2x/*@2x.' + ext,
            dest: spritePath + (name + '@2x.' + ext),
            destCss: project.res.css.sass + 'project/tx/_' + name + '@2x.scss',
            imgPath: imgPath + name + '@2x.' + ext,
            padding: 10,
            cssSpritesheetName: 'ssh-' + name + '-2x',
            cssVarMap: function(sprite) {
              sprite.name = 'spt-' + sprite.name;
            },
            cssOpts: {
              functions: false,
              variableNameTransforms: []
            }
          };
        }
        if (grunt.file.exists(spritePath + name + '@3x/')) {
          tasks[name + '3x'] = {
            src: spritePath + name + '@3x/*@3x.' + ext,
            dest: spritePath + (name + '@3x.' + ext),
            destCss: project.res.css.sass + 'project/tx/_' + name + '@3x.scss',
            imgPath: imgPath + name + '@3x.' + ext,
            padding: 15,
            cssSpritesheetName: 'ssh-' + name + '-3x',
            cssVarMap: function(sprite) {
              sprite.name = 'spt-' + sprite.name;
            },
            cssOpts: {
              functions: false,
              variableNameTransforms: []
            }
          };
        }
      });
      return tasks;
    })(),
    imagemin: {
      images: {
        cwd: project.build.dir,
        src: ['**/*.{png,jpg,gif,webp}'],
        dest: project.build.dir,
        expand: true
      }
    },
    svgmin: {
      options: {
        plugins: [{
          removeViewBox: false
        }]
      },
      images: {
        cwd: project.build.dir,
        src: ['**/*.svg', '!**/fonts/**/*.svg'],
        dest: project.build.dir,
        expand: true
      }
    },

    clean: {
      res: [project.res.css.dir, project.res.js.dir + '*.js', project.dir + '*.js'],
      build: [project.build.dir]
    },
    cleanempty: {
      options: {
        noJunk: true
      },
      build: {
        src: [project.build.dir + '**/*']
      }
    },
    copy: {
      build: {
        cwd: project.dir,
        src: ['*.html', '*.js', 'res/**/*.*', '!**/templates/**', '!**/sass/**', '!**/*.map', '!**/**-dev/**', '!**/tx-*.*', '!**/tx/**'].concat(project.res.images.spritesDir),
        dest: project.build.dir,
        expand: true
      },
      meta: {
        cwd: project.meta,
        src: ['**/*.{ico,png,jpg,gif,svg,txt,json}'],
        dest: project.build.dir,
        expand: true
      }
    },
    compress: {
      res: {
        options: {
          mode: 'gzip'
        },
        cwd: project.build.dir,
        src: ['**/*.css', '**/*.js'],
        dest: project.build.dir,
        ext: '.gz',
        extDot: 'last',
        expand: true
      }
    },

    watch: {
      options: {
        spawn: false
      },
      html: {
        files: [project.res.templates.dir + '**/*.html'],
        tasks: ['processhtml']
      },
      images: {
        files: [project.res.images.dir + '**/*.{png,jpg,gif,svg}'],
        tasks: ['sass', 'autoprefixer', 'processhtml']
      },
      sass: {
        files: [project.res.css.sass + '**/*.{scss,sass}'],
        tasks: ['sass', 'autoprefixer']
      },
      javascript: {
        files: [project.res.js.devDir + '**/*.js'],
        tasks: ['browserify']
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [project.dir + '*.html', project.res.css.dir + '**/*.css', project.res.js.dir + '**/*.js', project.dir + '**/*.{png,jpg,gif,svg}'],
        tasks: ['copy:build']
      }
    },
    concurrent: {
      options: {
        logConcurrentOutput: true,
        limit: 5
      },
      projectWatch: ['watch:html', 'watch:images', 'watch:sass', 'watch:javascript', 'watch:livereload']
    }

  });

  grunt.registerTask('spritesSCSS', 'processing sprites styles', function() {
    var scss = '';
    grunt.file.delete(project.res.css.sass + 'project/_project-sprites.scss');
    if (project.res.images.sprites.length > 0) {
      project.res.images.sprites.forEach(function(sprite) {
        var name = sprite.split('.')[0];
        var ext = sprite.split('.')[1];
        var scssPath = project.res.css.sass + 'project/tx/_' + name;
        var scssBlock = '';
        if (grunt.file.isFile(scssPath + '.scss')) {
          scssBlock = grunt.file.read(scssPath + '.scss').replace(/(?:\r?\n|\r){2,}/gm, '');
          scssBlock = '// ' + name + '.' + ext + '\n\n' + scssBlock + '\n\n\n\n';
          if (scss === '') {
            scss += scssBlock;
          } else {
            scss += '\n\n\n' + scssBlock;
          }
          grunt.file.delete(scssPath + '.scss', {force: true});
        }
        if (grunt.file.isFile(scssPath + '@2x.scss')) {
          scssBlock = grunt.file.read(scssPath + '@2x.scss').replace(/(?:\r?\n|\r){2,}/gm, '');
          scssBlock = '// ' + name + '@2x.' + ext + '\n\n' + scssBlock + '\n\n\n\n';
          scss += scssBlock;
          grunt.file.delete(scssPath + '@2x.scss', {force: true});
        }
        if (grunt.file.isFile(scssPath + '@3x.scss')) {
          scssBlock = grunt.file.read(scssPath + '@3x.scss').replace(/(?:\r?\n|\r){2,}/gm, '');
          scssBlock = '// ' + name + '@3x.' + ext + '\n\n' + scssBlock + '\n\n\n\n';
          scss += scssBlock;
          grunt.file.delete(scssPath + '@3x.scss', {force: true});
        }
        scss = scss.replace(/\/\*[^*]*\*+([^/*][^*]*\*+)*\/(?:\r?\n|\r)/gm, '').replace(/\, \)/gm, ')').replace(/(\s|\()0px/gm, '$1' + '0') + '//eof';
        scss = scss.replace('\n\n\n\n//eof', '\n');
        grunt.file.write(project.res.css.sass + 'project/_project-sprites.scss', scss);
      });
    }
    grunt.file.delete(project.res.css.sass + 'project/tx');
  });

  grunt.registerTask('inlineModernizr', 'inlining Modernizr', function() {
    var html = grunt.file.read(project.build.dir + project.index);
    var modernizr;
    var modernizrPath = project.build.dir + html.match(/src=".*Modernizr\/.*?"/gm);
    modernizrPath = modernizrPath.replace(/"|'/gm, '').replace('src=', '');
    modernizr = '\n    <script id="modernizr" type="text/javascript">' + grunt.file.read(modernizrPath) + '</script>';
    modernizr = modernizr.replace(/\/\*(?:\r?\n|\r|.)*\*\/(?:\r?\n|\r)/gm, '');
    grunt.file.recurse(project.build.dir, function(path, root, sub, filename) {
      var file;
      var filenameArray = filename.split('.');
      var ext = filenameArray[(filenameArray.length - 1)];
      if (ext === 'html') {
        file = grunt.file.read(path);
        file = file.replace(/(?:\s|\t)*.*src=".*Modernizr\/.*(?=\r?\n|\r)/gm, modernizr);
        grunt.file.write(path, file);
      }
    });
  });

  grunt.registerTask('quality', [
    'htmlhint',
    'arialinter',
    'scsslint',
    'csslint',
    'csscss',
    'colorguard',
    'jscs',
    'jshint',
    'jsinspect'
  ]);

  grunt.registerTask('performance', [
    'analyzecss'
  ]);

  grunt.registerTask('test', [
    'quality',
    'performance',
    'mochaTest',
    'backstop:test'
  ]);

  grunt.registerTask('process-sprites', [
    'sprite',
    'spritesSCSS'
  ]);

  grunt.registerTask('process-html', [
    'processhtml'
  ]);

  grunt.registerTask('process-css', [
    'sass',
    'autoprefixer',
    'uncss',
    'cssc',
    'cssmin'
  ]);

  grunt.registerTask('process-js', [
    'browserify',
    'uglify'
  ]);

  grunt.registerTask('compile', [
    'clean:res',
    'process-sprites',
    'process-html',
    'process-css',
    'process-js'
  ]);

  grunt.registerTask('images', [
    'imagemin',
    'svgmin'
  ]);

  grunt.registerTask('build', [
    'compile',
    'clean:build',
    'copy',
    'images',
    'string-replace',
    'inlineModernizr',
    'htmlmin',
    'compress',
    'cleanempty'
  ]);

  grunt.registerTask('build-critical', [
    'compile',
    'clean:build',
    'copy',
    'images',
    'string-replace',
    'critical',
    'inlineModernizr',
    'htmlmin',
    'compress',
    'cleanempty'
  ]);

  grunt.registerTask('watch-project', [
    'concurrent'
  ]);

};
