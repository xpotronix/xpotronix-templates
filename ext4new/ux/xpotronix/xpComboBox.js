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

			var s = this.store;
			var r;

                	var data = s.get_foreign_key_record( this.up('grid').selModel.getSelection(), true );
                	// console.log(data);

			/* hago un suspendEvents porque enloquece la funcion updateIndex del combobox */

			s.suspendEvents();

			if ( s.getCount() > 0 ) 
				s.removeAt( 0 );

                	s.insert(0,data);

			s.resumeEvents();

			// console.log( s.getCount() );

			/* esto con el parent_store no funciono, lo dejo de referencia

			var data = s.get_foreign_key_record(s.parent_store.selections, true);
			// console.log(data);
			s.insert(0,data);

			*/ 

		}

		this.callParent(arguments);

	}
});
