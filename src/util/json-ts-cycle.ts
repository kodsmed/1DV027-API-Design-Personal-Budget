/**
 * @copyright 2023-06-26 Mats Loock - wrote the original code in JavaScript
 * @license MIT
 * @see json-js-cycle-license file
 * @link  https://www.npmjs.com/package/@lnu/json-js-cycle
 * @note NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 *
 * @copyright 2024-02-27 Jimmy Karlsson - translated the original code to TypeScript
 * @license MIT
 * @module json-ts-cycle
 * @needs json-extentions.d.ts
 */

// Warning: this makes sure its treated as a module. Looks redundant but IS needed.
export { };



/**
 * Defines the JSON object.
 */
declare global {
  interface JSON {
    decycle(object: any, options?: DecycleOptions): any;
    retrocycle($: any): any;
  }
}

/**
 * Decorates the JSON object with decycle method.
 */
JSON.decycle = function decycle(object: any, options: DecycleOptions = {}): any {
  options.replacer = options.replacer || undefined;
  options.includeNonEnumerableProperties = options.includeNonEnumerableProperties || false;

  var objects = new WeakMap<object, string>(); // object to path mappings

  // I have no idea what a de-rez is, it was named by the original author.
  return (function derez(value: any, path: string): any {
    var old_path: string | undefined; // The path of an earlier occurrence of value
    var nu: any; // The new object or array

    if (options.replacer !== undefined) {
      value = options.replacer(value);
    }

    if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof Boolean) &&
      !(value instanceof Date) &&
      !(value instanceof Number) &&
      !(value instanceof RegExp) &&
      !(value instanceof String)
    ) {
      old_path = objects.get(value);
      if (old_path !== undefined) {
        return { $ref: old_path };
      }

      objects.set(value, path);

      if (Array.isArray(value)) {
        nu = [];
        value.forEach(function (element: any, i: number) {
          nu[i] = derez(element, path + "[" + i + "]");
        });
      } else {
        nu = {};
        const propertyNames = options.includeNonEnumerableProperties
          ? Object.getOwnPropertyNames(value)
          : Object.keys(value);

        propertyNames.sort().forEach(function (name: string) {
          nu[name] = derez(value[name], path + "[" + JSON.stringify(name) + "]");
        });
      }
      return nu;
    }
    return value;
  })(object, "$");
};

/**
 * Decorates the JSON object with retrocycle method.
 */
JSON.retrocycle = function retrocycle($: any): any {
  "use strict";

  var px = /^\$(?:\[(?:\d+|"(?:[^\\"\u0000-\u001f]|\\(?:[\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*")\])*$/;

  // I have no idea what a rez is, it was named by the original author.
  (function rez(value: any): void {
    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        value.forEach(function (element: any, i: number) {
          if (typeof element === "object" && element !== null) {
            var path = element.$ref;
            if (typeof path === "string" && px.test(path)) {
              value[i] = eval(path);
            } else {
              rez(element);
            }
          }
        });
      } else {
        Object.keys(value).forEach(function (name: string) {
          var item = value[name];
          if (typeof item === "object" && item !== null) {
            var path = item.$ref;
            if (typeof path === "string" && px.test(path)) {
              value[name] = eval(path);
            } else {
              rez(item);
            }
          }
        });
      }
    }
  })($);
  return $;
};