Ext.Loader.setConfig({
	enabled: true,
	paths: {
		'Ux.xpotronix': '/ux4/xpotronix'
	}
});



Ext.util.CSS.swapStyleSheet("theme", "/ext/resources/css/xtheme-gray.css");



Ext.Ajax.timeout = 60000;

var config_App = {
	state_manager: 'http',
	feat: {
		application: 'alimentos',
		page_title: 'Deudores Alimentarios',
		page_rows: 50,
		base_url: '/alimentos/',
		default_module: 'home',
		auto_load: true,
		transform: 'bridge',
		app_cache_time: 0,
		db_cache_time: 0,
		debug_xml: false,
		login_window: true,
		menu_bar: 'false',
		theme: '/ext/resources/css/xtheme-gray.css',
		defaultSrc: '?m=solicitud',
		from_notificacion: 'patrocinio@derecho.uba.ar',
		default_view: 'ext4new/viewport',
		generator: 'xpotronix2',
		company_name: 'xpotronix Corporation',
		encoding: 'UTF-8',
		site_domain: 'red.justamente.net',
		crypt_url: false,
		paging_toolbar: true,
		force_utf8: false,
		host_locale: 'es_AR',
		date_format: 'd/m/y',
		date_long_format: 'd/m/Y',
		time_format: 'H:i:s',
		default_timezone: 'America/Argentina/Buenos_Aires',
		date_db_format: 'Y-m-d',
		time_db_format: 'H:i:s',
		date_db_null: '0000-00-00',
		time_db_null: '00:00:00',
		currency_symbol: '$',
		set_time_limit: null,
		syslog_level: 10,
		messages_level: -1,
		log_changes: false,
		load_full_query: true,
		add_labels: true,
		sql_page_model: 'page',
		query_action: 'data',
		load_after_store: false,
		remote_sort: true,
		include_dataset: 0,
		ignore_null_fields: true,
		ignore_null_dataset: true,
		on_null_dataset: null,
		hide_pk: true,
		hide_fk: true,
		key_delimiter: '^',
		container_tag: 'c_',
		try_update_on_fail: true,
		envelope_tag: true,
		expose_server_vars: false,
		sms_size: 160,
		max_file_size: 2097152,
		module: 'Juzgados',
		base_path: '/var/www/sites/xpotronix/alimentos'
	},
	user: {
		user_contact: '1',
		user_username: 'admin',
		user_id: '1',
		user_parent: '0',
		user_type: 'true',
		user_company: '0',
		user_department: '0',
		user_owner: '0',
		user_signature: null,
		_anon: null,
		ui_state: '[{"name":"ex","value":"s%3Ahome"},{"name":"Juzgados_xpGrid","value":"o%3Acolumns%3Da%253Ao%25253Aid%25253Dn%2525253A0%25255Ewidth%25253Dn%2525253A100%25255Ehidden%25253Db%2525253A1%25255Esortable%25253Db%2525253A1%255Eo%25253Aid%25253Dn%2525253A1%25255Ewidth%25253Dn%2525253A344%25255Esortable%25253Db%2525253A1%255Eo%25253Aid%25253Dn%2525253A2%25255Ewidth%25253Dn%2525253A100%25255Esortable%25253Db%2525253A1%255Eo%25253Aid%25253Dn%2525253A3%25255Ewidth%25253Dn%2525253A100%25255Esortable%25253Db%2525253A1%255Eo%25253Aid%25253Dn%2525253A4%25255Ewidth%25253Dn%2525253A100%25255Esortable%25253Db%2525253A1%255Eo%25253Aid%25253Dn%2525253A5%25255Ewidth%25253Dn%2525253A100%25255Esortable%25253Db%2525253A1%255Eo%25253Aid%25253Dn%2525253A6%25255Ewidth%25253Dn%2525253A100%25255Esortable%25253Db%2525253A1"},{"name":"viewport_north_tabs","value":"o%3A"},{"name":"xpApp_layout","value":"o%3Awidth%3Dn%253A611%5Eheight%3Dn%253A905"}]'
	}
};

if (App) {

	App.reconfigure(config_App);

} else {

	Ext.namespace('App');
	var App = Ext.create('Ux.xpotronix.xpApp', config_App);
}


