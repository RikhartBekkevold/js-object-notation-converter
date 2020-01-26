"use babel";

import Lib from './lib';

export default {
    /**
     *  Changes a string representing either a function statement definition or function
     *  expression definition; to a string representing an object literal definition.
     *  @param {String} definition the string to change
     *  @param {String} type the object type (expression or statement) the string represents
     *  @param {String} keyword the string to replace the function keyword
     *  (var, let, or const) with, if type is being changed from expression to definition
     *  @return {String} the string representation of an object literal definition
     */
    convertDefinition(definition, type, keyword) {
        if (type == "expression") {
            definition = definition.replace("function", "")
            definition = definition.replace("()", "")
        }
        else if (type == "declaration") {
            definition = definition.replace("function", keyword)
            definition = definition.replace("()", "=")
        }
        return definition
    },


    /**
     * Gets all substrings of a string that matches a valid JS constructor assignment expression.
     * @return {array} the expressions as an array of strings
     */
    getAllExpressions(txt, type) {
        const RX_PRIMITIVE_EXPRESSION       = /(var|const|let|this)(\s+|\.)\w+\s*=(?!=)\s*(\d+|"\w+")((;|\s*;)|(\s))/gm  //string or num
        const RX_BOOLEAN_EXPRESSION         = /(var|const|let|this)(\s+|\.)\w+\s*=(?!=)\s*(true|false)((;|\s*;)|(\s))/gm

        const RX_ARRAY_EXPRESSION           = /(var|const|let|this)(\s+|\.)\w+\s*=(?!=)\s*\[/gm//[^\]]*]((;|\s*;)|(\s))/gm
        const RX_OBJECT_LITERAL_EXPRESSION  = /(var|const|let|this)(\s+|\.)\w+\s*=(?!=)\s*{/gm
        const RX_FUNCTION_ASSIGNMENT        = /(var|const|let|this)(\s+|\.)\w+\s*=(?!=)\s*function\s*\(.*\)\s*\{/gm
        const RX_FUNCTION_DECLARATION       = /function\s+\w+\s*\(.*\)\s*{/gm  // wont work if comment?

        var primitive_expressions = txt.match(RX_PRIMITIVE_EXPRESSION)
        var array_expressions     = txt.match(RX_ARRAY_EXPRESSION)
        var object_expressions    = txt.match(RX_OBJECT_LITERAL_EXPRESSION)
        var bool_expressions      = txt.match(RX_BOOLEAN_EXPRESSION)
        var function_assignment   = txt.match(RX_FUNCTION_ASSIGNMENT)
        var function_statement    = txt.match(RX_FUNCTION_DECLARATION)

        // only expressions _inside_ the object is valid
        if (type == "expression")
           function_assignment.shift()

        if (type == "declaration")
           function_statement.shift()

        if (array_expressions != null)
            primitive_expressions = primitive_expressions.concat(array_expressions)

        if (object_expressions != null)
            primitive_expressions = primitive_expressions.concat(object_expressions)

        if (bool_expressions != null)
            primitive_expressions = primitive_expressions.concat(bool_expressions)

        if (function_assignment != null)
            primitive_expressions = primitive_expressions.concat(function_assignment)

        if (function_statement != null)
            primitive_expressions = primitive_expressions.concat(function_statement)

       console.log(primitive_expressions);
       return primitive_expressions
    },


    /**
     * Filters out the expressions that are found to be inside substrings of a string that represents functions
     * @param {Array} expressions the expressions to filter
     * @param {String} txt the string to check against
     * @return {Array} an array containing the expressions that are outside functions
     * in the source string
     */
    filterExpressions(expressions, txt) {
       var indices     = Lib.findFunctionIndices(txt)
       var legalExp    = []

       expressions.forEach((str) => {
           var index = txt.indexOf(str)

           // addContentToExpression - update the expression, if array/obj/func, to include the content
           indices.forEach((f) => {
               if ((index+(str.length-1)) == f.start) {
                  str = str + txt.substring(f.start+1,  f.end+1)
              }
           })

           if (!Lib.isWithinFunction(index, indices))
               legalExp.push(str)
       })

       return legalExp
    },


    /**
     * Changes the substrings that match constructor assignment expressions in the passed text,
     * to literal assignment expressions instead.
     * @param {String} txt the text to change expressions in
     * @param {String} type the type of expression used to declare currently selected object
     * @return {string} the changed txt
     */
    convertExpressions(txt, type) {
       var expressions = this.getAllExpressions(txt, type)
       var legalExp    = this.filterExpressions(expressions, txt)

       legalExp.forEach((exp, index) => {
           var words = exp.trim().split(" ")

           // if function statement (both inner and root obj def, therefore must be excludes before, when creating
           // legal exp), change def
           if (words[0] === "function") {
               let exp2            = exp.split("{")
               var name            = words[1].split("(")
               var contentStart    = exp.indexOf("{")
               var content         = exp.substring(contentStart+1)

               if (!name[1].includes("{"))
                   name[1] = name[1] + " {"

               exp = name[0] + ": function(" + name[1] + content
           }
           // if expression and not function statement, change def
           else {
               let def = exp.split("{")
               def[0] = def[0].replace("this.", "")
               def[0] = def[0].replace("var ", "")
               def[0] = def[0].replace("const ", "")
               def[0] = def[0].replace("let ", "")
               def[0] = def[0].replace(" =", ":")
               def[0] = def[0].replace("=", ":")
               exp = def.join("{")
           }

           // change potential separator
           if (exp[exp.length-1] != ";")
              exp = exp.trim() + ","
           else
              exp = exp.substring(0, exp.length-1) + ","

           // replace
           txt = txt.replace(legalExp[index], exp)
       })

       return txt
    },


    /**
     * Converts an object constructor to object literal, and inserts the text into the
     * provided atom text editor.
     * @param {String} txt the txt to change
     * @param {TextEditor} editor the Atom TextEditor object to insert the changed text into
     * @param {String} type the type of object expression
     * @param {String} keyword the keyword (const, let or var) to use for the object literal declaration
     */
    convertToLiteral(txt, editor, type, keyword) {
       txt = this.convertExpressions(txt, type)
       txt = this.convertDefinition(txt, type, keyword)
       editor.insertText(txt)
    }
}
