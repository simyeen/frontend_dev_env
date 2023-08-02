class MyWebpackPlugin {
  apply(compiler) {
    compiler.hooks.done.tap("My Plugin", (status) => {
      console.log("Myplugin: done");
    });

    compiler.plugin("emit", (compilation, callback) => {
      const source = compilation.assets["main.js"].source();
    });
  }
}

module.exports = MyWebpackPlugin;
