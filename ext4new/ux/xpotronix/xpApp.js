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

Ext.define('AppStatsModel', {/*{{{*/

	extend: 'Ext.data.Model'

	,proxy: { type: 'memory' 
		,reader: {
			type: 'xml',
			record: 'changes',
		}
	}
	,fields: [{name: 'value', mapping: '@value'}]

});/*}}}*/

Ext.define('AppMsgsModel', {/*{{{*/

	extend: 'Ext.data.Model'
	,proxy: { type: 'memory' 
		,reader: {
			type: 'xml',
			root: 'messages',
			record: 'message'
		}
	}
	,fields: [
		{name: 'type', mapping: '@type'}
		,{name: 'level', mapping: '@level'}
		,{name: 'file', mapping: '@file'}
		,{name: 'line', mapping: '@line'}
		,{name: '', mapping: ''}
	]

});/*}}}*/

Ext.define('AppStatsStore', { /*{{{*/

	extend: 'Ext.data.Store'
	,model: 'AppStatsModel'
	,alias: 'AppStatsStore'

	});/*}}}*/

Ext.define('AppMsgsStore', { /*{{{*/

	extend: 'Ext.data.Store'
	,model: 'AppMsgsModel'
	,alias: 'AppMsgsStore'

});/*}}}*/

Ext.define('AppMsgsGrid', {/*{{{*/

	syncSize: true,
	columns: [
			{ header: "Tipo", width: 120, dataIndex: 'type', sortable: false },
			{ header: "Nivel", width: 180, dataIndex: 'level', sortable: false, hidden:true },
			{ header: "Archivo", width: 115, dataIndex: 'file', sortable: false, hidden: true },
			{ header: "Linea", width: 100, dataIndex: 'line', sortable: false, hidden: true },
			{ header: "Texto", width: 100, dataIndex: '', sortable: false }]

	}); /*}}}*/

Ext.define('AppTreeMenuStore', {/*{{{*/

	extend: 'Ext.data.TreeStore',
	storeId: 'AppTreeMenuStore',
	autoLoad: true,
	proxy: {
		type: 'ajax',
		url: '?v=xml&amp;a=menu&amp;v=ext4new/menu-js',
		async: false,
		reader: {
			type: 'json',
			method: 'POST'
		}
	},
	root: {
		expanded: true,
		text: "Organization",
		leaf: 'false',
		id: '/',
	}
});/*}}}*/

Ext.define('AppTreeMenu', {/*{{{*/

	extend: 'Ext.tree.Panel',
	alias: 'widget.treemenu',
	// xtype: 'treemenu',

	store: Ext.create('AppTreeMenuStore'),

	rowHeight:1
	,layout:'fit'
	,autoScroll:true
	,useArrows:true
	,title:'Menú Principal'

	,nodeType: 'async'
	,rootVisible: false 

	,border:false
	,defaultTools:false
	,sort:false
	,bodyStyle:'padding:5px'
	,singleExpand:true
	,collapsible: true
	,stateful: true
	,height:240
	,id:'detail'
	,border:false
	,bodyStyle:'padding:4px'
	,title:'Ayuda'
	,autoScroll:true

	,detailEl: null
	,currentEx: null
	,normalized: false

	,debug: true

	,listeners: {

		render: { fn:function() {

			this.getRootNode().expand();
			this.showDetail('home');

			}
		}

		,load: { fn:function( node ) {

			// consoleDebugFn( this );

			var normalized = this.normalized ? '': '&UNNORMALIZED=1';

			if ( App.user_node == undefined && App.user.user_username && ! App.user._anon ) {

				return;

				App.user_node = this.getNodeById('user');
				App.user_node && App.user_node.setText( App.user_node.text + ' <b>' + App.user.user_username + '</b>' );

				Ext.Loader.loadScript( { url:App.feat.defaultSrc + '&v=ext4new/loader' + normalized } );
			}
		}}

		,itemclick: {

			stopEvent:true, 

			fn:function( panel, record, item, index, e, eOpts ) {

				if ( App.getModifiedStores && App.getModifiedStores().length ) {

					App.showSaveChanges();
					return;
				}

				e.stopEvent();

				// handle detail

				var id = record.get('id');

				if( id && Ext.fly( 'detail-' + id ) )
					showDetail(id);

				else {
					if ( record.parentNode ) {

						var parentNodeId;

						if ( parentNodeId = record.parentNode.get('id') )

							this.showDetail( parentNodeId );

					} 


				}

				var href = record.get('href');

				if( href ) {

					if ( href.substring(0,11) == 'javascript:' ) {

						eval( href );

					} else {

						var src = href;
						var layout = Ext.getCmp('xpApp_layout');

						Ext.Loader.loadScript( { url: src + '&v=ext4new/loader&UNNORMALIZED=1' } );
					}
				}

				// handle text click (toggle collapsed)
				record.isLeaf() || record.expand();
			}
		}
	}

	,showDetail:function(ex) {

		this.debug && console.error('no hay detail para el div_id: '+ ex );

		if ( ! this.detailEl )
			this.detailEl = Ext.getCmp('detail').body.createChild({tag:'div'});

		Ext.state.Manager.set('ex', ex);

		if (ex !== this.currentEx ) {
			var detailSrc = Ext.getDom('detail-' + ex);

			if ( detailSrc ) {
				this.detailEl.hide().update(detailSrc.innerHTML).slideIn('t');
				this.currentEx = ex;
			}
		}
	}

});/*}}}*/

