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

		let me = this;

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

		let me = this,
			panel = this.panel;

		me.insert(me.form_left_button(panel));
		me.insert(me.form_right_button(panel));

		let b, pos = me.items.length - 2;

		me.callParent();

	},/*}}}*/

	/*}}}*/

	/* botones formulario 
	enable/disable de los botones de la barra izquierda y derecha */

	form_left_button: function( panel ) {/*{{{*/

		let me = this, 
			tb = new Ext.Button( {
				// id: 'leftButton',
				text: 'Atras',
						menuAlign: 'tr?',
				disabled: true,
						tooltip: 'Ir hacia el elemento previo',
				listeners:{click:{scope:me.store, fn:function() { me.selModel.selectPrevious(); },buffer:200 }}
			});

		tb.setDisabled( !me.store.rowIndex );

		me.store.on( 'selectionchange', function( selection, selModel ) { 
			tb.setDisabled( !selModel.store.rowIndex );
		}, tb );

		return tb;

	},/*}}}*/

	form_right_button: function( panel ) {/*{{{*/

		let me = this,
			tb = new Ext.Button( {
				text: 'Adelante',
						menuAlign: 'tr?',
				disabled: true,
						tooltip: 'Ir hacia el proximo elemento',
				listeners:{click:{scope:me.store, fn:function(){ me.selModel.selectNext(); },buffer:200}}
			} );

		tb.setDisabled( ! ( me.store.rowIndex < ( me.store.getCount() - 1 ) ) );

		me.store.on( 'selectionchange', function( selection, selModel ) { 
			tb.setDisabled( ! ( selModel.store.rowIndex < ( selModel.store.getCount() - 1 ) ) );
		}, tb );

		return tb;

	},/*}}}*/

});
