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

	requires: ['Ux.xpotronix.xpProxy'],

	class_name: null, 
	module: null, 
	parent_store: null,

	feat: {},
	acl: {},

	rowKey: null, 
	pageSize: 20,
	lastTotalCount: 0,

	lrid: null, /* last record ID */

	primary_key: this.primary_key || [],
	foreign_key: this.foreign_key || {},
	foreign_key_values: [],
	fake_dirty_records: [],

	remoteSort: this.remoteSort || true,
	remoteFilter: this.remoteSort || true,
	pruneModifiedRecords: true,
	autoLoad: false,

	selections: undefined,
	selModel: undefined,

	debug: false, 
	debug_events: false, 

	constructor: function(config) {/*{{{*/

		let me = this;

		me.params = config.params || {
			start: 0,
			limit: me.pageSize
		};

		me.childs = new Ext.util.MixedCollection(false);
		me.childs.getKey = function(o) {
			return o.storeId;
		};

		Ext.apply(me, config);
		Ext.apply(me.params, config.extra_param || {});

		me.callParent(arguments);

		me.debug_events && me.consoleDebugEvents();

		/* eventos propios */

		me.addEvents( 'selectionchange' );
		me.addEvents( 'loadblank' );
		me.addEvents( 'serverstoreupdate' ); 

		/* parent_store */

		if ( me.parent_store ) {

			/* resuelve el parent_store */

			if ( typeof me.parent_store == 'string' ) {

				var parent_store_name = me.parent_store;
			}

			me.parent_store = App.store.lookup( parent_store_name );

			if ( me.parent_store == undefined ) {
			
				console.log( "no encuentro el parent_store " + parent_store_name );

			} else {

				me.parent_store.add_child( me );

				/* cuando cambia el parent_store */

				me.parent_store.on({

					selectionchange: {
						scope: me,
						fn: me.onParentSelectionChange
					},

					serverstoreupdate: {

						buffer: 100,
						scope: me,
						fn: function( a, b, c ) {

							let me = this;

							/* si es un eh lo ignora */

							if ( me.foreign_key.type == 'eh' ) return;

							let selections = me.parent_store.selections;

							if ( selections.length ) {

								let new_fk = me.get_foreign_key( [me.parent_store.selections[0]] );

								for ( let i = 0; i < new_fk.length ; i++ ) {

									if ( new_fk[i].value !== me.foreign_key_values[i].value ) {

										me.foreign_key_values = new_fk;
										me.load();
										break;
									}
								}

							} else {

								me.foreign_key_values = [];
								me.removeAll();
							}

						}

					}
				});

				/* carga un registro en blanco cuando la relacion es de parent */

				if ( me.foreign_key.type == 'parent' && ( !me.passive ) ) {

					me.parent_store.on({

						loadblank: {

							buffer: 100,
							fn: me.add_blank,
							scope: me
						}
					});
				}

			}
		}


		/* cuando el se haya modificado el store y tenga un fk == parent setea la fk */

		me.on({ 

			update: { 

				fn: function(s, r, o, m) {

					me.debug && console.log( 'update op: ' + o + ', class: ' + me.class_name + ', record modified: ' + JSON.stringify( r.modified ) );

					if ( o == Ext.data.Record.EDIT ) {

						if ( s.foreign_key.type == 'parent' ) 
							s.set_parent_fk();

					}
				}
			}, 

			load: {

				fn: function(s, a, b) {

					if (Ext.DomQuery.selectValue(App.feat.container_tag + '/@msg', me.proxy.reader.xmlData ) == 'ACC_DENIED') {

						App.login();
						return;
					}
				}
			},

			remove: {

				fn: function() {

					let me = this; 

					me.totalCount--;

					if ( me.lrid == me.count() ) {

						me.lrid--;

					}


				}

			},

			beforeload: {

				fn: me.onBeforeLoad
			}
		}); 


		me.childs.each(function(ch) {

			if (!ch.passive) 
				ch.init();

		});

	 },/*}}}*/ 

	/* events fn */

	consoleDebugEvents: function() { /*{{{*/

		return Ext.util.Observable.capture( this, 

			function() {

				let event_name = arguments[0],
					storeId = arguments[1].storeId;

				if ( ['selectionchange'].includes( event_name ) ) {

					storeId = arguments[2].store.storeId;

				}

				console.log( { event_name: event_name, storeId: storeId } );
			}
		);

	}, /*}}}*/

	lookup: function( store ) {/*{{{*/

		return App.store.lookup( this.module + '.' + store );

	},/*}}}*/

	getTotalCount: function() {/*{{{*/

		let me = this;

		if ( me.lastTotalCount )
			me.totalCount = me.lastTotalCount;

		return me.totalCount || 0;
	},/*}}}*/

	findByUiid: function(value, start) {/*{{{*/
		let me = this;
		return me.data.findIndexBy(function(rec) {
			return rec.isEqual(rec.id, value);
		},
		me, start);
	},/*}}}*/

	update_model: function(e) {/*{{{*/

		let me = this,
			reader = me.proxy.reader;

		/* toma los parametros del elemento XML */

		let ID 	 = e.getAttribute('__ID__'),
			uiid = e.getAttribute('uiid');

		me.lrid = me.findByUiid(uiid);

		console.log( 'me.lrid: ' +me.lrid );

		if (uiid === undefined) {

			/* si no vino con uiid, trata de buscarlo en el store */
			let ri = me.find('__ID__', ID);

			if (ri > -1)
				uiid = me.getAt(ri).id;
		}

		let a = e.getAttribute('action');

		if (a == 'i' || a == 'u') {

			let prev_record = reader.record,
				prev_root = reader.root;

			/* cambia las queries para poder leer changes/* */
			reader.record = "";
			reader.root = "";

			/* devuelve un array de records */
			let rs = reader.readRecords(e),
				nr = rs.records[0];

			/* reestablece el espacio de nombres para el reader */
			reader.record = prev_record;
			reader.root = prev_root;

			/* ajusta el totalRecords al totalCount anterior */
			rs.totalRecords = me.totalCount;


			if ( me.lrid >= 0 ) {

				/* modifica */
				let er = me.getAt(me.lrid);

				er.set(nr.getData());
				er.commit();

			} else {

				/* agrega */
				me.add(nr);
			}

		} else if (a == 'd') {

			console.log( 'lrid: ' +me.lrid );

			me.removeAt(me.lrid);

		} else {

			// error de validacion, no hace nada

		}

		return a;
	},/*}}}*/

  buildXpQuery: function( params ) {/*{{{*/

	let k, o = {}, cn = 
		  this.class_name;

	for ( let f in params ) {
		if ( params[f] ) {
			o['s['+cn+']['+f+']'] = params[f];
		}
	}
	return o;
   },/*}}}*/

	onBeforeLoad: function(store, options) { /*{{{*/

		/* check del acl */

		let me = this;

		if ( me.acl.access == false || me.acl.list == false || me.acl.view == false )
			return false;

		/* control de carga de los registros nuevos */

		if ((!options.add) && me.isDirty() && 
			(! _.isEmpty(me.dirty())|| 
				!_.isEmpty(me.dirty_childs()))) {

			let url = store.lastOptions.url;

			if ( url && getQueryParams(url).a == 'blank' ) {

				/* esta cargando un registro en blanco y agrega al store */
				return true;

			} else {

				Ext.Msg.alert('Atención', 'Hubo modificaciones: guarde o descarte los cambios');
				return false;
			}

		}

		// entry_helper
		if (me.passive)
			return;

		/* resuelve el foreign key */

		if (me.parent_store) {

			let fk = me.foreign_key_values;

			if ( _.isEmpty(fk) ) return;

			if (me.parent_store.getCount()) {


				/* filter de clave foranea */

				/* DEBUG: esto estaba para limitar que cuando hay una clave vacia no cargue todos los registros
				   pero ahora lo resuelve bien xpdataobject

				if ( me..length == 0 ) {
					if ( me.foreign_key.type != 'parent' ) 
						return false;
				}
				else 
				*/
				/* Ext.apply( options.filters, me. ); */

			} else if (me.foreign_key.type == 'parent')
				return;
			else
				return false;
		}


	},
	/*}}}*/

	add_blank: function(options) { /*{{{*/

		options = Ext.apply({}, options);

		let me = this;

		/* guarda el totalCount */

		me.lastTotalCount = me.totalCount;

		me.load({

			addRecords: true,
			scope: me,
			url: me.proxy.blank_url,

			callback: function( brs ) {

				let me = this;

				/* resetea el lastTotalCount */
				me.lastTotalCount = 0;

				me.suspendEvents();

				/* por cada registro recibido */
				Ext.each( brs, function( br ) {

					/* marcas de dirty para campos con valores */
					me.initRecord( br );

					//me.suspendEvents();
					if ( me.parent_store ) {

						if (me.foreign_key.type == 'parent')
							me.set_parent_fk();

						else if ( me.parent_store.selections.length )
							me.bind(br, me.get_foreign_key( [me.parent_store.selections[0]] ));

					}

					/* si no lo guarda no lo considera modificado */
					br.dirty = false;

					/* callback para despues de agregar en blanco */
					if (options.callback)
						options.callback.call(options.scope || me, br, me);


				}, me);

				me.resumeEvents();

				// me.fireEvent('selectionchange', brs, me.selModel);
				me.fireEvent('loadblank', me, brs, options);

				/* volver los parametros atras para hacer los load normales */
				delete me.lastOptions.add;
			}
		});

	},
	/*}}}*/

    loadRecords: function(records, options) {//{{{

	    /* redefinicion de loadRecords para poder
	     * insertar registros al principio */

        let me = this,
			length = records.length,
			start, addRecords, 
			snapshot = me.snapshot
			i = 0;

        if (options) {
            start = options.start;
            addRecords = options.addRecords;
        }

        if (!addRecords) {
            delete me.snapshot;
            me.clearData(true);
        } else if (snapshot) {
            snapshot.addAll(records);
        }

        me.data.insert(0, records);

        if (start !== undefined) {
            for (; i < length; i++) {
                records[i].index = start + i;
                records[i].join(me);
            }
        } else {
            for (; i < length; i++) {
                records[i].join(me);
            }
        }

        /*
         * this rather inelegant suspension and resumption of events is required because both the filter and sort functions
         * fire an additional datachanged event, which is not wanted. Ideally we would do this a different way. The first
         * datachanged event is fired by the call to this.add, above.
         */
        
		me.suspendEvents();

        if (me.filterOnLoad && !me.remoteFilter) {
            me.filter();
        }

        if (me.sortOnLoad && !me.remoteSort) {
            me.sort(undefined, undefined, undefined, true);
        }

        me.resumeEvents();

        if (me.isGrouped()) {
            me.constructGroups();
        }

        me.fireEvent('datachanged', me);
        me.fireEvent('refresh', me);

    },//}}}

	initRecord: function( nr, br ) {/*{{{*/

		if ( br == undefined ) br = nr;

			for (let f in br.data) {

				if (br.data[f] || Ext.isObject(br.data[f])) {

					if (!nr.modified)
						nr.modified = {};

					if (typeof nr.modified[f] == 'undefined')
						nr.modified[f] = br.data[f];
				}
			}
	},/*}}}*/

	onParentSelectionChange: function( selections ) { /*{{{*/

		/* evento que sigue la seleccion del parent */

		let me = this, data = [];

		if ( selections.length > 1 ) {

			/* en seleccion multiple, remueve los datos del store, tambien para los eh */

			me.removeAll();
			return;

		}

		me.selections = selections;

		me.clearFilter(true);

		if ( me.foreign_key.type == 'parent') {

			me.foreign_key_values = [];

		} else if ( me.foreign_key.type == 'eh' ) {

			/* DEBUG */

			// data = me.get_foreign_key_record(selections, true);
			// me.debug && console.log(data);
			// me.insert(0,data);


		} else {

			me.foreign_key_values = me.get_foreign_key( selections );

			if ( me.foreign_key_values.length ) {

				Ext.each( me.foreign_key_values, function( filter ) {
					me.filter( filter );
				});

			} else {

				me.removeAll();
			}


		}

	},

	/*}}}*/

	getRecordCurrentForeignKey: function(r) { /*{{{*/

		let cfk = [],
			rsfk = this.foreign_key;

		Ext.each(rsfk, function(ref) {

			cfk.push({
				local: ref.local,
				remote: ref.remote,
				value: r.get(ref.local)
			});

		}, this);

		return cfk;
	},
	/*}}}*/

	getParentRecord: function(r) { /*{{{*/

		let me = this,
			ps = me.parent_store;

		if (!ps) return null;

		/* via referencia directa en la UI */

		if (ps.cr())
			return ps.cr();

		/* via match de claves */

		let cfk = me.getRecordCurrentForeignKey(r);

		let index = ps.findBy(function(pr, id) {

			let retval = true;

			Ext.each(cfk, function(ref) {

				let value = pr.get(ref.remote);

				if (value.toLocaleDateString)
					value = value.toLocaleDateString();

				if (value != ref.value)
					retval = false;
			}, me);

			return retval;
		});

		return ps.getAt(index);

	},
	/*}}}*/

	set_parent_fk: function() { /*{{{*/

		let me = this, 
			ps_cr = me.parent_store.cr();

		if ( ps_cr ) {

			let cr = me.cr();

			if (cr) {

				Ext.each(me.foreign_key, function(ref) {

					// DEBUG: podria hacerse mejor, mas selectivo de acuerdo si
					// si la clave cambio o no
					// si cualquier otro dato cambia, que haga dirty la clave, etc.
					// por ahora lo hace siempre con un update

					// if ( typeof ps_cr.modified[ref.remote] == 'undefined' )

					ps_cr.set(ref.remote, cr.get(ref.local));

				}, me);

			}
		}

	},
	/*}}}*/

	add_child: function(store) { //{{{

		this.childs.add(store);
		// store.parent_store = this;

	}, //}}}

	cr: function() {/*{{{*/

		/* current record */
		let me = this;

		return ( me.selections.length ) ? me.selections[0] : {};

	},/*}}}*/

	getSelection: function() {/*{{{*/

		return this.selections;

	},/*}}}*/

	get_new: function() { //{{{

		let r = new this.rs({});
		r.data['__new__'] = 1;
		return r;

	}, //}}}

	isDirty: function() {/*{{{*/

		let me = this;

		let retval = (me.getNewRecords().length > 0 || 
			me.getUpdatedRecords().length > 0 || 
			me.getRemovedRecords().length > 0);

		me.debug && console.log( me.storeId + '.isDirty(): ' + retval );
		return retval;

	},/*}}}*/

	dirty: function(check_childs) { /*{{{*/

		let me = this,
			mr = me.getModifiedRecords(),
			ret = {},
			c = 0,
			t;

		for (let i = 0; i < mr.length; i++)
			if (mr[i].dirty)
				c++;

		if (c)
			ret[me.class_name] = c;

		if (check_childs)
			if (t = me.dirty_childs())
				Ext.apply(ret, t);

		return ret;

	},
	/*}}}*/

	dirty_childs: function() { /*{{{*/

		let me = this, ret = {},
			t;

		me.childs.each(function(ch) {
			if (t = ch.dirty(true))
				Ext.apply(ret, t);
		});

		return ret;

	},
	/*}}}*/

	revert_changes: function() { /*{{{*/

		let me = this;

		if ( me.foreign_key.type != 'eh' ) 
			me.rejectChanges();

		me.each(function(r) {
			if ( ( ! _.isEmpty(r) ) && r.get('__new__'))
				me.remove(r);
		}, me);

		me.childs.each(function(ch) {
			ch.revert_changes();
		});

	},
	/*}}}*/

	pack_key: function(key) { /*{{{*/

		let pkey;

		Ext.each(key, function(item, index) {

			pkey += item;
			if (index + 1 < key.length) pkey += App.feat.key_delimiter;
		});

		return pkey;

	},
	/*}}}*/

	get_primary_key: function() { /*{{{*/

		let me = this,
			keys = [];

		Ext.each(me.primary_key, function(key) {

			let value = me.cr().get(key);

			keys.push({
				key: key,
				value: (value.toLocaleDateString ? value.toLocaleDateString() : value)
			});

		}, me);

		return keys;
	},
	/*}}}*/

	get_foreign_key: function( selections ) { /*{{{*/

		let me = this,
			keys = [];

		selections || ( selections = me.selections );

		if ( selections.length > 0 ) {

			Ext.each( selections, function( s ) {

				let key = {};

				Ext.each( me.foreign_key.refs, function( ref ) {

					let r = ref.remote,
						value = s.data[r];

					key.property = ref.local;

					if (value === undefined)
						console.log('no encuentro la clave foranea ' + ref.remote);
					else {

						if ( value.toLocaleDateString ) 
							key.value = value.toLocaleDateString();
						else
							key.value = value;
					}

				}, me);

				keys.push( key );

			}, me );

		}

		return keys;

	},
	/*}}}*/

	get_field_metadata: function( field_name ) {/*{{{*/
	
		return this.model.getFields().find( o => o.name === field_name );
	
	},/*}}}*/

	get_foreign_key_record: function( selections, label ) { /*{{{*/

		let me = this, 
			keys = [], 
			key = {}, 
			i, j, ref, s, r, rl, value;

		if ( selections.length > 0 ) {

			for( i = 0; i < selections.length; i++ ) {	

				key = {};
				s = selections[i];

				for( j = 0; j < me.foreign_key.refs.length; j ++ ) {

					ref = me.foreign_key.refs[j];
					r = ref.remote;
					rl = ref.remote + '_label';
					value = s.data[r];

					if (value === undefined)
						console.log('no encuentro la clave foranea ' + ref.remote);
					else {
						value = value.toLocaleDateString ?
						value.toLocaleDateString :
						value;
					}


					/* hot fix para que traiga directamente el registro con id y _label */

					if ( label ) {

						key['id'] = value;
						key['_label'] = s.data[rl];

					} else {

						key[r] = value;
						key[rl] = s.data[rl];
					}

				}

				keys.push( key );

			}

		}

		return keys;

	},
	/*}}}*/

	get_search_key: function(keys) { /*{{{*/

		let me = this,
			search_fields = {};

		Ext.each(keys, function(key) {

			let variable = 's[' + me.class_name + '][' + key.key + ']';

			search_fields[variable] = key.value;

		}, me);

		return search_fields;
	},
	/*}}}*/

	bind: function(record, fk) { /*{{{*/

		/*
		for (let field in fk)
			record.set(field, fk[field]);
		*/

		Ext.each( fk, function( field ) {
			record.set(field.property,field.value);
		});

	},
	/*}}}*/

	child_match_key: function(ri, ch) { /*{{{*/

		let me = this;

		/* checks if a current record has a child store pointing to it */

		if (!ch.foreign_key_values) return false;

		Ext.each(ch.foreign_key, function(ref) {

			let value = me.getAt(ri).get(ref.remote);

			if (value.toLocaleDateString)
				value = value.toLocaleDateString();

			if (value != ch.foreign_key_values[ref.local])
				return false;

		}, me);

		return true;
	},
	/*}}}*/

	setSelection: function( selections, selModel ) {/*{{{*/

		let me = this, curPos;

		me.selections = selections;

		if ( selModel )
			me.selModel = selModel;

		if ( ( curPos = me.selModel.getCurrentPosition() ) !== undefined )
			me.rowIndex = curPos.row;
		else
			me.rowIndex = undefined;

		me.fireEvent('selectionchange', selections, me.selModel );

	},/*}}}*/

	serialize_record: function(record, fields) { /*{{{*/

		// let trim = Ext.util.Format.trim;
		let me = this, escapex = Ext.util.Format.escapeXml,
		element = me.class_name,
		result = '',
		nodeList = '',
		value;

		if (Ext.isArray(fields)) {

			Ext.each(fields, function(field_name) {

				if (field_name != '__new__' || field_name != '__ID__') {

					nodeList += '<' + field_name + '>' + escapex(record.get(field_name)) + '</' + field_name + '>';
				}

			}, me);

		} else if (record.modified) {

			for (let field_name in record.modified) {

				value = record.get(field_name);
				if (value === undefined) continue;

				nodeList += '<' + field_name + '>' + escapex(value) + '</' + field_name + '>';
			}
		}

		me.childs.each(function(ch) {

			if (! _.isEmpty(ch.dirty()))
				nodeList += ch.serialize();

		}, me);

		result = '<' + element;

		result += ' uiid=\"' + escapex(record.id) + '\"'
		result += ' ID=\"' + escapex(record.get('__ID__')) + '\"'
		result += ' new=\"' + escapex(record.get('__new__')) + '\"'

		result += nodeList ? '>' + nodeList + '</' + element + '>' : '/>';

		return result;

	},
	/*}}}*/

	serialize: function(all, fields) { /*{{{*/

		let me = this,
			result = '',
			nodeList = '',
			element = App.feat.container_tag,
			records = all ? me.getAll() : me.getModifiedRecords();

		Ext.each(records, function(record) {
			if (record.dirty)
				nodeList += me.serialize_record(record, fields);

		}, me);

		result = '<' + element + ' name=\"' + me.class_name + '\"';

		result += nodeList ? '>' + nodeList + '</' + element + '>' : '/>';

		return result;

	},/*}}}*/

	get_last_ancestor: function() { /*{{{*/

		let me = this;

		return  me.parent_store ? 
			me.parent_store.get_last_ancestor():
			me;

	},/*}}}*/

	/* filters */

	get_filters_values( unnormalized = false ) {//{{{

		/* con unnormalized = false devuelve un objeto con las propiedades por cada filtro asignado
		 * con unnormalized = true devuelve un objeto con un atributo con el nombre de la variable */

		let me = this,
			active_filters = me.getFilters(false),
			filters_array = [];

		active_filters.each( function(item) {

			let filter = [];

			if ( unnormalized ) {

				filter = { [item.property]: item.value };

			} else {

				filter = {
					'operator': item.operator,
					'property': item.property,
					'value' : 	item.value
				};
			}

			Ext.Array.push(filters_array, filter);
		});

		return filters_array;

	},//}}}

	/* store changes handling */

	serialize_all: function() {/*{{{*/

		let me = this,
			md = me.getStoresMods();

		me.debug && me.debug_show_changed_records( md );

		return me.get_last_ancestor().serialize();

	},/*}}}*/

	getStoresMods: function() {/*{{{*/

		/* iteracion sobre los stores modificados */

		let me = this,
			list = [];

		me.getModifiedStores( list );

		if ( list.length ) {

			Ext.each( list, function( o ) {

				o.records = o.store.getModifiedRecords();

				Ext.each( o.records, function( r ) {

					o.store.markModifiedRecordChain( r, me.fake_dirty_records );

				}, me );
			
			}, me );
		}

		return list;

	},/*}}}*/

	getModifiedStores: function( list ) {/*{{{ */

		let me = this,
			r_list = list || [];

		/* recursion entre los hijos y sus modificaciones */

		if( me.dirty && ! _.isEmpty( me.dirty() ) )

			r_list.push( { store: me, records: null } );

		me.childs.each( function( c ) {

			c.getModifiedStores( r_list );

		});

		return r_list;

	},/*}}}*/

	markModifiedRecordChain: function(r, fdr) { /*{{{*/

		/* marca los parents como 'dirty' cuando el hijo esta modificado */

		let pr = this.getParentRecord(r);

		if (pr && !pr.dirty) {

			pr.setDirty();
			fdr.push( pr );
			pr.store.markModifiedRecordChain( pr, fdr );
		}

	},/*}}}*/

	save: function() {/*{{{*/

		/* DEBUG: fijarse si es otro el store object y si aca se hace la distincion */

		let me = this, 
			module = me.get_last_ancestor().class_name;

		App.process_request( { m:module, a:'process', p:'store', b:'ext4', x:me.serialize_all() }, 
			function( a, b, c ) {

			Ext.each( me.fake_dirty_records, function( r ) { 
				r.commit(); 
			} );

		});

	},/*}}}*/

	debug_show_changed_records: function( md ) {/*{{{*/

		let message = '';

		if ( md.length ) {

			message = '<ul>';

			Ext.each( md, function( o ){
				message += "<li>store: " + o.store.class_name + ", records: " + o.records.length + "</li>";
			}, this);

			message += '</ul>';
		} else
			message = 'No hay cambios que guardar';

		Ext.Msg.show({

			msg: message,
			buttons: Ext.Msg.OK,
			width: 400
		});

	}/*}}}*/

}); // extend

// vim600: fdm=marker sw=3 ts=8 ai:
