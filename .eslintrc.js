module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: ["standard", "eslint-config-prettier", "prettier"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	rules: {
		"no-var": 0,
		"no-async-promise-executor": 1,
		"getter-return": 1,
		"array-callback-return": 1,
		"no-duplicate-imports": 1,
		"quotes": ["error", "double"],
		"semi": ["error", "always"],
		"one-var": 0,
		"no-useless-return": 0
	},
};
