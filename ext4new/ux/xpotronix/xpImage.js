/* obsoleto, actualizar */

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

