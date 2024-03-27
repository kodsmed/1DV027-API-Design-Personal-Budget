/**
 * Extends (decorates) the JSON object with decycle and retrocycle methods used by the logger
 * from the json-js-cycle package.
 *
 * @module json-extentions
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 */

interface JSON {
  decycle(object: any, options?: any): any;
  retrocycle(object: any): any;
}

interface DecycleOptions {
  replacer?: (value: any) => any;
  includeNonEnumerableProperties?: boolean;
}