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
	debug: true,

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

		this.callParent();

		if ( typeof this.store == 'string' )
			this.store = App.store.lookup( this.store );

                if ( typeof this.obj == 'string' ) 
			this.obj = App.obj.get( this.obj );

		/* this.getForm().trackResetOnLoad = true; */

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		if ( this.show_buttons && ( this.acl.edit || this.acl.add ) ) {

			var tbar = this.getDockedItems('toolbar[dock=top]')[0];
			var bbar = this.getDockedItems('toolbar[dock=bottom]')[0];

			if ( tbar && bbar ) {

				this.acl.add && bbar.add( tbar.add_button( this ) );
				bbar.add('-');
				bbar.add( tbar.save_button( this ));
			}
		}

		this.on({ 

			afterrender: { 
				fn: function( form ) {

					var r = form.getSelection();

					if ( r && r.length )
						form.loadRecord( r[0] );
					else
						form.getForm().reset();
				}, 
				buffer:200 }
		});

		this.store.on({

			update: { 

				scope: this
				,buffer:50
				,fn: function( form ) { 

					this.loadRecord( form.getSelection()[0] ); 
				}}

			,selectionchange: {

				scope: this
				,buffer:200
				,fn: function( sels, selMode, e ) {

					var me = this;

					if ( sels && sels.length )
						me.loadRecord( sels[0] );
					else
						me.getForm().reset();
				

				} 
			} 
		});

	}, /*}}}*/

	onRender: function() { /*{{{*/

		this.callParent();

		if ( ! this.store ) 
			return;

		var field_names = [];

		Ext.each( this.store.model.getFields(), function( i ) { field_names.push( i.name ) } );

		if ( this.store ) {

			recurse_items( this, function(i) {

				/* consoleDebugFn( i ); return; */

				if ( i.name != undefined && Ext.Array.contains( field_names, i.name ) ) {

					/* DEBUG: hay que ver si aca es el evento correcto para cuando cambia un valir, tal vez validateedit */

					// var event_name = (i.xtype == 'checkbox') ? 'check' : 'blur';
					var event_name = 'blur';

					this.debug && console.log( 'class: ' + i.$className + ', name: ' + i.name );

					this.debug && consoleDebugFn( i );

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

					}, this, { delay:0 });
				}

			}, this );

		}

		// this.loadRecord();

	},/*}}}*/

	loadRecord: function( r ) { /*{{{*/

		var me = this;

		if ( ( ! me.rendered ) && ( ! me.isVisible() ) ) 
			return;

		var form = this.getForm();

		for ( var key in r.data ) { 

			var a = form.findField(key);

			if ( a && a.hasFocus ) 
				return;
		}


		form.reset();

		if ( ( ! Ext.isEmptyObject ( r ) ) && r.get ) { 

			var c;
        		this._record = r;

			var is_new = r.get('__new__');
			var enabled = ( me.obj.acl.edit && !is_new ) || ( me.obj.acl.add && is_new );

			// if ( Ext.isEmptyObject( c = r.getChanges() ) )
				c = r.getData(); 

        		this.form.setValues(c);

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

	}/*}}}*/

}); /* eo extend */
