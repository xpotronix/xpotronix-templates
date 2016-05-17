/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define('Ux.xpotronix.xpCellEditing', {

	extend: 'Ext.grid.plugin.CellEditing',
	alias: 'plugin.xpcellediting',

	panel: null,

	alternateClassName: [
		'xpcellediting'
	],

	requires: [
		'Ext.grid.plugin.CellEditing'
	],

	rowIndex: -1,

        listeners: {

        	beforeedit: function(cellEditor, context, eOpts ){

        		// console.log(context.rowIdx);
        		this.rowIndex = context.rowIdx;
        	}
	 }

});
