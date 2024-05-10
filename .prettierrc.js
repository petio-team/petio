module.exports = {
  printWidth: 80,
  tabWidth: 2,
  trailingComma: 'all',
  singleQuote: true,
  semi: true,
  importOrder: ['^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ["typescript", "decorators-legacy", "jsx", "classProperties", "classPrivateProperties", "classPrivateMethods", "dynamicImport", "nullishCoalescingOperator", "optionalChaining"],
  plugins: [require('@trivago/prettier-plugin-sort-imports')],
};
