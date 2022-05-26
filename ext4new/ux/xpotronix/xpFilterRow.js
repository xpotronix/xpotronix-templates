/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ux.xpotronix.xpFilterRow = Ext.extend(Ext.ux.grid.FilterRow, {

	init: function(grid) {

		let me = this,
			cm = grid.getColumnModel(),
			view = grid.getView();
   
		me.grid = grid;
   		me.grid.store.filter = me;
		me.shown = false;

                let panel = me.toolbarContainer || me.grid;
                let tb = 'bottom' === me.position ? panel.bottomToolbar : panel.topToolbar;

		if ( !tb ) return;

                // add menu
                me.menu = new Ext.Toolbar.SplitButton({
                        icon: '/ux/images/filter.png'
                        ,cls: 'x-btn-text-icon'
                        ,text: 'Filtrar'
			,toogle: true
			,tooltip: '<b>Filtrar Datos</b><br/>Permite ingresar criterios de búsqueda por cada columna y obtener resultados'

			,menu: [{ text:'Limpiar Búsqueda', handler: me.resetFilterData, scope:me }]
                        //,iconCls:me.iconCls
                });

		/*
                // handle position
                if('right' === me.align) {
                        tb.addFill();
                }
                else {
                        if(0 < tb.items.getCount()) {
                                tb.addSeparator();
                        }
                }
		*/

                // add menu button
                tb.insert( tb.items.length -2, me.menu );

		me.menu.on('click', function() {

			this.shown = !this.shown;

			 let div = Ext.get( this.grid.id + '_search_bar' );

			if ( div )
				div.dom.style.display = this.shown ? '' : 'none';

			this.grid.getView().refresh();

		}, me);
 
    // For some reason GridView was changed in Ext 3.3 to completely
    // re-render grid header on store "datachanged" event (which is
    // fired after each loading/filtering/sorting).  Because this
    // re-rendering seems completely unnecessary and coding around it
    // quite hard (each time user types a character into field we have
    // to re-insert fields to the header and recover the lost focus,
    // which I couldn't get working with IE), I've decided to just
    // override the onDataChange method with Ext 3.2 version.
    // See also: http://www.sencha.com/forum/showthread.php?118510


    view.onDataChange = function() {
      this.refresh(); // this was: this.refresh(true);
      this.updateHeaderSortState();
      this.syncFocusEl(0);
    };
    
    // convert all filter configs to FilterRowFilter instances
    let Filter = Ext.ux.grid.FilterRowFilter;

    this.eachFilterColumn(function(col) {

      if (!(col.filter instanceof Filter)) {
        col.filter = new Filter(col.filter);
      }
      /* col.filter.on("change", this.onFieldChange, this); */

      col.filter.field.on('render', function(){

		  col.filter.field.km = new Ext.KeyMap(col.filter.field.getId(),
				[{
					key: Ext.EventObject.ENTER,
					fn: this.onFieldChange,
					scope: this
				}]

			);

		}, this );
    });
    
    me.applyTemplate();
    // add class for attatching plugin specific styles
    grid.addClass('filter-row-grid');
    
    // when grid initially rendered
    grid.on("render", me.renderFields, me);
    
    // when Ext grid state restored (untested)
    grid.on("staterestore", me.resetFilterRow, me);
    
    // when the width of the whole grid changed
    grid.on("resize", me.resizeAllFilterFields, me);
    // when column width programmatically changed
    cm.on("widthchange", me.onColumnWidthChange, me);
    // Monitor changes in column widths
    // newWidth will contain width like "100px", so we use parseInt to get rid of "px"
    view.onColumnWidthUpdated = view.onColumnWidthUpdated.createSequence(function(colIndex, newWidth) {
      me.onColumnWidthChange(me.grid.getColumnModel(), colIndex, parseInt(newWidth, 10));
    }, me);
    
    // when column is moved, remove fields, after the move add them back
    cm.on("columnmoved", me.resetFilterRow, me);
    view.afterMove = view.afterMove.createSequence(me.renderFields, me);
    
    // when column header is renamed, remove fields, afterwards add them back
    cm.on("headerchange", me.resetFilterRow, me);
    view.onHeaderChange = view.onHeaderChange.createSequence(me.renderFields, me);
    
    // When column hidden or shown
    cm.on("hiddenchange", me.onColumnHiddenChange, me);
    
    if (me.refilterOnStoreUpdate) {
      me.respectStoreFilter();
    }
  },

  applyTemplate: function() {
    let colTpl = "";
    this.eachColumn(function(col) {
      let filterDivId = this.getFilterDivId(col.id);
      let style = col.hidden ? " style='display:none'" : "";
      let icon = (col.filter && col.filter.showFilterIcon) ? "filter-row-icon" : "";
      colTpl += '<td' + style + '><div class="x-small-editor ' + icon + '" id="' + filterDivId + '"></div></td>';
    });
    
    let headerTpl = new Ext.Template(
      '<table border="0" cellspacing="0" cellpadding="0" style="{tstyle}">',
      '<thead><tr class="x-grid3-hd-row">{cells}</tr></thead>',
      '<tbody><tr class="filter-row-header" id="'+ this.grid.id + '_search_bar" style="display:none">',
      colTpl,
      '</tr></tbody>',
      "</table>"
    );
    
    let view = this.grid.getView();
    Ext.applyIf(view, { templates: {} } );
    view.templates.header = headerTpl;

    Ext.apply(view, { 
		onLoad: Ext.emptyFn,
		listeners: {
			beforerefresh: function(v) {
				v.scrollTop = v.scroller.dom.scrollTop;
				v.scrollHeight = v.scroller.dom.scrollHeight;
			},
		refresh: function(v) {
			v.scroller.dom.scrollTop = v.scrollTop + 
			(v.scrollTop == 0 ? 0 : v.scroller.dom.scrollHeight - v.scrollHeight);
			}
		}
	});

  },

  renderFields: function() {

    // if ( !this.shown ) return;

    this.eachFilterColumn(function(col) {
      let filterDiv = Ext.get(this.getFilterDivId(col.id));
      let editor = col.filter.getField();
      editor.setWidth(col.width - 2);
      if (editor.rendered) {
        filterDiv.appendChild(col.filter.getFieldDom());
      }
      else {
        editor.render(filterDiv);
      }
    });
  },


  getFilterData: function() {
    let data = {};
    this.eachFilterColumn(function(col) {
      // when column id is numeric, assume it's autogenerated and use
      // dataIndex.  Otherwise assume id is user-defined and use it.
      let name = (typeof col.id === "number") ? col.dataIndex : col.name;
      if ( col.filter.nameSuffix ) name += col.filter.nameSuffix;
      data[name] = col.filter.getFieldValue();
    });
    return data;
  },

  resetFilterData: function() {
    this.eachFilterColumn(function(col) {
      col.filter.field.setValue( null );
    });
  }

});
