module.exports = {
  plugins: ["prettier"],
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  rules: {
    "prettier/prettier": "warn",
  },
};
