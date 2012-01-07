/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

function entry_help( eh_store, obj_value, attr_value, attr_constraint, fn ) {

       	App.store.item( eh_store ).on('beforeload', function( store, options )  {

		var parent_obj = App.store.item( obj_value );
		if ( parent_obj ) {
			var value = parent_obj.cr().get( attr_value );

			if ( value || fn ) {
				var p = {};
				p[attr_constraint] = fn ? fn.call( store, value ): value;
				Ext.apply( options.params, p );
			} 
		}
	});
};


function formatBoolean(value){
   return ( value == 'true' || value == true )? 'Si' : 'No';
};

function formatDate(value){
   // return value ? Ext.util.Format.( value, 'd/m/Y') : '';
   return value;
};

