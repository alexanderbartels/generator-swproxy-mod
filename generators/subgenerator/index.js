var path = require('path');
var generators = require('yeoman-generator');
var superb = require('superb');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}


module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);

    this.argument('namespace', {
      type: String,
      required: true,
      description: 'Generator namespace'
    });
  },

  writing: function () {
    var generatorName = this.fs.readJSON(this.destinationPath('package.json')).name;
    var name = generatorName.replace('swproxy-mod-', '');
    var capitalizedName = capitalizeFirstLetter(name);

    this.fs.copyTpl(
      this.templatePath('index.jstpl'),
      this.destinationPath(path.join('src', generatorName + '.js')),
      {
        // Escape apostrophes from superb to not conflict with JS strings
        superb: superb().replace('\'', '\\\''),
        generatorName: generatorName,
        name: name,
        capitalizedName: capitalizedName
      }
    );

    this.fs.copy(
      this.templatePath('templates/**'),
      this.destinationPath(path.join('src', 'templates'))
    );

    this.fs.copyTpl(
      this.templatePath('test.jstpl'),
      this.destinationPath('test/' + this.namespace + '.js'),
      {
        namespace: this.namespace,
        generatorName: generatorName,
        name: name,
        capitalizedName: capitalizedName
      }
    );
  }
});
