// iMPORTANT do not use .babelrc: https://github.com/babel/babel/issues/8711#issuecomment-421918023
module.exports = {
  "presets": [
    "@babel/typescript",
    [
      "@babel/preset-env", {
        "targets": {
          "ie": "11",
          "safari": "10",
          "chrome": "52",
          "edge": "16",
          "firefox": "59"
        }
      }
    ]
  ],
  "plugins": [
    [
      "@babel/plugin-transform-runtime", {
        "corejs": 2
      }
    ],
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "array-includes"
  ]
};