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

	cmp.items && cmp.items.each && cmp.items.each( function( it ) {

		fn.call( scope, it );
		it.items && it.items.length && recurse_items( it, fn, scope );
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
	debug: false,

	constructor: function(config) {/*{{{*/

	App.obj.get(this.class_name).panels.add(this);

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

		this.addEvents( 'loadrecord' );

	},/*}}}*/

	initComponent:function() {/*{{{*/

		this.callParent();

		if ( typeof this.store == 'string' ) this.store = Ext.StoreMgr.lookup( this.store );

		/* this.getForm().trackResetOnLoad = true; */

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		if ( this.show_buttons && ( this.acl.edit || this.acl.add ) ) {

			var bbar = this.getDockedItems('toolbar[dock=bottom]')[0];

			this.acl.add && bbar.add( this.obj.add_button( this ) );
			bbar.add('-');
			bbar.add( this.obj.save_button( this ));

		}

		this.on({ 

			afterrender: { 
				fn: function( form ) {

					var r = form.getSelection();

					if ( r !== null )
						form.loadRecord( r[0] );
				}, 
				buffer:200 }
		});

		this.store.on({

			selectionchange: {

				fn: function( a, b, c ) {

					var form = this;
	
					var r = form.getSelection();

					if ( r.length != 0 )
						form.loadRecord( r[0] );
				

				}, 
				scope: this,
				buffer:200
			} 
		});

	}, /*}}}*/

	onRender: function() { /*{{{*/

		this.callParent();

		if ( ! this.store ) return;

		var field_names = [];

		Ext.each( this.store.model.getFields(), function( i ) { field_names.push( i.name ) } );

		if ( this.store ) {

			recurse_items( this, function(i) {

				/* consoleDebugFn( i ); return; */

				if ( i.name != undefined && Ext.Array.contains( field_names, i.name ) ) {

					/* DEBUG: hay que ver si aca es el evento correcto para cuando cambia un valir, tal vez validateedit */

					var event_name = (i.xtype == 'checkbox') ? 'check' : 'change';

					this.debug && console.log( 'class: ' + i.$className + ', name: ' + i.name );

					i.on( event_name, function( me, a, b ) {

						/* mantiene sincronizado el form con el controlador (grid) */

						var record = this.getSelection()[0];

						if ( record ) {

							if ( ! me.isEqual( me.getValue(), record.get( me.name ) ) ) {

								this.debug && console.log( me.name + ': ' + me.lastValue + ' << ' + me.getValue() );
								record.set( me.name, me.getValue() );
							}
						}
				
						return true;

					}, this);
				}

			}, this );

		}

		// this.loadRecord();

	},/*}}}*/

	loadRecord: function( a, b, c ) { /*{{{*/


		var me = this;

		if ( ( ! me.rendered ) && ( ! me.isVisible() ) ) return;

		var r = me.getSelection()[0];

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

		me.fireEvent( 'loadrecord', me, me.store, r );

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

	getSelection: function() {/*{{{*/

		return this.store.selections;	

		/*
		var cr = this.store.cr();
		return ( cr == undefined ) ? [] : [cr];
		*/

	},/*}}}*/

}); /* eo extend */
