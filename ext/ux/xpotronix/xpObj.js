/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */


Ext.ns( 'Ext.ux.xpotronix' );

Ext.ux.xpotronix.xpObj = function( config ) {

    	this.panels = new Ext.util.MixedCollection(false);
    	this.panels.getKey = function(o){ return o.id; };

	this.config = config | {};

	Ext.apply( this, config ); 

	Ext.ux.xpotronix.xpObj.superclass.constructor.call( this );

	this.on( 'beforedestroy', function(){

		this.panels.each( function(p){ 
			p.destroy();
			this.panels.remove(p);
			delete p;
		}, this );
	});

}

Ext.extend( Ext.ux.xpotronix.xpObj, Ext.Component, {

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

	filters:	[],

	columns: 	[],
	fields: 	[],
	editors:  	{},
	processes_menu: null,
	buttons: 	null,
	feat:		{},
	export_w: 	null,

        process_selections: function( panel, item, obj ){/*{{{*/

		if ( item.params == undefined ) 
			item.params = {};

		var selections = panel.get_selections();

		/* queda la funcion en una variable para ser llamada luego */

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

		/* si hay un dialog lo muestra */

		if ( item.dialog ) 	
			item.dialog.fn.call( item.dialog.scope || this, selections, command, item );

		/* o si hay un comando lo ejecuta */

		else if ( item.script ) 	
			ret = item.script.fn.call( item.script.scope || this, selections, command, item );

		else ret = true;

		if ( ret ) { 

			if ( App.getModifiedStores().length ) {

		        	Ext.MessageBox.alert('Error', 'Hay datos sin guardar: salve la información antes de procesar');
				return;
			}

			command.call( this );
		}

        },/*}}}*/

	form_left_button: function( panel ) {/*{{{*/

		var tb = new Ext.Toolbar.Button( {
				// id: 'leftButton',
				text: 'Atras',
	                	menuAlign: 'tr?',
				disabled: true,
	                	tooltip: 'Ir hacia el elemento previo',
				listeners:{click:{scope:this.store, fn:function() { this.prev() },buffer:200 }}
				});

		tb.setDisabled( !this.store.rowIndex );

		this.store.on( 'changerowindex', function( s, rowIndex ) { 
			tb.setDisabled( !rowIndex );
		}, tb );

		return tb;

	},/*}}}*/

	form_right_button: function( panel ) {/*{{{*/

		var tb = new Ext.Toolbar.Button( {
			// id: 'rightButton',
			text: 'Adelante',
	               	menuAlign: 'tr?',
			disabled: true,
	               	tooltip: 'Ir hacia el proximo elemento',
			listeners:{click:{scope:this.store, fn:function(){ this.next() },buffer:200}}
			} );

		tb.setDisabled( ! ( this.store.rowIndex < ( this.store.getCount() - 1 ) ) );

		this.store.on( 'changerowindex', function( s, rowIndex ) { 
			tb.setDisabled( ! ( rowIndex < ( s.getCount() - 1 ) ) );
		}, tb );

		return tb;

	},/*}}}*/

	export_button: function( panel ) {/*{{{*/

		return new Ext.Toolbar.Button({

	                icon: '/ux/images/grid.png',
	                cls: 'x-btn-text-icon',
			text: 'Exportar',
        	        tooltip: '<b>Exportar datos CSV</b><br/>Exporte los datos a una planilla de cálculos',

			listeners: { click: { scope:this, fn: function(){

	                        Ext.isObject( this.export_w ) || 

					( panel.export_w = this.export_dialog( panel ) );

				panel.export_w.show();

        	        }, buffer:200 } } 

		});

	},/*}}}*/

    export_dialog: function( panel ) { /*{{{*/

	var total_count = panel.store.getTotalCount();


    var form = new Ext.form.FormPanel({
        baseCls: 'x-plain',
        labelWidth: 100,
        defaultType: 'textfield',

        items: [{
	    xtype: 'combo',
	    name: 'max_recs',
            fieldLabel: 'Cantidad M&acoute;xima',
	    store: new Ext.data.SimpleStore({
    			fields: ['id', 'label'],
    			data : [ [1000,'1000'], [10000,'10000']]}),
	    anchor:'100%',
	    displayField: 'label',
	    valueField: 'id',
            typeAhead: true,
            mode: 'local',
            triggerAction: 'all',
            emptyText: ( total_count > 10000 ) ? 'Redefina la busqueda, demasiados registros (' + total_count + ')' : 'Seleccionar la cantidad de registros a exportar',
            selectOnFocus:true,
		value: ( total_count > 10000 ) ? null : total_count

        }]
    });

    var win = new Ext.Window({

        title: 'Exportar ' + this.class_name,
        width: 500,
        height:200,
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

		/* scope: panel */

		var store = this.store;
		var obj = this.obj;
		var q_params = {};
		var display_only_fields = [];

		/* foregn key */
		Ext.apply( q_params, store.buildXpQuery( store.get_foreign_key() ));

		/* Filtros */	
		if ( store.filter ) {
			Ext.apply( q_params, store.buildXpQuery( store.filter.getFilterData() ) );
		}


		/* lastOptions */
		if ( store.lastOptions )
			Ext.apply( q_params, store.lastOptions.params );


		/* Buscar (en todos los registros)  */
		if ( store.baseParams.query && store.baseParams.fields ) {

			var vars = eval(store.baseParams.fields).join(App.feat.key_delimiter);

                        var params = {};
                        params['s[' + store.class_name +']['+ vars +']'] = store.baseParams.query;

			Ext.apply( q_params, params );

		}

		/* display_only */
		if ( this.getXType() == 'xpGrid' ) {

			Ext.each( this.getColumnModel().config, function( f ) {

				f.hidden || display_only_fields.push( f.name );

			});

			Ext.apply( q_params, { 'f[display_only]': display_only_fields.join(',') } );

			var sort_state = this.store.getSortState();

			if ( sort_state !== undefined ) {

				var sort_field = this.store.getSortState().field;
				var sort_dir = this.store.getSortState().direction;  

                     	   	var params = {};
                        	params['o[' + store.class_name +']['+ sort_field +']'] = sort_dir;

				Ext.apply( q_params, params );
			}
		}

		/* URL */
		Ext.apply( q_params, { 
			m: this.class_name, 
			a: 'csv', 
			'f[row_count]': form.ownerCt.find('name','max_recs')[0].getValue()
		});

                // @parms: hot fix codigo copiado de xpStore, se necesitan variables globales

                var p = {};
                var url = Ext.urlDecode( App.get_source() );

                for ( var f in url )
                        if ( f.substr(0,1) === '@' )
                                p[f] = url[f];

                Ext.apply( q_params, p );



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

},//}}}


	invert_button: function( panel ) {/*{{{*/

		return new Ext.Toolbar.Button( {
	                icon: '/ext/resources/images/default/layout/stuck.gif',
	                cls: 'x-btn-text-icon',
			text: 'Inv. Sel.',
	                tooltip: '<b>Invertir la Selección</b><br/>Cambie el estado de no seleccionado por seleccionado y viceversa',
	                listeners: { click: { scope:panel, fn:panel.invertSelection, buffer:200 } } } );

	},/*}}}*/

	discard_changes: function( panel ) {/*{{{*/

		var tb = new Ext.Toolbar.Button( {
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

		return new Ext.Toolbar.Button({
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

        	var tb = new Ext.Toolbar.Button({
       	        	icon: '/ext/resources/images/default/dd/drop-yes.gif',
			text: 'Guardar',
                	cls: 'x-btn-text-icon',
			disabled: true,
                	tooltip: '<b>Guardar</b><br/>Pulse aqui para guardar las modificaciones',
			listeners:{ click:{ scope: this, fn:function( btn ) {
                		App.process_request({ m: App.feat.module, a: 'process', p: 'store',  x: App.serialize() });
			}, buffer:200 }}
		});

		this.store.on( 'update', function( s, r, o ) { 
			if ( this.el && this.el.dom ) 
				( o == Ext.data.Record.EDIT ) ? this.enable(): this.disable();
		}, tb );

		return tb;

	},/*}}}*/

	assign_button: function( panel ) {/*{{{*/
        	return new Ext.Toolbar.Button({
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

		return new Ext.Toolbar.Button({
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

		return new Ext.Toolbar.Button({
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
			// ,minWidth: 105
		};

		var item, pm = panel.processes_menu;

                for ( i = 0; i < pm.length; i ++ ) {

			item = new Ext.menu.Item( pm[i] );
			item.on( 'click', function( it ) { 
				this.process_selections( panel, it, this ) 
			}, this );
			menu_params.menu.items[i] = item;
                }

		return new Ext.Toolbar.Button( menu_params );

        },/*}}}*/

	toolbar: function( panel ) {/*{{{*/

                if ( ! App.get_feat( 'paging_toolbar', this ) || panel.paging_toolbar == false ) 
			return;

                panel.tbar = new Ext.PagingToolbar({
			store: panel.store,
			pageSize: panel.store.pageSize,
			displayInfo: true,
			displayMsg: '{0} a {1} de {2}',
			emptyMsg: "",
			prependButtons: true
		});

		panel.store.on('rowcountchange', function( s ) {
			this.bindStore( s, true );
		}, panel.tbar );

	},/*}}}*/

	set_toolbar: function( panel ) {/*{{{*/

		var tbar =  panel.getTopToolbar();

		if ( tbar ) {

			// botones

			if ( panel.getXType() == 'xpForm' || panel.getXType() == 'xpPanel' ) {

				tbar.insert( tbar.items.length - 2, panel.obj.form_left_button( panel ) ) ;

				tbar.insert( tbar.items.length - 2, panel.obj.form_right_button( panel ) ) ;
			}

			var b, pos = tbar.items.length - 2;

		        if ( panel.acl.del ) 
				tbar.insert( pos, panel.obj.del_button( panel ) );

			tbar.insert( pos, '->' );

		        if ( panel.acl.edit || panel.acl.add ) 
				tbar.insert( pos, panel.obj.discard_changes( panel ) );

		        tbar.insert( pos, panel.obj.export_button( panel ) ) ;

			if ( panel.store.foreign_key_type == 'parent' )
	        		tbar.insert( pos, panel.obj.assign_button( panel ) ) ;

	        	tbar.insert( pos, panel.obj.invert_button( panel ) ) ;

		        if ( panel.processes_menu ) 
				tbar.insert( pos, panel.obj.add_process_menu( panel ) );

		        if ( panel.acl.edit || panel.acl.add ) 
				tbar.insert( pos, panel.obj.save_button( panel ) );

	        	if ( panel.acl.add ) 
				tbar.insert( pos, panel.obj.add_button( panel ) ) ;


			if ( panel.obj.get_inspect_panel() )
	        		b = tbar.insert( pos, panel.obj.inspect_button( panel ) ) ;

		}


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

}); // extend

Ext.reg('xpObj', Ext.ux.xpotronix.xpObj );

// vim600: fdm=marker sw=3 ts=8 ai:
