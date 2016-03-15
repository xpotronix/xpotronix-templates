/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define( 'Ext.ux.grid.xpGridFilters', { 

	extend: 'Ext.ux.grid.GridFilters',

	constructor: function(config){

		Ext.ux.grid.xpGridFilters.superclass.constructor.call(this, config );

	},

	buildQuery : function (filters) {
		var p = {}, i, f, root, dataPrefix, key, tmp,
        	    len = filters.length;

        if (!this.encode){
            for (i = 0; i < len; i++) {
                f = filters[i];
		// modificacion: organiza el array por el nombre no por el indice
		var fieldName = f.searchField ? f.searchField : f.field;
                root = [this.paramPrefix, '[', fieldName, ']'].join('');
                p[root] = f.data.value;
		// modificacion 
            }
        } else {
            tmp = [];
            for (i = 0; i < len; i++) {
                f = filters[i];
                tmp.push(Ext.apply(
                    {},
                    {field: f.field},
                    f.data
                ));
            }
            // only build if there is active filter
            if (tmp.length > 0){
                p[this.paramPrefix] = Ext.util.JSON.encode(tmp);
            }
        }
        return p;
    },

/*

        cleanParams: function(p){


                var regex = new RegExp("^" + this.paramPrefix + "\[[0-9a-zA-Z_]+\]\[[0-9a-zA-Z_]+\]");
                for(var key in p)
                        if(regex.test(key))
                                delete p[key];

        },
*/
        getFilterData: function(){
                var filters = [];

                this.filters.each(function(f){
                        if(f.active){
                                var d = [].concat(f.serialize());
                                for(var i=0, len=d.length; i<len; i++)
                                        filters.push({
						field: f.dataIndex, 
						searchField: f.searchField, 
						data: d[i]
				});
                        }
                });

                return filters;
        }
});


