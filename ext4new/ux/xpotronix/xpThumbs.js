/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define( 'Ext.ux.xpotronix.xpThumbs', {

	extend: 'Ext.Panel',
	alias: 'xpThumbs', 

	obj: null,
	acl: null,
	module: this.module,
	trackMouseOver:true,
	layout:'fit',
	border:false,
	tpl: null,
	dv: null,
	items: null,
	feat: null,
	loadingText: 'Cargando ...',


	constructor: function(config) {

	Ext.apply(this, config);

	this.tpl = this.tpl || new Ext.XTemplate(/*{{{*/

		'<tpl for=".">',
		'<div class="thumb-wrap" id="{ID}">',
		'<div class="thumb"><img src="{image_url}" title="{full_path}"></div>',
		//'<span class="x-editable">{thumb_image}</span></div>',
		'<span>{thumb_image}</span></div>',
		'</tpl>',
		'<div class="x-clear"></div>'

	);/*}}}*/

	this.dv = this.dv || new Ext.DataView({/*{{{*/

		store: this.store,
		tpl: this.tpl,
		autoHeight:true,
		multiSelect: true,
		overClass:'x-view-over',
		itemSelector:'div.thumb-wrap',
		/* emptyText: '<h1>Por favor: seleccioná un dia y un fotografo</h1>', */

		plugins: [
			new Ext.DataView.DragSelector()
			// ,new Ext.DataView.LabelEditor({dataIndex: 'full_path'})
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

	});/*}}}*/

	this.items = this.items || this.dv;

	this.acl = this.acl || this.obj.acl;
	this.processes_menu = this.processes_menu || this.obj.processes_menu;

	Ext.ux.xpotronix.xpThumbs.superclass.constructor.apply(this, arguments);

	if(this.loadMask){
		this.loadMask = new Ext.LoadMask(this.bwrap,Ext.apply({store:this.store}, this.loadMask));
       	}


},

	initComponent:function() {//{{{


		this.obj.toolbar( this );

		Ext.ux.xpotronix.xpThumbs.superclass.initComponent.apply(this, arguments);

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



	}, // eo function initComponent//}}}

	onRender:function() {//{{{
		// call parent
		Ext.ux.xpotronix.xpThumbs.superclass.onRender.apply(this, arguments);

		this.obj.set_toolbar( this );

	}, // eo function onRender//}}}

	invertSelection:function(){/*{{{*/

		var sl = this.dv.getNodes();

		for( var i = 0; i < sl.length; i ++ ) {

			if ( this.dv.isSelected(i))
				this.dv.deselect(i);
			else
				this.dv.select(i, true);
		}
	},/*}}}*/

	get_selections: function () {/*{{{*/

		return this.dv.getSelectedRecords();

	}/*}}}*/

}); // eo extend