Ext.define('AppExportWindow', {/*{{{*/

	extend: 'Ext.window.Window',
	title: 'Exportar Objetos',
	width: 500,
	// height:300,
	constrain: true,
	minWidth: 300,
	minHeight: 100,
	layout: 'fit',
	plain:true,
	bodyStyle:'padding:5px;',
	buttonAlign:'center',
	closeAction: 'hide',
	toolbar: null,

	items: [{

		xtype: 'form',
		baseCls: 'x-plain',
		labelWidth: 55,
		defaultType: 'textfield',

		items: [{

		    xtype: 'combo',
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
		    selectOnFocus:true

		}]
	    }],

	listeners: {

		show: {

			fn: function( w ) { 

				var total_count = w.toolbar.store.getTotalCount(),
				max_records = this.down('form').getForm().findField('max_records');
				max_records.emptyText = ( total_count > 10000 ) ? 'Redefina la busqueda, demasiados registros (' + total_count + ')' : 'Seleccionar la cantidad de registros a exportar';
				max_records.applyEmptyText();
				max_records.setValue( ( total_count > 10000 ) ? null : total_count );
			}
		}
	},

	buttons: [{

	    text: 'Exportar',
	    listeners: { click: { fn: function() {  

		var win = this.up('window');
		var store = win.toolbar.store;
		var q_params = {};

		alert( 'falta ajustar parametros' ); return;

		Ext.apply( q_params, store.get_foreign_key() );

		// de xpStore.js	

		// Search (global search)
		if ( store.baseParams.query && store.baseParams.fields ) {

			var vars = eval(store.baseParams.fields).join(App.feat.key_delimiter);

			var params = {};
			params['s[' + store.class_name +']['+ vars +']'] = store.baseParams.query;

			Ext.apply( q_params, params );

		}

		if ( store.lastOptions )
			Ext.apply( q_params, store.lastOptions.params );

		var display_only_fields = [];

		Ext.each( getColumnModel().config, function( f ) {

			f.hidden || display_only_fields.push( f.name );
		});

		var limit = win.down('form').getForm().findField('max_records').getValue();

		Ext.apply( q_params, { m: this.class_name, 
			v: 'csv', 
			'f[ignore_null_fields]': 0, 
			'f[include_dataset]': 2, // DS_NORMALIZED
			'g[start]': 0,
			'g[limit]': limit,
			'f[display_only]': display_only_fields.join(',')
		});

		// alert( 'exportando la URL: ' + Ext.urlEncode( q_params ) );

		window.open ("?" + Ext.urlEncode( q_params ), "BrowserExportWindow" ); 
		win.hide(); 

		}, buffer: 200 }}
	},{
	    text: 'Cancelar',
	    handler: function() { 
		this.up('window').hide(); 
	}
	}]
    });/*}}}*/

