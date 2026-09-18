// Every field's logic, one namespace per field (design first), one module per primitive inside
// it. Import a single primitive from its subpath (`@duskresearch/primitives/design/color`) to
// keep bundles small.
export * as design from './design';
export { InputError, type Operation } from './operation';
