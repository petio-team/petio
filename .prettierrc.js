/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  printWidth: 80,
  tabWidth: 2,
  trailingComma: 'all',
  singleQuote: true,
  semi: true,
  importOrder: ['^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "decorators-legacy", "jsx", "classProperties", "classPrivateProperties", "classPrivateMethods", "dynamicImport", "nullishCoalescingOperator", "optionalChaining"],
  plugins: ["@trivago/prettier-plugin-sort-imports"],
};

module.exports = config;
