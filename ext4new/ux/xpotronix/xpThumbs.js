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
	obj, acl,
	module: this.module,

	/* id: 'images-view', */

	trackMouseOver:true,
	/* layout:'fit', */
	border:false,
	tpl, dv, items, feat,
	multi_row: true,
	loadingText: 'Cargando ...',

	constructor: function(config) {/*{{{*/

		let me = this;

		App.obj.get(me.class_name).panels.add(me);

		Ext.apply( config, { 

			dockedItems: [{
				xtype: 'xppagingtoolbar',
				panel: me,
				store: me.store,
				dock: 'top',
				displayInfo: true
			}],
		});


		me.tpl = me.tpl || [ 
		'<tpl for=".">',
			'<div class="thumb-wrap" id="{ID}">',
				'<div class="thumb"><img src="{image_url}" title="{full_path}"></div>',
				/*'<span class="x-editable">{thumb_image}</span></div>',*/
			'</div>',
		'</tpl>',
		'<div class="x-clear"></div>'
		];

		me.dv = me.dv || Ext.create('Ext.view.View', {

			store: me.store,
			tpl: me.tpl,
			autoHeight:true,
			multiSelect: true,
			overClass:'x-item-over',
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

		me.items = me.items || me.dv;

		me.callParent(arguments);

	},/*}}}*/

	initComponent:function() {/*{{{*/

		let me = this;

		me.selModel = me.dv.getSelectionModel();	

		if ( typeof me.store == 'string' ) 
			me.store = App.store.lookup( me.store );

                if ( typeof me.obj == 'string' )
			me.obj = App.obj.get( me.obj );

		/* me.getForm().trackResetOnLoad = true; */

		me.acl = me.acl || me.obj.acl;
		me.processes_menu = me.processes_menu || me.obj.processes_menu;

		me.callParent();

		me.dv.on('selectionchange', function(dv, nodes) {

			let me = this;

			/* if ( me.dv.selModel == dv ) return; */
			me.store.setSelection( nodes );
	
		}, me, { buffer: 500 } );

		me.store.on('selectionchange', function(s) {

			let me = this;

			if ( me.rendered && me.store.getCount() ) 
				me.dv.selModel.select( s );

		}, me );

	},/*}}}*/

	onRender:function() {/*{{{*/

		this.callParent();

	},/*}}}*/

	invertSelection:function() {/*{{{*/

		let me = this,
			sl = me.dv.getNodes();

		for( let i = 0; i < sl.length; i ++ ) {

			if ( me.dv.isSelected(i))
				me.dv.deselect(i);
			else
				me.dv.select(i, true);
		}
	},/*}}}*/

	getSelection:function(){/*{{{*/

		return this.dv.getSelectedRecords();

	}/*}}}*/

});
