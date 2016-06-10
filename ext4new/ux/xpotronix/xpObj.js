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

 	save_button: function( panel ) {/*{{{*/

        	return {
       	        	icon: '/ext/resources/images/default/dd/drop-yes.gif',
			text: 'Guardar',
                	cls: 'x-btn-text-icon',
			disabled: true,
                	tooltip: '<b>Guardar</b><br/>Pulse aqui para guardar las modificaciones',
			margin: '5 5 5 5',
			listeners:{ click:{ scope: this, fn:function( btn ) {
				debugger;
                		App.process_request({ m: App.feat.module, a: 'process', p: 'store',  x: App.serialize() });
			}, buffer:200 }}
		};


	},/*}}}*/

	add_button: function( panel ) {/*{{{*/

		return {
			icon: '/ext/resources/images/default/dd/drop-add.gif',
			cls: 'x-btn-text-icon',
			text: 'Agregar',
	                menuAlign: 'tr?',
	                tooltip: '<b>Agregar</b><br/>Pulse aqui para agregar un nuevo registro',
			margin: '5 5 5 5',
			listeners:{click:{scope:panel, fn:this.addRecord, buffer:200}}
		};


	},/*}}}*/

}); // extend

// vim600: fdm=marker sw=3 ts=8 ai:
