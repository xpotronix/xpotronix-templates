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

	cmp.items.each( function( it ) {

		fn.call( scope, it );
		it.items && it.items.getCount() && recurse_items( it, fn, scope );
	});
};


Ext.ux.xpotronix.xpForm = function(config) {

	Ext.apply(this, config);
	this.acl = this.acl || this.obj.acl;
	this.processes_menu = this.processes_menu || this.obj.processes_menu;
	Ext.ux.xpotronix.xpForm.superclass.constructor.apply(this, arguments);
	this.addEvents( 'loadrecord' );

};

Ext.extend( Ext.ux.xpotronix.xpForm, Ext.form.FormPanel, {

	obj: null,
	acl: null,
	border: false,
	show_buttons: true,
	loadMask: true,
	buttonAlign: 'left',
	feat: null,
	export_w: null,
	first_enabled_item: null,


    initEvents : function(){

        Ext.form.FormPanel.superclass.initEvents.call(this);

        if(this.loadMask){
            this.loadMask = new Ext.LoadMask(this.bwrap,
                    Ext.apply({store:this.store}, this.loadMask));
        }


    },


	initComponent:function() {/*{{{*/

		this.store && this.store.on({

			load: { fn:function(){this.loadRecord();}, buffer: 200, scope:this },
			update: { fn:function( s, r, o ){ if ( o == Ext.data.Record.EDIT || o == Ext.data.Record.COMMIT ) this.loadRecord();}, buffer: 200, scope:this },
			// datachanged: { fn:function() {this.loadRecord();}, buffer: 200, scope:this },
			changerowindex: { fn:function() {this.loadRecord();}, buffer: 200, scope:this },
			clear: {  fn:function() {this.getForm().reset();}, buffer: 200, scope:this }	
		});

		this.obj && this.obj.toolbar( this );

		if ( this.show_buttons && ( this.acl.edit || this.acl.add ) ) {

			this.buttons = [new Ext.Spacer({ width: 145 })];
			this.buttons.push( this.obj.save_button( this ) );

			this.acl.add && this.buttons.push( this.obj.add_button( this ) );
		}

		Ext.ux.xpotronix.xpForm.superclass.initComponent.apply(this, arguments);

		this.on({ 

			afterrender: { fn: function() { 

				this.loadRecord();
				this.first_enabled_item && this.first_enabled_item.focus(true,100);

			}, scope: this, buffer:200 }
		});

	}, /*}}}*/

	onRender: function() { /*{{{*/

		/* call parent */
		Ext.ux.xpotronix.xpForm.superclass.onRender.apply(this, arguments);

		this.obj && this.obj.set_toolbar( this );

		if ( !this.store ) return;

		recurse_items( this.getForm(), function(i) {

			var en;

			if ( this.first_enabled_item == null && i.xtype && i.xtype != 'checkbox' && ( !i.initialConfig.disabled ) ) {

				/* el primer item habilitado */
				this.first_enabled_item = i;

			}

			switch( i.xtype ) {

				case 'checkbox': 
					en = 'check';  break;

				case 'combo': 

					en = 'select'; 
					i.on( 'blur', function( e ) { 

        					if( e.getRawValue() == "" ) {

            						e.clearValue(); 
							var record = this.store.cr();
							record.set(e.name, '');
							record.set(e.name+'_label', '');

						}
    					}, this );

				break;

				default:	 
					en = 'change';
			}

			i.on( en, function(e) {

				var record = this.store.cr();

				if ( record ) {

					// guarda los cambios del form en el store

					// this.suspendEvents( true );

					record.set(e.name, e.getValue());

					if ( e.xtype == 'combo' && e.mode == 'remote' )
						
						record.set(e.name+'_label', e.getRawValue());

					// this.resumeEvents();

					// e.focus();
				}
		
				return true;

			}, this);

		}, this );

		// this.loadRecord();

	},/*}}}*/

	enableForm: function() {/*{{{*/

		recurse_items( this.getForm(), function( it ) {

			it.initialConfig.disabled || it.enable();

			// it.setReadOnly( it.initialConfig.disabled )

		}, this );

	},/*}}}*/

	disableForm: function() {/*{{{*/

		recurse_items( this.getForm(), function( it ) {

			// it.setReadOnly( true );
			it.disable();

		}, this );

	},/*}}}*/

	loadRecord: function() { /*{{{*/

		if ( ( ! this.rendered ) && ( ! this.isVisible() ) ) return;

		var r = this.store.cr();

		var f = this.getForm();	

		if ( r && r.get ) { 

			recurse_items( f,  function( it ) {

				it.setValue( r.get( it.name ) );

				if ( it.xtype == 'combo' && it.mode == 'remote' ) {

					// para los comboboxes que no han sido cargados aun

					it.valueNotFoundText = r.get( it.name + '_label' );
					it.setValue(r.get( it.name ) );
					delete it.valueNotFoundText;
				}

			}, this );

			var is_new = r.get('__new__');

			var enabled = ( this.store.acl.edit && !is_new ) || ( this.store.acl.add && is_new );

			this.disableForm();

			if ( enabled )

				this.enableForm();

		} else {

			f.reset();
			this.disableForm();
		}

		

		/* this.fireEvent( 'loadrecord', this, this.store, r ); */

	},/*}}}*/

	get_selections: function() {/*{{{*/

		var cr = this.store.cr();

		return ( cr == undefined ) ? [] : [cr];


	}/*}}}*/

}); // eo extend

// register xtype
Ext.reg('xpForm', Ext.ux.xpotronix.xpForm );

