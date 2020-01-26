"use babel";

export default {
    /**
    * Determines the object type that a string represents.
    * @param txt {string}
    * @return {string} a string representing the type of function
    */
    getObjectType(txt) {
        const RX_FUNCTION_DECLARATION   = /function\s+\w+\s*\(.*\)\s*{/gm
        const RX_FUNCTION_EXPRESSION    = /(var|let|const)\s+\w+\s*=\s*function\s*\(\)\s*{/gm // allow global var?
        const RX_OBJECT_LITERAL         = /(var|let|const)\s+\w+\s*=\s*{/gm

        if (RX_FUNCTION_DECLARATION.test(txt.trim()))
            return "declaration"
        if (RX_OBJECT_LITERAL.test(txt.trim()))
            return "literal"
        if (RX_FUNCTION_EXPRESSION.test(txt.trim()))
            return "expression"
    },


    /**
    *   Finds the indices where a function starts and ends. Finds the start and end indices of each outer scope defined
    *   function (or any structures) (all types. missing one arrow func currently) inside the object literal (or function object), by
    *   @param {string} txt the string to extract the indices from
    *   @return {array} an array with index pairs, representing the start and end index of a function, as
    *   determined by {}.
    */
    findFunctionIndices(txt) {
        var object_start_index = txt.indexOf("{")
        // var funcStarted = false
        var nested = 0
        var indices = []

        for (var i = object_start_index+1; i < txt.length; i++) {
            // start of a function
            if ((txt[i] == "{"  || txt[i] == "[") && nested == 0) {
                indices.push({ start:i })
                // funcStarted = true
                nested = 1
            }

            // nested struct found
            else if ((txt[i] == "{"  || txt[i] == "[") && nested > 0){
                nested++
            }

            // end of nested struct
            else if ((txt[i] == "}"  || txt[i] == "]") && nested > 1){
                nested--
            }

            // end of the function  - If nested == 0 can end function
            else if ((txt[i] == "}" || txt[i] == "]") && nested == 1) {
                nested = 0 // not necessary
                var textAhead = this.getSemicolonAfter(txt, i+1)

                if(textAhead != null)
                  indices[indices.length-1].end = i + textAhead.length + 1
                else
                  indices[indices.length-1].end = i + 1
            }
        }

        return indices
    },


    /**
     * Gets the semicolon and whitespace after index
     * @param src the text to search in
     * @param index the index to start searching from
     * @return {string/null} the string or null
     */
    getSemicolonAfter(src, index) {
        var txt = ""
        var i = index
        var nextChar = src[i]  // first char

        while(nextChar == " " || nextChar == "\n" || nextChar == "\r" || nextChar == "\r\n" || nextChar == "\t") {
            txt += nextChar
            nextChar = src[++i]
            if (nextChar == ";")
                return txt
        }
        return null
    },


    /**
    *    Checks whether an index(num), is within the index pairs
    *    provided.
    *    @param index the number representing the index
    *    @param indices an array of index pairs in the format
    *    @return {boolean} whether the index was found within
    *    the range of any of the index pairs
    */
    isWithinFunction(index, indices) {
      var bool = false

      indices.forEach(function(f) {
          if (index > f.start && index < f.end)
              bool = true
      })
      return bool
    },


    /**
     * Finds all occurences of a substring/char in the given
     * string.
     * @param char the char to match/search for
     * @param txt the text to search in
     * @return an array containing the index of the first char of the
     * word searched for
     */
    findAllIndicesOf(char, txt) {
      var i = -1
      var pos = 0
      var indices = []

      while (pos != -1) {
          pos = txt.indexOf(char, i + 1);
          i = pos;
          if (pos != -1)
              indices.push(pos)
      }

      return indices
    },


    /**
     * Determines if the string provided is a declaration (constructor).
     * @param {String} exp the expression
     * @return {Boolean} true if function declaration, false otherwise
     */
    isFunctionDeclaration(exp) {
      const RX_FUNCTION_DECLARATION  = /function\s+\w+\s*\(.*\)\s*{/gm

      if (RX_FUNCTION_DECLARATION.test(exp.trim()))
          return true

      return false
    },


    /**
     * Gets all the whitespace (\n\t\s\r) immidately following a character in
     * a given string.
     * Used to retain user formatting (spacing)
     * Gets the whitespace directly behind the last letter in txt
     * @param txt the text to find whitespace behind
     */
     getWhitespaceBehind(txt, c) {
       var index = txt.length-2        // -1 last, -2 skip last
       // if (!c)
       var char = txt[txt.length-2]
       var whitespace = ""

       while (char == " " || char == "\n" || char == "\r" || char == "\r\n" || char == "\t") {
           char = txt[index]
           whitespace += char
           index--
       }

      return whitespace.slice(0, whitespace.length-1).split("").reverse().join("")
    }
}
