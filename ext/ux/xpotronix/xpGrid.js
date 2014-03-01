/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.ux.xpotronix.xpGrid = function(config) {

	Ext.apply(this, config);
	this.acl = this.acl || this.obj.acl;
	this.processes_menu = this.processes_menu || this.obj.processes_menu;
	Ext.ux.xpotronix.xpGrid.superclass.constructor.apply(this, arguments);

};

Ext.extend( Ext.ux.xpotronix.xpGrid, Ext.grid.EditorGridPanel, {

	obj: null,
	acl: null,
	layout:'fit',
	border:false,
	trackMouseOver:true,
	selModel: null,
	inspect_w: null,
	feat: null,
	loadMask: true,
	export_w: null,

	initComponent:function() {/*{{{*/

		Ext.apply( this, { 

				selModel: new Ext.grid.RowSelectionModel({
				singleSelect:false, 
				moveEditorOnEnter: false,

				onEditorKey: function(field, e) {
						// this place should be to add new editors key
        					this.constructor.prototype.onEditorKey.apply(this, arguments);
					}	
				})
			});

		this.obj.toolbar( this );

		/* eventos */


		/* solo lectura

		this.on('beforerender', function() {

			this.addListener( 'beforeedit', function() { return this.obj.acl.edit; } );

		}, this);

		*/

		this.on( 'render', function() {

			this.km = new Ext.KeyMap( this.getId(), [
				{
			            key: Ext.EventObject.DELETE,
				    scope: this,
			            shift: false,
			            ctrl: false,
			            fn: function( k, e ) {
					if ( this.acl.del ) 

						if ( e.getTarget().nodeName == 'INPUT' )
							return true;
						else
							this.obj.delete_confirm( this );
		            }
		        },
			        {
			            key: Ext.EventObject.INSERT,
				    scope: this,
			            shift: false,
			            ctrl: false,
			            fn: this.obj.addRecord
		        	}
		    	]);	
		});

		this.on('beforedestroy', function(){

			var dz = this.dz;

			this.dz && this.dz.destroy();
			delete this.dz;

		}, this);

	 	this.on('validateedit', function(e, a, b){/*{{{*/

	    		var cm = e.grid.colModel.config;
			var field = cm[e.column];

       			if ( field.editor.field.initialConfig.displayField == '_label') { 

	  			var label = field.name + '_label';
	  			e.record.data[label] = field.editor.field.getRawValue() ;	

       			}

	 	});/*}}}*/

		this.selModel.on('rowselect', function(sm, rowIndex) {/*{{{*/
		
			if ( sm.getCount() == 1 ) 
				this.store.go_to( rowIndex );

			return true;

		}, this, { buffer: 500 });/*}}}*/

		this.selModel.on( 'beforerowselect', function() {

			if ( ! Ext.isEmptyObject( this.dirty_childs() ) ) {

				Ext.Msg.alert( 'Atención', 'Hubo modificaciones: guarde o descarte los cambios' );
				return false;
			}

		}, this.store );


		this.on( 'viewready', function() {/*{{{*/

			if ( this.store.getCount() ) 
				this.selModel.selectRow( this.store.rowIndex );

		} );/*}}}*/

		this.store.on( 'add', function() {

			if ( ! this.selModel.getSelected() ) 
				this.store.go_to( 0 );

		}, this );
	

                this.store.on( 'load', function() {/*{{{*/

			if ( this.rendered && this.store.getCount() ) 
				this.selModel.selectRow( this.store.rowIndex );

		}, this);/*}}}*/

                this.store.on('changerowindex', function(s, rowIndex) {/*{{{*/

			if ( this.rendered && this.store.getCount() ) 
				this.selModel.selectRow( s.rowIndex );

                }, this );/*}}}*/
               
		// call parent
		Ext.ux.xpotronix.xpGrid.superclass.initComponent.apply(this, arguments);

	}, // eo function initComponent/*}}}*/

	onRender:function() {//{{{
		// call parent
		Ext.ux.xpotronix.xpGrid.superclass.onRender.apply(this, arguments);

		this.obj.set_toolbar( this );

		this.dz = new Ext.ux.xpotronix.GridDropZone(this, {ddGroup:this.ddGroup || 'GridDD'});	

	}, // eo function onRender//}}}

	invertSelection:function() {/*{{{*/

		var sl = this.selModel.getSelections();

		for( var i = 0; i < this.store.getCount(); i ++ ) {

			if ( this.selModel.isSelected(i))
				this.selModel.deselectRow(i);
			else
				this.selModel.selectRow(i, true);
		}
	},/*}}}*/

	startEditingBlank: function() {/*{{{*/

		this.startEditing( 0, this.findFirstEditor() );

	},/*}}}*/

	get_selections: function() {/*{{{*/

		return this.selModel.getSelections();

	},/*}}}*/

    findFirstEditor: function(){/*{{{*/
        var cols = this.getColumnModel().config;
        for (var i=0; i < cols.length; i++)
            if (!cols[i].hidden && cols[i].editor){
                return i;
            }
    },/*}}}*/
    
    //find index of last column in grid that has a visible editor

    findLastEditor: function(){/*{{{*/
        var cols = this.getColumnModel().config;
        for (var i=cols.length-1; i >= 0; i--)
            if (!cols[i].hidden && cols[i].editor){
                return i;
            }
    }/*}}}*/

	,onRecordsDrop:Ext.emptyFn

}); // eo extend

// register xtype
Ext.reg('xpGrid', Ext.ux.xpotronix.xpGrid );