Ext.define('AppChangePasswordPanel', { /*{{{*/

	extend: 'Ext.form.Panel',
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

                handler:function( a, b, c ){ 

                    this.getForm().submit({ 
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
                                obj = Ext.decode(action.response.responseText); 
                                Ext.Msg.alert('Fallo la autorizacion', obj.errors.reason); 
                            }else{ 
				if ( ! ( reason = action.response.responseText)  ) reason = 'Servidor fuera de linea, por favor reingrese en unos minutos ...';
                                Ext.Msg.alert('Mensaje', 'No puedo conectarme con el servidor: ' + reason); 
                            } 
                            this.getForm().reset(); 
                        } 
                    }); 
                } 
            },{

		text:'Cancelar',
		handler:function(){ this.hide();}

	    }] 
    });/*}}}*/

Ext.define('ChangePasswordWindow', {/*{{{*/

	extend: 'Ext.Window',
	layout:'fit',
	width:300,
	height:150,
	constrain: true,
	closable: false,
	resizable: false,
	plain: true,
	border: false,
	items: ['AppChangePasswordPanel']

});/*}}}*/

Ext.define( 'Ux.xpotronix.xpApp', {

	mixins: { observable: 'Ext.util.Observable' },

	name: 			'xpApp',
	alias: 			'xpApp',

	fake_dirty_records:	[],
	prevent_reload:		false, // on windows login
	debug:			false,

	constructor: function( config ) {/*{{{*/

		var version = '4.2.1';

		// this.check_ext_version( version );

		Ext.apply( this, config );

		this.mixins.observable.constructor.call(this, config);

		Ext.SSL_SECURE_URL = '/ext/resources/images/vista/s.gif';
		Ext.BLANK_IMAGE_URL = '/ext/resources/images/vista/s.gif';

		Ext.tip.QuickTipManager.init();

		this.init_state_manager();
 
		// Ext.Ajax.timeout = 600000;

		this.session = null;	

		this.obj = new Ext.util.MixedCollection(false);
		this.obj.getKey = function(o){ return o.class_name; }

		this.store = Ext.StoreMgr;

		this.conn_process   = new Ext.data.Connection();
		this.conn_process.on( 'requestcomplete', this.on_complete, this );
		this.conn_process.on( 'requestexception', this.on_complete_exception , this );

		this.response = { status: null, changes: [], messages: [] };

		this.panel = {

			status: {

				store: 'AppStatsStore'
				,grid: 'AppStatsGrid'
				,window: null
			},

			messages: {

				store: 'AppMsgsStore'
				,grid: 'AppMsgsGrid' 
				,window: null

			},

			login: {
				window: null,
				process: 'login'
			},

			password: {
				window: null,
				process: 'change_password'
			}

		};

		this.window_onbeforeunload();

	},/*}}}*/

	/* init */

	init_state_manager: function() {/*{{{*/

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

	},/*}}}*/

	check_ext_version: function( version ) {/*{{{*/

		if ( Ext.version != version )
			console.error( 'Atención: la versión requerida de la librería ExtJs es la '
				+ version + ': la versión provista es la ' 
				+ Ext.version );

	},/*}}}*/

	window_onbeforeunload: function() {/*{{{*/

		window.onbeforeunload = function() {

			if ( this.getModifiedStores && this.getModifiedStores().length ) 
				return 'Hay cambios que no han sido guardados todavía. Si presiona [Aceptar], perderá los cambios. Si presiona [Cancelar], presione el botón de [Guardar] y luego cierre la página';
			};
	},/*}}}*/

	reconfigure: function( config ) {/*{{{*/

		config && Ext.apply( this, config );
	},/*}}}*/

	start: function() {/*{{{*/

	},/*}}}*/ 

	close_stores: function() {/*{{{*/

		this.store.each( function(s) { 
			s.destroy(); 
			delete s;
		});

	
	},/*}}}*/ 

	close_objs: function() {/*{{{*/

		this.obj.each( function(o) { 
			o.destroy();
			this.obj.remove(o);
			delete o;
		}, this );
	
	},/*}}}*/ 

	accessible: function( arr ) {/*{{{*/

		var ret = [];

		Ext.each( arr, function( a ) { 

			// DEBUG: poner accesos en acl en juscaba2
			( a.acl.access || this.config.application == 'juscaba2' ) && 
				ret.push( a ); 
		}, this );

		return ret;
	},/*}}}*/

	/* store changes handling */

	getModifiedStores: function() {/*{{{ */

		var list = [];

		this.store.each( function( s, a, b ) {

			if ( s.dirty && ! Ext.isEmptyObject( s.dirty() ) )

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

					o.store.markModifiedRecordChain( r, this.fake_dirty_records );

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

		return this.store.lookup( this.feat.root_obj ).serialize();

	},//}}}

	save: function() {/*{{{*/

		App.process_request({m:App.feat.module,a:'process',p:'store',b:'ext4',x:App.serialize()});

	},/*}}}*/

 	process_request: function( p, callback ) {/*{{{*/

		this.showPleaseWait( 'Ejecutando la acción ... Aguarde', 'Procesando ...' );

		var url = { m: p.m, a: p.a };
		delete( p.m );
		delete( p.a );

		if ( p.p ) {
			Ext.apply( url, { p: p.p } );
			delete( p.p );
		}

            	this.conn_process.request({ method: 'POST', url: '?' + Ext.urlEncode( url ), params: p, success: callback });

	}, /*}}}*/

	/* transact response handlers */

	parse_response: function( param ) {/*{{{*/

		var q = Ext.DomQuery, ns = 'xpotronix|messages';

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

		this.response.status 	= q.selectValue( ns + "/status/@value", param.responseXML );
		this.response.messages 	= q.selectNode( ns + "/messages", param.responseXML );
		this.response.changes 	= q.select( ns + "/changes/*", param.responseXML );

		this.handle_messages( param );
		this.handle_status( param );

		return true;

	}, /*}}}*/

	handle_messages: function( param ) {/*{{{*/

		var ms = this.panel.messages.store;

		if ( typeof ms == 'string' )
			ms = Ext.create( ms );

		ms.loadRawData( this.response.messages );
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

	handle_status: function( param ) {/*{{{*/

		var ms = this.panel.status.store;

		if ( typeof ms == 'string' )
			ms = Ext.create( ms );

		ms.proxy.reader.readRecords( param.responseXML );
			
	},/*}}}*/

	update_model: function( param ) {/*{{{*/

		var ms = [];

		Ext.each( this.response.changes, function( e ) { 

			var s;

			if ( s = this.store.lookup( e.nodeName ) ) 
				ms[s.class_name] = { store: s, response: s.update_model( e ) };

		}, this );

		/* todos los stores modificados, se fija si tiene un child 'parent' y lo recarga */

		for ( var sn in ms ) {

			var ss = ms[sn];

			if ( Ext.isObject( ss ) && ( ss.response == 'u' || ss.response == 'i' || ss.response == 'd' ) ) {

				ss.store.fireEvent( 'serverstoreupdate', ss.store );
				ss.store.childs.each( function( ch ) {
					if ( ch.foreign_key_type == 'parent' )
						ch.load();
				});			

			}
		}

	},/*}}}*/

	on_complete: function( sender, param ) { // Callback called on response/*{{{*/

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

	login: function( prevent_reload ) {/*{{{*/

		this.prevent_reload = prevent_reload;

		if ( !this.panel.login.window ) 
			this.panel.login.window = this.login_window();

		this.panel.login.window.show();


	},/*}}}*/

	handle_login: function( form, action ) {/*{{{*/

		try {

			obj = Ext.decode(action.response.responseText); 

		} catch ( ex ) {

			obj = null;

		}

		if ( ! obj ) {

			if ( action.failureType == 'server' ){ 

				obj = Ext.decode(action.response.responseText); 

			} else { 

				if ( ! ( reason = action.response.responseText)  ) reason = 'Servidor fuera de linea, por favor reingrese en unos minutos ...';
				Ext.Msg.alert('Mensaje', 'No puedo conectarme con el servidor: ' + reason); 
			} 

			// login.getForm().reset(); 

		} else if ( obj.success ) {

			this.panel.login.window.hide();

			if ( ! this.prevent_reload ) {
				Ext.Msg.show({
					id: 'win_ingresando',
					msg : form.title,
					progressText: 'Ingresando, aguarde por favor ...',
					width :300,
					wait :true,
					buttons: Ext.Msg.CANCEL,
					waitConfig : { interval: 200 }
				});

				this.reload_app();
			}

		} else if ( ! obj.success ) {

			Ext.Msg.alert('Fallo la autorizacion', obj.errors.reason); 

		} else {

			Ext.Msg.alert('Respuesta del servidor inesperada. No se puede continuar, consulte con el administrador de la aplicación.'); 
		}
	},/*}}}*/

	reload_app: function() {/*{{{*/

		var target = ( window.parent ) ? window.parent.location : window.location;

		if ( this.feat.login_location )
			if ( window.parent ) 
				window.parent.location = this.feat.login_location;
			else 
				window.location = this.feat.login_location;
		else
			if ( window.parent )	
				window.parent.location.reload();
			else
				window.location.reload();
	},/*}}}*/

	logout: function() {/*{{{*/

	    conn = new Ext.data.Connection();

	    conn.on( 'requestcomplete', function() { 

		alert('Presione [Aceptar] para salir de la aplicación');
		window.location.reload();}, 

		this );

            conn.request({ method: 'POST', url: '?' + Ext.urlEncode( { a: 'logout' } ) });

	},/*}}}*/

	/* user ui */

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

	showSaveChanges: function() {//{{{
		var me = this;
		Ext.Msg.show({
			msg :'Hay cambios sin guardar. Desea guardar los cambios?',
			width :300,
			buttons: Ext.Msg.YESNOCANCEL,
			scope: me,
			fn: function( btn ) {
				( btn == 'yes' ) && me.save();
			}
		});
	},//}}}

	 hidePleaseWait: function() {//{{{

		Ext.Msg.hide();

	},//}}}

	hideSaveChanges: function() {//{{{
		Ext.Msg.hide();
	},//}}}

	login_window: function() {/*{{{*/

		var me = this;

		var doLoginForm = function(){ 

			var form = login.getForm();

			if ( !form.isValid() )
				return;

			form.submit({ 
				method:'POST', 
				waitTitle:'Conectando', 
				waitMsg:'Enviando datos, aguarde ...',
				scope: me,
				success: me.handle_login,
				failure: me.handle_login
			}); 
		};

		var base_url = (this.feat.base_url == undefined) ? '' : this.feat.base_url;

		var login = new Ext.FormPanel({ 
		
			labelWidth:80,
			url: base_url + '?m=users&amp;a=login&amp;v=json', 
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

			var map = new Ext.util.KeyMap({
				target: this,
				key : [10, 13],
				scope : this,
				fn: doLoginForm
			});
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

	change_password: function() {/*{{{*/

		if ( ! this.panel.password.window )
			this.panel.password.window = Ext.create('ChangePasswordWindow');

		this.panel.password.window.show();

	},/*}}}*/

	showTips: function() {/*{{{*/

		// DEBUG: esto fue hecho en 10 minutos hay que hacer uno mejor !! 
		var randomnumber = Math.floor(Math.random() * 7);

		var tip = Ext.getDom('tip-' + randomnumber);

		tip && Ext.MessageBox.show({
			title: App.feat.page_title,
			msg: '<center><b>Sugerencia del sistema:</b>' + tip.innerHTML + '</center>',
			width: 300,
			buttons: Ext.Msg.OK
		});
	},/*}}}*/

	get_feat: function( key, obj ) {/*{{{*/

		return ( obj && obj.feat[key] !== undefined ) ? obj.feat[key] : this.feat[key];

	}/*}}}*/

}); // extend

// vim600: fdm=marker sw=3 ts=8 ai:
