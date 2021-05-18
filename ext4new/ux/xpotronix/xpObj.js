/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */


Ext.ns( 'Ux.xpotronix' );

Ext.define( 'Ux.xpotronix.xpObj', { 

	extend: 'Ext.Component',
	alias: 'xpObj',

	config: 	null,

	class_name: 	null,
	translate:	null,
	parent_name:	null,
	acl:		{},
	role:		null,
	extra_param:	{},
	cm:		[],
	panels:		null,
	store:		null,
	inspect:	[],

	i_panel: null,

	columns: 	[],
	fields: 	[],
	editors:  	{},
	processes_menu: null,
	buttons: 	null,
	feat:		{},
	export_w: 	null,

	constructor: function( config ) {/*{{{*/

		this.panels = new Ext.util.MixedCollection(false);
		this.panels.getKey = function(o){ return o.id; };

		this.config = config | {};

		Ext.apply( this, config ); 

		Ux.xpotronix.xpObj.superclass.constructor.call( this );

		this.on( 'beforedestroy', function(){

			this.panels.each( function(p){ 
				p.destroy();
				this.panels.remove(p);
				delete p;
			}, this );
		});

	},/*}}}*/

	serialize_selection_item: function( item ) {/*{{{*/

		var result = '', nodeList = '';
		var element = this.class_name;

		result = '<' + element;
		result += ' ID=\"' + Ext.util.Format.escapeXml(item.get('__ID__')) + '\"'
		result += ' uiid=\"' + Ext.util.Format.escapeXml(item.id) + '\"'
		result += ' new=\"' + Ext.util.Format.escapeXml(item.get('__new__')) + '\"'
		result += '/>\n';

		return result;
	},/*}}}*/

	serialize_selections: function( sels ) {/*{{{*/

		var nodeList = '';
		var element = App.feat.container_tag;

		Ext.each( sels, function( s ) {
			nodeList += this.serialize_selection_item( s ); 
		}, this );

		return '<' + element + ' name=\"' + this.class_name + '\"' + ( nodeList ? '>\n' + nodeList + '</' + element + '>\n' : ' />\n' );

	},/*}}}*/

	inspect_window: function( panel ){/*{{{*/

		let me = panel.obj,
		xtype = me.inspect[0];

		if ( xtype == panel.xtype ) {

			panel.show();
		
		} else {

			if ( ! me.i_panel ) {

				me.i_panel = Ext.create('widget.window', {

					width: 600,
					minWidth: 300,
					height:400,
					minHeight: 200,
					closable: true,
					closeAction : 'hide',
					maximizable: true,
					layout: 'fit',
					stateful: true,
					stateId: xtype + '.inspectWindow',
					plain:true,
					border:false,
					buttonAlign:'center',
					items:[
						{
							xtype:xtype,
							region:'center'
						}
					]
				});
			}

			me.i_panel.show();
		}

	},/*}}}*/



}); // extend

// vim600: fdm=marker sw=3 ts=8 ai:
