"use babel";
import Lib from './lib';

export default {
    /**
     * A regex matching any legal JS identifier prefixes other than whitespace
     */
    prefix: "(?<!this\.|[a-z0-9A-Z])",


     /**
      *  Changes the declaration of an object literal to function object.
      *  @param {String} txt the text to "mutate"
      *  @return {String} the "mutated" text
      */
    changeLiteralDefinition(txt) {
        txt = txt.replace("=", "()")
        txt = txt.replace("var", "function") // or const/let - use the setting?
        return txt
    },


    /**
     *  Converts an object literal to a constructor declaration
     *  and inserts the new text.
     *  @param {string} txt the txt to change and insert
     *  @param {TextEditor} editor an editor object to insert the text into
     */
    changeFunctionBody(txt, editor, setting) {
        var replaceCommaWithSemicolon = setting
        var identifiers = txt.match(/(\w)+\s*:/gm)
        var legalIdentifiers = []
        var function_indices = Lib.findFunctionIndices(txt)

        if (identifiers != null) { // only null if mistake - mismatching dec and content
          identifiers.forEach((identifier) => {
              let index = txt.indexOf(identifier)

              if (!Lib.isWithinFunction(index, function_indices))
                  legalIdentifiers.push(identifier)
          })
        }

        legalIdentifiers.forEach((identifier) => {
          let index = txt.indexOf(identifier)

          if (!Lib.isWithinFunction(index, Lib.findFunctionIndices(txt))) {
                txt = txt.replace(new RegExp(this.prefix + identifier, "g"), "this." + identifier)
            }
        })

        txt = txt.replace(/:/gm, " =")

        if (replaceCommaWithSemicolon == true)
            txt = txt.replace(/,/gm, ";")
        else
            txt = txt.replace(/,/gm, "")

        return txt
    },


    /**
     * Converts an entire string representing an object
     * literal to a string representing a
     * function declaration, then inserts the text in
     * the provided atom text editor.
     * @param {String} txt the text that includes an object literal
     * @param {String} editor an atom editor to insert the text into
     * @param {String} replaceChar the character to replace statement seperator with, e.g: "" or ","
     */
    convertToDeclaration(txt, editor, replaceChar) {
        txt = this.changeLiteralDefinition(txt)
        txt = this.changeFunctionBody(txt, editor, replaceChar)
        editor.insertText(txt)
    }
}
