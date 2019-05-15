import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

const primedBabel = babel({
    babelrc: false,
    presets: [
        [
            '@babel/preset-env',
            {
                targets: '> 0.25%, not dead',
                modules: false,
                loose: false
            }
        ]
    ],
    exclude: 'node_modules/**',
    plugins: [
    ]
});

export default () => [
    {
        input: 'src/js/index.js',
        output: {
            file: 'dist/tricks.js',
            format: 'es'
        },
        plugins: [
            resolve(),
            primedBabel
        ]
    },
    {
        input: 'src/js/index.js',
        output: {
            file: 'dist/tricks.cjs.js',
            format: 'cjs'
        },
        plugins: [
            resolve(),
            primedBabel
        ]
    }
];
