/**
 *  util
 *
 *  Collection of utility functions.
 **/
var util = (function () {

    "use strict";

    var utility = {

        /**
         *  util.Array
         *
         *  Collection of utility functions that manipulate or work with arrays.
         **/
        Array: {},

        /**
         *  util.Function
         *
         *  Collection of utility functions that manipulate or work with
         *  functions.
         **/
        Function: {},

        /**
         *  util.Object
         *
         *  Collection of utility functions that manipulate or work with
         *  objects.
         **/
        Object: {},

        /**
         *  util.Number
         *
         *  Collection of utility functions that manipulate or work with
         *  numbers.
         **/
        Number: {},

        /**
         *  util.String
         *
         *  Collection of utility functions that manipulate or work with
         *  strings.
         **/
        String: {}

    };

    /**
     *  util.Object.assign(source, [...objects]) -> Object
     *  - source (Object): Source object to extend.
     *  - objects (Object): Objects to use to extend the source.
     *
     *  Extends one object with the properties of others. This function
     *  takes any number of arguments, the important thing to remember is
     *  that the first argument is the one being changed.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = {bar: 2};
     *      util.Object.assign(obj1, obj2);
     *      // -> {foo: 1, bar: 2}
     *      // obj1 is now {foo: 1, bar: 2}; obj2 is still {bar: 2}
     *
     *  The function will take any number of arguments and add them all to
     *  the original.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = {bar: 2};
     *      var obj3 = {baz: 3};
     *      util.Object.assign(obj1, obj2, obj3);
     *      // -> {foo: 1, bar: 2, baz: 3}
     *
     *  Matching properties will be over-written by subsequent arguments in
     *  the order they were supplied to the function.
     *
     *      var obj1 = {foo: 1};
     *      var obj2 = {foo: 2};
     *      var obj3 = {foo: 3};
     *      util.Object.assign(obj1, obj2, obj3);
     *      // -> {foo: 3}
     *
     *  This function defaults to the native
     *  [Object.assign](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
     **/
    var assign = Object.assign || function (source, ...objects) {

        objects.forEach(function (object) {

            Object.keys(object).forEach(function (key) {
                source[key] = object[key];
            });

        });

        return source;

    };

    /**
     *  util.Array.map(array, handler[, context]) -> Boolean
     *  - array (Array): Array to test.
     *  - handler (Function): Function for testing.
     *  - context (Object): Optional context for `handler`.
     *
     *  Identical to the native `[].map()` with the exception that it will work
     *  on any iterable object, not just arrays.
     *
     *      var divs = document.getElementsByTagName('div');
     *      function getNodeName(div) {
     *          return div.nodeNode.toLowerCase();
     *      }
     *      divs.map(getNodeName);
     *      // -> TypeError: divs.map is not a function
     *      util.Array.map(divs, getNodeName);
     *      // -> ['div', 'div', 'div', ...]
     *
     **/
    var arrayMap = Array.map || function (array, handler, context) {
        return Array.prototype.map.call(array, handler, context);
    };

    /**
     *  util.Array.invoke(array, method[, ...args]) -> Array
     *  - array (Array): Array over which to iterate.
     *  - method (String): Function to execute on each entry of the array.
     *  - args (?): Optional arguments to be passed to the function.
     *
     *  Executes a method on all entries of an array or array-like object.
     *  Additional arguments for the invokation may be passed as additional
     *  arguments to `invoke`. The original array is untouched although the
     *  function called using `invoke` may mutate the entries.
     *
     *      var array = ['one', 'two', 'three'];
     *      util.Array.invoke(array, 'toUpperCase'); // -> ['ONE', 'TWO', THREE']
     *      util.Array.invoke(array, 'slice', 1); // -> ['ne', 'wo', 'hree']
     *
     **/
    function arrayInvoke(array, method, ...args) {

        return arrayMap(array, function (entry) {
            return entry[method](...args);
        });

    }

    /**
     *  util.String.interpret(string) -> String
     *  - string (?): Object to interpret as a string.
     *
     *  Identifies the given `string` as a string.
     *
     *      util.String.interpret("abc"); // -> "abc"
     *      util.String.interpret(123);   // -> "123"
     *
     *  This is frequently done by executing the `toString` method (if there is
     *  one). Many native types already have a `toString` method.
     *
     *      var custom = {
     *          toString: function () {
     *              return "hi";
     *          }
     *      };
     *      util.String.interpret(custom); // -> "hi"
     *      util.String.interpret({});     // -> "[object Object]"
     *      util.String.interpret([1, 2]); // -> "1,2"
     *
     *  If `null` or `undefined` are passed, an empty string is returned.
     *
     *      util.String.interpret(null);      // -> ""
     *      util.String.interpret(undefined); // -> ""
     *      util.String.interpret();          // -> ""
     *
     **/
    function interpretString(string) {

        return typeof string === "string"
            ? string
            : (string === null || string === undefined)
                ? ""
                : String(string);

    }

    /**
     *  util.String.tokenise(string, pattern[, handler[, context]]) -> Array
     *  - string (String): String to tokenise.
     *  - pattern (RegExp): Regular expression to identify the tokens.
     *  - handler (Function): Optional conversion for the matches.
     *  - context (?): Optional context for the `handler`.
     *
     *  Tokenises a string based on the given pattern.
     *
     *      util.String.tokenise("a<b>c<d>e", /<(\w+)>/);
     *      // -> ["a", "<b>", "c", "<d>", "e"]
     *
     *  The `pattern` does not need the global flag - the flag is removed before
     *  tokenising.
     *
     *  The actual matches can be converted with the function passed as
     *  `handler` (which can optionally have a `context`). The `handler` will
     *  be passed the matches and should return the text in place of the match.
     *
     *      util.String.tokenise("a<b>c<d>e", /<(\w+)>/, function (matches) {
     *          // matches = ["<b>", "b"]
     *          // matches = ["<d>", "d"]
     *          return "(" + matches[1].toUpperCase() + ")";
     *      });
     *      // -> ["a", "(B)", "c", "(D)", "e"]
     *
     **/
    function tokenise(string, pattern, handler, context) {

        var str = interpretString(string);
        var parts = [];
        var match;

        if (!(pattern instanceof RegExp)) {
            pattern = /(?:)/; // matches nothing
        }

        if (typeof handler !== "function") {

            // returns first entry
            handler = function (matches) {
                return matches[0];
            };

        }

        while (str.length) {

            match = str.match(pattern);

            if (!match || match[0].length === 0) {

                parts.push(str);
                str = "";

            } else {

                parts.push(
                    str.substr(0, match.index),
                    interpretString(handler.call(context, match))
                );
                str = str.substr(match.index + match[0].length);

            }

        }

        return parts;

    }

    /**
     *  util.String.toPath(string) -> Array
     *  - string (String): String to convert.
     *
     *  Converts a string into an array or properties for accessing an object.
     *
     *      util.String.toPath("one"); // -> ["one"]
     *      util.String.toPath("one.two"); // -> ["one", "two"]
     *      util.String.toPath("one[1].two"); // -> ["one", "1", "two"]
     *
     **/
    function stringToPath(paths) {

        var result = [];
        var str = interpretString(paths);

        if ((/^\./).test(str)) {
            result.push('');
        }

        str.replace(
            /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,
            function(match, number, quote, string) {

                result.push(
                    quote
                        ? string.replace(/\\(\\)?/g, '$1')
                        : (number || match)
                );

            }
        );

        return result;

    }

    /**
     *  util.Object.access(object, path) -> ?
     *  - object (Object): Object whose propertys should be accessed.
     *  - path (String): Path string.
     *
     *  Traces the given `path` to access the associated data from `object`. If
     *  the path cannot be followed at any point, `undefined` is returned.
     *
     *  To better understand this function, consider the following object:
     *
     *      var object = {
     *          one: {
     *              two: {
     *                  three: [
     *                      "alpha",
     *                      "bravo",
     *                      [
     *                          "charlie",
     *                          "cat",
     *                          "car"
     *                      ],
     *                      {
     *                          delta: true,
     *                          devious: false
     *                      }
     *                  ]
     *              }
     *          },
     *          four: [
     *              "one",
     *              "two"
     *          ],
     *          "five-six": {
     *              seven: 7,
     *              eight: 88,
     *              nine: [
     *                  "nine",
     *                  "NINE",
     *                  "9"
     *              ]
     *          }
     *      };
     *
     *  Given that object, this function would return the following results:
     *
     *      access(object, "one.two.three[2][1]");    // -> "cat"
     *      access(object, "four[0].length");         // -> 3
     *      access(object, "one.two.three[3].delta"); // -> true
     *      access(object, "five");                   // -> undefined
     *      access(object, "five.one.two");           // -> undefined
     *      access(object, "five-six.nine[2]");       // -> "9"
     *      access(object, "[five-six].nine[2]");     // -> "9"
     *
     **/
    function access(object, path) {

        stringToPath(path).every(function (property) {

            object = (
                    object !== null
                    && object !== undefined
                    && Object.prototype.hasOwnProperty.call(object, property)
                )
                ? object[property]
                : undefined;

            return object !== undefined;


        });

        return object;

    }

    /**
     *  util.String.supplant(string, replacements[, pattern]) -> String
     *  - string (String): String to supplant.
     *  - replacements (Object): Replacements for the string.
     *  - pattern (RegExp): Optional pattern for the placeholders.
     *
     *  Replaces the placeholders in the given `string` with the properties in
     *  the `replacements` object.
     *
     *      var string = "Hello ${world}";
     *      var reps = {world: "you"};
     *      util.String.supplant(string, reps); // -> "Hello you"
     *
     *  Placeholders can appear multiple times within the string.
     *
     *      var string = "Hello ${world} ${world}";
     *      var reps = {world: "you"};
     *      util.String.supplant(string, reps); // -> "Hello you you"
     *
     *  Placeholders can be escaped with `"\\"`.
     *
     *      var string = "Hello \\${world} ${world}";
     *      var reps = {world: "you"};
     *      util.String.supplant(string, reps); // -> "Hello ${world} you"
     *
     *  If the placeholder property isn't found, or the value isn't stringy (see
     *  [[util.String.isStringy]]) then the placeholder is left in place.
     *
     *      util.String.supplant(string, {nothing: "you"});
     *      // -> "Hello ${world}"
     *      util.String.supplant(string, {world: []});
     *      // -> "Hello ${world}"
     *
     *  The pattern for the placeholders can be defined by passing a regular
     *  expression as the `pattern` argument (if ommitted,
     *  `/(^|.|\r|\n)(\$\{(.*?)\})/` is used). The pattern should match 3 parts.
     *  The three parts are:
     *
     *  -   The prefix before the placeholder.
     *  -   The whole placeholder.
     *  -   The placeholder text.
     *
     *  To better understand this, here is the regular expression for the
     *  default pattern.
     *
     *      var pattern = /(^|.|\r|\n)(\$\{(.*?)\})/;
     *
     *  Here's an example of using this function with double braces.
     *
     *      var string = "Hello \\{{world}} {{world}}";
     *      var reps = {world: "you"};
     *      var ptrn = /(^|.|\r|\n)(\{\{(.*?)\}\})/;
     *      util.String.supplant(string, reps, ptrn);
     *      // -> "Hello {{world}} you"
     *
     **/
    function supplant(string, replacements) {

        string = interpretString(string);
        replacements = replacements || {};

        return tokenise(string, /(^|.|\r|\n)(\$\{(.*?)\})/, function (matches) {

            var prefix = matches[1];
            var whole = matches[2];
            var value = access(replacements, matches[3]);
            var replacement = (
                    typeof value === "string"
                    || typeof value === "number"
                )
                ? value
                : whole;

            return prefix === "\\"
                ? whole
                : prefix + replacement;

        }).join("");

    }

    /**
     *  util.Number.isNumeric(number) -> Boolean
     *  - number (?): Number to test.
     *
     *  Tests to see if the given number is numberic. This is not necessarily
     *  the same as testing whether or not the given `number` is a number.
     *
     *      util.Number.isNumeric(10);       // -> true
     *      util.Number.isNumeric('10');     // -> true
     *      util.Number.isNumeric(10,1);     // -> true
     *      util.Number.isNumeric(util);     // -> false
     *      util.Number.isNumeric(NaN);      // -> false
     *      util.Number.isNumeric(Infinity); // -> false
     *
     **/
    function isNumeric(number) {
        return !isNaN(parseFloat(number)) && isFinite(number);
    }

    /**
     *  util.Function.curry(func, ...args) -> Function
     *  - func (Function): Function to curry.
     *  - args (?): Pre-defined arguments for `func`.
     *
     *  This method creates a function that pre-populates `func` with the given
     *  `args`. To better understand that, consider the following function:
     *
     *      function aLady(once, twice, threeTimes) {
     *          return once + (2 * twice) + (3 * threeTimes);
     *      }
     *      aLady(1, 2, 3); // -> (1 + (2 * 2 = 4) + (3 * 3 = 9) = ) 14
     *
     *  The arguments can be pre-defined:
     *
     *      var ladyOne = util.Function.curry(aLady, 1);
     *      ladyOne(1, 2); // -> (1 + (2 * 1 = 2) + (3 * 2 = 6) = ) 9
     *
     *  Gaps in the pre-defined arguments can be left using `undefined` - these
     *  gaps will be automatically filled in using the arguments passed to the
     *  new function.
     *
     *      var ladyTwo = util.Function.curry(aLady, undefined, 5);
     *      ladyTwo(6, 7); // -> (6 + (2 * 5 = 10) + (3 * 7 = 21) = ) 37
     *
     **/
    function curry(func, ...args) {

        return function (...innerArgs) {

            var allArgs = [];

            args.forEach(function (arg) {

                allArgs.push(
                    arg === undefined
                        ? innerArgs.shift()
                        : arg
                );

            });

            return func(...allArgs.concat(innerArgs));

        };

    }

    /**
     *  util.Object.pair(object) -> Array
     *  - object (Object): Object to convert.
     *
     *  Converts an object into an array of `key`/`value` pairs.
     *
     *      var object = {foo: 1, bar: 2};
     *      var pairs = util.Object.pair(object);
     *      // -> [{key: "foo", value: 1}, {key: "bar", values: 2}]
     *
     *  The `value` entry can contain anything and the conversion only goes a
     *  single level deep.
     *
     *     var object = {foo: {bar: 1}};
     *     var pairs = util.Object.pair(object);
     *     // -> [{key: "foo", value: {bar: 1}]
     *
     *  Be warned that manipulating the resulting object in `value` in this
     *  example will propbably manipulate the original as well (because objects
     *  in JavaScript are passed by reference).
     **/
    function objectPair(object) {

        var pairs = [];

        Object.keys(object).forEach(function (key) {

            pairs.push({
                key: key,
                value: object[key]
            });

        });

        return pairs;

    }

    /**
     *  util.Array.isArrayLike(object) -> Boolean
     *  - object (?): Object to test.
     *
     *  Tests to see if the given object is array-like.
     *
     *      util.Array.isArrayLike([]);                             // -> true
     *      util.Array.isArrayLike('');                             // -> true
     *      util.Array.isArrayLike(0);                              // -> false
     *      util.Array.isArrayLike({});                             // -> false
     *      util.Array.isArrayLike({length: 0});                    // -> true
     *      util.Array.isArrayLike({length: -1});                   // -> false
     *      util.Array.isArrayLike(document.querySelector('*'));    // -> false
     *      util.Array.isArrayLike(document.querySelectorAll('*')); // -> true
     *
     **/
    function isArrayLike(array) {

        var arrayMaxLength = Math.pow(2, 32) - 1;

        return (
            array !== null
            && array !== undefined
            && (
                Array.isArray(array)
                || (
                    isNumeric(array.length)
                    && array.length >= 0
                    && array.length < arrayMaxLength
                )
                || (
                    window.Symbol
                        ? typeof array[Symbol.iterator] === "function"
                        : false
                )
            )
        );

    };

    assign(utility.Array, {
        map: arrayMap,
        invoke: arrayInvoke
    });

    assign(utility.Function, {
        curry: curry
    });

    assign(utility.Number, {
        isNumeric: isNumeric
    });

    assign(utility.Object, {
        access: access,
        pair: objectPair
    });

    assign(utility.String, {
        interpret: interpretString,
        toPath: stringToPath,
        supplant: supplant,
        tokenise: tokenise
    });

    return utility;

}());
