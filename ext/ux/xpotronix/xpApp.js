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

Ext.ux.xpotronix.xpApp = function( config ) {

	var version = '3.4.0';

	if ( Ext.version != version )
		( typeof console != 'undefined' ) && console.error( 'Atención: la versión requerida de la librería ExtJs es la ' + version + ': la versión provista es la ' + Ext.version );

	Ext.apply( this, config ); 

	Ext.ux.xpotronix.xpApp.superclass.constructor.call( this );

	Ext.SSL_SECURE_URL = '/ext/resources/images/vista/s.gif';
	Ext.BLANK_IMAGE_URL = '/ext/resources/images/vista/s.gif';

	Ext.QuickTips.init();

	if ( this.state_manager == 'http' ) {

		Ext.state.Manager.setProvider(new Ext.ux.state.HttpProvider({
			url:'?m=user_preferences'
	 		,user:'649254989'
			,session:'session'
			,id:'1'
			,readBaseParams:{a: 'process', p:'readState'}
			,saveBaseParams:{a: 'process', p:'saveState'}
			,autoRead:false
		//	,logFailure:true
		//	,logSuccess:true
			,paramNames: {
				id:'id'
				,name:'name'
				,value:'value'
				,user:'user'
				,session:'session'
				,data:'ui_state'
			}
		}));
 
		Ext.state.Manager.getProvider().initState( eval( this.user.ui_state ) );

	} else

		Ext.state.Manager.setProvider(new Ext.state.CookieProvider());
 
	// Ext.Ajax.timeout = 600000;

	this.session = null;	

	this.obj = new Ext.util.MixedCollection(false);
        this.obj.getKey = function(o){ return o.class_name; }

	this.store = Ext.StoreMgr;

	this.addEvents( 'configready' );

	this.messages_proxy = new Ext.data.MemoryProxy();

	this.conn_process = new Ext.data.Connection();

        this.conn_process.on( 'requestcomplete', this.on_complete, this );
	this.conn_process.on( 'requestexception', this.on_complete_exception , this );

	this.on('configready', this.start );

	window.onbeforeunload = function() {

		if ( App.getModifiedStores && App.getModifiedStores().length ) 
    			return 'Hay cambios que no han sido guardados todavía. Si presiona [Aceptar], perderá los cambios. Si presiona [Cancelar], presione el botón de [Guardar] y luego cierre la página';
  	};

	this.status_store = new Ext.data.Store({//{{{

   		proxy: this.messages_proxy,
   		reader: new Ext.data.XmlReader(

			{record: 'status'}, 
				[
               			{name: 'value', mapping: '@value'}
			])
		});//}}}

	this.messages_grid = new Ext.grid.GridPanel({//{{{

		id: '__messagesGrid',
		syncSize: true,
       		store: new Ext.data.Store({
   			proxy: this.messages_proxy,
   			reader: new Ext.data.XmlReader({
			record: 'message'	
       		},[
              			{name: 'type', mapping: '@type'}
               			,{name: 'level', mapping: '@level'}
               			,{name: 'file', mapping: '@file'}
               			,{name: 'line', mapping: '@line'}
               			,{name: '', mapping: ''}
			])


		}),

        		columns: [
            			{header: "Tipo", width: 120, dataIndex: 'type', sortable: false},
            			{header: "Nivel", width: 180, dataIndex: 'level', sortable: false, hidden:true },
            			{header: "Archivo", width: 115, dataIndex: 'file', sortable: false, hidden: true},
            			{header: "Linea", width: 100, dataIndex: 'line', sortable: false, hidden: true},
            			{header: "Texto", width: 100, dataIndex: '', sortable: false}
        			]
    		});//}}}

}

