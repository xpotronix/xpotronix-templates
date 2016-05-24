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

	debug: false,

	panel: null,

	alternateClassName: [
		'xpcombobox'
	],

	requires: [
		'Ext.form.field.ComboBox'
	],


	setValue: function( value,  b ) {

		if ( value !== undefined ) {

			/* carga un registro fake en el store del combobox para que pueda machear el forceSelections */

			var p = this.up('grid') || this.up('form');

			if ( p ) {

				var s = this.store;
				var selModel = p.selModel || p.controller.selModel;

				var data = s.get_foreign_key_record( selModel.getSelection(), true );
				this.debug && console.log(data);

				/* hago un suspendEvents porque enloquece la funcion updateIndex del combobox */

				s.suspendEvents();
				if ( s.getCount() > 0 ) 
					s.removeAt( 0 );

				s.insert(0,data);
				s.resumeEvents();

				this.bindStore(s);
				this.updateLayout();

				this.debug && console.log( s.getCount() );

				if ( p = this.up('form') ) {

					var r = p.controller.selModel.selected.first();
					this.valueNotFoundText = r.get( this.name + '_label' );

				}
			} 
		}

		this.callParent(arguments);
		delete this.valueNotFound;
	}
});