Ext.onReady(function() {

	document.title = 'Juzgados :: Deudores Alimentarios';

	/*
	var wait = Ext.LoadMask(document.body, {msg:'Aguarde por favor ...'});
	wait.show();
	*/

	Ext.define('Juzgados', {
		extend: 'Ext.data.Model',
		fields: [{
				name: '__ID__',
				mapping: '@ID',
				type: 'string'
			}, {
				name: '__new__',
				mapping: '@new',
				type: 'int'
			}, {
				name: '__acl__',
				mapping: '@acl',
				type: 'string'
			},

			/* Auto */
			{
				name: 'Auto',
				type: 'int'
			}
			/* Tipo_de_juz */
			, {
				name: 'Tipo_de_juz',
				type: 'string'
			}
			/* N__mero */
			, {
				name: 'N__mero',
				type: 'int'
			}
			/* Juez */
			, {
				name: 'Juez',
				type: 'string'
			}
			/* Secretaria */
			, {
				name: 'Secretaria',
				type: 'string'
			}
			/* Direcci__n */
			, {
				name: 'Direcci__n',
				type: 'string'
			}
			/* Cod_pos */
			, {
				name: 'Cod_pos',
				type: 'string'
			}
		]
	});


	var tmp;
	var config;
	var model;


	var config = Ext.apply({

			storeId: 'Juzgados',
			model: 'Juzgados',
			class_name: 'Juzgados',
			module: 'Juzgados',
			primary_key: ['Auto']
			,
			feat: {}

			,
			acl: {
				access: true,
				view: true,
				add: true,
				edit: true,
				del: true,
				list: true
			}


			,
			pageSize: 50,
			remoteSort: true
		}

		, {});

	var tmp = Ext.create('Ux.xpotronix.xpStore', config);

	/* Entry Helpers */

	/* End Entry Helpers */


	/* Juzgados xpObj */

	App.obj.add(Ext.create('Ux.xpotronix.xpObj', {

		class_name: 'Juzgados'
			/* ,el:'contentEl_Juzgados' */
			,
		translate: 'Juzgados',
		parent_name: '',
		acl: {
			access: true,
			view: true,
			add: true,
			edit: true,
			del: true,
			list: true
		},
		role: 'admin',
		extra_param: {},
		store: App.store.lookup('Juzgados'),
		feat: {}

	}));


	/* panels para Juzgados */
	App.obj.get('Juzgados').panels.addAll([Ext.create('Ux.xpotronix.xpGrid', Ext.apply(

		{
			id: 'Juzgados_xpGrid',
			class_name: 'Juzgados',
			obj: App.obj.get('Juzgados'),
			acl: App.obj.get('Juzgados').acl,
			xtype: 'xpGrid',
			store: App.store.lookup('Juzgados'),
			feat: {}

			,
			display_as: '',
			title: 'Juzgados'
		},



		/* ui_override: start */
		{
			columns: [{
				name: 'Auto',
				header: 'Auto',
				dataIndex: 'Auto',
				hidden: true,
				align: 'right',
				filter: true,
				field: {
					xtype: 'numberfield',
					style: 'text-align:right;'
				}
			}, {
				name: 'Tipo_de_juz',
				header: 'Tipo_de_juz',
				dataIndex: 'Tipo_de_juz',
				align: 'left',
				filter: true,
				field: {}
			}, {
				name: 'N__mero',
				header: 'N__mero',
				dataIndex: 'N__mero',
				align: 'right',
				filter: true,
				field: {
					xtype: 'numberfield',
					style: 'text-align:right;'
				}
			}, {
				name: 'Juez',
				header: 'Juez',
				dataIndex: 'Juez',
				align: 'left',
				filter: true,
				field: {}
			}, {
				name: 'Secretaria',
				header: 'Secretaria',
				dataIndex: 'Secretaria',
				align: 'left',
				filter: true,
				field: {}
			}, {
				name: 'Direcci__n',
				header: 'Direcci__n',
				dataIndex: 'Direcci__n',
				align: 'left',
				filter: true,
				field: {}
			}, {
				name: 'Cod_pos',
				header: 'Cod_pos',
				dataIndex: 'Cod_pos',
				align: 'left',
				filter: true,
				field: {}
			}]
		}
		/* ui_override: end */


		, {
			layout: 'fit',
			deferredRender: true,
			split: true,
			syncSize: true,
			autoScroll: true,
			plugins: [


			]
		}))]);


	var events_js = false;



	App.on('configready', function() {



		Ext.create('Ext.Viewport', {

			id: 'xpApp_layout',
			stateful: true,
			layout: 'border',
			hideMode: 'offsets',
			renderTo: Ext.getBody(),
			bodyStyle: {
				border: 0
			},
			items: [



				{
					id: 'viewport_north_tabs',
					xtype: 'tabpanel',
					stateful: true,
					titleCollapse: false,
					height: 200,
					margins: '0 0 0 0',
					split: true,
					region: 'center',
					layoutOnTabChange: true,
					/* collapsible: true, 
					collapseMode:'mini',*/
					activeTab: 0,
					items: [
						Ext.getCmp('Juzgados_xpGrid')
					]
				}


			]
		});


	});


	events_js || App.fireEvent('configready');


	var post_render_js = [];

	if (post_render_js.length)
		Ext.Loader.load(post_render_js);

});
