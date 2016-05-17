/* bugfix para las versiones nuevas del chrome */

Ext.chromeVersion = Ext.isChrome ? parseInt(( /chrome\/(\d{2})/ ).exec(navigator.userAgent.toLowerCase())[1],10) : NaN;

/*if ( Ext.grid.RowEditorButtons ) 
	Ext.apply( Ext.grid.RowEditorButtons.prototype, { position: 'top' } );
*/


consoleDebugFn = function( e ) {

	Ext.util.Observable.capture( e, function(evname) {
		console.log(evname, arguments);
	});

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

