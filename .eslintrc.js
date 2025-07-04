module.exports = {
  root: true,
  extends: ['@react-native', 'plugin:react/jsx-runtime'],
  rules: {
    'react-native/no-inline-styles': 0,
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
};
