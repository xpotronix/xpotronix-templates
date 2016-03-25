Ext.define('Ux.xpotronix.xpPagingToolbar', {

	extend: 'Ext.toolbar.Paging',
	alias: 'widget.xppagingtoolbar',

	alternateClassName: [
		'xppagingtoolbar'
	],

	requires: [
		'Ext.toolbar.Paging'
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

	constructor: function(config) {

		var me = this;

		var s = config.store;

		Ext.apply(config, {
			pageSize: s.pageSize,
			displayInfo: true,
			displayMsg: '{0} a {1} de {2}',
			emptyMsg: "",
			prependButtons: true
		});

		me.callParent(arguments);

	},

	initComponent: function() {
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

		// saveParamsOnLoad just fixates the params in the extraParams, before the load
		if (me.saveParamsOnLoad) {
			var store = me.store;
			store.on('beforeload', function(store, operation) {
				var params = operation.params;
				var proxy = store.getProxy();
				Ext.iterate(params, function(item, value) {
					proxy.extraParams[item] = value;
				});
			}, me);
		}

		if (Ext.isObject(me.alternateHandlers)) {
			Ext.iterate(me.alternateHandlers, function(item, value) {
				var c = me.down('#' + item);
				if (c) {
					if (Ext.isFunction(value)) {
						c.setHandler(value);
					}
				}
			});
		}
	},

	set_toolbar: function(panel) { /*{{{*/

		var tbar = panel.getTopToolbar();

		if (tbar) {

			// botones

			if (panel.getXType() == 'xpForm' || panel.getXType() == 'xpPanel') {

				tbar.insert(tbar.items.length - 2, panel.obj.form_left_button(panel));

				tbar.insert(tbar.items.length - 2, panel.obj.form_right_button(panel));
			}

			var b, pos = tbar.items.length - 2;

			if (panel.acl.del)
				tbar.insert(pos, panel.obj.del_button(panel));

			tbar.insert(pos, '->');

			if (panel.acl.edit || panel.acl.add)
				tbar.insert(pos, panel.obj.discard_changes(panel));

			tbar.insert(pos, panel.obj.export_button(panel));

			if (panel.store.foreign_key_type == 'parent')
				tbar.insert(pos, panel.obj.assign_button(panel));

			tbar.insert(pos, panel.obj.invert_button(panel));

			if (panel.processes_menu)
				tbar.insert(pos, panel.obj.add_process_menu(panel));

			if (panel.acl.edit || panel.acl.add)
				tbar.insert(pos, panel.obj.save_button(panel));

			if (panel.acl.add)
				tbar.insert(pos, panel.obj.add_button(panel));


			if (panel.obj.get_inspect_panel())
				b = tbar.insert(pos, panel.obj.inspect_button(panel));

		}


	},
	/*}}}*/

});
