module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: ['google'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        indent: ['warn', 4],
        'object-curly-spacing': ['error', 'always'],
        'quote-props': ['error', 'as-needed'],
        'max-len': ['error', 120],
        'linebreak-style': 0,
    },
};
