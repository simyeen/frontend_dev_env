const path = require("path");
const webpack = require("webpack");
const childProcess = require("child_process"); // prcoess의 정보 얻어내기 가능 여기에서는 git 정보 자동추출
const HtmlWebPackPlugin = require("html-webpack-plugin"); //
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // build 할 때마다 dist 날리고 다시 생성하게함.
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  mode: "development",
  entry: {
    main: "./src/app.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      // loader는 module객체의 rules에서 정한다.
      {
        // test: /\.js$/, // 패턴이라 정규표현식의 형태를 띔. 여기서는 .js로 끝나는 모든 확장자를 의미한다.
        // use: [path.resolve("./my-webpack-loader.js")],

        test: /\.css$/,
        // use: ["css-loader"], // module은 js이기 때문에 css->js문자열로 바꿔주는 css-loader를 사용해야한다.
        use: ["style-loader", "css-loader"], // style-loader는 css->html dom안으로 넣어준다. 순서는 css-loader => style-loader로 작동한다.
      },
      {
        test: /\.(jpeg)$/,
        use: {
          loader: "url-loader",
          options: {
            publicPath: "./dist/",
            name: "[name].[ext]?[contenthash]",
            limit: 20000, // 2kb
          },
        },
        //   // use: ["file-loader"] 사진은 file-loader로 따로 url 처리 필요 -> 위처럼 옵션을 통해 경로도 설정할 수 있다.
      },
    ],
  },

  // 모듈은 각각 실행되고, plugin은 번들된 것에 한 번 실행됨.
  plugins: [
    new webpack.BannerPlugin({
      banner: `
        Build Date: ${new Date().toLocaleString()}
        Author: ${childProcess.execSync("git config user.name")}
    `,
    }),
    new webpack.DefinePlugin({
      TWO: "1+1",
      STRING_TWO: JSON.stringify("1+1"),
      "api.domin": JSON.stringify("http"),
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      templateParameters: {
        env: process.env.NODE_ENV === "development" ? "개발용" : "배포용",
      },
      minify: {},
    }),
    new CleanWebpackPlugin(),
    process.env.NODE_ENV === "production"
      ? [new MiniCssExtractPlugin({ filename: "[name].css" })]
      : [],
  ],
};
