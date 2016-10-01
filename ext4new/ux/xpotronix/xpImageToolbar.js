/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define('Ux.xpotronix.xpImageToolbar', {

	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.xpimagetoolbar',

	panel: null,

	alternateClassName: [
		'xpimagetoolbar'
	],

	requires: [
		'Ext.toolbar.Toolbar'
	],

	/**
	 * @cfg {Boolean} hideRefresh
	 * Hide the refresh button when true
	 * Default : false
	 */

	hideRefresh: false,
	/**
	 * @cfg {Boolean} saveParamsOnLoad
	 * Convert params on load to extraParams
	 * Default : false
	 */
	saveParamsOnLoad: false,
	/**
	 * @cfg {Object} alternateHandlers
	 * Object with handler functions for first,prev,refresh,next,last
	 * Sample: 
	 *    alternateHandlers: {
	 *         first: me.PageOne,
	 *         prev: me.PagePrev,
	 *         refresh: me.PageRefresh,
	 *         next: me.PageNext,
	 *         last: me.PageLast
	 *    }
	 * Default : false
	 */
	alternateHandlers: false,

	constructor: function(config) {/*{{{*/

		/* */

		Ext.apply(config, 
			{items:[{xtype:'tbspacer'}]});

		this.callParent(arguments);

	},/*}}}*/

	initComponent: function() {/*{{{*/

		var me = this;

		Ext.applyIf(me, {
			listeners: {
				afterrender: function(tbar) {
					if (tbar.hideRefresh) {
						tbar.down('#refresh').hide();
					}
				}
			}
		});

		me.callParent();

	},/*}}}*/

	onRender: function() {/*{{{*/

		var panel = this.panel;

		this.insert(this.form_left_button(panel));
		this.insert(this.form_right_button(panel));

		var b, pos = this.items.length - 2;

		this.callParent();

	},/*}}}*/

	/*}}}*/

	/* botones formulario 
	enable/disable de los botones de la barra izquierda y derecha */

	form_left_button: function( panel ) {/*{{{*/

		var tb = new Ext.Button( {
			// id: 'leftButton',
			text: 'Atras',
	               	menuAlign: 'tr?',
			disabled: true,
	               	tooltip: 'Ir hacia el elemento previo'
			,listeners:{click:{scope:this.store, fn:function() { this.selModel.selectPrevious(); },buffer:200 }}

		});

		tb.setDisabled( !this.store.rowIndex );

		this.store.on( 'selectionchange', function( selection, selModel ) { 
			tb.setDisabled( !selModel.store.rowIndex );
		}, tb );

		return tb;

	},/*}}}*/

	form_right_button: function( panel ) {/*{{{*/

		var tb = new Ext.Button( {
			text: 'Adelante',
	               	menuAlign: 'tr?',
			disabled: true,
	               	tooltip: 'Ir hacia el proximo elemento',
			listeners:{click:{scope:this.store, fn:function(){ this.selModel.selectNext(); },buffer:200}}
			} );

		tb.setDisabled( ! ( this.store.rowIndex < ( this.store.getCount() - 1 ) ) );

		this.store.on( 'selectionchange', function( selection, selModel ) { 
			tb.setDisabled( ! ( selModel.store.rowIndex < ( selModel.store.getCount() - 1 ) ) );
		}, tb );

		return tb;

	},/*}}}*/

});
