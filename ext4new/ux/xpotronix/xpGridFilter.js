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

		this.callParent( config );
	},

	buildQuery : function (filters) {

		let me = this,
			p = {}, i, f, root, dataPrefix, key, tmp,
			len = filters.length;

        if (!me.encode){
            for (i = 0; i < len; i++) {
                f = filters[i];
		// modificacion: organiza el array por el nombre no por el indice
		let fieldName = f.searchField ? f.searchField : f.field;
                root = [me.paramPrefix, '[', fieldName, ']'].join('');
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
                p[me.paramPrefix] = JSON.stringify(tmp);
            }
        }
        return p;
    },

/*

        cleanParams: function(p){


                let regex = new RegExp("^" + me.paramPrefix + "\[[0-9a-zA-Z_]+\]\[[0-9a-zA-Z_]+\]");
                for(let key in p)
                        if(regex.test(key))
                                delete p[key];

        },
*/
        getFilterData: function(){

                let me = this,
				filters = [];

                me.filters.each(function(f){

					if(f.active){

						let d = [].concat(f.serialize());

						for( let i=0, len=d.length; i<len; i++ )

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


