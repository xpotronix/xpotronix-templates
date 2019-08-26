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

var recurse_items = function( cmp, fn, scope ) {/*{{{*/

	cmp.items && cmp.items.each && cmp.items.each( function( it ) {

		fn.call( scope, it );
		it.items && it.items.length && recurse_items( it, fn, scope );
	});

};/*}}}*/

Ext.define( 'Ux.xpotronix.xpForm', { 

	extend: 'Ext.form.FormPanel', 
	alias: 'xpForm',

	obj: undefined,
	acl: undefined,
	feat: undefined,
	border: false,
	show_buttons: true,
	buttonAlign: 'left',
	multi_row: false,
	debug: false,

	constructor: function(config) {/*{{{*/

		/* agrega un panel al objeto para futura referencia */

		App.obj.get(this.class_name).panels.add(this);

		config.dockedItems = config.dockedItems || [];

		/* paging toolbar */

		/* DEBUG: por ahora activos por default */

		if ( true || config.paging_toolbar ) {

			config.dockedItems.push({

				xtype: 'xppagingtoolbar',
				panel: this,
				store: this.store,
				dock: 'top',
				displayInfo: true
			});
		}

		/* bottom toolbar */

		if ( true || config.bottom_toolbar ) {

			config.dockedItems.push({

				xtype: 'toolbar',
				panel: this,
				store: this.store,
				dock: 'bottom',
				displayInfo: true,
				layout: { pack: 'center' }
			});
		}

		this.callParent(arguments);

		this.addEvents( 'loadrecord' );

		this.debug && consoleDebugFn( this );
		this.debug && consoleDebugFn( this.getForm() );

	},/*}}}*/

	initComponent:function() {/*{{{*/

		var me = this;

		me.callParent();

		if ( typeof me.store == 'string' )
			me.store = App.store.lookup( me.store );

                if ( typeof me.obj == 'string' ) 
			me.obj = App.obj.get( me.obj );

		/* me.getForm().trackResetOnLoad = true; */

		me.acl = me.acl || me.obj.acl;
		me.processes_menu = me.processes_menu || me.obj.processes_menu;

		if ( me.show_buttons && ( me.acl.edit || me.acl.add ) ) {

			var tbar = me.getDockedItems('toolbar[dock=top]')[0];
			var bbar = me.getDockedItems('toolbar[dock=bottom]')[0];

			if ( tbar && bbar ) {

				bbar.add( tbar.save_button( me ));
				bbar.add('-');
				me.acl.add && bbar.add( tbar.add_button( me ) );
			}
		}

		me.on({ 

			afterrender: { 
				fn: function( form ) {

					var r = form.getSelection();

					if ( r && r.length ) {

						me.enable();
						form.loadRecord( r[0] );
					}
					else {
						form.getForm().reset();
						me.disable();	
					}
				},
				buffer:200 }
		});

		me.store.on({

			update: { 

				scope:me
				,buffer:50
				,fn: function( form ) { 

					me.loadRecord( form.getSelection()[0] ); 
				}}

			,selectionchange: {

				scope:me 
				,buffer:200
				,fn: function( sels, selMode, e ) {

					if ( sels && sels.length ) {

						me.enable();
						me.loadRecord( sels[0] );

					} else {

						me.getForm().reset();
						me.disable();	
					}
				} 
			} 
		});

	}, /*}}}*/

	onRender: function() { /*{{{*/

		var me = this;

		me.callParent();

		if ( ! me.store ) 
			return;

		var field_names = [];

		Ext.each( me.store.model.getFields(), function( i ) { field_names.push( i.name ) } );

		if ( me.store ) {

			recurse_items( me, function(i) {

				/* consoleDebugFn( i ); return; */

				if ( i.name != undefined && Ext.Array.contains( field_names, i.name ) ) {

					/* DEBUG: hay que ver si aca es el evento correcto para cuando cambia un valir, tal vez validateedit */

					// var event_name = (i.xtype == 'checkbox') ? 'check' : 'blur';
					var event_name = 'blur';

					me.debug && console.log( 'class: ' + i.$className + ', name: ' + i.name );

					me.debug && consoleDebugFn( i );

					i.on( event_name, function( field ) {

						/* mantiene sincronizado el form con el controlador (grid) */

						var record = me.getSelection()[0];

						if ( record ) {

							if ( ! field.isEqual( field.getValue(), record.get( field.name ) ) ) {

								me.debug && console.log( field.name + ': ' + field.lastValue + ' << ' + field.getValue() );
								record.set( field.name, field.getValue() );
							}
						}
				
						return true;

					}, me, { delay:0 });
				}

			}, me );

		}

		// me.loadRecord();

	},/*}}}*/

	loadRecord: function( r ) { /*{{{*/

		var me = this;

		if ( ( ! me.rendered ) && ( ! me.isVisible() ) ) 
			return;

		var form = me.getForm();

		for ( var key in r.data ) { 

			var a = form.findField(key);

			if ( a && a.hasFocus ) 
				return;
		}


		form.reset();

		if ( ( ! Ext.isEmptyObject ( r ) ) && r.get ) { 

        		me._record = r;

			var c,
			is_new = r.get('__new__'),
			enabled = ( me.obj.acl.edit && !is_new ) || ( me.obj.acl.add && is_new );

			// if ( Ext.isEmptyObject( c = r.getChanges() ) )
			c = r.getData(); 

        		me.form.setValues(c);

			if ( enabled )
				me.enableForm();
			else 	me.disableForm();


		} else {

			me.disableForm();
		}

		/* me.fireEvent( 'loadrecord', me, me.store, r ); */

	},/*}}}*/

	enableForm: function() {/*{{{*/

		recurse_items( this.getForm(), function( it ) {

			it.initialConfig.disabled || it.enable();

		}, this );


	},/*}}}*/

	disableForm: function() {/*{{{*/

		recurse_items( this.getForm(), function( it ) {

			it.disable();

		}, this );

	},/*}}}*/

	getSelection: function() {/*{{{*/

		return this.store.selections;	

	},/*}}}*/

	getTopToolbar:  function() {/*{{{*/
		var tb = this.getDockedItems('toolbar[dock=top]');
		return tb.length ? tb[0] : undefined;
	}/*}}}*/

}); /* eo extend */
