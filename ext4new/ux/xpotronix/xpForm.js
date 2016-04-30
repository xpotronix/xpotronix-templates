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
	loadMask: true,
	buttonAlign: 'left',
	feat: undefined,
	controller: undefined,

/*

    initEvents : function(){
        Ext.form.FormPanel.superclass.initEvents.call(this);

        if(this.loadMask){
            this.loadMask = new Ext.LoadMask(this.bwrap,
                    Ext.apply({store:this.store}, this.loadMask));
        }
    },

*/

	constructor: function(config) {/*{{{*/

		Ext.apply( config, { 

			dockedItems: [{
				xtype: 'xppagingtoolbar',
				panel: this,
				store: this.store,
				dock: 'top',
				displayInfo: true
			}],
		});

		this.callParent(arguments);

	},/*}}}*/

	initComponent:function() {/*{{{*/

		this.callParent();

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		/* busca un controlador, default la xpGrid del objeto */

		this.find_controller();

		if ( this.show_buttons && ( this.acl.edit || this.acl.add ) ) {

			this.buttons = [new Ext.toolbar.Spacer({ width: 145 })];
			this.buttons.push( this.obj.save_button( this ) );

			this.acl.add && this.buttons.push( this.obj.add_button( this ) );
		}

		this.on({ 

			afterrender: { fn: function() { this.loadRecord() }, scope: this, buffer:200 }
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
			selectionchange: { fn:function() {this.loadRecord();}, buffer: 200, scope:this },
		});

		this.store && this.store.on({

			load: { fn:function(){this.loadRecord();}, buffer: 200, scope:this },
			update: { fn:function( s, r, o ){ if ( o == Ext.data.Record.EDIT || o == Ext.data.Record.COMMIT ) this.loadRecord();}, buffer: 200, scope:this },
			// datachanged: { fn:function() {this.loadRecord();}, buffer: 200, scope:this },
			clear: {  fn:function() {this.getForm().reset();}, buffer: 200, scope:this }	
		});

	},/*}}}*/



	onRender: function() { /*{{{*/

		this.callParent();

		if ( this.controller || this.find_controller() ) {

			recurse_items( this, function(i) {

				var event_name = (i.xtype == 'checkbox') ? 'check' : 'change';

				i.on( event_name, function(e) {

					var record = this.controller.selModel.selected.first();

					if ( record ) {

						// guarda los cambios del form en el store

						// this.suspendEvents( true );

						debugger;

						record.set(e.name, e.getValue());

						// if ( e.xtype == 'combo' && e.mode == 'remote' ) DEBUG: remote??

						if ( e.xtype == 'combo' )
							
							record.set(e.name+'_label', e.getRawValue())

						// this.resumeEvents();

						// e.focus();
					}
			
					return true;

				}, this);

			}, this );

		}

		// this.loadRecord();

	},/*}}}*/

	loadRecord: function() { /*{{{*/

		var me = this;

		if ( ( ! me.rendered ) && ( ! me.isVisible() ) ) return;

		var r = me.controller.selModel.selected.first();

		if ( r && r.get ) { 

			recurse_items( me,  function( it ) {

				it.setValue( r.get( it.name ) );

				// if ( it.xtype == 'combo' && it.mode == 'remote' ) { // DEBUG: remote??
				if ( it.xtype == 'combo' ) {

					// para los comboboxes que no han sido cargados aun

					it.valueNotFoundText = r.get( it.name + '_label' );
					it.setValue(r.get( it.name ) );
					delete it.valueNotFoundText;
				}

			}, me );

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

	}/*}}}*/

}); // eo extend
