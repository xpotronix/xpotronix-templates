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

Ext.define('Ux.xpotronix.xpProxy', {

	extend: 'Ext.data.proxy.Ajax',
	alias: 'proxy.xpProxy',

	class_name: null, module: null, blank_url: null,

	/*
	startParam: 'g[start]',
	limitParam: 'g[limit]', 
	// pageParam: null, 
	sortParam: 'g[sort]', 
	directionParam: 'g[dir]', 
	// filterParam: null, 
	// groupParam: null, 
	// groupDirectionParam: null, 
	*/

	constructor: function( config ) {

		let me = this;

		me.url = '?v=xml&a=data&b=ext4&r=' + config.class_name + '&m=' + config.module;
		me.blank_url = '?v=xml&a=blank&b=ext4&r=' + config.class_name + '&m=' + config.module;

		me.reader = {

			type: 'xml',
			record: '>' + config.class_name,
			updates_record: 'changes/' + config.class_name,
			id: '@uiid',
			totalProperty: '@total_records',
			messageProperty: '@msg',
			root: 'c_'
		};

		me.writer = {

			type: 'xml',
			record: '>' + config.class_name,
			updates_record: 'changes/' + config.class_name,
			id: '@uiid',
			totalProperty: '@total_records',
			messageProperty: '@msg',
			root: 'c_'
		};

		me.callParent(arguments);
	},


	/*
	afterRequest: function(request, success) {
		debugger;
	},*/


    encodeFilters: function(filters) {

        let min = [],
            length = filters.length,
            i = 0;

        for (; i < length; i++) {
            min[i] = {
                property: filters[i].property,
                value   : filters[i].value
            };
        }
        return this.applyEncoding(min);
    }


}); // extend

// vim600: fdm=marker sw=3 ts=8 ai:
