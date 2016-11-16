/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define( 'Ux.xpotronix.xpThumbs', {

	extend: 'Ext.Panel',
	alias: 'xpThumbs', 

	obj: null,
	acl: null,
	module: this.module,
	trackMouseOver:true,
	/* layout:'fit', */
	border:false,
	tpl: null,
	dv: null,
	items: null,
	feat: null,
	loadingText: 'Cargando ...',


	constructor: function(config) {

		App.obj.get(this.class_name).panels.add(this);

		Ext.apply( config, { 

			dockedItems: [{
				xtype: 'xppagingtoolbar',
				panel: this,
				store: this.store,
				dock: 'top',
				displayInfo: true
			}],
		});


		this.tpl = this.tpl || [ 

			'<tpl for=".">',
			'<div class="thumb-wrap" id="{ID}">',
			'<div class="thumb"><img src="{image_url}" title="{full_path}"></div>',
			//'<span class="x-editable">{thumb_image}</span></div>',
			'<span>{thumb_image}</span></div>',
			'</tpl>',
			'<div class="x-clear"></div>' ];

		this.dv = this.dv || Ext.create('Ext.view.View', {

			store: this.store,
			tpl: this.tpl,
			autoHeight:true,
			multiSelect: true,
			overClass:'x-view-over',
			itemSelector:'div.thumb-wrap',
			/* emptyText: '<h1>Por favor: seleccioná un dia y un fotografo</h1>', */

			plugins: [
				Ext.create('Ext.ux.DataView.DragSelector', {}),
				Ext.create('Ext.ux.DataView.LabelEditor', {dataIndex: 'full_path'})
			],

			prepareData: function(data){

				data.image_url = App.feat.uri_thumb + 
					data.dirname + '/' +
					data.basename +
					'&wp=100&hl=100&ar=x';
					data.full_path = data.imagen || data.dirname + '/' + data.basename;
					// data.thumb_image = data.dirname + '/' + data.basename;
					data.thumb_image = data.basename;

				return data;
			}

		});

		this.items = this.items || this.dv;

		this.callParent(arguments);

	},

	initComponent:function() {

		this.callParent();

		if ( typeof this.store == 'string' ) this.store = Ext.StoreMgr.lookup( this.store );
                if ( typeof this.obj == 'string' ) this.obj = App.obj.get( this.obj );

		/* this.getForm().trackResetOnLoad = true; */

		this.acl = this.acl || this.obj.acl;
		this.processes_menu = this.processes_menu || this.obj.processes_menu;

		this.dv.on('click', function(dv, rowIndex) {/*{{{*/
	
			if ( dv.getSelectionCount() == 1 )	
				this.store.go_to( rowIndex );

		}, this, { buffer: 500 } );/*}}}*/

                this.store.on( 'load', function() {/*{{{*/

			if ( this.rendered && this.store.getCount() ) 
				this.dv.select( this.store.rowIndex );

		}, this);/*}}}*/

                this.store.on('changerowindex', function(s, rowIndex) {/*{{{*/

			if ( this.rendered && this.store.getCount() ) 
				this.dv.select( s.rowIndex );

                }, this );/*}}}*/

	},

	onRender:function() {

		this.callParent();

	},

	invertSelection:function() {

		var sl = this.dv.getNodes();

		for( var i = 0; i < sl.length; i ++ ) {

			if ( this.dv.isSelected(i))
				this.dv.deselect(i);
			else
				this.dv.select(i, true);
		}
	},

	getSelection:function(){/*{{{*/

		return this.dv.getSelectedRecords();

	}/*}}}*/

}); // eo extend
