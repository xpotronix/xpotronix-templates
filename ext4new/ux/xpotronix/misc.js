/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */


function entry_help_process( store, obj_value, attr_value, attr_constraint, fn ) {

	var parent_obj = store.lookup( obj_value );

	if ( parent_obj ) {
		var value = parent_obj.cr().get( attr_value );

		if ( value || fn ) {
			var p = {};
			p[attr_constraint] = fn ? fn.call( store, value ): value;
			return p;
		} 
	}

	return {};
}

function entry_help( eh_store, obj_value, attr_value, attr_constraint, fn ) {

       	eh_store.lookup( eh_store ).on('beforeload', function( store, options )  {

		Ext.apply( options.params, entry_help_process( store, obj_value, attr_value, attr_constraint, fn ) );

	});
};


function formatBoolean(value){
   return ( value == 'true' || value == true )? 'Si' : 'No';
};

function formatDate(value){
   // return value ? Ext.util.Format.( value, 'd/m/Y') : '';
   return value;
};

