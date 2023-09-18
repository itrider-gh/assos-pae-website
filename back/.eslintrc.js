module.exports = {
  "extends": [
      "eslint:recommended",
      "plugin:node/recommended"
  ],
  "rules": {
    "no-unused-vars": ["error", { "args": "none" }],
    "semi": ["error", "never"],
    "quotes": ["error", "single"],
    "no-trailing-spaces": ["error"]
  }
}
