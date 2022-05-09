/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */


/* carga un json en un template del tipo decl */
/* duplicado de miportal/decl/extra-fn.js */

let loadDocument =  ( row ) => {

	debugger;
											
	dataset = ( typeof row.archivo === 'string' )? JSON.parse(row.archivo) : row.archivo.dataset;

	$('p.declaracion').each( (i,e) => { e.textContent = e.textContent.compose(row) });

	if ( row.estado == 'firmada' ) {

		const URL = `${window.location.origin}/${row.archivo.module}/valida/${row.ID}`;

		let elements = [];

		if ( row.guarda !== undefined  ) {

			row.guarda.includes('pública') && elements.push('td.qrcode-firma:first');
			row.guarda.includes('confidencial') && elements.push('td.qrcode-firma.C1');

		} else {

			elements.push('td.qrcode-firma');

		}

		$( elements.join(',') ).each( (i,e)=> { 

			var qrpub = new QRious({
				element: $(e).find('canvas').removeClass('d-none').get(0),
				size:150,
				value: URL 
			});

		});

	} else {

		$('td.qrcode-firma').find('hr').removeClass('d-none');
		$('td.qrcode-firma').find('p').removeClass('d-none');

	}

	if ( dataset == undefined ) {

		console.error( "no hay datos cargados en la variable dataset" );
		return;
	
	}

	for (var [table_name, rows] of Object.entries(dataset)) {

		/* console.log( table ); */

		let $search = $( `table[data-name='${table_name}']` );

		if ( $search.length === 0 ) {
		
			console.error(`no encuentro la tabla con name [${table_name}]`);
			continue;
		
		}

		$search.each( function( i, table ) {

			let $table = $(table);

			$table.closest("div.d-none").removeClass("d-none");

			let rowTemplate = $table.find('tr.row-template'),
			$tbody = $table.find('tbody');

			rows.forEach( row => {

				/* decode */

				Object.keys(row)
					.forEach(
						function(key){ 
							row[key] = _.unescape( row[key] )
							});

				/* console.log( row ); */

				let $tr = $tbody.find( '>tr[data-id="' + row.ID + '"]' ),
				single = ( $table.data('instance') === 'single' ),
				tr = rowTemplate.get(0).outerHTML.replace('row-template','').compose( row );

				/* considera el row-template, siempre agrega */
				$tbody.append( tr );

			});

		});

	}

}


function entry_help_process( store, obj_value, attr_value, attr_constraint, fn ) {

	var parent_obj = App.store.item( obj_value );
	if ( parent_obj ) {
		var value = parent_obj.cr().get( attr_value );

		if ( value || fn ) {
			var p = {};
			p[attr_constraint] = fn ? fn.call( store, value ): value;
			return p;
		} 
	}

	return {};
}

function entry_help( eh_store, obj_value, attr_value, attr_constraint, fn ) {

       	App.store.item( eh_store ).on('beforeload', function( store, options )  {

		Ext.apply( options.params, entry_help_process( store, obj_value, attr_value, attr_constraint, fn ) );

	});
};


function formatBoolean(value){
   return ( value == 'true' || value == true )? 'Si' : 'No';
};

function formatDate(value){
   // return value ? Ext.util.Format.( value, 'd/m/Y') : '';
   return value;
};

