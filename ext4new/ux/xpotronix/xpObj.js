/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */


Ext.ns( 'Ux.xpotronix' );

Ext.define( 'Ux.xpotronix.xpObj', { 

	extend: 'Ext.Component',
	alias: 'xpObj',

	constructor: function( config ) {

    	this.panels = new Ext.util.MixedCollection(false);
    	this.panels.getKey = function(o){ return o.id; };

	this.config = config | {};

	Ext.apply( this, config ); 

	Ux.xpotronix.xpObj.superclass.constructor.call( this );

	this.on( 'beforedestroy', function(){

		this.panels.each( function(p){ 
			p.destroy();
			this.panels.remove(p);
			delete p;
		}, this );
	});

	}, 

	config: 	null,

	class_name: 	null,
	translate:	null,
	parent_name:	null,
	acl:		{},
	role:		null,
	extra_param:	{},
	cm:		[],
	panels:		null,
	store:		null,

	columns: 	[],
	fields: 	[],
	editors:  	{},
	processes_menu: null,
	buttons: 	null,
	feat:		{},
	export_w: 	null,

        process_selections: function( panel, item, obj ){/*{{{*/

		/* procesa la selección */

		if ( item.params == undefined ) 
			item.params = {};

		var selections = panel.get_selections();

		/* prepara la funcion enviada por parametro desde xpotronix */

		var command = function( params ){

			params = params | {};

	                App.process_request( Ext.apply({

        	                m: obj.class_name,
                	        a: 'process',
				p: item.value,
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

		alert( 'form_left_button' );

		var tb = new Ext.Button( {
			// id: 'leftButton',
			text: 'Atras',
	               	menuAlign: 'tr?',
			disabled: true,
	               	tooltip: 'Ir hacia el elemento previo'
			//,listeners:{click:{scope:this.store, fn:function() { this.prev() },buffer:200 }}

		});



		// tb.setDisabled( !this.store.rowIndex );


		return tb;

	},/*}}}*/

	export_button: function( panel ) {/*{{{*/

		return new Ext.Button( {
	                icon: '/ux/images/grid.png',
	                cls: 'x-btn-text-icon',
			text: 'Exportar',
        	        tooltip: '<b>Exportar datos CSV</b><br/>Exporte los datos a una planilla de cálculos',

			listeners: { click: { scope:this, fn: function(){

	                        this.export_w || ( this.export_w = this.export_dialog( panel ) );
				this.export_w.show();

        	        }, buffer:200 } } 

			} )

	},/*}}}*/

	invert_button: function( panel ) {/*{{{*/

		return new Ext.Button( {
	                icon: '/ext/resources/images/default/layout/stuck.gif',
	                cls: 'x-btn-text-icon',
			text: 'Inv. Sel.',
	                tooltip: '<b>Invertir la Selección</b><br/>Cambie el estado de no seleccionado por seleccionado y viceversa',
	                listeners: { click: { scope:panel, fn:panel.invertSelection, buffer:200 } } } );

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
							// this.store.revert_changes();
							alert( 'disabled discard_changes' );
					},
					scope: panel
				});

				}, buffer:200 } 
			} 
		});

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

	save_button: function( panel ) {/*{{{*/

        	var tb = new Ext.Button({
       	        	icon: '/ext/resources/images/default/dd/drop-yes.gif',
			text: 'Guardar',
                	cls: 'x-btn-text-icon',
			disabled: true,
                	tooltip: '<b>Guardar</b><br/>Pulse aqui para guardar las modificaciones',
			listeners:{ click:{ scope: this, fn:function( btn ) {
                		App.process_request({ m: App.feat.module, a: 'process', p: 'store',  x: App.serialize() });
			}, buffer:200 }}
		});

		return tb;

	},/*}}}*/

	assign_button: function( panel ) {/*{{{*/
        	return new Ext.Button({
       	        	icon: '/ux/images/arrow_up.png',
			text: 'Asignar',
                	cls: 'x-btn-text-icon',
			// disabled: true,
                	tooltip: '<b>Asignar</b><br/>Asocia el registro actual al panel principal',
			listeners:{ click:{ scope: this, fn:function( btn ) {
				// this.store.set_parent_fk();
				alert( 'assign_button' );
			}, buffer:200 }}
		});

	},/*}}}*/

	inspect_window: function(){/*{{{*/

		var i_panel = this.get_inspect_panel();
		var iw;

		if ( ! i_panel ) return;

		if ( ! ( iw = Ext.getCmp( 'inspect_' + i_panel.id ) ) ) {

			Ext.apply( i_panel, { region: 'center' } );

			iw = new Ext.Window({
				id: 'inspect_' + i_panel.id,
				width: 600,
				height:400,
				minWidth: 300,
				minHeight: 200,
				constrain: true,
				closable: true,
				closeAction : 'hide',
				maximizable: true,
				layout: 'border',
				plain:true,
				bodyStyle:'padding:5px;',
				buttonAlign:'center',
				buttons: [{ text: 'Cerrar', handler:function(){ iw.hide();}} ],
				items: [ i_panel ]
			});

			this.panels.add(iw);
		}

		iw.show();

	},/*}}}*/

	inspect_button: function( panel ) {/*{{{*/

		return new Ext.Button({
	                icon: '/ux/images/application_form_magnify.png',
			cls: 'x-btn-text-icon',
			text: 'Ver',
	                menuAlign: 'tr?',
	                tooltip: '<b>Inspeccionar</b><br/>Pulse aqui para inspeccionar el registro seleccionado',
			listeners:{click:{scope:panel.obj, fn:this.inspect_window, buffer:200}}
		});
	},/*}}}*/

	get_inspect_panel: function() {/*{{{*/

		var panel = null;

		this.panels.each( function(p){ 

			if ( p.display_as == 'inspect' ) {
				panel = p;
				return;
			}
		});

		return panel;

	},/*}}}*/

	add_button: function( panel ) {/*{{{*/

		return new Ext.Button({
			icon: '/ext/resources/images/default/dd/drop-add.gif',
			cls: 'x-btn-text-icon',
			text: 'Agregar',
	                menuAlign: 'tr?',
	                tooltip: '<b>Agregar</b><br/>Pulse aqui para agregar un nuevo registro',
			listeners:{click:{scope:panel, fn:this.addRecord, buffer:200}}
		});


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
				this.process_selections( panel, it, this ) 
			}, this );
			menu_params.menu.items[i] = item;
                }

		return new Ext.Button( menu_params );

        },/*}}}*/

	    	delete_confirm: function ( panel ) {//{{{

		var m = panel.get_selections();

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

		Ext.each( panel.get_selections(), function( r ) {

			if ( r.get('__new__') ) 
				this.remove( r );
			else
				saved++;

		}, panel.store );

		if ( saved ) App.process_request({

                        m: this.class_name,
                        a: 'process',
                        p: 'delete',
                        x: this.serialize_selections( panel.get_selections() ),
                        process_name: 'Borrar la Selección'
                }, function() { 

			panel.getView &&
			panel.getView().focusRow(panel.store.rowIndex);
		});

		else panel.store.go_to( panel.store.rowIndex, false );

   	},  /*}}}*/

	addRecord:function() {//{{{

		alert ( 'disabled addRecord' ); return;

		if ( ! this.acl.add ) return;

        	if ( this.store.parent_store && this.store.foreign_key.length && this.store.parent_store.rowIndex === null ) {

                	Ext.Msg.alert( 'Error', 'No se ha seleccionado ningun registro en el panel principal. Por favor, seleccione uno' );

        	} else {

			this.store.add_blank({ callback: function() {

				var i_panel = this.obj.get_inspect_panel();

				if ( i_panel && ( this.getXType() != i_panel.getXType() ) )
					this.obj.inspect_window();
				else if ( this.startEditingBlank )
					this.startEditingBlank();

			}, scope: this });
		}

	}, // eo function addRecord//}}}

	serialize_selection_item: function( item ) {/*{{{*/

		var result = '', nodeList = '';
		var element = this.class_name;

		result = '<' + element;
		result += ' ID=\"' + Ext.util.Format.escapeXml(item.get('__ID__')) + '\"'
		result += ' uiid=\"' + Ext.util.Format.escapeXml(item.id) + '\"'
		result += ' new=\"' + Ext.util.Format.escapeXml(item.get('__new__')) + '\"'
		result += '/>\n';

		return result;
	},/*}}}*/

	serialize_selections: function( sels ) {/*{{{*/

		var nodeList = '';
		var element = App.feat.container_tag;

		Ext.each( sels, function( s ) {
			nodeList += this.serialize_selection_item( s ); 
		}, this );

		return '<' + element + ' name=\"' + this.class_name + '\"' + ( nodeList ? '>\n' + nodeList + '</' + element + '>\n' : ' />\n' );

	},/*}}}*/

    export_dialog: function( panel ) {//{{{

    var form = new Ext.form.FormPanel({
        baseCls: 'x-plain',
        labelWidth: 55,
        url:'save-form.php',
        defaultType: 'textfield',

        items: [{
	    xtype: 'combo',
	    id: panel.name + '_export_dialog_max_records',
            fieldLabel: 'Cantidad Máxima',
	    store: new Ext.data.SimpleStore({
    			fields: ['id', 'label'],
    			data : [ [1000,'1000'], [10000,'10000']]}),
	    name: 'max_records',
	    anchor:'100%',
	    displayField: 'label',
	    valueField: 'id',
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText:'Seleccionar la cantidad de registros a exportar',
            selectOnFocus:true

        }]
    });

    var win = new Ext.Window({
        title: 'Exportar Objetos',
        width: 500,
        // height:300,
	constrain: true,
        minWidth: 300,
        minHeight: 300,
        layout: 'fit',
        plain:true,
        bodyStyle:'padding:5px;',
        buttonAlign:'center',
        items: form,

        buttons: [{
            text: 'Exportar',
	    listeners: { click: { scope: panel, fn: function() {  

		alert( 'disabled listeners' ); return;

		var store = this.store;
		var q_params = {};

		Ext.apply( q_params, store.get_foreign_key() );


		// de xpStore.js	

		// Search (global search)
		if ( store.baseParams.query && store.baseParams.fields ) {

			var vars = eval(store.baseParams.fields).join(App.feat.key_delimiter);

                        var params = {};
                        params['s[' + store.class_name +']['+ vars +']'] = store.baseParams.query;

			Ext.apply( q_params, params );

		}

		if ( this.store.lastOptions )
			Ext.apply( q_params, this.store.lastOptions.params );

		var display_only_fields = [];

		Ext.each( this.getColumnModel().config, function( f ) {

			f.hidden || display_only_fields.push( f.name );
		});

		Ext.apply( q_params, { m: this.class_name, 
			v: 'csv', 
			'f[ignore_null_fields]': 0, 
			'f[include_dataset]': 2, // DS_NORMALIZED
			'g[start]': 0,
			'g[limit]': form.items.get( panel.name + '_export_dialog_max_records').getValue(),
			'f[display_only]': display_only_fields.join(',')
		});

		// alert( 'exportando la URL: ' + Ext.urlEncode( q_params ) );

		window.open ("?" + Ext.urlEncode( q_params ), "mywindow" ); 
		win.hide(); 

		}, buffer: 200 }}
        },{
            text: 'Cancelar',
	    handler: function() { win.hide(); }
        }]
    });

    return win;	

}//}}}

}); // extend

// vim600: fdm=marker sw=3 ts=8 ai:
