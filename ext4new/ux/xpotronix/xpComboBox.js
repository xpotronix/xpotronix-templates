/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define('Ux.xpotronix.xpComboBox', {

	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.xpcombo',

	panel: null,

	alternateClassName: [
		'xpcombobox'
	],

	requires: [
		'Ext.form.field.ComboBox'
	],


	setValue: function( value,  b ) {

		if ( value ) {

			/* carga un registro fake en el store del combobox para que pueda machear el forceSelections */

			var g, f, r;

			if ( g = this.up('grid') ) {

				var s = this.store;

				var data = s.get_foreign_key_record( g.selModel.getSelection(), true );
				// console.log(data);

				/* hago un suspendEvents porque enloquece la funcion updateIndex del combobox */

				s.suspendEvents();

				if ( s.getCount() > 0 ) 
					s.removeAt( 0 );

				s.insert(0,data);

				s.resumeEvents();

				// console.log( s.getCount() );

				this.callParent(arguments);

				/* esto con el parent_store no funciono, lo dejo de referencia

				var data = s.get_foreign_key_record(s.parent_store.selections, true);
				// console.log(data);
				s.insert(0,data);

				*/

			} else if ( f = this.up('form') ) {


				console.error('estoy aca!!! arreglar el valueNotFound y agregar los botones ADELANTE y ATRAS en el FORM para DEBUG');	
				r = f.controller.selModel.selected.first();
				this.valueNotFoundText = r.get( this.name + '_label' );
				this.callParent(arguments);
				this.valueNotFoundText = '';

			}

		} else 

			delete this.valueNotFound; // DEBUG: solo para form


	}
});
