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


var recurse_items = function( cmp, fn, scope ) {

	cmp.items && cmp.items.each( function( it ) {

		fn.call( scope, it );
		it.items && it.items.getCount() && recurse_items( it, fn, scope );
	});
};

Ext.define( 'Ux.xpotronix.xpForm', { 

	extend: 'Ext.form.FormPanel', 
	alias: 'xpForm',

	obj: undefined,
	acl: undefined,
	border: false,
	show_buttons: true,
	buttonAlign: 'left',
	feat: undefined,
	controller: undefined,
	debug: false,

	constructor: function(config) {/*{{{*/

		Ext.apply( config, { 

			dockedItems: [{
				xtype: 'xppagingtoolbar',
				panel: this,
				store: this.store,
				dock: 'top',
				displayInfo: true
			},{
				xtype: 'toolbar',
				panel: this,
				store: this.store,
				dock: 'bottom',
				displayInfo: true,
				layout: { pack: 'center' }
			}],
		});

		this.callParent(arguments);

		/* consoleDebugFn( this ); */
		/* consoleDebugFn( this.getForm() ); */

	},/*}}}*/

	initComponent:function() {/*{{{*/

		this.callParent();

		/* this.getForm().trackResetOnLoad = true; */

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		/* busca un controlador, default la xpGrid del objeto */

		this.find_controller();

		if ( this.show_buttons && ( this.acl.edit || this.acl.add ) ) {

			var bbar = this.getDockedItems('toolbar[dock=bottom]')[0];

			this.acl.add && bbar.add( this.obj.add_button( this ) );
			bbar.add('-');
			bbar.add( this.obj.save_button( this ));

		}

		this.on({ 

			afterrender: { 
				fn: function( form ) {
					var r;
					if ( r = form.controller.selModel.selected.first() )
						form.loadRecord( r );
				}, 
				buffer:200 }
		});

	}, /*}}}*/

	find_controller: function() {/*{{{*/

		if ( this.controller == undefined ) 
			this.controller = this.class_name + '_xpGrid';
		
		if (typeof this.controller == 'string') {

			if ( ! ( this.controller = Ext.getCmp( this.controller ) ) )
				return false;

			this.store = this.controller.store; // DEBUG para compatibilidad

		} else  this.store = Ext.StoreMgr.lookup( this.store );

		this.controller && this.controller.on({

			selectionchange: { 

				fn:function( a, b, c ) {
					this.loadRecord(this.controller.selModel.selected.first());
				}, 
				buffer: 200, 
				scope: this },
		});

		this.store && this.store.on({

			/*
			load: { 
				fn:function( a, b, c ){
					this.loadRecord( 
						this.controller.selModel.selected.first()||{});
				}, 
				buffer: 200, 
				scope: this },

			*/

			update: { 
				fn:function( s, r, o ) { 

					if ( o == Ext.data.Record.EDIT || o == Ext.data.Record.COMMIT || o == Ext.data.Record.REJECT ) 
						this.loadRecord(this.controller.selModel.selected.first());

				}, 
				// buffer: 200, 
				scope: this },

			clear: {  
				fn:function( a, b, c ) {
					this.getForm().reset();
				}, 
				buffer: 200, 
				scope: this }

			/* ,datachanged: { 
				fn:function() {
					this.loadRecord(this.controller.selModel.selected.first());
				}, 
				buffer: 200, 
				scope: this }
			*/
		});

	},/*}}}*/

	onRender: function() { /*{{{*/

		this.callParent();

		if ( this.controller || this.find_controller() ) {

			recurse_items( this, function(i) {

				/* consoleDebugFn( i ); return; */

				var event_name = (i.xtype == 'checkbox') ? 'check' : 'change';

				i.on( event_name, function( me, a, b ) {

					/* mantiene sincronizado el form con el controlador (grid) */

					var record = this.controller.selModel.selected.first();

					if ( record ) {

						if ( ! me.isEqual( me.getValue(), record.get( me.name ) ) ) {

							this.debug && console.log( me.name + ': ' + me.lastValue + ' << ' + me.getValue() );
							record.set( me.name, me.getValue() );
						}
					}
			
					return true;

				}, this);

			}, this );

		}

		// this.loadRecord();

	},/*}}}*/

	loadRecord: function( a, b, c ) { /*{{{*/


		var me = this;

		if ( ( ! me.rendered ) && ( ! me.isVisible() ) ) return;

		var r = me.controller.selModel.selected.first();

		this.callParent(arguments);

		if ( r && r.get ) { 

			var is_new = r.get('__new__');

			var enabled = ( me.obj.acl.edit && !is_new ) || ( me.obj.acl.add && is_new );

			if ( enabled )

				me.enableForm();

			else 	me.disableForm();


		} else {

			me.getForm().reset();
			me.disableForm();
		}

		// me.fireEvent( 'loadrecord', me, me.store, r );

	},/*}}}*/

	enableForm: function() {/*{{{*/

		recurse_items( this.getForm(), function( it ) {

			it.initialConfig.disabled || it.enable();

			// it.setReadOnly( ! ( ! it.initialConfig.disabled ) )

		}, this );


	},/*}}}*/

	disableForm: function() {/*{{{*/

		recurse_items( this.getForm(), function( it ) {

			// it.setReadOnly( true );
			it.disable();

		}, this );

	},/*}}}*/

	get_selections: function() {/*{{{*/

		return this.controller.selModel.selected;	

		/*
		var cr = this.store.cr();
		return ( cr == undefined ) ? [] : [cr];
		*/

	},/*}}}*/

}); /* eo extend */
