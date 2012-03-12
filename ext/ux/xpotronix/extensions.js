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

Ext.ux.Image = Ext.extend(Ext.BoxComponent, {
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
    this.addEvents('load');
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
Ext.reg("image", Ext.ux.Image);

