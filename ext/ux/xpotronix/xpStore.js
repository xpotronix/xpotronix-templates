/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.ns( 'Ext.ux.xpotronix' );

Ext.ux.xpotronix.xpStore = function( config ) {


	this.paramNames = {
		start : 'g[start]',
		limit : 'g[limit]',
		sort : 'g[sort]',
		dir : 'g[dir]'
	};


	this.params = config.params || { start: 0, limit: this.pageSize };

    	this.childs = new Ext.util.MixedCollection(false);
    	this.childs.getKey = function(o){ return o.storeId; };

	Ext.apply( this, config ); 
	Ext.apply( this.params, config.extra_param || {} );

	this.store_url  = '?v=xml&a='+ App.get_feat( 'query_action', this ) +'&r=' + this.class_name + '&m=' + this.module;
	this.blank_url  = '?v=xml&a=blank&r=' + this.class_name + '&m=' + this.module;

	this.ns = '>' + this.class_name;
	this.ns_update = 'changes/' + this.class_name;

	this.rs = this.rs || {};
	
	this.proxy =  new Ext.data.HttpProxy({ url: this.store_url, useAjax: true });
	this.reader = new Ext.data.XmlReader({ record: this.ns, id: '@uiid', totalProperty: '@total_records', messageProperty: '@msg' }, this.rs );

	this.blank_ds = new Ext.data.Store({

		proxy: new Ext.data.HttpProxy({ url: this.blank_url, useAjax: true }),
		reader: new Ext.data.XmlReader({ record: this.ns, totalProperty: '@total_records' }, this.rs )

	});

	this.blank_ds.data_store = this;

	Ext.ux.xpotronix.xpStore.superclass.constructor.call( this );

	this.addEvents( 'changerowindex' );

	// eventos

	this.parent_store && this.parent_store.on({ 
		changerowindex:  { buffer: 100, fn: this.on_changerowindex, scope: this }
	});


	this.on( 'update', function( s, r, o ) {/*{{{*/

		if ( s.foreign_key_type == 'parent' && o == Ext.data.Record.EDIT ) 
			s.update_parent_fk();

	});/*}}}*/
	
	this.on( 'load', function( s, a, b ) {//{{{

		if ( this.parent_store ) 

			this.foreign_key_values = this.get_foreign_key();


		if ( this.getCount() ) {

			this.go_to_rowKey();


			var r = this.getAt(0);

			if ( this.getCount() == 1 && r.get('__new__') ) {

				// tiene un unico registro en blanco (opcion "datab" del server)

				for ( var f in r.data ) {

        		        	if ( r.data[f] || Ext.isObject( r.data[f] ) ) {

	                	        	if ( !r.modified )
        	                	        	r.modified = {};

	                	        	if ( typeof r.modified[f] == 'undefined')
        	                	        	r.modified[f] = r.data[f];

	        	        	}
	        		}

				this.suspendEvents();
				this.set_foreign_key( r, this.get_foreign_key() );
				this.resumeEvents();
				r.dirty = false;

				this.rowIndex = null;
				this.go_to( 0 );
			}

		} else {

			if ( Ext.DomQuery.selectValue( App.feat.container_tag + '/@msg', this.reader.xmlData) == 'ACC_DENIED' ) {

				App.login();
				return;
			}

			this.rowIndex = null;

			if ( App.get_feat( 'query_action', this ) == 'datab' )
				this.add_blank();
			else
				this.go_to( -1 );
		}

	});//}}}
 
 	this.on( 'beforeload', function( store, options ) {//{{{

		if ( this.dirty() || this.dirty_childs() ) {

			Ext.Msg.alert( 'Atención', 'Hubo modificaciones: guarde o descarte los cambios' );
                        return false;

		}

		// entry_helper
		if ( this.passive )
			return;

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

			Ext.apply( options.params, params );

		}

		// FilterRow
		if ( this.filter && this.filter.shown ) {

			Ext.apply( options.params, this.filter.getFilterDataXp() );

		}

		
		if ( this.parent_store ) {

			var fk = this.get_foreign_key();

			if ( this.parent_store.getCount() ) {

				if ( this.is_foreign_key_empty() ) {
					if ( this.foreign_key_type != 'parent' ) 
						return false;
				}
				else
					Ext.apply( options.params, this.get_foreign_key() );

			} 
			else if ( this.foreign_key_type == 'parent' )
				return;
			else
				return false;
		}
  	});//}}}

	this.childs.each( function( ch ) {//{{{

		if ( ! ch.passive ) ch.init();

	});//}}}

}

