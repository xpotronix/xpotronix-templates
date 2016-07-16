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
			prependButtons: true
		});

		this.callParent(arguments);

	},/*}}}*/

	initComponent: function() {/*{{{*/

		var me = this;

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
			var store = me.store;
			store.on('beforeload', function(store, operation) {
				var params = operation.params;
				var proxy = store.getProxy();
				Ext.iterate(params, function(item, value) {
					proxy.extraParams[item] = value;
				});
			}, me);
		}

		if (Ext.isObject(me.alternateHandlers)) {
			Ext.iterate(me.alternateHandlers, function(item, value) {
				var c = me.down('#' + item);
				if (c) {
					if (Ext.isFunction(value)) {
						c.setHandler(value);
					}
				}
			});
		}
	},/*}}}*/

	onRender: function() {/*{{{*/

		var panel = this.panel, panel_xtype = panel.getXType();

		// botones

		// DEBUG: hay que especificar si el panel es sigle o multiple (ej. selection type)

		if ( 	panel_xtype.substr(panel_xtype.length - 6) == 'xpForm' || 
			panel_xtype.substr(panel_xtype.length - 7) == 'xpPanel') {

			this.insert(this.items.length - 2, this.form_left_button(panel));
			this.insert(this.items.length - 2, this.form_right_button(panel));
		}

		var b, pos = this.items.length - 2;

		if (panel.acl.del)
			this.insert(pos, this.del_button(panel));

		this.insert(pos, '->');

		if (panel.acl.edit || panel.acl.add)
			this.insert(pos, this.discard_changes(panel));

		this.insert(pos, this.export_button(panel));

		if (panel.store.foreign_key_type == 'parent')
			this.insert(pos, this.assign_button(panel));

		this.insert(pos, this.invert_button(panel));

		if (panel.processes_menu)
			this.insert(pos, this.add_process_menu(panel));

		if (panel.acl.edit || panel.acl.add)
			this.insert(pos, this.save_button(panel));

		if (panel.acl.add)
			this.insert(pos, this.add_button(panel));


		if (this.panel.obj.inspect.length)
			b = this.insert(pos, this.inspect_button(panel));


		this.callParent();

	},/*}}}*/

	/*}}}*/

        process_selections: function( panel, item, obj ){/*{{{*/

		/* procesa la selección */

		if ( item.params == undefined ) 
			item.params = {};

		var selections = panel.getSelection();

		/* prepara la funcion enviada por parametro desde xpotronix */

		var command = function( params ){

			params = params | {};

	                App.process_request( Ext.apply({

        	                m: obj.class_name,
                	        a: 'process',
				p: item.value,
				b: 'ext4',
	                        x: obj.serialize_selections( selections )

                	}, item.params ), item.params.callback );
		}; 

		var ret = false;

		/* si tiene definido un dialogo, lo muestra */

		if ( item.dialog ) 	
			item.dialog.fn.call( item.dialog.scope || this, selections, command, item );

		/* si tiene un script lo ejecuta */

		else if ( item.script ) 	
			ret = item.script.fn.call( item.script.scope || this, selections, command, item );

		else ret = true;

		/* verifica si hay registros para guardar */

		if ( ret ) { 

			if ( App.getModifiedStores().length ) {

		        	Ext.MessageBox.alert('Error', 'Hay datos sin guardar: salve la información antes de procesar');
				return;
			}

			command.call( this );
		}

        },/*}}}*/

	/* botones formulario 
	enable/disable de los botones de la barra izquierda y derecha */

	form_left_button: function( panel ) {/*{{{*/

		var tb = new Ext.Button( {
			// id: 'leftButton',
			text: 'Atras',
	               	menuAlign: 'tr?',
			disabled: true,
	               	tooltip: 'Ir hacia el elemento previo'
			,listeners:{click:{scope:this.store, fn:function() { this.selModel.selectPrevious(); },buffer:200 }}

		});

		tb.setDisabled( !this.store.rowIndex );

		this.store.on( 'selectionchange', function( selection, selModel ) { 
			tb.setDisabled( !selModel.store.rowIndex );
		}, tb );

		return tb;

	},/*}}}*/

	form_right_button: function( panel ) {/*{{{*/

		var tb = new Ext.Button( {
			text: 'Adelante',
	               	menuAlign: 'tr?',
			disabled: true,
	               	tooltip: 'Ir hacia el proximo elemento',
			listeners:{click:{scope:this.store, fn:function(){ this.selModel.selectNext(); },buffer:200}}
			} );

		tb.setDisabled( ! ( this.store.rowIndex < ( this.store.getCount() - 1 ) ) );

		this.store.on( 'selectionchange', function( selection, selModel ) { 
			tb.setDisabled( ! ( selModel.store.rowIndex < ( selModel.store.getCount() - 1 ) ) );
		}, tb );

		return tb;

	},/*}}}*/

	export_button: function( panel ) {/*{{{*/

		return {
	                icon: '/ux/images/grid.png',
	                cls: 'x-btn-text-icon',
			text: 'Exportar',
        	        tooltip: '<b>Exportar datos CSV</b><br/>Exporte los datos a una planilla de cálculos',

			listeners: { click: { scope:this, fn: function(){

	                        this.export_w || ( this.export_w = Ext.create( 'AppExportWindow', { toolbar: this } ) );
				this.export_w.show();

        	        }, buffer:200 } } 

			}; 

	},/*}}}*/

	export_dialog: function( panel ) {/*{{{*/

		return new Ext.Window();

	},/*}}}*/

	invert_button: function( panel ) {/*{{{*/

		return {
	                icon: '/ext/resources/images/default/layout/stuck.gif',
	                cls: 'x-btn-text-icon',
			text: 'Inv. Sel.',
	                tooltip: '<b>Invertir la Selección</b><br/>Cambie el estado de no seleccionado por seleccionado y viceversa',
	                listeners: { click: { scope:panel, fn:panel.invertSelection, buffer:200 } } };

	},/*}}}*/

	discard_changes: function( panel ) {/*{{{*/

		var tb = new Ext.Button( {
	                // icon: '/ext/resources/images/default/layout/stuck.gif',
	                icon: '/ux/images/cross.png',
	                cls: 'x-btn-text-icon',
			text: 'Descartar',
	                tooltip: '<b>Descartar Cambios</b><br/>ignorar las modificaciones realizadas',
			disabled: true,
	                listeners: { click: { scope:panel, fn:function() {

				Ext.Msg.show({

					msg :'Realmente desea descartar los cambios realizados?',
					width :300,
					buttons: Ext.Msg.YESNOCANCEL,
					fn: function(btn) { 

						if ( btn == 'yes' ) 
							this.store.revert_changes();
					},
					scope: panel
				});

				}, buffer:200 } 
			} 
		});

		this.store.on( 'update', function( s, r, o ) { 
			if ( this.el && this.el.dom ) 
				( o == Ext.data.Record.EDIT ) ? this.enable(): this.disable();
		}, tb );


		return tb;

	},/*}}}*/

	del_button: function( panel ) {/*{{{*/

		return new Ext.Button({
	        	        icon: '/ext/resources/images/default/dd/drop-no.gif',
        	        	cls: 'x-btn-text-icon',
				text: 'Borrar',
	                	tooltip: '<b>Borrar</b><br/>Pulse aqui para borrar la seleccion',
				listeners:{click:{scope:this, fn: function(){
					this.delete_confirm( panel );
				}, buffer:200}}
		});

	},/*}}}*/

	assign_button: function( panel ) {/*{{{*/
        	return new Ext.Button({
       	        	icon: '/ux/images/arrow_up.png',
			text: 'Asignar',
                	cls: 'x-btn-text-icon',
			// disabled: true,
                	tooltip: '<b>Asignar</b><br/>Asocia el registro actual al panel principal',
			listeners:{ click:{ scope: this, fn:function( btn ) {
				this.store.set_parent_fk();
			}, buffer:200 }}
		});

	},/*}}}*/

	inspect_window: function(){/*{{{*/

		if ( ! this.i_panel )  

			this.i_panel = Ext.create('widget.window', {

				width: 600,
				minWidth: 300,
				height:400,
				minHeight: 200,
				closable: true,
				closeAction : 'hide',
				maximizable: true,
				layout: 'border',
				plain:true,
				border:false,
				buttonAlign:'center',
				items:[
					{xtype:'tabpanel',region:'center',
					items:[
						{xtype:this.panel.obj.inspect[0],region:'center'}]}]
			});

		this.i_panel.show();

	},/*}}}*/

	inspect_button: function( panel ) {/*{{{*/
		return {
	                icon: '/ux/images/application_form_magnify.png',
			cls: 'x-btn-text-icon',
			text: 'Ver',
	                menuAlign: 'tr?',
	                tooltip: '<b>Inspeccionar</b><br/>Pulse aqui para inspeccionar el registro seleccionado',
			handler: this.inspect_window,
			scope:this 
		};
	},/*}}}*/

	add_button: function( panel ) {/*{{{*/

		return new Ext.Button({
			icon: '/ext/resources/images/default/dd/drop-add.gif',
			cls: 'x-btn-text-icon',
			text: 'Agregar',
	                menuAlign: 'tr?',
	                tooltip: '<b>Agregar</b><br/>Pulse aqui para agregar un nuevo registro',
			listeners:{click:{scope:this, fn:this.addRecord, buffer:200}}
		});


	},/*}}}*/

	save_button: function( panel ) {/*{{{*/

        	var tb = new Ext.Button({
       	        	icon: '/ext/resources/images/default/dd/drop-yes.gif',
			text: 'Guardar',
                	cls: 'x-btn-text-icon',
			disabled: true,
                	tooltip: '<b>Guardar</b><br/>Pulse aqui para guardar las modificaciones',
			listeners:{ click:{ scope: this, fn:App.save, buffer:200 }}
		});

		panel.store.on( 'update', function( s, r, o ) { 
			if ( this.el && this.el.dom ) 
				( o == Ext.data.Record.EDIT ) ? 
					this.enable():
					this.disable();
		}, tb );

		return tb;

	},/*}}}*/

	add_process_menu: function( panel ) {/*{{{*/

		var menu_params = {
			icon: '/ux/images/list-items.gif',
			// cls: 'x-btn-text-icon',
			// minWidth: 105,
			text: 'Acciones',
			tooltip: 'Ejecute una acción para procesar los items seleccionados',
			menu: { items: []}
		};

		var item, pm = panel.processes_menu;

                for ( i = 0; i < pm.length; i ++ ) {

			item = new Ext.menu.Item( pm[i] );
			item.on( 'click', function( it ) { 
				this.process_selections( panel, it, panel.obj) 
			}, this );
			menu_params.menu.items[i] = item;
                }

		return new Ext.Button( menu_params );

        },/*}}}*/

	    	delete_confirm: function ( panel ) {//{{{

		var m = panel.getSelection();

        	if ( m.length ) {
                		Ext.MessageBox.confirm('Message', 
					'Realmente deseas eliminar ' + m.length + ' elementos?', 
					function( b ) { 
						( b == 'yes' ) && this.delete_selections( panel ); 
					}, 
					this );
				/* DEBUG: no puedo setear el boton por default para que no borre !!
				Ext.MessageBox.getDialog().buttons[0].focus();
				*/
			}
		else
                	Ext.MessageBox.alert('Error', 
				'Para borrar, debes seleccionar algun(os) elemento(s)');

    	}, //}}}

   	delete_selections: function( panel ) {/*{{{*/

		// DEBUG: esto estaba en xpGrid, hay que ver si aplica para todos

		var saved = 0;

		Ext.each( panel.getSelection(), function( r ) {

			if ( r.get('__new__') ) 
				this.remove( r );
			else
				saved++;

		}, panel.store );

		if ( saved ) App.process_request({

                        m: this.class_name,
                        a: 'process',
                        p: 'delete',
                        x: this.serialize_selections( panel.getSelection() ),
                        process_name: 'Borrar la Selección'

                }, function() { 

			panel.getView &&
			panel.getView().focusRow(panel.store.rowIndex);
		});

		else panel.store.go_to( panel.store.rowIndex, false );

   	},  /*}}}*/

	addRecord:function() {//{{{

		var panel = this.panel;

		if ( ! panel.acl.add ) return;

        	if ( panel.store.parent_store && panel.store.parent_store.selections.length === 0 ) {

                	Ext.Msg.alert( 'Error', 'No se ha seleccionado ningun registro en el panel principal. Por favor, seleccione uno' );

        	} else {


			panel.store.add_blank({ callback: function() {

				// DEBUG: manejar la insercion de nuevos registros, donde los pone

				panel.selModel.select(0);

				/* se fija que sean distintos en el tipo (que o abra otra grilla del mismo objeto) */

				if ( panel.obj.inspect.length )
					if ( this.i_panel )
						this.i_panel.show();
					else
						this.inspect_window();

				else if ( panel.startEditingBlank )
					panel.startEditingBlank();

			}, scope: this });
		}

	}, // eo function addRecord//}}}

});
