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

	rowIndex: null,
	rowKey: null, 
	pageSize: 20,

	primary_key: this.primary_key || [],
	foreign_key: this.foreign_key || [],
	foreign_key_values: [],

	remoteSort: this.remoteSort || true,
	remoteFilter: this.remoteSort || true,
	pruneModifiedRecords: true,
	autoLoad: false,

	selection: [],

	constructor: function(config) {/*{{{*/

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

		this.callParent(arguments);

		/* eventos propios */

		this.addEvents( 'selectionchange' );
		this.addEvents( 'rowcountchange' );
		this.addEvents( 'loadblank' );
		this.addEvents( 'serverstoreupdate' ); 


		/* parent_store */

		if ( tmp = this.parent_store ) {

			var tmp;

			if ( typeof this.parent_store == 'string' )
				this.parent_store = Ext.StoreMgr.lookup( tmp ) || 
					console.error( "no encuentro el parent_store " + tmp );

			this.parent_store.add_child( this );

			/* cuando cambia el parent_store */

			this.parent_store.on({
				selectionchange: {
					buffer: 100,
					fn: this.onSelectionChange,
					scope: this
				}
			});

			/* carga un registro en blanco cuando la relacion es de parent */

			this.foreign_key.type == 'parent' && (!this.passive) &&
			this.parent_store.on({
				loadblank: {
					buffer: 100,
					fn: this.add_blank,
					scope: this
				}
			});
		}


		/* cuando el se haya modificado el store y tenga un fk == parent setea la fk */

		this.on('update', function(s, r, o) {

			if (s.foreign_key.type == 'parent' && o == Ext.data.Record.EDIT)
				s.set_parent_fk();

		}); 

		/* on load */

		this.on('load', function(s, a, b) {


			if (this.getCount()) {

				this.go_to_rowKey();

				var r = this.getAt(0);

				if (this.getCount() == 1 && r.get('__new__')) {

					/*  recibio un registro en blanco (opcion "datab" del server) */

					for (var f in r.data) {

						if (r.data[f] || Ext.isObject(r.data[f])) {

							if (!r.modified)
								r.modified = {};

							if (typeof r.modified[f] == 'undefined')
								r.modified[f] = r.data[f];

						}
					}


					if ( this.foreign_key_values.length == 0 ) {

						this.suspendEvents();
						this.bind(r, this.foreign_key_values);
						this.resumeEvents();
					}

					r.dirty = false;

					this.rowIndex = null;
					this.go_to(0);
				}

			} else {

				if (Ext.DomQuery.selectValue(App.feat.container_tag + '/@msg', this.proxy.reader.xmlData) == 'ACC_DENIED') {

					App.login();
					return;
				}

				this.rowIndex = null;

				if (App.get_feat('query_action', this) == 'datab')
					this.add_blank();
				else
					this.go_to(-1);
			}

		});

		/* this.on('beforeload', this.onBeforeLoad); */

		this.childs.each(function(ch) {

			if (!ch.passive) ch.init();

		});

	},/*}}}*/

