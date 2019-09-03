Ext.onReady(function() { 

/*

Ext.override(Ext.grid.ViewDropZone, {

    handleNodeDrop: function (data, record, position) {
        var view = this.view,
            store = view.getStore(),
            index, records, i, len;


	if ( ! data.copy ) 
            data.view.store.remove(data.records, data.view === view);

	if ( view.prepareData )
		data.records = view.prepareData.call( this, store, data.records );

        // If the copy flag is set, create a copy of the models
        if (data.copy) {
            records = data.records;
            data.records = [];
            for (i = 0, len = records.length; i < len; i++) {
                data.records.push(records[i].copy());
            }
        } 


        if (record && position) {
            index = store.indexOf(record);

            // 'after', or undefined (meaning a drop at index -1 on an empty View)...
            if (position !== 'before') {
                index++;
            }
            store.insert(index, data.records);
        }
        // No position specified - append.
        else {
            store.add(data.records);
        }

        view.getSelectionModel().select(data.records);
    }

 
});

*/

/* bugfix para las versiones nuevas del chrome */

Ext.chromeVersion = Ext.isChrome ? parseInt(( /chrome\/(\d{2})/ ).exec(navigator.userAgent.toLowerCase())[1],10) : NaN;

/*if ( Ext.grid.RowEditorButtons ) 
	Ext.apply( Ext.grid.RowEditorButtons.prototype, { position: 'top' } );
*/

/* que no chequee si han cambiado los valores */
Ext.form.field.Field.prototype.suspendCheckChange = 1;

consoleDebugFn = function( e ) {

	Ext.util.Observable.capture( e, function(evname) {
		console.log(evname, arguments);
	});

	return true;
};


/* test RowEditor en espa#ol */
if (Ext.grid.RowEditor) {
	Ext.apply(Ext.grid.RowEditor.prototype, {
		saveBtnText : "Guardar",
		cancelBtnText : "Cancelar",
		errorsText : "Errores",
		dirtyText : "Debe guardar o cancelar sus cambios"
	});
}

/* Ext.isEmptyObject() */
Ext.isEmptyObject = function( o ) {

                for(var p in o)
                        if(o.hasOwnProperty(p))
                                return false;
                return true;
        };

/* Ext.util.format.escapeXml() */
Ext.util.Format.escapeXml = function(str) {
	function replaceChars(character) {
		switch (character) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			case "'": return '&apos;';
			case '"': return '&quot;';
			default: return '';
		};			
	};
	return String(str).replace(/[<>&"']/g, replaceChars);
};

/* DEBUG: no anda

Ext.define('Ux.xpotronix.StoreManager', {

	extend: 'Ext.data.StoreManager',
	alternateClassName: ['Ux.xpotronix.StoreMgr'],
	singleton: true,

	lookup: function( store ) {
		return this.callParent(arguments);
	}

});

*/

});
