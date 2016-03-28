/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */
Ext.ns('Ux.xpotronix');

Ext.define('Ux.xpotronix.xpStore', {

	extend: 'Ext.data.Store',
	alias: 'xpStore',

	class_name: null,
	module: null,
	parent_store: null,

	feat: {},
	acl: {},

	rowIndex: null,
	rowKey: null,
	pageSize: 20,
	filter: null,

	primary_key: this.primary_key || [],
	foreign_key: this.foreign_key || [],
	foreign_key_type: this.foreign_key_type,
	foreign_key_values: null,

	remoteSort: this.remoteSort || true,
	remoteFilter: this.remoteSort || true,
	pruneModifiedRecords: true,
	autoLoad: false,

	constructor: function(config) {

		this.params = config.params || {
			start: 0,
			limit: this.pageSize
		};

		this.childs = new Ext.util.MixedCollection(false);
		this.childs.getKey = function(o) {
			return o.storeId;
		};

		Ext.apply(this, config);
		Ext.apply(this.params, config.extra_param || {});

		/* URL */
		this.store_url = '?v=xml&a=' + App.get_feat('query_action', this) + '&r=' + this.class_name + '&m=' + this.module;
		this.blank_url = '?v=xml&a=blank&r=' + this.class_name + '&m=' + this.module;

		/* xpath para las respuestas */
		this.ns = '>' + this.class_name;
		this.ns_update = 'changes/' + this.class_name;

		this.rs = this.rs || {};

		var reader = new Ext.data.XmlReader({
			record: this.ns,
			id: '@uiid',
			totalProperty: '@total_records',
			messageProperty: '@msg'
		}, this.rs);

		this.store_proxy = new Ext.data.proxy.Ajax({
			url: this.store_url,
			reader: reader
		});

		this.blank_proxy = new Ext.data.proxy.Ajax({
			url: this.blank_url,
			reader: reader,
		});

		this.proxy = this.store_proxy;

		this.callParent(arguments);

	},

	serialize_record: function(record, fields) { /*{{{*/

		// var trim = Ext.util.Format.trim;
		var escapex = Ext.util.Format.escapeXml;

		var result = '',
			nodeList = '';
		var element = this.class_name;

		var value;

		if (Ext.isArray(fields)) {

			Ext.each(fields, function(field_name) {

				if (field_name != '__new__' || field_name != '__ID__') {

					nodeList += '<' + field_name + '>' + escapex(record.get(field_name)) + '</' + field_name + '>';
				}

			}, this);

		} else if (record.modified) {

			for (var field_name in record.modified) {

				value = record.get(field_name);
				if (value === undefined) continue;

				nodeList += '<' + field_name + '>' + escapex(value) + '</' + field_name + '>';
			}
		}

		this.childs.each(function(ch) {

			if (!Ext.isEmptyObject(ch.dirty()))
				nodeList += ch.serialize();

		}, this);

		result = '<' + element;

		result += ' uiid=\"' + escapex(record.id) + '\"'
		result += ' ID=\"' + escapex(record.get('__ID__')) + '\"'
		result += ' new=\"' + escapex(record.get('__new__')) + '\"'

		result += nodeList ? '>' + nodeList + '</' + element + '>' : '/>';

		return result;

	},
	/*}}}*/

	serialize: function(all, fields) { /*{{{*/

		var result = '',
			nodeList = '';
		var element = App.feat.container_tag;

		var records = all ? this.getAll() : this.getModifiedRecords();

		Ext.each(records, function(record) {
			if (record.dirty)
				nodeList += this.serialize_record(record, fields);

		}, this);

		result = '<' + element + ' name=\"' + this.class_name + '\"';

		result += nodeList ? '>' + nodeList + '</' + element + '>' : '/>';

		return result;
	} /*}}}*/

}); // extend

// vim600: fdm=marker sw=3 ts=8 ai:
