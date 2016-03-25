/* bugfix para las versiones nuevas del chrome */

Ext.chromeVersion = Ext.isChrome ? parseInt(( /chrome\/(\d{2})/ ).exec(navigator.userAgent.toLowerCase())[1],10) : NaN;

Ext.override(Ext.grid.ColumnModel, {
	getTotalWidth : function(includeHidden) {
		if (!this.totalWidth) {
			var boxsizeadj = (Ext.isChrome && Ext.chromeVersion > 18 ? 2 : 0);
			this.totalWidth = 0;
			for (var i = 0, len = this.config.length; i < len; i++) {
				if (includeHidden || !this.isHidden(i)) {
					this.totalWidth += (this.getColumnWidth(i) + boxsizeadj);
				}
			}
		}
		return this.totalWidth;
	}
});

Ext.isEmptyObject = function( o ) {

                for(var p in o)
                        if(o.hasOwnProperty(p))
                                return false;
                return true;
        };

Ext.util.Format.escapeXml = function(str) {
	function replaceChars(character) {
		switch (character) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			case "'": return '&apos;';
			case '"': return '&quot;';
			default: return '';
		};			
	};
	return String(str).replace(/[<>&"']/g, replaceChars);
};


/* para mantener la seleccion entre paginas
no anda

Ext.override(Ext.grid.RowSelectionModel, {
	onRefresh : function(){
		var ds = this.grid.store, index;
		var s = this.getSelections();
		if (!this.keepSelections) this.clearSelections(true);
		for (var i = 0, len = s.length; i < len; i++) {
			var r = s[i];
			if ((index = ds.indexOfId(r.id)) != -1) {
				this.selectRow(index, true);
				if(this.keepSelections) this.grid.getView().onRowSelect(index);
			}
		}
	},
	keepSelections: true
});
*/

Ext.ux.Image = Ext.extend(Ext.Component, {
  url: Ext.BLANK_IMAGE_URL,
  resizable: false,
  //for initial src value
  autoEl: {
    tag: 'img',
    src: Ext.BLANK_IMAGE_URL,
    cls: 'tng-managed-image'
  },
  initComponent: function() {
    Ext.ux.Image.superclass.initComponent.call(this);
    /* this.addEvents('load'); */
  },
  onRender: function() {
    Ext.ux.Image.superclass.onRender.apply(this, arguments);
    this.el.on('load', this.onLoad, this);
    if (this.resizable) {
      new Ext.Resizable(this.el, {
        wrap: true,
        pinned: true,
        minWidth: 50,
        width: this.width || 50,
        height: this.height || 50,
        minHeight: 50,
        preserveRatio: true
      });
    }
    if (this.url) {
      this.setSrc(this.url);
    }

  },
  onLoad: function() {
    this.fireEvent('load', this);
  },
  setSrc: function(src) {
    this.el.dom.src = src;
  }
});

// Ext.define( 'image', 'Ext.ux.Image' );