/* events fn */

	update_model: function(e) {/*{{{*/

		/* toma los parametros del elemento XML */

		var a = e.getAttribute('action');
		var uiid = e.getAttribute('uiid');
		var ID = e.getAttribute('ID');
		var rs = null;

		if (uiid == undefined) {

			/* si no vino con uiid, trata de buscarlo en el store */

			var ri = this.find('__ID__', ID);

			if (ri > -1)

				uiid = this.getAt(ri).id;
		}

		if (a == 'i' || a == 'u') {

			/* cambia la raiz del registro para leer el elemento actual */
			this.proxy.reader.record = "";

			/* devuelve un array de records */
			rs = this.proxy.reader.readRecords(e);

			/* ajusta el totalRecords al totalLength anterior */
			rs.totalRecords = this.totalLength;

			if (uiid)
				rs.records[0].id = uiid; /* queda como el caracu. hacerlo mas eficiente */

			/* incorpora ese unico registro al store 
			   suspende los eventos para que no se propagen los load */

			this.suspendEvents();
			this.loadRecords(rs, {
				add: true
			}, true);
			this.resumeEvents();

			/* reestablece el espacio de nombres para el reader */
			this.proxy.reader.record = this.ns;

			var rr = this.findExact('id', uiid);

			rr && rr.commit();

			for (var i = 0; i < this.modified.length; i++) {
				if (this.modified[i].id == uiid) {
					this.modified.splice(i);
					break;
				}
			}


		} else if (a == 'd') {

			this.remove(this.getById(uiid));
			this.totalLength--;
			this.fireEvent('rowcountchange', this);
			this.go_to(this.rowIndex, false);

		} else {

			// error de validacion, no hace nada

		}

		return a;
	},/*}}}*/

	onBeforeLoad: function(store, options) { /*{{{*/

		if ((!options.add) && this.dirty && (!Ext.isEmptyObject(this.dirty()) || !Ext.isEmptyObject(this.dirty_childs()))) {

			Ext.Msg.alert('Atención', 'Hubo modificaciones: guarde o descarte los cambios');
			return false;

		}

		// entry_helper
		if (this.passive)
			return;

		/* DEBUG: baseParams no va en extjs4

		// Search (global search)
		if ( this.baseParams.query && this.baseParams.fields ) {

			var server_vars = [];
			var bpf = eval(this.baseParams.fields);
			var keys = this.rs.prototype.fields.keys;

			// busca el campo con _label para buscar sobre el

			for ( var i = 0; i < bpf.length ; i ++ ) {

				var io = keys.indexOf( bpf[i] + '_label' );
				server_vars.push( ( io == -1 ) ? bpf[i] : keys[io] );

			}

			var vars = server_vars.join(App.feat.key_delimiter);

                        var params = {};
                        params['s[' + this.class_name +']['+ vars +']'] = this.baseParams.query;

			Ext.apply( options.filters, params );

		}


		// FilterRow
		if (this.filter && this.filter.shown) {

			Ext.apply(options.filters, this.filter.getFilterDataXp());

		}

		*/

		/* resuelve el foreign key */

		if (this.parent_store) {

			var fk = this.foreign_key_values;

			if (Ext.isEmptyObject(fk)) return;

			if (this.parent_store.getCount()) {

				/* DEBUG: esto estaba para limitar que cuando hay una clave vacia no cargue todos los registros
				   pero ahora lo resuelve bien xpdataobject

				if ( this.foreign_key_values.length == 0 ) {
					if ( this.foreign_key.type != 'parent' ) 
						return false;
				}
				else 
				*/
				/* Ext.apply( options.filters, this.foreign_key_values ); */

			} else if (this.foreign_key.type == 'parent')
				return;
			else
				return false;
		}


	},
	/*}}}*/

	add_blank: function(options) { /*{{{*/

		options = Ext.apply({}, options);

		this.proxy = this.blank_proxy;

		this.load({
			add: true,
			scope: this,
			callback: function(abr) {

				Ext.each(abr, function(br) {

					// para los campos que vengan con datos en el server
					// los pone como modified por que si no, no los graba

					// var nr = br.copy(br.get('__ID__'));

					/*
					var nr = br.copy();
					Ext.data.Record.id( nr );
					*/

					var nr = br;

					for (var f in br.data) {

						if (br.data[f] || Ext.isObject(br.data[f])) {

							if (!nr.modified)
								nr.modified = {};

							if (typeof nr.modified[f] == 'undefined')
								nr.modified[f] = br.data[f];
						}
					}

					this.suspendEvents();

					if (this.foreign_key.type != 'parent')

						this.bind(nr, this.get_foreign_key());

					else
						this.set_parent_fk();

					this.resumeEvents();
					nr.dirty = false;

					// DEBUG: falta parametrizar en que lugar lo pone
					// DEBUG: aca fuerza a que vuelva a leer el registro. En realidad lo que cambia es la clave, no el rowIndex

					// this.insert( 0, nr ) ;

					if (!options.silent)
						this.go_to(0, false);

					if (options.callback)
						options.callback.call(options.scope || this, nr, this);

					this.fireEvent('loadblank', this, nr, options)

				}, this);

				/* volver los parametros atras para hacer los load normales */
				delete this.lastOptions.add;
				this.proxy = this.store_proxy;
			}
		});

	},
	/*}}}*/

	onSelectionChange: function( selections ) { /*{{{*/

		var me = this;

		me.clearFilter(true);

		me.foreign_key_values = ( me.parent_store && me.foreign_key.type != 'parent') ? 
		me.get_foreign_key( selections ): 
		[];

		Ext.each( me.foreign_key_values, function( key ) {
			me.addFilter( key.property, key.value );
		});

		me.load();
	},

	/*}}}*/

	getRecordCurrentForeignKey: function(r) { /*{{{*/

		var cfk = [];

		var rsfk = this.foreign_key;

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

		var ps = this.parent_store;

		if (!ps) return null;

		/* via referencia directa en la UI */

		if (ps.cr())
			return ps.cr();

		/* via match de claves */

		var cfk = this.getRecordCurrentForeignKey(r);

		var index = ps.findBy(function(pr, id) {

			var retval = true;

			Ext.each(cfk, function(ref) {

				var value = pr.get(ref.remote);

				if (value.dateFormat)
					value = value.dateFormat(App.feat.date_long_format);

				if (value != ref.value)
					retval = false;
			}, this);

			return retval;
		});

		return ps.getAt(index);

	},
	/*}}}*/

	markRecordModifiedChain: function(r, fdr) { /*{{{*/

		var pr = this.getParentRecord(r);

		if (pr && !pr.dirty) {

			var tmp = pr.get('__ID__');
			pr.set('__ID__', null);
			pr.set('__ID__', tmp);

			fdr.push(pr);

			pr.store.markRecordModifiedChain(pr, fdr);
		}

	},
	/*}}}*/

	set_parent_fk: function() { /*{{{*/

		var ps_cr = this.parent_store.cr();

		if (ps_cr) {

			var cr = this.cr();

			if (cr) {

				Ext.each(this.foreign_key, function(ref) {

					// DEBUG: podria hacerse mejor, mas selectivo de acuerdo si
					// si la clave cambio o no
					// si cualquier otro dato cambia, que haga dirty la clave, etc.
					// por ahora lo hace siempre con un update

					// if ( typeof ps_cr.modified[ref.remote] == 'undefined' )

					ps_cr.set(ref.remote, cr.get(ref.local));

				}, this);

			}
		}

	},
	/*}}}*/

	add_child: function(store) { //{{{

		this.childs.add(store);
		// store.parent_store = this;

	}, //}}}

	cr: function() { //{{{

		// current record

		return this.getAt(this.rowIndex);

	}, //}}}

	get_new: function() { //{{{

		var r = new this.rs({});
		r.data['__new__'] = 1;
		return r;

	}, //}}}

	dirty: function(check_childs) { /*{{{*/

		var mr = this.getModifiedRecords(),
			ret = {},
			c = 0,
			t;

		for (var i = 0; i < mr.length; i++)
			if (mr[i].dirty)
				c++;

		if (c)
			ret[this.class_name] = c;

		if (check_childs)
			if (t = this.dirty_childs())
				Ext.apply(ret, t);

		return ret;

	},
	/*}}}*/

	dirty_childs: function() { /*{{{*/

		var ret = {},
			t;

		this.childs.each(function(ch) {
			if (t = ch.dirty(true))
				Ext.apply(ret, t);
		});

		return ret;

	},
	/*}}}*/

	revert_changes: function() { /*{{{*/

		this.rejectChanges();

		this.each(function(r) {
			if (r.get('__new__'))
				this.remove(r);
		}, this);

		this.childs.each(function(ch) {
			ch.revert_changes();
		});

		this.go_to(this.rowIndex, false);

	},
	/*}}}*/

	pack_key: function(key) { /*{{{*/

		var pkey;

		Ext.each(key, function(item, index) {

			pkey += item;
			if (index + 1 < key.length) pkey += App.feat.key_delimiter;
		});

		return pkey;

	},
	/*}}}*/

	get_primary_key: function() { /*{{{*/

		var keys = [];

		Ext.each(this.primary_key, function(key) {

			var value = this.cr().get(key);

			keys.push({
				key: key,
				value: (value.dateFormat ? value.dateFormat(App.feat.date_long_format) : value)
			});

		}, this);

		return keys;
	},
	/*}}}*/

	get_foreign_key: function( selections ) { /*{{{*/

		var keys = [];

		if ( selections.length > 0 ) {

			Ext.each( selections, function( s ) {

				var key = {};

				Ext.each( this.foreign_key.refs, function( ref ) {

					var r = ref.remote;
					var value = s.data[r];

					key.property = ref.local;

					if (value == undefined)
						(typeof console != 'undefined') && console.error('no encuentro la clave foranea ' + ref.remote);
					else {
						key.value = value.dateFormat ?
						value.dateFormat(App.feat.date_long_format) :
						value;
					}

				}, this);

				keys.push( key );

			}, this );

		}

		return keys;

	},
	/*}}}*/

	get_search_key: function(keys) { /*{{{*/

		var search_fields = {};

		Ext.each(keys, function(key) {

			var variable = 's[' + this.class_name + '][' + key.key + ']';

			search_fields[variable] = key.value;

		}, this);

		return search_fields;
	},
	/*}}}*/

	bind: function(record, fk) { /*{{{*/

		for (var field in fk)
			record.set(field, fk[field]);

	},
	/*}}}*/

	child_match_key: function(ri, ch) { /*{{{*/

		/* checks if a current record has a child store pointing to it */

		if (!ch.foreign_key_values) return false;

		Ext.each(ch.foreign_key, function(ref) {

			var value = this.getAt(ri).get(ref.remote);

			if (value.dateFormat)
				value = value.dateFormat(App.feat.date_long_format);

			if (value != ch.foreign_key_values[ref.local])
				return false;

		}, this);

		return true;
	},
	/*}}}*/

	prev: function() { /*{{{*/

		return this.go_to(this.rowIndex - 1);
	},
	/*}}}*/

	next: function() { /*{{{*/

		return this.go_to(this.rowIndex + 1);

	},
	/*}}}*/

	set_selection: function( selection ) {/*{{{*/
	
		this.fireEvent('selectionchange', this.selection = selection );

	},/*}}}*/

	go_to: function( ri, stay ) { /*{{{*/

		if (stay === undefined)
			var stay = true;

		var c = this.getCount();

		if (stay) {

			if (ri == this.rowIndex && ri < c && ri >= 0)
				return;

		} else if (!Ext.isEmptyObject(this.dirty_childs())) {

			Ext.Msg.alert('Atención', 'Hubo modificaciones: guarde o descarte los cambios');
			return;
		}


		if (ri >= c)
			this.rowIndex = c - 1;
		else
			this.rowIndex = ri;

		this.rowKey = c ? this.cr().get('__ID__') : null;

		this.fireEvent('selectionchange', this, this.rowIndex);

		return true;

	},
	/*}}}*/

	go_to_rowKey: function() { /*{{{*/

		if (this.rowKey === null) {

			this.go_to(0, false);

		} else {

			// busca el rowKey para posicionar la barra en el mismo lugar

			var ri = null;

			if ((ri = this.find('__ID__', this.rowKey)) > -1)

				this.go_to(ri);
			else
				this.go_to(0, false); // not found
		}

	},
	/*}}}*/

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
