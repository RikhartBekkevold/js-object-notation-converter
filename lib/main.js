'use babel';

import { CompositeDisposable } from 'atom';
import ConstConverter from './convertToConstructor';
import LiteralConverter from './convertToLiteral';
import Lib from './lib';


export default {
    /**
     * Atom events subscribed to by this package.
     */
    subscriptions: null,

    /**
     * The user config, name must be "config" exactly.
     */
    config: {
        replaceCommaWithSemicolon: {
            title: 'Replace "," with ";"',
            description: "Replaces commas with semicolons, instead of just removing the commas, in the literal -> constructor conversion",
            type: 'boolean',
            default: true,
        },
        objectKeyword: {
            title: 'Use const, let or var in object literal',
            description: 'When converting to object literal use either const, var or let in the resulting object literal',
            type: 'string',
            default: "var",
            enum: ["let", "const", "var"]
        }
    },


    /**
     * Called by atom when package is activated.
     * Sets up the package's single command: convert.
     */
    activate(state) {
        this.subscriptions = new CompositeDisposable();

        this.subscriptions.add(atom.commands.add('atom-workspace', {
          'js-object-notation-converter:convert': () => this.convert()
        }));
    },


    /**
     * Gets a package's setting value.
     * @param {String} key the setting to get the value of
     * @return {Any} the value of the setting
     */
    getSetting(key) {
        if (key === "replaceCommaWithSemicolon")
            return atom.config.get('js-object-notation-converter.replaceCommaWithSemicolon')
        if (key === "retainSpacing")
            return atom.config.get('js-object-notation-converter.retainSpacing')
        if (key === "objectKeyword")
            return atom.config.get('js-object-notation-converter.objectKeyword')
    },


    /**
     * Displays an atom notification warning.
     */
    diplayWarning() {
        var msg = "Selected text not a valid object. Did you forget to select "  +
                  "an object, or is the selected object not a literal or constructor?"

        var options = {
            detail: "Warning thrown in package: js-object-notation-converter",
            dismissable: true
        }

        var notification = atom.notifications.addWarning(msg, options)

        setTimeout(function() {
            notification.dismiss()
        }, 13000)
    },


    /**
     * Converts the currently selected editor text from its current object
     * notation to its "opposite" notation. If not a valid object,
     * user is alerted with an atom notification message.
     */
    convert() {
        var editor                = atom.workspace.getActiveTextEditor()
        var txt                   = editor.getSelectedText()
        var indexOfFirstBracket   = txt.trim().indexOf("{")
        var firstline             = txt.trim().slice(0, indexOfFirstBracket+1)
        var type                  = Lib.getObjectType(firstline)

        switch (type) {
            case "declaration":
                LiteralConverter.convertToLiteral(txt, editor, type, this.getSetting("objectKeyword"))
            break;
            case "expression":
                LiteralConverter.convertToLiteral(txt, editor, type, this.getSetting("objectKeyword"))
            break;
            case "literal":
                ConstConverter.convertToDeclaration(txt, editor, this.getSetting("replaceCommaWithSemicolon"))
            break;
            default:
                this.diplayWarning()
            break;
        }
    }
};
