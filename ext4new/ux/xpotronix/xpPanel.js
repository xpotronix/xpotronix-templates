// vim: sw=4:ts=4:nu:nospell:fdc=4

/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */


Ext.define( 'Ux.xpotronix.xpPanel', { 

	extend: 'Ext.Panel', 
	alias: 'xpPanel',

	obj: undefined,
	acl: undefined,
	border: false,
	show_buttons: true,
	buttonAlign: 'left',
	feat: undefined,
	multi_row: false,
	debug: true,

	constructor: function(config) {/*{{{*/

		/* agrega un panel al objeto para futura referencia */

		App.obj.get(this.class_name).panels.add(this);

		/* paging toolbar */

		if ( config.paging_toolbar ) 

			Ext.apply( config, { 

				dockedItems: [{
					xtype: 'xppagingtoolbar',
					panel: this,
					store: this.store,
					dock: 'top',
					displayInfo: true
				}],
			});

		/* bottom toolbar */

		if ( config.bottom_toolbar )

		Ext.apply( config, { 

			dockedItems: [{
				xtype: 'toolbar',
				panel: this,
				store: this.store,
				dock: 'bottom',
				displayInfo: true,
				layout: { pack: 'center' }
			}],
		});

		this.callParent(arguments);

		this.addEvents( 'loadrecord' );

		this.debug && consoleDebugFn( this );

	},/*}}}*/

	initComponent:function() {/*{{{*/

		this.callParent();

		/* resuelve referencias */

		if ( typeof this.store == 'string' ) 
			this.store = App.store.lookup( this.store );

                if ( typeof this.obj == 'string' )
			this.obj = App.obj.get( this.obj );

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		this.on({ 
			afterrender: { 
				fn: this.loadRecord,
				buffer:200 }
		});

		this.store.on({

			update: { 
				fn: this.loadRecord, 
				scope: this, 
				buffer:50 
			},

			selectionchange: {

				fn: this.loadRecord, 
				scope: this,
				buffer:200
			} 
		});

	}, /*}}}*/

	loadRecord: function() { /*{{{*/

		var me = this;

		if ( ( ! me.rendered ) && ( ! me.isVisible() ) ) return;

		var t = me.getSelection();

		if ( t == undefined ) return;

		var r = t[0];

		/* DEBUG: para parametrizar un URL y cargar algun contenido 

		if ( r && r.get && this.body ) 
			this.load({ url: '?', params: 
				Ext.apply({ 
					m: App.feat.module, 
					r: this.obj.class_name, 
					v: 'card', 
					'f[include_dataset]': 2, 
					'f[transform]': 'php' }, 
					s.get_search_key( s.get_primary_key() ))
				});

		me.fireEvent( 'loadrecord', me, me.store, r );

		*/

	},/*}}}*/

	getSelection: function() {/*{{{*/

		return this.store.selections;	

		/*
		var cr = this.store.cr();
		return ( cr == undefined ) ? [] : [cr];
		*/

	}/*}}}*/

}); /* eo extend */
