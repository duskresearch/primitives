// Every primitive's logic, one module each. Import a single primitive from its subpath
// (`@duskresearch/primitives/color`) to keep bundles small.
export * as color from './color';
export * as type from './type';
export * as grid from './grid';
export * as shape from './shape';
export * as motion from './motion';
export { InputError, type Operation } from './operation';
