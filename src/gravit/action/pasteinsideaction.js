(function (_) {

    /**
     * Action for pasting clipboard contents into selection
     * @class GPasteInsideAction
     * @extends GUIAction
     * @constructor
     */
    function GPasteInsideAction() {
    };
    GObject.inherit(GPasteInsideAction, GUIAction);

    GPasteInsideAction.ID = 'edit.paste-inside';
    GPasteInsideAction.TITLE = new GLocale.Key(GPasteInsideAction, "title");

    /**
     * @override
     */
    GPasteInsideAction.prototype.getId = function () {
        return GPasteInsideAction.ID;
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.getTitle = function () {
        return GPasteInsideAction.TITLE;
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_EDIT;
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.getGroup = function () {
        return "ccp";
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.SHIFT, GUIKey.Constant.META, 'V'];
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.isEnabled = function () {
        var cpMimeTypes = gShell.getClipboardMimeTypes();
        if (cpMimeTypes && cpMimeTypes.indexOf(GXNode.MIME_TYPE) >= 0) {
            var document = gApp.getActiveDocument();
            if (document) {
                var selection = document.getEditor().getSelection();
                if (selection) {
                    for (var i = 0; i < selection.length; ++i) {
                        if (selection[i].hasMixin(GXNode.Container)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };

    /**
     * @override
     */
    GPasteInsideAction.prototype.execute = function () {
        var nodes = GXNode.deserialize(gShell.getClipboarContent(GXNode.MIME_TYPE));
        if (nodes && nodes.length > 0) {
            var elements = [];
            for (var i = 0; i < nodes.length; ++i) {
                if (nodes[i] instanceof GXElement) {
                    elements.push(nodes[i]);
                }
            }

            if (elements.length > 0) {
                var editor = gApp.getActiveDocument().getEditor();
                var selection = editor.getSelection();
                var newSelection = [];

                editor.beginTransaction();
                try {
                    for (var i = 0; i < selection.length; ++i) {
                        var target = selection[i];
                        if (!target.hasMixin(GXNode.Container)) {
                            continue;
                        }

                        for (var k = 0; k < elements.length; ++k) {
                            if (elements[k].validateInsertion(target)) {
                                var clone = elements[k].clone();
                                target.appendChild(clone);
                                newSelection.push(clone);
                            }
                        }
                    }

                    editor.updateSelection(false, newSelection);
                } finally {
                    // TODO : I18N
                    editor.commitTransaction('Paste Inside');
                }
            }
        }
    };

    /** @override */
    GPasteInsideAction.prototype.toString = function () {
        return "[Object GPasteInsideAction]";
    };

    _.GPasteInsideAction = GPasteInsideAction;
})(this);