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
	debug_events: false,

	requires: [ 'Ux.xpotronix.xpComboBox', 'Ux.xpotronix.xpMultiSearch', 'Ext.ux.form.DateTimeField' ],

	constructor: function(config) {/*{{{*/

		let me = this;

		App.obj.get(me.class_name).panels.add(me);

		Ext.apply( me, { 

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
				panel: me,
				store: me.store,
				dock: 'top',
				displayInfo: true
			}],

			onEditorKey: function(field, e) {
				// this place should be to add new editors key
				this.callParent(arguments);
			}
		});

		me.callParent(arguments);

		me.debug_events && me.consoleDebugEvents();
		// me.debug && consoleDebugFn( me.getView() );

	},/*}}}*/

	/* events fn */

	consoleDebugEvents: function() { /*{{{*/

		return Ext.util.Observable.capture( this, 

			function() {

				let event_name = arguments[0],
					xtype = arguments[1].xtype;

				if ( ['beforeselect','select','selectionchange'].includes( event_name ) ) {

					xtype = arguments[1][0].views[0].initialConfig.grid.xtype;

				}

				if ( ['filterchange'].includes( event_name ) ) {

					xtype = arguments[1][0].storeId;

				}

				console.log( { event_name: event_name, xtype: xtype } );
			}
		);

	}, /*}}}*/

	initComponent:function() {/*{{{*/

		let me = this;

		me.selModel = me.getSelectionModel();	
		
		if ( typeof me.store == 'string' )
			me.store = App.store.lookup( me.store );

		if ( typeof me.obj == 'string' )
			me.obj = App.obj.get( me.obj );

		me.acl = me.acl || me.obj.acl;
		me.processes_menu = me.processes_menu || me.obj.processes_menu;

		/* call parent */
		me.callParent(arguments);

		/* eventos */

		// me.getStore().on('beforeload', me.rememberSelection, me);

		// me.getView().on('refresh', me.refreshSelection, me);

		me.getView().preserveScrollOnRefresh = true;

		me.on( 'beforeedit', function() {//{{{

			/* chequea el acl si puede editar o no */

			return this.acl.edit;

		});//}}}

		me.on( 'viewready', function() {//{{{

			/* dispara que cargue la grilla y seleccione el primer elemento,
			 * si feat.auto_load && parent_store */

			let me = this,
			store = me.store;

			if ( store.feat.auto_load === false ) return;

			if ( ( ! store.parent_store ) ) {

				store.load({ callback:
					function(a,b,c){ 
						me.selModel.select(0);
				}});
			}

			me.renewSelection( true );

		});//}}}

		me.on( 'render', function() {//{{{

			/* carga el mapeo del teclado */

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

		me.on( 'beforedestroy', function() {//{{{

			let dz = this.dz;

			this.dz && this.dz.destroy();
			delete this.dz;

		}, this);//}}}

	 	me.on( 'validateedit', function(e, eOpts ) {//{{{

			/* actualiza el _label del registro al seleccionar en el combobox */

			let field = eOpts.column.field;
			let data  = eOpts.record.data;

       			if ( field.displayField == '_label') { 
	  			data[eOpts.field + '_label'] = field.getRawValue() ;	
       			}

	 	});//}}}

		me.on( 'selectionchange', function(selModel, selection) {//{{{

			/* copia la seleccion al store */

			this.store.setSelection( selection, this.selModel );

			return true;

		}, this,  { buffer: 0 });//}}}

		/* agrega el rowClass via config */

		if ( typeof me.xpconfig == 'undefined' ) {

			console.log( 'xpconfig no definido, no se puede configurar ni botones ni rowClass' );

		} else {

		( typeof me.xpconfig.rowClass == 'function' ) && 

			me.on( 'afterrender', panel => { //{{{
				Ext.apply( panel.view, { getRowClass: panel.xpconfig.rowClass } );
			});//}}}

		/* agrega los botones en el panel */

		( ! _.isEmpty( me.xpconfig.buttons ) ) && 

			me.on( 'beforerender', panel => { //{{{

				let tbar = panel.getTopToolbar();

				if ( tbar ) { 

					/* DEBUG: Revisar referencia 'this' */
					Object.entries(me.xpconfig.buttons).
						forEach(([button, config]) => {

							/* evaula las referencias para que sean locales */

							if ( config != '-' ) {

							let o = eval( '({' + config + '})' );

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

		me.selModel.on( 'beforeselect', function() {//{{{

			if ( ! _.isEmpty(this.dirty_childs()) ) {

				Ext.Msg.alert( 'Atención', 'Hubo modificaciones: guarde o descarte los cambios' );
				return false;
			}

			return true;

		}, me.store );//}}}

		me.store.on( 'load', function() { this.renewSelection( false ); }, this ); 

		me.store.on( 'loadblank', function( s, r, e ) {//{{{

			let me = this;

			me.selModel.select( r );

		}, me );//}}}

		me.store.on( 'bulkremove', function( s, r, e ) {//{{{

			let me = this;

			console.log( 'bulkremove' );

			if ( me.getView && me.store.lrid != null )
				me.selModel.select( me.store.lrid );

		}, me );//}}}


	}, /*}}}*/

	renewSelection: function( supressEvent ) {//{{{

		let me = this,
		store = me.store,
		sm = me.selModel;

		if ( store.getCount() ) {
	
			sm.preventFocus = true;

			let selections = sm.selected;

			if ( selections.length === 0 ) {

				sm.select( 0, false, supressEvent );

			} else {

				selections.items.forEach(

					function( selection ) {

						sm.select( me.store.find('__ID__', selection.get('__ID__') ), true, true );

				});
			}

			sm.preventFocus = false;
			//me.selModel.select( 0, true, true );

		}

	}, //}}}

	rememberSelection: function(selModel, selectedRecords) {/*{{{*/

		let me = this;

		if (!me.rendered || _.isEmpty(me.el)) {
			return;
		}

		me.selectedRecords = me.getSelectionModel().getSelection();
		me.getView().saveScrollState();

	},/*}}}*/

	refreshSelection: function() {/*{{{*/

		let me = this;

		if ( me.selectedRecords == undefined || me.selectedRecords.length < 1 ) {
			return;
		}

		let newRecordsToSelect = [];

		for (let i = 0; i < me.selectedRecords.length; i++) {

			record = me.getStore().getById(me.selectedRecords[i].getId());

			if (!Ext.isEmpty(record)) {

				newRecordsToSelect.push(record);
			}
		}

		me.getSelectionModel().select(newRecordsToSelect);

	},/*}}}*/

	onRender:function() {/*{{{*/

		this.callParent();

	},/*}}}*/

	invertSelection:function() {/*{{{*/

		let me = this,
			sl = me.selModel.getSelection();

		for( let i = 0; i < me.store.getCount(); i ++ ) {

			if ( me.selModel.isSelected(i))
				me.selModel.deselect(i);
			else
				me.selModel.select(i, true);
		}
	},/*}}}*/

	startEditingBlank: function(r) {/*{{{*/

		let me = this, editor = me.findFirstEditor();

		Ext.isObject( editor ) && me.editingPlugin.startEdit(r, editor);

	},/*}}}*/

	findFirstEditor: function(){/*{{{*/

		let me = this,
			ret;

		Ext.each( me.headerCt.getGridColumns(), ( col ) => {

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
		let tb = this.getDockedItems('toolbar[dock=top]');
		return tb.length ? tb[0] : undefined;
	},/*}}}*/

	getBottomToolbar:  function() {/*{{{*/
		let tb = this.getDockedItems('toolbar[dock=bottom]');
		return tb.length ? tb[0] : undefined;
	},/*}}}*/

	onRecordsDrop:Ext.emptyFn

}); // eo extend


