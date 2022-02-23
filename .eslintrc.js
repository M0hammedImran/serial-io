module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: ['plugin:import/recommended', 'plugin:import/typescript'],
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
        'import/no-unresolved': [2, { commonjs: true, amd: true }],
        'import/named': 2,
        'import/namespace': 2,
        'import/default': 2,
        'import/export': 2,
    },
};
