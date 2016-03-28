/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define( 'Ux.xpotronix.xpGrid',  {

	extend: 'Ext.grid.Panel',
	alias: 'xpGrid',
	obj: null,
	acl: null,
	layout:'fit',
	border:false,
	selModel: null,
	trackMouseOver:true,
	inspect_w: null,
	feat: null,
	loadMask: true,
	rowEditing: null,
	

	initComponent:function() {/*{{{*/

		
    		this.rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
        		clicksToMoveEditor: 1,
        		autoCancel: false
    		});


		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		Ext.apply( this, { 

			plugins: [this.rowEditing],

			dockedItems: [{
				itemId: 'pagingtoolbar',
				xtype: 'xppagingtoolbar',
				panel: this,
				store: this.store,
				dock: 'top',
				displayInfo: true
			}],

			onEditorKey: function(field, e) {
				// this place should be to add new editors key
				this.constructor.prototype.onEditorKey.apply(this, arguments);
			}
		});

		/* eventos */


		/* solo lectura

		this.on('beforerender', function() {

			this.addListener( 'beforeedit', function() { return this.obj.acl.edit; } );

		}, this);

		*/

		this.on( 'render', function() {

			this.km = new Ext.KeyMap( this.getId(), [
				{
			            key: Ext.EventObject.DELETE,
				    scope: this,
			            shift: false,
			            ctrl: false,
			            fn: function( k, e ) {
					if ( this.acl.del ) 

						if ( e.getTarget().nodeName == 'INPUT' )
							return true;
						else
							this.obj.delete_confirm( this );
		            }
		        },
			        {
			            key: Ext.EventObject.INSERT,
				    scope: this,
			            shift: false,
			            ctrl: false,
			            fn: this.obj.addRecord
		        	}
		    	]);	
		});

		this.on('beforedestroy', function(){

			var dz = this.dz;

			this.dz && this.dz.destroy();
			delete this.dz;

		}, this);

	 	this.on('validateedit', function(e, a, b){/*{{{*/

			/* DEBUG: esta codigo se fija si tiene un label y lo actualiza.
			Ver si es necesario

	    		var cm = e.grid.columns;
			var field = cm[e.column];

       			if ( field.editor.field.initialConfig.displayField == '_label') { 

	  			var label = field.name + '_label';
	  			e.record.data[label] = field.editor.field.getRawValue() ;	

       			}
			*/

	 	});/*}}}*/

		/* selModel events */

		this.selModel = this.getSelectionModel();

		this.selModel.on('selectionchange', function(sm, rowIndex) {
		
			if ( sm.getCount() == 1 ) 
				this.store.go_to( rowIndex );

			return true;

		}, this, { buffer: 500 });

		this.selModel.on( 'beforerowselect', function() {

			if ( ! Ext.isEmptyObject( this.dirty_childs() ) ) {

				Ext.Msg.alert( 'Atención', 'Hubo modificaciones: guarde o descarte los cambios' );
				return false;
			}

		}, this.store );


		this.on( 'viewready', function() {/*{{{*/

			if ( this.store.getCount() ) 
				this.selModel.select( this.store.rowIndex );

		} );/*}}}*/

		/* store events */

		this.store.on( 'add', function() {

			if ( ! this.selModel.getSelected() ) 
				this.store.go_to( 0 );

		}, this );
	

                this.store.on( 'load', function() {/*{{{*/

			if ( this.rendered && this.store.getCount() ) 
				this.selModel.select( this.store.rowIndex );

		}, this);/*}}}*/

                this.store.on('changerowindex', function(s, rowIndex) {/*{{{*/

			if ( this.rendered && this.store.getCount() ) 
				this.selModel.select( s.rowIndex );

                }, this );/*}}}*/
               
		// call parent
		this.callParent();

	}, // eo function initComponent/*}}}*/

	onRender:function() {//{{{

		/* DEBUG MIGRACION FALTA */
		// this.dz = Ext.create( 'Ux.xpotronix.GridDropZone', {grid: this, ddGroup:this.ddGroup || 'GridDD'});	

		this.callParent();

	}, // eo function onRender//}}}

	invertSelection:function() {/*{{{*/

		var sl = this.selModel.getSelection();

		for( var i = 0; i < this.store.getCount(); i ++ ) {

			if ( this.selModel.isSelected(i))
				this.selModel.deselect(i);
			else
				this.selModel.select(i, true);
		}
	},/*}}}*/

	startEditingBlank: function() {/*{{{*/

		this.rowEditing.startEdit(0,0);

	},/*}}}*/

	get_selections: function() {/*{{{*/

		return this.selModel.getSelection();

	},/*}}}*/

	getTopToolbar:  function() {/*{{{*/
		var tb = this.getDockedItems('toolbar[dock=top]');
		return tb.length ? tb[0] : undefined;
	},/*}}}*/

	getBottomToolbar:  function() {/*{{{*/
		var tb = this.getDockedItems('toolbar[dock=bottom]');
		return tb.length ? tb[0] : undefined;
	},/*}}}*/

	onRecordsDrop:Ext.emptyFn

}); // eo extend

