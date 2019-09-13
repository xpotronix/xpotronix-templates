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

		var me = this
            ,headerCt = grid.getView().getHeaderCt()
            ,extVersion = Ext.versions.extjs.major;

		me.originalHeight = me.height;	
		me.height = 0;

		// safety check (mainly) for Architect who does not have RegExp type, only string
		if(Ext.isString(me.operatorRe)) {
		    me.operatorRe = new RegExp(me.operatorRe.replace(/(^\/|\/$)/g,''));
		}

		// save some vars in the instance
		Ext.apply(me, {
		     grid:grid
		    ,headerCt:headerCt
		    ,extVersion:extVersion
		});

		// install listeners on headerCt to sync sizes and positions
		headerCt.on({
		    afterlayout:{
			 fn:me.afterHdLayout
			,scope:me
			,delay:0
			    ,buffer:900
		    }
		    ,afterrender:{
			 fn:me.afterHdRender
			,scope:me
			,single:true
		    }
		    ,columnmove:{
			 fn:me.onColumnMove
			,scope:me
		    }
		});

		grid.on({
		     scope:me
		    ,reconfigure:me.onReconfigure
		});

		me.on({
		     afterrender:{
			  fn:me.onAfterRender
			 ,scope:me
			 ,single:true
		     }
		});

		me.onReconfigure(grid, grid.store, grid.columns);

		// install convenience method(s) on the grid
		/**
		 * MultiSearch plugin getter
		 * @member Ext.grid.Panel
		 * @returns {Ext.saki.grid.MultiSearch}
		 */
		grid.getFilter = function() {
		    return me;
		};


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


	    /**
	     * Synchronizes columns and other UI features
	     * whenever the header changes layout
	     * @private
	     */
	    ,afterHdLayout:function() {
		var me = this;
		    this.debug && console.log('afterHdLayout start ' + me.grid.xtype);
		if(!me.grid.reconfiguring) {
		    me.syncCols();
		    me.syncUi();
		}
	    	this.debug && console.log('afterHdLayout stop');
	    } // eo function afterHdLayout



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
