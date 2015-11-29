var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');
var _ = require('lodash');
var askName = require('inquirer-npm-name');
var mkdirp = require('mkdirp');
var extend = require('deep-extend');

function makeSwProxyModName(name) {
  name = _.kebabCase(name);
  name = name.indexOf('swproxy-mod-') === 0 ? name : 'swproxy-mod-' + name;
  return name;
}

module.exports = yeoman.generators.Base.extend({
  initializing: function () {
    this.props = {};
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the awe-inspiring ' + chalk.red('generator-swproxy-mod') + ' generator!'
    ));

    askName({
      name: 'name',
      message: 'Your swproxy mod name',
      default: makeSwProxyModName(path.basename(process.cwd())),
      filter: makeSwProxyModName,
      validate: function (str) {
        return str.length > 0;
      }
    }, this, function (name) {
      this.props.name = name;
      done();
    }.bind(this));
  },

  defaults: function () {
    if (path.basename(this.destinationPath()) !== this.props.name) {
      this.log(
        'Your generator must be inside a folder named ' + this.props.name + '\n' +
        'I\'ll automatically create this folder.'
      );
      mkdirp(this.props.name);
      this.destinationRoot(this.destinationPath(this.props.name));
    }

    var readmeTpl = _.template(this.fs.read(this.templatePath('README.md')));

    this.composeWith('node:app', {
      options: {
        babel: false,
        boilerplate: false,
        name: this.props.name,
        projectRoot: 'generators',
        skipInstall: this.options.skipInstall,
        readme: readmeTpl({
          swProxyModName: this.props.name,
          name: this.props.name.replace('swproxy-mod-', '')
        })
      }
    }, {
      local: require('generator-node').app
    });

    this.composeWith('generator:subgenerator', {
      arguments: ['app']
    }, {
      local: require.resolve('../subgenerator')
    });
  },

  writing: {
    pkg: function () {
      var pkg = this.fs.readJSON(this.destinationPath('package.json'), {});
      extend(pkg, {
        dependencies: {
          'swproxy-mod': '0.0.1'
        }
      });
      pkg.keywords = pkg.keywords || [];
      pkg.keywords.push('swproxy-mod');
      pkg.keywords.push('swproxy');
      pkg.keywords.push('serviceworker');

      this.fs.writeJSON(this.destinationPath('package.json'), pkg);
    }
  },

  install: function () {
    this.installDependencies({bower: false});
  }
});
