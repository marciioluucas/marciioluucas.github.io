const path = require("path");

module.exports = {
  outputDir: path.resolve("./docs"),
  publicPath: process.env.NODE_ENV === "production" ? '' : "/"
}