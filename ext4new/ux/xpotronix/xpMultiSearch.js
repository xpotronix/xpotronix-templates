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
		/* 'Ext.saki.grid.MultiSearch' */
		'Ext.ux.grid.MultiSearch'
	],

	init: function( grid ) {/*{{{*/

		var me = this;
		me.originalHeight = me.height;	
		me.height = 0;

		me.callParent(arguments);

		// add menu
		me.menu = Ext.create('Ext.button.Split',{
			/* iconCls: 'fa fa-compass fa-10x' */
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


	/* override de las siguientes dos funciones
	 * para que no borre la busqueda del filtro
	 */

    ,getFilterFromField:function(field) {//{{{
        var  me = this
            ,value = field.getSubmitValue()
            ,filter
	    ,ns = field.initialConfig.nameSuffix;
        ;
        if(value) {
            filter = me.parseUserValue(value);

		if ( ns )  
            		filter.property = field.getItemId() + field.initialConfig.nameSuffix;
		else
            		filter.property = field.getItemId();
            return filter;
        }
        return null;

    }//}}}

    ,onStoreFilterChange:function() {//{{{
        var me = this;
        if(!me.filtering) {
            // me.setValuesFromStore();
        }
    }//}}}

	/**
	* specialkey hander. Used only if {@link #filterOnEnter filterOnEnter:true}
	* @private
	* @param {Ext.form.field.Field} field
	* @param {Ext.EventObject} e
	*/
	,onSpecialKey:function(field, e) {
		var  me = this;
		if(Ext.EventObject.ENTER === e.getKey()) {
			var allFilters = Ext.Array.merge( this.store.foreign_key_values, this.getFilters() );
			me.store.clearFilter(true);
			me.store.filter(allFilters);
		}
	} // eo function onSpecialKey



});
