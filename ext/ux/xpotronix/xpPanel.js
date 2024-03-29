/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.ux.xpotronix.xpPanel = function(config) {

	Ext.apply(this, config);
	this.acl = this.acl || this.obj.acl;
	this.processes_menu = this.processes_menu || this.obj.processes_menu;
	Ext.ux.xpotronix.xpPanel.superclass.constructor.apply(this, arguments);

};

Ext.extend( Ext.ux.xpotronix.xpPanel, Ext.Panel, {

	obj: null,
	acl: null,
	buttonAlign: 'left',
	feat: null,


	initComponent:function() {/*{{{*/

        	if(this.loadMask){
	            this.loadMask = new Ext.LoadMask(this.bwrap,
        	            Ext.apply({store:this.store}, this.loadMask));
	        }

		if ( this.obj.feat.paging_toolbar && ( this.acl.edit || this.acl.add ) ) {

			var buttons = [new Ext.Spacer({ width: 145 })];
			buttons.push( this.obj.save_button( this ) );
			if ( this.acl.add ) 
				buttons.push( this.obj.add_button( this ) );

			this.buttons = buttons;
		}

		this.on({

			render: { fn:function() {this.on_render();}, buffer: 200, scope: this }
		});

		this.store.on({

			// load: { fn:function(){this.loadRecord();}, scope:this },
			// update: { fn:function( s, r, o ){ if ( o == Ext.data.Record.EDIT ) this.loadRecord(); }, buffer: 200, scope:this },
			// datachanged: { fn:function() {this.loadRecord();}, buffer: 200, scope:this },
			changerowindex: { fn:function() {this.loadRecord();}, buffer: 200, scope:this },

			clear: { fn:function() {
				this.getForm && this.getForm() && this.getForm().reset();
			}, buffer: 200, scope:this }	
		});

		this.obj.toolbar( this );

		/*
		this.on('keypress', function(e) {
                	if( e.getKey() == e.RIGHT ) 	this.store.prev();
                	if( e.getKey() == e.LEFT ) 	this.store.next();
         	}, this );
		*/

		Ext.ux.xpotronix.xpPanel.superclass.initComponent.apply(this, arguments);

	}, // eo function initComponent///*}}}*/

	onRender: function() {//{{{

		// call parent
		Ext.ux.xpotronix.xpPanel.superclass.onRender.apply(this, arguments);

		this.obj.set_toolbar( this );

	},//}}}

	on_render: function() {/*{{{*/

		this.loadRecord();

	},/*}}}*/

	loadRecord: function() {/*{{{*/

		let me = this;

		if ( me.items && me.items.getCount() )
			return;

		var s = me.store;
		var r = s.cr();

		if ( me.body ) 
			if ( r ) 
				me.load({ 
					url: '?', 
					params: Ext.apply({ 
						m: App.feat.module, 
						r: me.obj.class_name, 
						v: 'card', 
						'f[include_dataset]': 2, 
						'f[blob_load]': 1, 
						'f[transform]': 'php' }, 
						s.get_search_key( s.get_primary_key() ))});
			else 
				me.update('');

	},//}}}/*}}}*/

	invertSelection:function(){//{{{

		var sm = this.getSelectionModel();
		var sl = sm.getSelections();

		for( var i = 0; i < this.store.getCount(); i ++ ) {

			if ( sm.isSelected(i))
				sm.deselectRow(i);
			else
				sm.selectRow(i, true);
		}
	},//}}}

	get_selections: function() {/*{{{*/

		return [ this.store.cr() ];

	}/*}}}*/
	

}); // eo extend

// register xtype
Ext.reg('xpPanel', Ext.ux.xpotronix.xpPanel );

