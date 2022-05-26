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
	autoScroll: true,
	overflowY: 'scroll',
	feat: undefined,
	multi_row: false,
	debug: false,

	constructor: function(config) {/*{{{*/

		let me = this;

		/* agrega un panel al objeto para futura referencia */

		App.obj.get(me.class_name).panels.add(me);

		/* paging toolbar */

		if ( config.paging_toolbar ) 

			Ext.apply( config, { 

				dockedItems: [{
					xtype: 'xppagingtoolbar',
					panel: me,
					store: me.store,
					dock: 'top',
					displayInfo: true
				}],
			});

		/* bottom toolbar */

		if ( config.bottom_toolbar )

		Ext.apply( config, { 

			dockedItems: [{
				xtype: 'toolbar',
				panel: me,
				store: me.store,
				dock: 'bottom',
				displayInfo: true,
				layout: { pack: 'center' }
			}],
		});

		me.callParent(arguments);

		me.addEvents( 'loadrecord' );

		if ( me.debug ) 
			consoleDebugFn( me );

	},/*}}}*/

	initComponent:function() {/*{{{*/

		let me = this;

		me.callParent();

		/* resuelve referencias */

		if ( typeof me.store == 'string' ) 
			me.store = App.store.lookup( me.store );

                if ( typeof me.obj == 'string' )
			me.obj = App.obj.get( me.obj );

		me.acl = me.acl || me.obj.acl;
		me.processes_menu = me.processes_menu || me.obj.processes_menu;

		me.on({ 
			afterrender: { 
				fn: me.loadRecord,
				buffer:200 }
		});

		me.store.on({

			update: { 
				fn: me.loadRecord, 
				scope: me, 
				buffer:50 
			},

			selectionchange: {

				fn: me.loadRecord, 
				scope: me,
				buffer:200
			} 
		});

	}, /*}}}*/

	loadRecord: function() { /*{{{*/

		let me = this;

		if ( ( ! me.rendered ) && ( ! me.isVisible() ) ) return;

		let t = me.getSelection();

		if ( t == undefined ) return;

		let s = me.store,
			r = s.cr();

		/* borra el contenido */
		me.update('');

		if ( r && me.body ) 
				me.body.load({ 
					url: '?', 
					params: Ext.apply({ 
						m: App.feat.module, 
						r: me.obj.class_name, 
						v: 'card', 
						'f[include_dataset]': 2, 
						'f[transform]': 'php' }, 
						s.get_search_key( s.get_primary_key() ))});

	},/*}}}*/

	getSelection: function() {/*{{{*/

		return this.store.selections;	

		/*
		let cr = this.store.cr();
		return ( cr == undefined ) ? [] : [cr];
		*/

	}/*}}}*/

}); /* eo extend */
