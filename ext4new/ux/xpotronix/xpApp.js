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

Ext.define('AppTreeMenuModel', {/*{{{*/

	extend: 'Ext.data.Model',

	fields: [

		{name: 'itemId'},
		{name: 'text'},
		{name: 'module'},
		{name: 'extra'},
		{name: 'tabId'}
	],

	proxy: {
		type: 'ajax',
		url: '?v=xml&amp;a=menu&amp;v=ext4new/menu-js',
		async: false,
		reader: {
			type: 'json',
			method: 'POST'
		}
	}

});/*}}}*/

Ext.define('AppTreeMenuStore', {/*{{{*/

	model: 'AppTreeMenuModel',
	extend: 'Ext.data.TreeStore',
	storeId: 'AppTreeMenuStore',
	autoLoad: true,

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
	/* ,layout:'fit' */
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
	,border:false
	,title:'Ayuda'
	,autoScroll:true

	,detailEl: null
	,currentEx: null
	,normalized: false

	,lastSelection: null

	,debug: false 

	,listeners: {

		render: { fn:function() {

			this.up('panel').setTitle( App.feat.page_title );

			this.getRootNode().expand();
			this.showDetail('home');

			}
		}

		,load: { fn:function( node ) {

			/* carga el arbol del menu */

			/* consoleDebugFn( this ); */

			/* agrega el nombre de usuario al final del menu */

			if ( App.user_node == undefined && App.user.user_username && ! App.user._anon ) {

				if ( App.user_node = this.store.getRootNode().findChild('itemId', "user", true) ) {

					App.user_node.data.text += ' <b>' + App.user.user_username + '</b>';

				}
			}
		}}

		,itemclick: {

			stopEvent:true, 

			fn:function( panel, record, item, index, e, eOpts ) {

				/* alerta de modificaciones */

				if ( record.raw.disabled ) return;

				if ( App.getModifiedStores && App.getModifiedStores().length ) {

					App.showSaveChanges();
					return;
				}

				record.raw.disabled = true;

				e.stopEvent();

				/* no es hoja, expande */

				if ( ! record.isLeaf() ) {
					record.expand();
					return;
				}

				var n = record.getData();

				/* Id del nodo */

				/* debugger; */

				if( n.itemId ) {

					Ext.fly( 'detail-' + n.itemId ) &&
					this.showDetail(n.itemId);

				} else {

					/* despliega parent */
					if ( record.parentNode ) {
						var parentNodeId;
						if ( parentNodeId = record.parentNode.get('itemId') )
							this.showDetail( parentNodeId );
					}

					if ( n.href ) {

						/* hot fix para los items que no tengan definido m= */
						n.itemId = n.href.substring(3);
						console.log( 'item sin parametro "m" definido' );

					} else {

						console.error( 'faltan atributos validos para el item' );
					}

					console.log( n );
				}

				if( n.href ) {

					if ( n.href.substring(0,11) == 'javascript:' ) {
						eval( n.href );

					} else {

						/* busca entre los paneles del tab */

						var tabPanel = this.up('viewport').down('tabpanel'),
						panel;

						if ( panel = tabPanel.getComponent( n.tabId ) ) {
							tabPanel.setActiveTab( panel );
						
						} else {
						
							/* si no lo encuentra carga el panel */
							this.loadModule( record, n.href, tabPanel );
					
						}
					}
				}
			}
		}
	}

	,loadModule:function( record, href, tabPanel ) {
	
		/* marca la seleccion al record actual */

		tabPanel.lastSelection = record;

		var url = href + '&v=ext4new/loader&UNNORMALIZED';

		Ext.Loader.loadScript({ 
			scope:tabPanel,
			url: url, 
			onLoad:function() {
				console.log('cargado modulo desde URL: ' + url );
				record.raw.disabled = false;
			},
			onError:function(a,b,c){

				alert( 'hubo un error al procesar el requerimiento' );
				record.raw.disabled = false;

			}
		});
	}

	,showDetail:function(ex) {


		this.debug && console.log('no hay detail para el div_id: '+ ex );

		return;

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

Ext.define('AppTabMenu', {/*{{{*/

	extend: 'Ext.tab.Panel'
	,alias: 'widget.tabmenu'

	// xtype: 'tabmenu',

	,debug: false

	,listeners: {

		tabchange: {

			fn: function(tabPanel, newTab, oldTab, eOpts) {

				/* ajusta la seleccion del menu cuando se hace clik en los tabs */

				var tm = tabPanel.up('viewport').down('treemenu'),
				record = tm.store.getRootNode().findChild('itemId',newTab.itemId,true),
				tmSelModel = tm.getSelectionModel(),
				currentRecord = tmSelModel.getSelection().pop();

				if (currentRecord) {

					if ( record ) {

						if ( record.id != currentRecord ) {

							record.parentNode.expand();
							tmSelModel.select(record);

							var pNode = record.parentNode;

							while(pNode) {
								pNode.expand();
								pNode = pNode.parentNode;
							}
						}

					} else {

						tmSelModel.deselect();

					}
				}
			}
		}
	} 

	,add: function( panel ) {

		return this.callParent(arguments);
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
	/*layout: 'fit',*/
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
		    store: { xtype: 'store.array',
				fields: ['id', 'label'],
				data : [ [1000,'1000'], [10000,'10000']]},
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
		var toolbar = win.toolbar;
		var panel = toolbar.panel;

		var store = win.toolbar.store;

		/* foregin keys */
		var q_params = store.get_foreign_key();

		var display_only_fields = [];

		Ext.each( panel.columns, function( f ) {

			f.hidden || display_only_fields.push( f.name );
		});

		var limit = win.down('form').getForm().findField('max_records').getValue();

		Ext.apply( q_params, { 
			m: panel.store.module,
			r: panel.store.class_name, 
			a: 'csv',
			'f[ignore_null_fields]': 0, 
			'f[include_dataset]': 2, // DS_NORMALIZED
			'g[start]': 0,
			'g[limit]': limit,
			'f[display_only]': display_only_fields.join(',')
		});

		console.log( 'exportando la URL: ' + Ext.urlEncode( q_params ) );

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

Ext.define('ChangePasswordWindow', {/*{{{*/

	extend: 'Ext.Window',
	alias: 'widget.passwordpanel',
	/*layout:'fit',*/
        title:'Cambiar Contraseña', 
	constrain: true,
	closable: false,
	resizable: false,
	plain: true,
	border: false,

	items:[{ 

		xtype: 'form',
		labelWidth:80,
		bodyStyle: 'padding:6px',
		url:'?m=users&a=change_password&v=json', 
		frame:true, 
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

				var form = this.up('form').getForm();

				form.submit({ 

					method:'POST', 
					waitTitle:'Conectando', 
					waitMsg:'Enviando datos, aguarde ...',

					success:function( form ){ 

						form.owner.up().hide();
						Ext.Msg.show({
							msg : 'El cambio de su clave ha sido satisfactorio',
							width :300,
							wait :true,
							buttons: Ext.Msg.OK,
							waitConfig: { interval:200 }
						});
					},

					failure:function(form, action){ 

						if ( action.failureType == 'server'){ 

							var obj = Ext.decode(action.response.responseText); 
							Ext.Msg.alert('Fallo la autorizacion', obj.errors.reason); 

						} else { 

							if ( ! ( reason = action.response.responseText)  ) reason = 'Servidor fuera de linea, por favor reingrese en unos minutos ...';
							Ext.Msg.alert('Mensaje', 'No puedo conectarme con el servidor: ' + reason); 
						}

						form.reset(); 
					} 
				}); 
			} 
		    },{

			text:'Cancelar',
			handler:function(){ 
				this.up('form').up().hide();
			}

		    }] 
    		}]

	});/*}}}*/

Ext.define('LoginWindow', {/*{{{*/

	extend: 'Ext.Window',
	alias: 'widget.loginwindow',

	constrain: true,
	closable: false,
	resizable: false,
	plain: true,
	border: false,
	defaultButton: 'loginUsername', // quien recibe el foco
	baase_url: null,

	initComponent: function( config ) {

		var me = this;

		Ext.applyIf( me, { 
			title: 'Ingreso a '+ App.feat.page_title,
			base_url: (App.feat.base_url == undefined) ? '' : App.feat.base_url,
		});

		return this.callParent();
	},

	doLoginForm:function() { /*{{{*/

		var form = this.down('form').getForm();

		if ( !form.isValid() )
			return;

		form.submit({ 
			url: this.base_url + '?m=users&amp;a=login&amp;v=json', 
			method:'POST', 
			waitTitle:'Ingresando', 
			waitMsg:'Aguarde por favor ...',
			success: this.handle_login,
			failure: this.handle_login
		}); 
	},/*}}}*/

	handle_login: function( form, action ) {/*{{{*/

		var obj;

		try {

			obj = Ext.decode(action.response.responseText); 

		} catch ( ex ) {

			obj = null;

		}

		if ( obj == null ) {

			if ( action.failureType == 'server' ){ 

				obj = Ext.decode(action.response.responseText); 

			} else { 

				if ( ! ( reason = action.response.responseText)  ) reason = 'Servidor fuera de linea, por favor reingrese en unos minutos ...';
				Ext.Msg.alert('Mensaje', 'No puedo conectarme con el servidor: ' + reason); 
			} 

			// login.getForm().reset(); 

		} else if ( obj.success ) {

			this.form.owner.up().hide();

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

				App.reload_app();
			}

		} else if ( ! obj.success ) {

			Ext.Msg.alert('Fallo la autorizacion', obj.errors.reason); 

		} else {

			Ext.Msg.alert('Respuesta del servidor inesperada. No se puede continuar, consulte con el administrador de la aplicación.'); 
		}
	},/*}}}*/

	listeners: {
	
		render: function() {

			var map = new Ext.util.KeyMap({
				target: this,
				key : [10, 13],
				scope : this,
				fn: this.doLoginForm
			});
		}
	},

	items:[{ 

		xtype: 'form',
		layout:'anchor',
		/* labelWidth:80, */
		defaults: {labelWidth:50},
		bodyStyle: 'padding:6px',
		frame:true, 
		defaultType:'textfield',
		monitorValid:true,

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
				handler: function() { 
					this.up('form').up().doLoginForm();
				}
			},{
				text:'Cancelar',
				handler:function(){ 
					this.up('form').up().hide();
				}
			}]

 
    		}]

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

		// Ext.tip.QuickTipManager.init();

		this.init_state_manager();
 
		// Ext.Ajax.timeout = 600000;

		this.session = null;	

		this.obj = new Ext.util.MixedCollection(false);
		this.obj.getKey = function(o){ return o.class_name; }

		this.store = Ext.data.StoreManager;
		// this.store = Ux.xpotronix.StoreManager;

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

			Ext.state.Manager.setProvider(Ext.create('Ext.ux.state.HttpProvider', {
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

			Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider',{}));

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

 	process_request: function( p, callback ) {/*{{{*/

		this.showPleaseWait( 'Ejecutando la acción ... Aguarde', 'Procesando ...' );

		var module = p.m;
		var url = { m: p.m, a: p.a };
		delete( p.m );
		delete( p.a );

		if ( p.p ) {
			Ext.apply( url, { p: p.p } );
			delete( p.p );
		}

            	this.conn_process.request({ method: 'POST', module: module, url: '?' + Ext.urlEncode( url ), params: p, success: callback });

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

		var module = param.request.options.module; 

		Ext.each( this.response.changes, function( e ) { 

			var s;

			if ( s = this.store.lookup( module + '.' + e.nodeName ) ) 
				ms[s.class_name] = { 
					store: s, 
					response: s.update_model( e ) 
				};

		}, this );

		/* todos los stores modificados, se fija si tiene un child 'parent' y lo recarga */

		for ( var sn in ms ) {

			var ss = ms[sn];

			if ( Ext.isObject( ss ) && ( ss.response == 'u' || ss.response == 'i' || ss.response == 'd' ) ) {

				ss.store.fireEvent( 'serverstoreupdate', ss.store );

				ss.store.childs.each( function( ch ) {

					if ( ch.foreign_key.type == 'parent' )
						ch.load();
				});			

			}
		}

	},/*}}}*/

	on_complete: function( sender, param ) { // Callback called on response/*{{{*/

		this.hidePleaseWait();
		this.parse_response( param ) && this.update_model( param );

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
			this.panel.login.window = Ext.create('LoginWindow');

		this.panel.login.window.show();

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

	accessible: function( arr ) {/*{{{*/

		var ret = [];

		Ext.each( arr, function( a ) { 

			// DEBUG: poner accesos en acl en juscaba2
			( a.acl.access || this.feat.application == 'juscaba2' ) && 
				ret.push( a ); 
		}, this );

		return ret;
	},/*}}}*/

	showPleaseWait: function( msg, progressText ) {/*{{{*/

		Ext.Msg.show({
			msg : msg,
			icon: Ext.MessageBox.INFO,
			progressText: progressText,
			width :400,
			wait :true,
			buttons: Ext.Msg.CANCEL,
			waitConfig : { interval :200 }
			});
	},/*}}}*/

	showSaveChanges: function() {/*{{{*/
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
	},/*}}}*/

	 hidePleaseWait: function() {/*{{{*/

		Ext.Msg.hide();

	},/*}}}*/

	hideSaveChanges: function() {/*{{{*/
		Ext.Msg.hide();
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
