/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define('Ux.xpotronix.xpMultiSearch', {

	extend: 'Ext.ux.grid.MultiSearch',
	alias: 'plugin.xp-gms',

	panel: null,
	menu: null,
	height: 21,

	debug: false,

	alternateClassName: [
		'xpmultisearch'
	],

	requires: [
		'Ext.saki.grid.MultiSearch'
	],

	init: function( grid ) {/*{{{*/

		var me = this;
		me.originalHeight = me.height;	
		me.height = 0;

		me.callParent(arguments);

		// add menu
		me.menu = new Ext.button.Split({
			icon: '/ux/images/filter.png'
			,cls: 'x-btn-text-icon'
			,text: 'Filtrar'
			,enableToggle: true
			,tooltip: '<b>Filtrar Datos</b><br/>Permite ingresar criterios de búsqueda por cada columna y obtener resultados'
			,handler: function() {

				me.height = me.height ? 0: me.originalHeight;
				me.grid.getView().refresh();
			}
			,menu: [{ 
				text:'Limpiar Búsqueda'
				,scope: me
				,handler: function() {

					me.clearValues(true);
                    			me.getStore().clearFilter();
			}}]
		});

		var tb = grid.getDockedItems('toolbar[dock=top]')[0];

		/* add menu button */
		tb.insert( tb.items.length -2, me.menu );

	}/*}}}*/

});
