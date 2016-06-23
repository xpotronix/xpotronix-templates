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
	multiSelect: true,

	selection: [],

	initComponent:function() {/*{{{*/

		this.selModel = this.getSelectionModel();	
		
		if ( typeof this.store == 'string' ) this.store = Ext.StoreMgr.lookup( this.store );

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		App.obj.get(this.class_name).panels.add(this);

		Ext.apply( this, { 

			plugins: [{
					ptype: 'xpcellediting',
        				clicksToMoveEditor: 1,
		        		autoCancel: false,
					errorSummary: false 

				}, 
				{
			        	ptype: 'filterbar',
			        	renderHidden: false,
			        	showShowHideButton: true,
			        	showClearAllButton: true
				}
			],

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

		/* call parent */
		this.callParent(arguments);

                this.getStore().on('beforeload', this.rememberSelection, this);
                this.getView().on('refresh', this.refreshSelection, this);

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

	 	this.on('validateedit', function(e, eOpts ){/*{{{*/

			/* actualiza el _label del registro al seleccionar en el combobox */

			var field = eOpts.column.field;
			var data  = eOpts.record.data;

       			if ( field.displayField == '_label') { 
	  			data[eOpts.field + '_label'] = field.getRawValue() ;	
       			}

	 	});/*}}}*/

		this.on('selectionchange', function(sm, selection) {/*{{{*/

			this.store.setSelection( selection );

			return true;

		}, this, { buffer: 0 });/*}}}*/

		this.selModel.on( 'beforeselect', function() {

			if ( ! Ext.isEmptyObject( this.dirty_childs() ) ) {

				Ext.Msg.alert( 'Atención', 'Hubo modificaciones: guarde o descarte los cambios' );
				return false;
			}

		}, this.store );


		this.on( 'afterrender', function() {/*{{{*/

			if ( this.store.getCount() ) 
				this.selModel.select( 0 );

		} );/*}}}*/

		this.store.on( 'add', function() {

			if ( ! this.selModel.getSelected() ) 
				this.store.select( 0 );

		}, this );
	

                this.store.on( 'load', function() {/*{{{*/

			if ( this.rendered && this.store.getCount() ) 
				this.selModel.select( 0 );

		}, this);/*}}}*/

	}, // eo function initComponent/*}}}*/

	rememberSelection: function(selModel, selectedRecords) {/*{{{*/

		this.selectedRecords = this.getSelectionModel().getSelection();
		this.getView().saveScrollState();

	},/*}}}*/

	refreshSelection: function() {/*{{{*/

		if (this.selectedRecords === undefined || 0 >= this.selectedRecords.length) {
			return;
		}

		var newRecordsToSelect = [];
		for (var i = 0; i < this.selectedRecords.length; i++) {
			record = this.getStore().getById(this.selectedRecords[i].getId());
			if (!Ext.isEmpty(record)) {
				newRecordsToSelect.push(record);
			}
		}

		this.getSelectionModel().select(newRecordsToSelect);
		Ext.defer(this.el.setScrollTop, 30, this.el, [this.getView().scrollState.top]);

	},/*}}}*/

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

		this.getPlugin().startEdit(0,0);

	},/*}}}*/

	getSelection: function() {/*{{{*/

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


