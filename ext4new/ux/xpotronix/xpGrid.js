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
	/* layout:'fit', */
	border:false,
	selModel: null,
	trackMouseOver:true,
	inspect_w: null,
	feat: null,
	loadMask: true,
	multiSelect: true,
	multi_row: true,

	selection: [],
	debug: false,

	requires: [ 'Ux.xpotronix.xpComboBox', 'Ux.xpotronix.xpMultiSearch', 'Ext.ux.form.DateTimeField' ],

	constructor: function(config) {/*{{{*/

		App.obj.get(this.class_name).panels.add(this);

		Ext.apply( this, { 

			plugins: [	{
					ptype: 'bufferedrenderer'
					},{
					ptype: 'xpcellediting',
        				clicksToMoveEditor: 1,
		        		autoCancel: false,
					errorSummary: false 

				} 
				/*,{
			        	ptype: 'filterbar',
			        	renderHidden: false,
			        	showShowHideButton: true,
			        	showClearAllButton: true 
				}*/
				,{
					ptype:'xp-gms'
					,filterOnEnter:true
					,iconColumn:false
				}
			],

			dockedItems: [{
				xtype: 'xppagingtoolbar',
				panel: this,
				store: this.store,
				dock: 'top',
				displayInfo: true
			}],

			onEditorKey: function(field, e) {
				// this place should be to add new editors key
				this.callParent(arguments);
			}
		});

		this.callParent(arguments);

		this.debug && consoleDebugFn( this );
		// this.debug && consoleDebugFn( this.getView() );

	},/*}}}*/

	initComponent:function() {/*{{{*/

		this.selModel = this.getSelectionModel();	
		
		if ( typeof this.store == 'string' )
			this.store = App.store.lookup( this.store );

		if ( typeof this.obj == 'string' )
			this.obj = App.obj.get( this.obj );

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		/* call parent */
		this.callParent(arguments);

		/* eventos */

		// this.getStore().on('beforeload', this.rememberSelection, this);

		// this.getView().on('refresh', this.refreshSelection, this);

		this.getView().preserveScrollOnRefresh = true;

		this.on( 'beforeedit', function() {

			return this.acl.edit;

		});

		this.on( 'viewready', function() {//{{{

			var grid = this;

			if ( this.store.feat.auto_load !== false && ( ! this.store.parent_store ) ) {
				this.store.load({ callback:function(a,b,c){ 
					grid.selModel.select(0);
				}});
			}
		});//}}}

		this.on( 'render', function() {//{{{

			this.km = new Ext.KeyMap( 
				this.getId(), [
				{
		            key: Ext.EventObject.DELETE,
				    scope: this,
			            shift: false,
			            ctrl: false,
			            fn: function( k, e ) {
					if ( this.acl.del ) 

						if ( e.getTarget().nodeName == 'INPUT' ) {
							return true;
						}
						else {
							this.getTopToolbar().delete_confirm( this );
						}
		            		}
		        	},
			        {
			            key: Ext.EventObject.INSERT,
				    scope: this,
			            shift: false,
			            ctrl: false,
			            fn: function( k, e ) {
					if ( this.acl.add ) 

						if ( e.getTarget().nodeName == 'INPUT' ) {
							return true;
						}
						else {
							this.getTopToolbar().addRecord( this );
						}
		            		}

		        	}
		    	]);	
		});//}}}

		this.on('beforedestroy', function() {//{{{

			var dz = this.dz;

			this.dz && this.dz.destroy();
			delete this.dz;

		}, this);//}}}

	 	this.on('validateedit', function(e, eOpts ) {//{{{

			/* actualiza el _label del registro al seleccionar en el combobox */

			var field = eOpts.column.field;
			var data  = eOpts.record.data;

       			if ( field.displayField == '_label') { 
	  			data[eOpts.field + '_label'] = field.getRawValue() ;	
       			}

	 	});//}}}

		this.on('selectionchange', function(sm, selection) {//{{{

			this.store.setSelection( selection, this.selModel );

			return true;

		}, this, { buffer: 0 });//}}}

		/* agrega el rowClass via config */

		if ( typeof this.xpconfig == 'undefined' ) {

			console.log( 'xpconfig no definido, no se puede configurar ni botones ni rowClass' );

		} else {

		( typeof this.xpconfig.rowClass == 'function' ) && 
			this.on( 'afterrender', panel => { //{{{
				Ext.apply( panel.view, { getRowClass: panel.xpconfig.rowClass } ) 
			});//}}}


		/* agrega los botones en el panel */

		( ! _.isEmpty( this.xpconfig.buttons ) ) && 
			this.on( 'beforerender', panel => { //{{{

				var tbar = panel.getTopToolbar();

				if ( tbar ) { 

					Object.entries(this.xpconfig.buttons).
						forEach(([button, config]) => {

							/* evaula las referencias para que sean locales */

							if ( config != '-' ) {

							var o = eval( '({' + config + '})' );

							console.log( 'button: '+ button+ ', config: ' + config );

							tbar.insert( tbar.items.length -2, 
								_.assign( { cls: 'x-btn-text', menuAlign: 'tr?' }, 
									o ));

							} else {

								tbar.insert( tbar.items.length -2, config );
							}
							

					});

				}

		});//}}}

		}

		this.selModel.on( 'beforeselect', function() {//{{{

			if ( ! _.isEmpty(this.dirty_childs()) ) {

				Ext.Msg.alert( 'Atención', 'Hubo modificaciones: guarde o descarte los cambios' );
				return false;
			}

			return true;

		}, this.store );//}}}

		this.store.on( 'load', function() {//{{{

			if ( this.store.getCount() ) {
		
				this.selModel.preventFocus = true;
				this.selModel.select( 0 );
				this.selModel.preventFocus = false;
				//this.selModel.select( 0, true, true );
			}

		}, this);//}}}

		this.store.on( 'selectionchange', function(s) {//{{{

			if ( this.store.getCount() ) 
				this.selModel.select( s );

                }, this );//}}}

		this.store.on( 'loadblank', function( s, r, e ) {//{{{

			this.selModel.select( r );

		}, this );//}}}


		this.store.on( 'bulkremove', function( s, r, e ) {//{{{

			console.log( 'bulkremove' );

			this.getView 
			&& this.store.lrid != null
			&& this.selModel.select( this.store.lrid );

		}, this );//}}}


	}, /*}}}*/

	rememberSelection: function(selModel, selectedRecords) {/*{{{*/

		if (!this.rendered || _.isEmpty(this.el)) {
			return;
		}

		this.selectedRecords = this.getSelectionModel().getSelection();
		this.getView().saveScrollState();

	},/*}}}*/

	refreshSelection: function() {/*{{{*/

		if ( this.selectedRecords == undefined || this.selectedRecords.length < 1 ) {
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

	},/*}}}*/

	onRender:function() {/*{{{*/

		this.callParent();

	},/*}}}*/

	invertSelection:function() {/*{{{*/

		var sl = this.selModel.getSelection();

		for( var i = 0; i < this.store.getCount(); i ++ ) {

			if ( this.selModel.isSelected(i))
				this.selModel.deselect(i);
			else
				this.selModel.select(i, true);
		}
	},/*}}}*/

	startEditingBlank: function(r) {/*{{{*/

		var editor = this.findFirstEditor();

		Ext.isObject( editor ) && this.editingPlugin.startEdit(r, editor);

	},/*}}}*/

	findFirstEditor: function(){/*{{{*/

		var ret = null;

		Ext.each( this.headerCt.getGridColumns(), function( col ) {

		    if ( ! col.hidden ) {
			ret = col;
			return false;
		    }

		});

		return ret;

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


