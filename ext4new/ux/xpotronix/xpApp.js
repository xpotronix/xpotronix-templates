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

	extend: 'Ext.data.Model',

	proxy: { type: 'memory',
			reader: {
				type: 'xml',
				record: 'changes',
			}
		},

	fields: [{name: 'value', mapping: '@value'}]

});/*}}}*/

Ext.define('AppMsgsModel', {/*{{{*/

	extend: 'Ext.data.Model',
	proxy: { type: 'memory',
		reader: {
			type: 'xml',
			root: 'messages',
			record: 'message'
		}
	},
	fields: [
		{name: 'type', mapping: '@type'},
		{name: 'level', mapping: '@level'},
		{name: 'file', mapping: '@file'},
		{name: 'line', mapping: '@line'},
		{name: '', mapping: ''}
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
	autoLoad: false,

	root: {
		expanded: false,
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
	,useArrows:true

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
	,title:'Ayuda'
	,autoScroll:true

	,detailEl: null
	,currentEx: null
	,normalized: false

	,lastSelection: null

	,debug: false 

	,initComponent: function( config ) {

		let me = this;

		/* me.store.on( 'load', s => console.log( s ) ); */

		return me.callParent();
	}


	,listeners: {

		render: { fn:function() {

			let me = this;

			me.up('panel').setTitle( App.feat.page_title );

			me.getRootNode().expand();
			me.showDetail('home');

			}
		}

		,load: { fn:function( node ) {

			let me = this;

			/* carga el arbol del menu */

			/* consoleDebugFn( me ); */

			/* agrega el nombre de usuario al final del menu */

			if ( App.user_node == undefined && App.user.user_username && ! App.user._anon ) {

				if ( ( App.user_node = me.store.getRootNode().findChild('itemId', 'current_user', true) ) != null ) {

					App.user_node.data.text += ' <b>' + App.user.user_username + '</b>';

				}
			}
		}}

		,itemclick: {

			stopEvent:true, 

			fn:function( panel, record, item, index, e, eOpts ) {

				let me = this;

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

				let n = record.getData();

				/* Id del nodo */

				/* debugger; */

				if( n.itemId ) {

					if ( Ext.fly( 'detail-' + n.itemId ) )
						me.showDetail(n.itemId);

				} else {

					/* despliega parent */
					if ( record.parentNode ) {
						let parentNodeId;
						if ( ( parentNodeId = record.parentNode.get('itemId') ) != null )
							me.showDetail( parentNodeId );
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

						let tabPanel = me.up('viewport').down('tabpanel');

						if ( ( panel = tabPanel.getComponent( n.tabId ) ) != null ) {
							tabPanel.setActiveTab( panel );
						
						} else {
						
							/* si no lo encuentra carga el panel */
							me.loadModule( record, n.href, tabPanel );
					
						}
					}
				}
			}
		}
	}

	,loadModule:function( record, href, tabPanel ) {
	
		/* marca la seleccion al record actual */

		tabPanel.lastSelection = record;

		let url = href + '&v=ext4new/loader&UNNORMALIZED';

		Ext.Loader.loadScript({ 
			scope:tabPanel,
			url: url, 
			onLoad:function() {
				console.log('cargado modulo desde URL: ' + url );
				record.raw.disabled = false;
			},
			onError:function(msg){

				Ext.Msg.show({
					title: 'Atención',
					icon: Ext.Msg.ERROR,
					width: 400,
					buttons: Ext.Msg.OK,
					msg: '<strong>No pude conectarme con el servidor, consulte con el administrador de la aplicación.</strong><br/>Mensaje recibido: ' + msg
				});	


				record.raw.disabled = false;

			}
		});
	}

	,showDetail:function(ex) {

		let me = this;

		if ( me.debug ) 
			console.log('no hay detail para el div_id: '+ ex );

		return;

		/*
		if ( ! me.detailEl )
			me.detailEl = Ext.getCmp('detail').body.createChild({tag:'div'});

		Ext.state.Manager.set('ex', ex);

		if (ex !== me.currentEx ) {
			let detailSrc = Ext.getDom('detail-' + ex);

			if ( detailSrc ) {
				me.detailEl.hide().update(detailSrc.innerHTML).slideIn('t');
				me.currentEx = ex;
			}
		}
		*/
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

				let tm = tabPanel.up('viewport').down('treemenu'),
				record = tm.store.getRootNode().findChild('itemId',newTab.itemId,true),
				tmSelModel = tm.getSelectionModel(),
				currentRecord = tmSelModel.getSelection().pop();

				if (currentRecord) {

					if ( record ) {

						if ( record.id != currentRecord ) {

							record.parentNode.expand();
							tmSelModel.select(record);

							let pNode = record.parentNode;

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

				let total_count = w.toolbar.store.getTotalCount(),
				max_records = this.down('form').getForm().findField('max_records');
				max_records.emptyText = ( total_count > 10000 ) ? 'Redefina la busqueda, demasiados registros (' + total_count + ')' : 'Seleccionar la cantidad de registros a exportar';
				max_records.applyEmptyText();
				max_records.setValue( ( total_count > 10000 ) ? null : total_count );
			}
		}
	},

	buttons: [{

	    text: 'Exportar',
	    listeners: { 
			click: { 
				fn: function() {  

					let win = this.up('window'),
					toolbar = win.toolbar,
					panel = toolbar.panel,
					display_only_fields = [],
					store = win.toolbar.store,
					q_params = store.get_foreign_key(),
					limit = win.down('form').getForm().findField('max_records').getValue(),
					filters = store.get_filters_values();

					Ext.each( panel.columns, function( f ) {
						if ( ! f.hidden ) 
							display_only_fields.push( f.name );
					});

					Ext.apply( q_params, {
						b: 'ext4',
						m: panel.store.module,
						r: panel.store.class_name, 
						a: 'csv',
						filter: JSON.stringify(filters),
						'f[row_count]': limit,
						'f[display_only]': display_only_fields.join(',')
					});

					console.log( 'exportando la URL: ' + Ext.urlEncode( q_params ) );

					window.open ("?" + Ext.urlEncode( q_params ), "BrowserExportWindow" ); 
					win.hide(); 

					}, buffer: 200 
				}
			}
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

				let form = this.up('form').getForm();

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

							let obj = Ext.decode(action.response.responseText); 
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

	layout:'border',
	height:200,
	width:380,
	plain: true,
	defaultButton: 'Ingresar', // quien recibe el foco
	baase_url: null,

	initComponent: function( config ) {

		let me = this;

		Ext.applyIf( me, { 
			title: 'Ingreso a '+ App.feat.page_title,
			base_url: (App.feat.base_url == undefined) ? '' : App.feat.base_url,
		});

		return this.callParent();
	},

	doLoginForm:function() { /*{{{*/

		let me = this, 
			form = me.down('form').getForm();

		if ( !form.isValid() )
			return;

		form.submit({ 
			url: me.base_url + '?m=users&amp;a=login&amp;v=json', 
			method:'POST', 
			waitTitle:'Ingresando', 
			waitMsg:'Aguarde por favor ...',
			success: me.handle_login,
			failure: me.handle_login
		}); 
	},/*}}}*/

	handle_login: function( form, action ) {/*{{{*/

		let me = this, obj;

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

			me.form.owner.up().hide();

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

			let me = this, 
				map = new Ext.util.KeyMap({
				target: me.getEl(),
				key : [10, 13],
				scope : me,
				fn: me.doLoginForm
			});
		}
	},

	items:[{ 

		xtype: 'form',
		layout:'anchor',
		region:'center',
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

		let me = this;

		let version = '4.2.1';

		// me.check_ext_version( version );

		Ext.apply( me, config );

		me.mixins.observable.constructor.call(me, config);

		Ext.SSL_SECURE_URL = '/ext/resources/images/vista/s.gif';
		Ext.BLANK_IMAGE_URL = '/ext/resources/images/vista/s.gif';

		// Ext.tip.QuickTipManager.init();

		me.init_state_manager();
 
		// Ext.Ajax.timeout = 600000;

		me.session = null;	

		me.obj = new Ext.util.MixedCollection(false);
		me.obj.getKey = function(o){ return o.class_name; };

		me.store = Ext.data.StoreManager;
		// me.store = Ux.xpotronix.StoreManager;

		me.conn_process   = new Ext.data.Connection();
		me.conn_process.on( 'requestcomplete', me.on_complete, me );
		me.conn_process.on( 'requestexception', me.on_complete_exception , me );

		me.response = { status: null, changes: [], messages: [] };

		me.panel = {

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

		me.window_onbeforeunload();

	},/*}}}*/

	/* init */

	init_state_manager: function() {/*{{{*/

		let me = this;

		if ( me.state_manager == 'http' ) {

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
	 
			Ext.state.Manager.getProvider().initState( eval( me.user.ui_state ) );

		} else

			Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider',{}));

	},/*}}}*/

	check_ext_version: function( version ) {/*{{{*/

		if ( Ext.version != version )
			console.error( `Atención: la versión requerida de la librería ExtJs es la ${version}: la versión provista es la ${Ext.version}` );

	},/*}}}*/

	window_onbeforeunload: function() {/*{{{*/

		window.onbeforeunload = function() {

			if ( this.getModifiedStores && this.getModifiedStores().length ) 
				return 'Hay cambios que no han sido guardados todavía. Si presiona [Aceptar], perderá los cambios. Si presiona [Cancelar], presione el botón de [Guardar] y luego cierre la página';
			};
	},/*}}}*/

	reconfigure: function( config ) {/*{{{*/

		if ( config ) 
			Ext.apply( this, config );

	},/*}}}*/

	start: function() {/*{{{*/


	},/*}}}*/ 

	close_stores: function() {/*{{{*/

		this.store.each( function(s) { 
			s.destroy(); 
		});

	
	},/*}}}*/ 

	close_objs: function() {/*{{{*/

		let me = this;

		me.obj.each( function(o) { 
			o.destroy();
			me.obj.remove(o);
		}, me );
	
	},/*}}}*/ 

 	process_request: function( p, callback ) {/*{{{*/

		let me = this;

		me.showPleaseWait( 'Ejecutando la acción ... Aguarde', 'Procesando ...' );

		let module = p.m,
			url = { m: p.m, a: p.a };

		delete( p.m );
		delete( p.a );

		if ( p.p ) {
			Ext.apply( url, { p: p.p } );
			delete( p.p );
		}

		me.conn_process.request({ 
			method: 'POST', 
			module: module, 
			url: '?' + 
			Ext.urlEncode( url ), 
			params: p, 
			success: callback });

	}, /*}}}*/

	/* transact response handlers */

	parse_response: function( param ) {/*{{{*/

		let me = this,
			q = Ext.DomQuery, ns = 'xpotronix|messages';

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

		me.response.status 	= q.selectValue( ns + "/status/@value", param.responseXML );
		me.response.messages 	= q.selectNode( ns + "/messages", param.responseXML );
		me.response.changes 	= q.select( ns + "/changes/*", param.responseXML );

		me.handle_messages( param );
		me.handle_status( param );

		return true;

	}, /*}}}*/

	handle_messages: function( param ) {/*{{{*/

		let me = this,
			ms = me.panel.messages.store;

		if ( typeof ms == 'string' )
			ms = Ext.create( ms );

		ms.loadRawData( me.response.messages );
		let msgs = '';

		for ( let i = 0; ( r = ms.getAt(i) ) != null ; i++ ) {
			// if ( r.get('type') == "16" ) 
				msgs += ( '<li>' + r.get('') + '</li>');
		}

		if ( msgs != '' ) 
			Ext.Msg.show({
				width: 400,
				title:'Respuesta del Servidor de Datos',
				msg: '<ul>' + msgs + '</ul>',
				buttons: Ext.Msg.OK,
				icon: Ext.Msg.INFO
			});
			
	},/*}}}*/

	handle_status: function( param ) {/*{{{*/

		let ms = this.panel.status.store;

		if ( typeof ms == 'string' )
			ms = Ext.create( ms );

		ms.proxy.reader.readRecords( param.responseXML );
			
	},/*}}}*/

	update_model: function( param ) {/*{{{*/


		if ( typeof param == 'undefined' ) {

			console.log( 'No se recibio respuesta del servidor' );
			return;

		}

		let me = this,
			ms = [],
			module = param.request.options.module; 

		Ext.each( me.response.changes, function( e ) { 

			let full_name = module + '.' + e.nodeName;
				s = me.store.lookup( full_name );

			if ( s ) {

				ms[s.class_name] = { 
					store: s, 
					response: s.update_model( e ) 
				};


			} else {

				console.error( 'no encuentro el modulo para actualizar ' + full_name );

			}

		}, me );

		/* todos los stores modificados, se fija si tiene un child 'parent' y lo recarga */

		for ( let sn in ms ) {

			let ss = ms[sn];

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

		let me = this;

		me.hidePleaseWait();

		if ( me.parse_response( param ) )
			me.update_model( param );

	},/*}}}*/

       on_complete_exception: function( sender, param ) { // Callback called on response/*{{{*/

		   let me = this;

			Ext.Msg.alert( 'Hubo un problema al guardar, por favor reintente mas tarde');
			me.parse_response( param );
			me.update_model();
			me.hidePleaseWait();

	},/*}}}*/

	login: function( prevent_reload ) {/*{{{*/

		let me = this;

		me.prevent_reload = prevent_reload;

		if ( !me.panel.login.window ) 
			me.panel.login.window = Ext.create('LoginWindow');

		me.panel.login.window.show();

	},/*}}}*/

	reload_app: function() {/*{{{*/

		let me = this,
			target = ( window.parent ) ? window.parent.location : window.location;

		if ( me.feat.login_location )
			if ( window.parent ) 
				window.parent.location = me.feat.login_location;
			else 
				window.location = me.feat.login_location;
		else
			if ( window.parent )	
				window.parent.location.reload();
			else
				window.location.reload();
	},/*}}}*/

	logout: function() {/*{{{*/

	    let conn = new Ext.data.Connection();

	    conn.on( 'requestcomplete', function() { 
	
			alert('Presione [Aceptar] para salir de la aplicación');
			window.location.reload();}, 

		this );

		conn.request({ 
			method: 'POST', 
			url: '?' + Ext.urlEncode( 
				{ a: 'logout' } ) });

	},/*}}}*/

	/* user ui */

	accessible: function( arr ) {/*{{{*/

		let me = this, ret = [];

		Ext.each( arr, function( a ) { 

			// DEBUG: poner accesos en acl en juscaba2
			if ( a.acl.access || me.feat.application == 'juscaba2' )  
				ret.push( a ); 
		}, me );

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
		let me = this;
		Ext.Msg.show({
			msg :'Hay cambios sin guardar. Desea guardar los cambios?',
			width :300,
			buttons: Ext.Msg.YESNOCANCEL,
			scope: me,
			fn: function( btn ) {
				if ( btn == 'yes' )
					me.save();
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

		let me = this;

		if ( ! me.panel.password.window )
			me.panel.password.window = Ext.create('ChangePasswordWindow');

		me.panel.password.window.show();

	},/*}}}*/

	showTips: function() {/*{{{*/

		// DEBUG: esto fue hecho en 10 minutos hay que hacer uno mejor !! 
		let randomnumber = Math.floor(Math.random() * 7),
			tip = Ext.getDom('tip-' + randomnumber);

		if ( tip ) 
			Ext.MessageBox.show({
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
