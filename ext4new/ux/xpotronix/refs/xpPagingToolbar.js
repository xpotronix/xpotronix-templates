/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define('Ux.xpotronix.xpPagingToolbar', {

	extend: 'Ext.toolbar.Paging',
	alias: 'widget.xppagingtoolbar',

	panel: null,

	alternateClassName: [
		'xppagingtoolbar'
	],

	requires: [
		'Ext.toolbar.Paging'
	],

	/**
	 * @cfg {Boolean} hideRefresh
	 * Hide the refresh button when true
	 * Default : false
	 */

	hideRefresh: false,
	/**
	 * @cfg {Boolean} saveParamsOnLoad
	 * Convert params on load to extraParams
	 * Default : false
	 */
	saveParamsOnLoad: false,
	/**
	 * @cfg {Object} alternateHandlers
	 * Object with handler functions for first,prev,refresh,next,last
	 * Sample: 
	 *    alternateHandlers: {
	 *         first: me.PageOne,
	 *         prev: me.PagePrev,
	 *         refresh: me.PageRefresh,
	 *         next: me.PageNext,
	 *         last: me.PageLast
	 *    }
	 * Default : false
	 */
	alternateHandlers: false,

	constructor: function(config) {/*{{{*/

		Ext.apply(config, {
			pageSize: 20,
			displayInfo: true,
			displayMsg: '{0} a {1} de {2}',
			emptyMsg: "",
			prependButtons: true,
			layout: {overflowHandler: 'Menu'}
		});

		this.callParent(arguments);

	},/*}}}*/

	initComponent: function() {/*{{{*/

		let me = this;

		Ext.applyIf(me, {
			listeners: {
				afterrender: function(tbar) {
					if (tbar.hideRefresh) {
						tbar.down('#refresh').hide();
					}
				}
			}
		});

		me.callParent();

		// saveParamsOnLoad just fixates the params in the extraParams, before the load
		if (me.saveParamsOnLoad) {

			let store = me.store;

			store.on('beforeload', function(store, operation) {

				let params = operation.params,
					proxy = store.getProxy();

				Ext.iterate(params, function(item, value) {
					proxy.extraParams[item] = value;
				});

			}, me);
		}

		if (Ext.isObject(me.alternateHandlers)) {
			Ext.iterate(me.alternateHandlers, function(item, value) {

				let c = me.down('#' + item);

				if (c) {
					if (Ext.isFunction(value)) {
						c.setHandler(value);
					}
				}
			});
		}
	},/*}}}*/

	onRender: function() {/*{{{*/

		let me = this, 
			panel = me.panel, 
			store = panel.store,
			panel_xtype = panel.getXType();

		/* botones */

		if ( ! panel.multi_row ) {

			me.insert( me.items.length - 2, me.form_left_button( panel ) );
			me.insert( me.items.length - 2, me.form_right_button( panel ) );
		}

		let b, pos = me.items.length - 2;

		if ( panel.acl.del )
			me.insert( pos, me.del_button( panel ) );

		me.insert( pos, '->' );

		me.insert( pos, me.export_button( panel ) );

		if ( store.foreign_key.type == 'parent' )
			me.insert( pos, me.assign_button( panel ) );

		if ( panel.multi_row ) 
			me.insert( pos, me.invert_button( panel ) );

		if ( panel.processes_menu )
			me.insert( pos, me.add_process_menu( panel ) );

		if ( panel.acl.edit || panel.acl.add )
			me.insert( pos, me.discard_changes( panel ) );

		if ( panel.acl.edit || panel.acl.add )
			me.insert(pos, me.save_button( panel ) );

		if ( panel.acl.add )
			me.insert( pos, me.add_button( panel ) );

		if ( panel.multi_row && panel.obj.inspect.length )
			me.insert( pos, me.inspect_button( panel ) );

		me.callParent();

	},/*}}}*/

	/*}}}*/

        process_selections: function( panel, item, obj ){/*{{{*/

		/* procesa la selección */

		if ( item.params == undefined ) 
			item.params = {};

		let me = this, 
			selections = panel.getSelection();

		/* prepara la funcion enviada por parametro desde xpotronix */

		let command = function( params ) {

			/* NUEVO */

			params = { ...{

					m: obj.class_name,
					a: 'process',
					p: item.value,
					x: obj.serialize_selections( selections )

			}, ...item.params, ...params };

			App.process_request( params, params.callback );

			};

		let ret = false;

		/* si tiene definido un dialogo, lo muestra */

		if ( item.dialog ) 	
			item.dialog.fn.call( item.dialog.scope || me, selections, command, item );

		/* si tiene un script lo ejecuta */

		else if ( item.script ) 	
			ret = item.script.fn.call( item.script.scope || me, selections, command, item );

		else ret = true;

		/* verifica si hay registros para guardar */

		if ( ret ) { 

			if ( me.store.getModifiedStores().length ) {

		        	Ext.MessageBox.alert('Error', 'Hay datos sin guardar: salve la información antes de procesar');
				return;
			}

			command.call( me );
		}

        },/*}}}*/

	/* botones formulario 
	enable/disable de los botones de la barra izquierda y derecha */

	form_left_button: function( panel ) {/*{{{*/

		let me = this;

		return {

			text: 'Atras',
	               	menuAlign: 'tr?',
			disabled: true,
	               	tooltip: 'Ir hacia el elemento previo'
			,listeners:{
				click:{
					scope:me.store,
					buffer:200,
					fn:function() { 
						this.selModel.selectPrevious(); 
					}
				}
				,render: {

					fn:function() {
						this.setDisabled( !me.store.rowIndex );
					}
				}
			}

			,initComponent: function() {

				me.store.on( 'selectionchange', function( selection, selModel ) { 
					this.setDisabled( !selModel.store.rowIndex );
				}, this);

				this.callParent();
			}
		};

	},/*}}}*/

	form_right_button: function( panel ) {/*{{{*/

		let me = this;

		return {

			text: 'Adelante',
	               	menuAlign: 'tr?',
			disabled: true,
	               	tooltip: 'Ir hacia el proximo elemento',
			listeners:{
				click:{
					scope:me.store
					,buffer:200
					,fn:function(){ 
						this.selModel.selectNext(); 
					}
				}
				,render: {

					fn:function() {
						this.setDisabled( ! ( me.store.rowIndex < ( me.store.getCount() - 1 ) ) );
					}
				}
			}
			,initComponent: function() {

				me.store.on( 'selectionchange', function( selection, selModel ) { 
					this.setDisabled( ! ( selModel.store.rowIndex < ( selModel.store.getCount() - 1 ) ) );
				}, this );
			}
		};

	},/*}}}*/

	export_button: function( panel ) {/*{{{*/

		let me = this;

		return {

	                icon: '/ux/images/grid.png',
	                cls: 'x-btn-text-icon',
			text: 'Exportar',
        	        tooltip: '<b>Exportar datos CSV</b><br/>Exporte los datos a una planilla de cálculos',

			handler: function() {
	                       	me.export_w = me.export_w || Ext.create( 'AppExportWindow', { toolbar: me, ref_panel: panel } );
				me.export_w.show();
			}
		}; 

	},/*}}}*/

	invert_button: function( panel ) {/*{{{*/

		return {

	                icon: '/ext/resources/images/default/layout/stuck.gif',
	                cls: 'x-btn-text-icon',
			text: 'Inv. Sel.',
	                tooltip: '<b>Invertir la Selección</b><br/>Cambie el estado de no seleccionado por seleccionado y viceversa',
			handler: function() { panel.invertSelection(); }
		};

	},/*}}}*/

	discard_changes: function( panel ) {/*{{{*/

		let me = this,
		store = panel.store;

		return {

			// icon: '/ext/resources/images/default/layout/stuck.gif',
			icon: '/ux/images/cross.png',
			cls: 'x-btn-text-icon',
			text: 'Descartar',
			tooltip: '<b>Descartar Cambios</b><br/>ignorar las modificaciones realizadas',
			disabled: true,

			initComponent: function() {

				let me = this;

				me.on('render', function() {

					( store.isDirty() ) ? me.enable(): me.disable();
				
				});

				store.on( 'update', function( s, r, o ) { 

					if ( me.isVisible() ) 
						( o == Ext.data.Record.EDIT ) ? me.enable(): me.disable();
					});

				me.callParent();
			},

			handler: function() {

				Ext.Msg.show({

					msg :'Realmente desea descartar los cambios realizados?',
					width :300,
					buttons: Ext.Msg.YESNOCANCEL,
					fn: function(btn) { 
						if ( btn == 'yes' ) 
							store.revert_changes();
					}
				});

			} 
		};

	},/*}}}*/

	del_button: function( panel ) {/*{{{*/

		let me = this;

		return {
	        	        icon: '/ext/resources/images/default/dd/drop-no.gif',
        	        	cls: 'x-btn-text-icon',
				text: 'Borrar',
	                	tooltip: '<b>Borrar</b><br/>Pulse aqui para borrar la seleccion',
				handler: function() { me.delete_confirm( panel ); }
		};

	},/*}}}*/

	assign_button: function( panel ) {/*{{{*/

		let me = this;

        	return {

       	        	icon: '/ux/images/arrow_up.png',
			text: 'Asignar',
                	cls: 'x-btn-text-icon',
			// disabled: true,
                	tooltip: '<b>Asignar</b><br/>Asocia el registro actual al panel principal',
			handler: function() { panel.store.set_parent_fk(); }
		};

	},/*}}}*/

	inspect_button: function( panel ) {/*{{{*/

		let store = panel.store;

		return {

			icon: '/ux/images/application_form_magnify.png',
			cls: 'x-btn-text-icon',
			text: 'Ver',
			menuAlign: 'tr?',
			tooltip: '<b>Inspeccionar</b><br/>Pulse aqui para inspeccionar el registro seleccionado',
			handler: Ext.Function.pass( panel.obj.inspect_window, panel ),
			disabled: true,
			scope:panel,
			panel:panel,

			initComponent: function() {

				/* controla que el boton se deshabilite si no hay seleccion */

				let me = this,
				sels = panel.getSelection();

				me.on('render', function() {

					( sels.length ) ? me.enable(): me.disable();
				
				});

				store.on( 'selectionchange', function( sels ) {

					if ( me.isVisible() ) {

						if ( sels.length )
							me.enable();
						else
							me.disable();
					}

				});

				me.callParent(arguments);
			}
		};

	},/*}}}*/

	add_button: function( panel ) {/*{{{*/

		let me = this;

		return {

			icon: '/ext/resources/images/default/dd/drop-add.gif',
			cls: 'x-btn-text-icon',
			text: 'Agregar',
	                menuAlign: 'tr?',
	                tooltip: '<b>Agregar</b><br/>Pulse aqui para agregar un nuevo registro',
			scope: me,
			handler:Ext.Function.pass( me.addRecord, panel )

		};

	},/*}}}*/

	save_button: function( panel ) {/*{{{*/

		let me = this,
		store = panel.store;

        	return {

				icon: '/ext/resources/images/default/dd/drop-yes.gif',
				text: 'Guardar',
				cls: 'x-btn-text-icon',
				disabled: true,
				tooltip: '<b>Guardar</b><br/>Pulse aqui para guardar las modificaciones',

				handler: () => store.save(),

				initComponent:function() {

					let me = this;

					me.on('render', function() {

						( store.isDirty() ) ? me.enable(): me.disable();
					
					});

					store.on( 'datachanged', function( s, o ) { 

						if ( me.isVisible() ) {
							if ( s.isDirty() )
								me.enable();
							else
								me.disable();
						}
					});

					store.on( 'update', function( s, r, o ) { 

						if ( me.isVisible() ) {
							( o == Ext.data.Record.EDIT ) ? 
								me.enable():
								me.disable();
						}
					});

					me.callParent();
				}

		};


	},/*}}}*/

	add_process_menu: function( panel ) {/*{{{*/

		let me = this, items = [];

		Ext.each( panel.processes_menu, function( pm ) {

			items.push( Ext.apply( pm, 
				{ handler: it => me.process_selections( panel, it, panel.obj ) }
			));
		}); 

		return {
			icon: '/ux/images/list-items.gif',
			// cls: 'x-btn-text-icon',
			// minWidth: 105,
			text: 'Acciones',
			tooltip: 'Ejecute una acción para procesar los items seleccionados',
			menu: { items: items }
		};

        },/*}}}*/

	 delete_confirm: function ( panel ) {/*{{{*/

		let tb = panel.getDockedItems('toolbar[dock=top]')[0],
		m = panel.getSelection();

        	if ( m.length ) {


					let messageBox = Ext.create('Ext.window.MessageBox', {


						buttonText: {
							yes: 'Si, borrar',
							no: 'Cancelar'
						}
					});

					messageBox.defaultButton = 'no';
					messageBox.show({
						title: 'Atención',
						msg: '¿Realmente deseas eliminar ' + m.length + ' elementos?',
						buttons: Ext.Msg.YESNO,
						icon: Ext.MessageBox.WARNING,
						fn: function( b ) { 
							( b == 'yes' ) && tb.delete_selections( panel ); 
						}

					});


		} else {
                	Ext.MessageBox.alert('Error', 'Para borrar, debes seleccionar algun(os) elemento(s)');
		}

    	}, /*}}}*/

   	delete_selections: function( panel ) {/*{{{*/

		// DEBUG: esto estaba en xpGrid, hay que ver si aplica para todos
		//
		//


		let index = panel.store.cr().index,
			me = this,
			selection = panel.getSelection();

		Ext.each( panel.getSelection(), function( r ) {

			if ( r.get('__new__') ) 
				panel.store.remove( r );
		});

		if ( selection.length ) {

			let m, r;

			[m,r] = panel.store.storeId.split('.');

			let param = {

				m: m,
				r: r,
				a: 'process',
				p: 'delete',
				x: panel.obj.serialize_selections( selection ),
				process_name: 'Borrar la Selección'

			};

			App.process_request( param );

		}


   	},  /*}}}*/

	addRecord:function( panel ) {//{{{

		if ( ! panel.acl.add ) return;

        	if ( panel.store.parent_store && 
					panel.store.parent_store.selections.length === 0 ) {

                	Ext.Msg.alert( 'Error', 
						'No se ha seleccionado ningun registro en el panel principal. Por favor, seleccione uno' );

        	} else {

			panel.store.add_blank({ 
				
				callback: function(r) {

					if ( panel.obj.inspect.length ) {

						panel.obj.inspect_window( panel );
					
					} else if ( panel.startEditingBlank )
						panel.startEditingBlank(r);
			}});
		}

	} //}}}

});
