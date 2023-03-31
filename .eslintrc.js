module.exports = {
	env: {
		es2021: true,
	},
	extends: 'xo',
	overrides: [
		{
			extends: ['xo-typescript'],
			files: ['*.ts', '*.tsx'],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	rules: {
		'no-mixed-operators': 'off',
		'no-bitwise': 'off',
	},
};