Ext.extend( Ext.ux.xpotronix.xpStore, Ext.data.Store, {

	class_name: 	null,
	module: 	null,
	parent_store: 	null,
	rowIndex: 	null,
	rowKey: 	null,
	pageSize:	20,
	filter:		null,

	primary_key: 	this.primary_key || [],
	foreign_key: 	this.foreign_key || [],
	foreign_key_type: 	this.foreign_key_type,
	foreign_key_values: null,
	remoteSort: 	this.remoteSort || true,
	feat:		{},
	acl:		{},
	pruneModifiedRecords: true,

	add_blank: function( options ) {/*{{{*/

	        options = Ext.apply({}, options);

		this.blank_ds.load({scope: this, callback: function( abr ){

			Ext.each( abr, function( br ){

				// para los campos que vengan con datos en el server
				// los pone como modified por que si no, no los graba

				// var nr = br.copy(br.get('__ID__'));

				var nr = br.copy();
				Ext.data.Record.id( nr );


				for ( var f in br.data ) {

        		        	if ( br.data[f] || Ext.isObject( br.data[f] ) ) {

	                	        	if ( !nr.modified )
        	                	        	nr.modified = {};

	                	        	if ( typeof nr.modified[f] == 'undefined')
        	                	        	nr.modified[f] = br.data[f];

	        	        	}
	        		}


				if ( this.foreign_key_type != 'parent' ) {

					this.suspendEvents();
					this.set_foreign_key( nr, this.get_foreign_key() );
					this.resumeEvents();
				}

				nr.dirty = false;

				// DEBUG: falta parametrizar en que lugar lo pone
				// DEBUG: aca fuerza a que vuelva a leer el registro. En realidad lo que cambia es la clave, no el rowIndex

				this.insert( 0, nr ) ;
				this.go_to( 0, false );

				if ( options.callback )
					options.callback.call(options.scope || this, nr, this );

			}, this );

		}});
	},/*}}}*/

	on_changerowindex: function( s, ri ) {/*{{{*/

		// DEBUG: access en juscaba2
		if ( ( !this.acl.access && ! App.application == 'juscaba2' ) || !this.acl.list || !this.foreign_key.length || this.passive ) 
			return;

		if ( ri == -1 || this.parent_store.cr().get('__new__')) {

			this.removeAll();
			this.go_to( -1 );

		} else 
			this.load();
		
	},/*}}}*/

	getRecordCurrentForeignKey: function( r ) {/*{{{*/

		var cfk = [];

		var rsfk = this.foreign_key;

		Ext.each( rsfk, function( ref ) {

			cfk.push({
				local: ref.local,
				remote: ref.remote,
				value: r.get( ref.local )
			});

		}, this );

		return cfk;
	},/*}}}*/

	getParentRecord: function( r ) {/*{{{*/

		var ps = this.parent_store;

		if ( ! ps ) return null;

		var cfk = this.getRecordCurrentForeignKey( r );

		var index = ps.findBy( function( pr, id ) {

			var retval = true;

			Ext.each( cfk, function( ref ) {

				var value = pr.get( ref.remote );

				if ( value.dateFormat )
					value = value.dateFormat( App.feat.date_long_format );

				if ( value != ref.value ) 
					retval =  false;
			}, this );

			return retval;
		});

		return ps.getAt( index );

	},/*}}}*/ 

	markRecordModifiedChain: function( r, fdr ) {/*{{{*/

		var pr = this.getParentRecord( r );

		if ( pr && ! pr.dirty ) {

			var tmp = pr.get('__ID__');
			pr.set('__ID__', null );
			pr.set('__ID__', tmp );

			fdr.push( pr );

			pr.store.markRecordModifiedChain( pr, fdr );
		}

	},/*}}}*/

	update_parent_fk: function() {/*{{{*/

		var ps_cr = this.parent_store.cr();

		if ( ps_cr ) {

			var cr = this.cr();

			if ( cr ) {

				Ext.each( this.foreign_key, function( ref ) {

					// DEBUG: podria hacerse mejor, mas selectivo de acuerdo si
					// si la clave cambio o no
					// si cualquier otro dato cambia, que haga dirty la clave, etc.
					// por ahora lo hace siempre con un update

					// if ( typeof ps_cr.modified[ref.remote] == 'undefined' )

					ps_cr.set(ref.remote, cr.get(ref.local));

				}, this );

			}
		}

	},/*}}}*/

	add_child: function( store ) {//{{{

		this.childs.add( store );
		// store.parent_store = this;

	},//}}}

	cr: function() {//{{{

		// current record

		return this.getAt( this.rowIndex );

	},//}}}

	get_new: function() {//{{{

		var r = new this.rs({});
		r.data['__new__'] = 1;
		return r;

	},//}}}

	dirty: function( childs ) {/*{{{*/

		var mr = this.getModifiedRecords();

		for( var i = 0; i < mr.length; i ++ )
			if ( mr[i].dirty )
				return true;

		if ( childs ) 
			return this.dirty_childs();
		else
			return false;

	 },/*}}}*/

	dirty_childs: function() {/*{{{*/

		var ret = false;

		this.childs.each( function( ch ) {
			if ( ch.dirty( true ) ) {
				ret = true;
				return;
			}
		} );
	
		return ret;

	},/*}}}*/

	revert_changes: function() {/*{{{*/

		this.rejectChanges();

		this.each( function(r) {
			if ( r.get('__new__') ) 
				this.remove( r );
		}, this );

		this.childs.each( function( ch ) {
			ch.revert_changes();
		} );

		this.go_to( this.rowIndex, false );
	
	},/*}}}*/

	pack_key: function( key ) {/*{{{*/

		var pkey;

		Ext.each( key, function( item, index ){ 

			pkey += item;
			if ( index + 1 < key.length ) pkey += App.feat.key_delimiter; 
		});

		return pkey;

	},/*}}}*/

	get_primary_key: function() {/*{{{*/

		var keys = [];

		Ext.each( this.primary_key, function( key ) {

			var value = this.cr().get( key );

			keys.push({ 	key: key, 
					value: ( value.dateFormat ? value.dateFormat( App.feat.date_long_format ) : value )
				});

			}, this );

		return keys;
	},/*}}}*/

	get_foreign_key: function() {/*{{{*/

		var keys = {};

		if ( !this.parent_store ) return keys;
		
		var ps = this.parent_store;

	 	if ( 	ps.rowIndex === null || 
			ps.rowIndex < 0 || 
			ps.data.items.length == 0 || 
			ps.data.items.length < ps.rowIndex ) 
			return keys;

		if ( ps.cr() == 'undefined' ) return keys;

		Ext.each( this.foreign_key, function( ref ) {

			var value = ps.cr().get(ref.remote);

			if ( value == undefined ) 
				( typeof console != 'undefined' ) && console.error( 'no encuentro la clave foranea ' + ref.remote );
			else
				keys[ref.local] = value.dateFormat ? 
					value.dateFormat( App.feat.date_long_format ) : 
					value;

		}, this );

		return keys; 

	}, /*}}} */

	is_foreign_key_empty: function() {/*{{{*/

		var fk = this.get_foreign_key();
	
		for( var i in fk )
			if ( fk[i] == '' || fk[i] == null )
				return true;

		return false;

	},/*}}}*/

	get_search_key: function( keys ) {/*{{{*/

		var search_fields = {};

		Ext.each( keys, function( key ) {

			var variable = 's[' + this.class_name + '][' + key.key + ']';

			search_fields[ variable ] = key.value;

		}, this );

		return search_fields;
	},/*}}}*/

	set_foreign_key: function( record, fk ) {/*{{{*/

		for ( var field in fk ) 
			record.set( field, fk[field] );

	},/*}}}*/

	child_match_key: function( ri, ch ) {/*{{{*/

		/* checks if a current record has a child store pointing to it */

		if ( ! ch.foreign_key_values ) return false;

		Ext.each( ch.foreign_key, function( ref ) {

			var value = this.getAt( ri ).get( ref.remote );

			if ( value.dateFormat )
				value = value.dateFormat( App.feat.date_long_format );

			if ( value != ch.foreign_key_values[ref.local] ) 
				return false;

		}, this );

		return true;
 	},/*}}}*/

	prev: function() {/*{{{*/

		return this.go_to( this.rowIndex - 1 ); 
	},/*}}}*/

	next: function() {/*{{{*/

		return this.go_to( this.rowIndex + 1 );

	},/*}}}*/

	go_to: function( ri, stay ) {/*{{{*/

		if ( stay === undefined ) 
			var stay = true;

		var c = this.getCount();

		if ( stay && ri == this.rowIndex && ri < c && ri >= 0 ) 
			return;

                if ( this.dirty_childs() ) {

			Ext.Msg.alert( 'Atención', 'Hubo modificaciones: guarde o descarte los cambios' );
			return;
		}

		if ( ri >= c ) 
			this.rowIndex = c -1;
		else 
			this.rowIndex = ri;

		this.rowKey = c ? this.cr().get('__ID__') : null;

		this.fireEvent('changerowindex', this, this.rowIndex );

		return true;

	},/*}}}*/

	go_to_rowKey: function() {/*{{{*/

		if ( this.rowKey === null ) {

			this.go_to( 0, false );

		} else {

			// busca el rowKey para posicionar la barra en el mismo lugar

			var ri = null;

			if ( ( ri = this.find('__ID__', this.rowKey ) ) > -1 ) 

				this.go_to( ri );
			else 	
				this.go_to( 0, false ); // not found
		}

	},/*}}}*/

 	serialize_record: function( record, fields ) {/*{{{*/

		// var trim = Ext.util.Format.trim;
		var escapex = Ext.util.Format.escapeXml;

		var result = '', nodeList = '';
		var element = this.class_name;

		var value;

		if ( Ext.isArray( fields ) ) { 

			Ext.each( fields, function( field_name ) {

	    			nodeList += '<' + field_name + '>'
	    			+ escapex ( record.get( field_name ) ) 
				+ '</' + field_name + '>';

			}, this );

		} else if ( record.modified ) { 

	 		for ( var field_name in record.modified ) {

				value = record.get( field_name );
				if ( value === undefined ) continue;	

	    			nodeList += '<' + field_name + '>'
	    			+ escapex ( value )
				+ '</' + field_name + '>';
	 		}
     		}

		this.childs.each( function( ch ){

			if ( ch.dirty() )
				nodeList += ch.serialize();

		}, this );

		result = '<' + element;

		result += ' uiid=\"' + escapex( record.id ) + '\"'
		result += ' ID=\"' + escapex( record.get ('__ID__') ) + '\"'
		result += ' new=\"' + escapex( record.get( '__new__' ) ) + '\"'

		result += nodeList ? '>' + nodeList + '</' + element + '>' : '/>';
	
		return result;

	} ,/*}}}*/

	serialize: function( all, fields ) {/*{{{*/

		var result = '', nodeList = '';
		var element = App.feat.container_tag;

		var records = all ? this.getAll() : this.getModifiedRecords() ;

		Ext.each( records, function( record ) {
			if ( record.dirty )
				nodeList += this.serialize_record( record, fields );

		}, this );

		result = '<' + element + ' name=\"' + this.class_name + '\"';

		result += nodeList ? '>' + nodeList + '</' + element + '>' : '/>';
			
		return result;
  	}/*}}}*/

}); // extend

Ext.reg('xpStore', Ext.ux.xpotronix.xpStore );

// vim600: fdm=marker sw=3 ts=8 ai:
