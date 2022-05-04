module.exports = {
    env: { es2021: true, node: true },
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    parser: '@typescript-eslint/parser',
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_' }],
        'prettier/prettier': ['error', {}, { usePrettierrc: true }],
        'no-unsafe-optional-chaining': 'off',
    },
};
