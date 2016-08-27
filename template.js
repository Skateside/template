/**
 *  template(string) -> Object
 *  - string (String): Template to parse.
 *
 *  Parses the given template `string` and creates an object with a `render`
 *  method that can accept data and will render the template based on it.
 *
 *  See [the associated blog post]() for more details.
 **/
var template = (function () {

    "use strict";

    var BRANCH_PART = /(^|.|\r|\n)\$\{#[^\}]+\}/;
    var PROCESS_BRANCH = /(^|.|\r|\n)\$\{#(\w+)\s+([^\}]+)\}$/;

    var makeTemplate;

    var tests = {

        "<": function (data, value) {
            return data < value;
        },

        ">": function (data, value) {
            return data > value;
        },

        "<=": function (data, value) {
            return data <= value;
        },

        ">=": function (data, value) {
            return data >= value;
        },

        "!==": function (data, value) {
            return data !== value;
        },

        "===": function (data, value) {
            return data === value;
        },

        // The regular expression won't match this, but we'll need it for a case
        // like: `${#if responses.length}`
        truthy: function (data) {
            return !!data;
        }

    };

    // We should create some aliases to make life easier on developers.
    tests["!="] = tests["!=="];
    tests["=="] = tests["==="];

    function makeTextBranch(text) {

        var textBranch = {

            type: "text",

            render: function (data) {
                return util.String.supplant(text, data);
            }

        };

        return Object.freeze(textBranch);

    }

    function makeBaseBranch() {

        var branches = [];
        var parent;
        var baseBranch = {

            type: "base",

            addBranch: function (branch) {
                branches.push(branch);
            },

            getBranches: function () {
                return branches.concat();
            },

            render: function (data) {
                return util.Array.invoke(branches, "render", data).join("");
            },

            setParent: function (branch) {
                parent = branch;
            },

            getParent: function () {
                return parent;
            }

        };

        return Object.freeze(baseBranch);

    }

    function decode(value) {

        var parts;

        switch (value) {

        case "null":
            value = null;
            break;

        case "undefined":
            value = undefined;
            break;

        case "false":
        case "true":
            value = value === "true";
            break;

        default:

            parts = value.match(/^(["'`])?([\s\S]+)?\1$/);

            if (typeof parts[1] === "string") {
                value = parts[2];
            } else if (util.Number.isNumeric(value)) {
                value = +value;
            } else {

                value = util.Function.curry(
                    util.Object.access,
                    undefined,
                    value
                );

            }

        }

        return value;

    }

    function makeIfBranch(condition) {

        // Parsing.
        var regexp = /\${#if\s+(!)?([\S]+)(\s*([<>!=]{1,3})\s*([\S]+))?\}/;
        var parts = condition.match(regexp);

        // Checking the parts and falling back where necessary.
        var negation = parts[1];
        var propertyPath = parts[2];
        var test = parts[4] || "truthy";
        var value = parts[5] || "";

        // Creating the branch.
        var baseBranch = makeBaseBranch();
        var ifBranch = util.Object.assign({}, baseBranch, {

            type: "if",

            render: function (data) {

                var property = util.Object.access(data, propertyPath);
                var decoded = decode(value);
                var shouldRender = true;

                if (test && typeof tests[test] === "function") {

                    shouldRender = tests[test](
                        negation === "!"
                            ? !property
                            : property,
                        typeof decoded === "function"
                            ? decoded(data)
                            : decoded
                    );

                }

                return shouldRender
                    ? baseBranch.render(data)
                    : "";

            }

        });

        return Object.freeze(ifBranch);

    }

    function pair(object) {

        return util.Array.isArrayLike(object)
            ? util.Array.map(object, function (value, key) {

                return {
                    key: key,
                    value: value
                };

            })
            : util.Object.pair(object);

    }

    function makeEachBranch(condition) {

        // Parsing.
        var regexp = /\$\{#each\s+([\w]+)\s+as(\s([\w]+)\s+to)?\s+([\w]+)\}/;
        var parts = condition.match(regexp);

        // Aliases (for readability).
        var dataKey = parts[1];
        var iterationKey = parts[3];
        var iterationValue = parts[4];

        // Creating the branch.
        var eachBranch = util.Object.assign({}, makeBaseBranch(), {

            type: "each",

            render: function (data) {

                var rendered = "";
                var datum = pair(data[dataKey]);

                var branchData = util.Object.assign({}, data);

                datum.forEach(function (pair) {

                    eachBranch.getBranches().forEach(function (branch) {

                        branchData[iterationValue] = pair.value;

                        if (iterationKey) {
                            branchData[iterationKey] = pair.key
                        }

                        rendered += branch.render(branchData);

                    });

                });

                return rendered;

            }

        });

        return Object.freeze(eachBranch);

    }

    function makeTree() {

        var types = {
            each: makeEachBranch,
            text: makeTextBranch,
            "if": makeIfBranch
        };
        var currentBranch;
        var tree = {

            init: function () {
                tree.setBranch(makeBaseBranch());
            },

            setBranch: function (branch) {
                currentBranch = branch;
            },

            getBranch: function () {
                return currentBranch;
            },

            addBranch: function (branch) {
                currentBranch.addBranch(branch);
            },

            render: function (data) {

                if (currentBranch.type !== "base") {

                    throw new SyntaxError(
                        "Unclosed " + currentBranch.type + " branch"
                    );

                }

                return currentBranch.render(data);

            },

            openBranch: function (type, content) {

                var newBranch;

                if (!types[type]) {
                    throw new TypeError("Unknown branch type " + type);
                }

                newBranch = types[type](content);
                newBranch.setParent(currentBranch);
                tree.addBranch(newBranch);
                tree.setBranch(newBranch);

            },

            closeBranch: function (type) {

                var branchType = currentBranch.type;

                if (branchType !== type) {

                    throw new SyntaxError(
                        "Expecting type " + branchType + " but got " + type
                    );

                }

                tree.setBranch(currentBranch.getParent());

            }

        }

        return Object.freeze(tree);

    }

    function setup(tree) {

        tree.init();
        util.String.tokenise(string, BRANCH_PART).forEach(function (part) {

            var match = part.match(PROCESS_BRANCH);

            if (match && match[1] !== "\\") {

                if (match[2] === "end") {
                    tree.closeBranch(match[3]);
                } else {
                    tree.openBranch(match[2], match[0]);
                }

            } else {
                tree.addBranch(makeTextBranch(part));
            }

        });

    }

    template = function (string) {

        var tree = makeTree();
        var template = {
            render: tree.render,
tree: tree
        };

        setup(tree);

        return Object.freeze(template);

    };

    util.Object.assign(template, {
        makeBaseBranch: makeBaseBranch,
        makeEachBranch: makeEachBranch,
        makeIfBranch: makeIfBranch,
        makeTextBranch: makeTextBranch,
        makeTree: makeTree,
        make: makeTemplate
    });

    return Object.freeze(template);

}());