Ext.extend( Ext.ux.xpotronix.xpApp, Ext.util.Observable, {

	menu:			null,
	changes_buffer: 	null,
	login_w: 		null,
	change_password_w: 	null,
	fake_dirty_records:	[],
	prevent_reload:		false, // on windows login
	debug:			false,

	start: function() {/*{{{*/

		if ( App.store ) {

			var main_store = App.store.first();

			if ( main_store && ( main_store.feat.auto_load || this.feat.auto_load ) )
				main_store.load(); 
		}
	
	},/*}}}*/ 

	accessible: function( arr ) {

		var ret = [];

		Ext.each( arr, function( a ) { 

			// DEBUG: poner accesos en acl en juscaba2
			( a.acl.access || this.feat.application == 'juscaba2' ) && 
				ret.push( a ); 
		}, this );

		return ret;
	},

	getModifiedStores: function() {/*{{{ */

		var list = [];

		this.store.each( function( s, a, b ) {

			if ( s.dirty && s.dirty() ) 

				list.push( { store: s, records: null } );
		}, this );


		return list;

	},/*}}}*/

	getStoresMods: function() {/*{{{*/

		var md = this.getModifiedStores();

		if ( md.length ) {

			Ext.each( md, function( o ) {

				o.records = o.store.getModifiedRecords();

				Ext.each( o.records, function( r ) {

					o.store.markRecordModifiedChain( r, this.fake_dirty_records );

				}, this );
			
			}, this );
		}

		return md;
	},/*}}}*/

	debug_show_changed_records: function( md ) {/*{{{*/

		var message = '';

		if ( md.length ) {

			message = '<ul>';

			Ext.each( md, function( o ){
				message += "<li>store: " + o.store.class_name + ", records: " + o.records.length + "</li>";
			}, this);

			message += '</ul>';
		} else
			message = 'No hay cambios que guardar';

		Ext.Msg.show({

			msg: message,
			buttons: Ext.Msg.OK,
			width: 400
		});

	},/*}}}*/

	serialize: function() {//{{{

		var md = this.getStoresMods();

		this.debug && this.debug_show_changed_records( md );

		if ( md.length )
			return App.store.first().serialize();


	},//}}}

	showPleaseWait: function( msg, progressText ) {//{{{

		Ext.Msg.show({
			msg : msg,
			icon: Ext.MessageBox.INFO,
			progressText: progressText,
			width :400,
			wait :true,
			buttons: Ext.Msg.CANCEL,
			waitConfig : { interval :200 }
			});
	},//}}}

	load_changes_buffer: function() {/*{{{*/

		this.changes_buffer = this.serialize();

	},/*}}}*/

	showSaveChanges: function() {//{{{

		Ext.Msg.show({

			msg :'Hay cambios sin guardar. Desea guardar los cambios?',
			width :300,
			buttons: Ext.Msg.YESNOCANCEL,
			fn: this.fnSaveChanges

		});

	},//}}}

	 hidePleaseWait: function() {//{{{

		Ext.Msg.hide();

	},//}}}

	hideSaveChanges: function() {//{{{
		Ext.Msg.hide();
	},//}}}

	save: function() {/*{{{*/

		App.process_request({ m: App.feat.module, a: 'process', p: 'store',  x: App.serialize() });
	},/*}}}*/

 	process_request: function( p ) {/*{{{*/

		this.showPleaseWait( 'Ejecutando la acción ... Aguarde','Procesando ...' );

		var url = { m: p.m, a: p.a };
		delete( p.m );
		delete( p.a );

		if ( p.p ) {
			Ext.apply( url, { p: p.p } );
			delete( p.p );
		}

            	this.conn_process.request({ method: 'POST', url: '?' + Ext.urlEncode( url ), params: p });

	}, /*}}}*/

	fnSaveChanges: function( btn ) {/*{{{*/

		if ( btn == 'yes' ) 
			App.process_request({ m: App.feat.module, a: 'process', p: 'store',  x: App.serialize() });
	},/*}}}*/

	handle_messages: function( param ) {/*{{{*/

		var mp = Ext.getCmp('__messagesPanel');

		if ( mp && !mp.findById('__messagesGrid') ) {
			mp.add( this.messages_grid );
			mp.doLayout();
		}

		var ms = this.messages_grid.store;
		ms.loadData(  param.responseXML, false );
		var msgs = '';

		for ( var i = 0; r = ms.getAt(i); i++ ) {
			// if ( r.get('type') == "16" ) 
				msgs += ( '<li>' + r.get('') + '</li>');
		}

		( msgs != '' ) &&  Ext.Msg.show({
			width: 400,
			title:'Respuesta del Servidor de Datos',
			msg: '<ul>' + msgs + '</ul>',
			buttons: Ext.Msg.OK,
			icon: Ext.Msg.INFO
		});
			
	},/*}}}*/

	parse_response: function( param ) {/*{{{*/

		if ( ! param.responseXML ) {

			Ext.Msg.show({
				title: 'Atención',
				icon: Ext.Msg.ERROR,
				width: 400,
				buttons: Ext.Msg.OK,
				msg: 'No pude conectarme con el servidor: por favor, comuníquese con el administrador de la aplicación'
			});	
			return false;
		}

		this.handle_messages( param );
		this.status_store.loadData( param.responseXML, false );

		return true;

	}, /*}}}*/

	update_model: function( param ) {/*{{{*/

		var q = Ext.DomQuery;

		Ext.each( q.select( 'changes/*', param.responseXML ), function( e ) { 

			var s;

			if ( s = this.store.item( e.nodeName ) ) {

				var a = e.getAttribute( 'action' );
				var uiid = e.getAttribute( 'uiid' );

				if ( a == 'i' || a == 'u' ) {

					s.reader.meta.record = s.ns_update;

					var r = s.reader.readRecords(e);
					r.totalRecords = s.totalLength;
					s.loadRecords(r, {add: true}, true);
					s.reader.meta.record = s.ns;
					s.getById( uiid ).commit();

				} else if ( a == 'd' ) {

					s.remove( s.getById( uiid ) );
					s.totalLength--;
					s.fireEvent('rowcountchange', s);
					s.go_to( s.rowIndex, false );

				} else {

					// error de validacion, no hace nada

				}
			}

			debug = 1;

		}, this );
	},/*}}}*/

	on_complete: function(sender, param) { // Callback called on response/*{{{*/

		this.hidePleaseWait();
		this.parse_response( param ) && this.update_model( param );
		Ext.each( this.fake_dirty_records, function( r ) { r.commit(); } );

	},/*}}}*/

       on_complete_exception: function( sender, param ) { // Callback called on response/*{{{*/

		Ext.Msg.alert( 'hubo un problema al guardar, por favor reintenta');
		this.parse_response( param );
		this.update_model();

               	this.hidePleaseWait();

	},/*}}}*/

	handle_login: function( form, action ) {/*{{{*/

		try {

			obj = Ext.decode(action.response.responseText); 

		} catch ( ex ) {

			obj = null;

		}

		if ( ! obj ) {

			if ( action.failureType == 'server' ){ 

				obj = Ext.util.JSON.decode(action.response.responseText); 

			} else { 

				if ( ! ( reason = action.response.responseText)  ) reason = 'Servidor fuera de linea, por favor reingrese en unos minutos ...';
				Ext.Msg.alert('Mensaje', 'No puedo conectarme con el servidor: ' + reason); 
			} 

			// login.getForm().reset(); 

		} else if ( obj.success ) {

			App.login_w.hide();

		if ( ! App.prevent_reload ) {
			Ext.Msg.show({
				id: 'win_ingresando',
				msg : form.title,
				progressText: 'Ingresando, aguarde por favor ...',
				width :300,
				wait :true,
				buttons: Ext.Msg.CANCEL,
				waitConfig : { interval: 200 }
			});


			if ( window.parent ) 
				window.parent.location.reload(); 
			else
				window.location.reload();
		}

		} else if ( ! obj.success ) {

			Ext.Msg.alert('Fallo la autorizacion', obj.errors.reason); 

		} else {

			Ext.Msg.alert('Respuesta del servidor inesperada. No se puede continuar, consulte con el administrador de la aplicación.'); 
		}
	},/*}}}*/

	login_window: function() {/*{{{*/

		var doLoginForm = function(){ 

			var form = login.getForm();

			if ( !form.isValid() )
				return;

			form.submit({ 
				method:'POST', 
				waitTitle:'Conectando', 
				waitMsg:'Enviando datos, aguarde ...',
				scope: this,
				success: App.handle_login,
				failure: App.handle_login
			}); 
		};

		var login = new Ext.FormPanel({ 
		
			labelWidth:80,
			url:'?m=users&amp;a=login', 
			frame:true, 
			title:'Ingreso a '+ this.feat.page_title, 
			defaultType:'textfield',
			monitorValid:true,
			id: 'loginFormPanel',
			// buttonAlign: 'center',
		
			items:[{ 
				fieldLabel:'Usuario', 
				id:'loginUsername', 
				name:'loginUsername', 
				width: 280,
				allowBlank:false 
			},{ 
				fieldLabel:'Clave', 
				name:'loginPassword', 
				inputType:'password', 
				width: 280,
				allowBlank:false 
			}],
		
			buttons:[{ 
				text:'Ingresar',
				formBind: true,	 
				handler: doLoginForm
			},{
				text:'Cancelar',
				handler:function(){ win.hide();}
			}] 
		});

		login.on('render', function() {

			var map = new Ext.KeyMap( login.bodyCfg.id, [{
				key : [10, 13],
				scope : this,
				fn: doLoginForm
			}]);
		});
		
		var win = new Ext.Window({
			layout:'fit',
			width:400,
			height:150,
			constrain: true,
			closable: false,
			resizable: false,
			plain: true,
			border: false,
			defaultButton: 'loginUsername', // quien recibe el foco
			items: [login]
		});
		
		return win;
		
	},/*}}}*/

	login: function( prevent_reload ) {/*{{{*/

		this.prevent_reload = prevent_reload;

		if ( !this.login_w ) 
			this.login_w = this.login_window();

		this.login_w.show();


	},/*}}}*/

	change_password_window: function() {/*{{{*/


    var login = new Ext.FormPanel({ 

        labelWidth:80,
        url:'?m=users&a=change_password', 
        frame:true, 
        title:'Cambiar Contraseña', 
        defaultType:'textfield',
	monitorValid:true,

        items:[{ 
                fieldLabel:'Nueva Clave', 
                name:'password', 
                inputType:'password', 
                allowBlank:false 
            },{ 
                fieldLabel:'Repetir Clave', 
                name:'password_repeat', 
                inputType:'password', 
                allowBlank:false 
            }],
 
        buttons:[{ 
                text:'Cambiar',
                formBind: true,	 

                handler:function(){ 

                    login.getForm().submit({ 
                        method:'POST', 
                        waitTitle:'Conectando', 
                        waitMsg:'Enviando datos, aguarde ...',

			success:function(){ 

				win.hide();
		                Ext.Msg.show( {
		                msg : 'El cambio de su clave ha sido satisfactorio',
		                width :300,
		                wait :true,
		                buttons: Ext.Msg.OK,
		                waitConfig : {
		                        interval :200
		                }
	                	} );

			},
		
                        failure:function(form, action){ 
                            if(action.failureType == 'server'){ 
                                obj = Ext.util.JSON.decode(action.response.responseText); 
                                Ext.Msg.alert('Fallo la autorizacion', obj.errors.reason); 
                            }else{ 
				if ( ! ( reason = action.response.responseText)  ) reason = 'Servidor fuera de linea, por favor reingrese en unos minutos ...';
                                Ext.Msg.alert('Mensaje', 'No puedo conectarme con el servidor: ' + reason); 
                            } 
                            login.getForm().reset(); 
                        } 
                    }); 
                } 
            },{

		text:'Cancelar',
		handler:function(){ win.hide();}

	    }] 
    });
 

    	var win = new Ext.Window({
        	layout:'fit',
        	width:300,
        	height:150,
		constrain: true,
        	closable: false,
        	resizable: false,
       	 	plain: true,
        	border: false,
        	items: [login]
		});


	return win;


	},/*}}}*/

	change_password: function() {/*{{{*/

		if ( !this.change_password_w ) 
			this.change_password_w = this.change_password_window();

		this.change_password_w.show();


	},/*}}}*/

	logout: function() {/*{{{*/

	    conn = new Ext.data.Connection();

	    conn.on( 'requestcomplete', function() { 

		alert('Presione [Aceptar] para salir de la aplicación');
		window.location.reload();}, 

		this );

            conn.request({ method: 'POST', url: '?' + Ext.urlEncode( { a: 'logout' } ) });

	},/*}}}*/

	get_feat: function( key, obj ) {/*{{{*/

		return ( obj && obj.feat[key] !== undefined ) ? obj.feat[key] : this.feat[key];

	}/*}}}*/

}); // extend

Ext.reg('xpApp', Ext.ux.xpotronix.xpApp );

// vim600: fdm=marker sw=3 ts=8 ai:
