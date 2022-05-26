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
	  let me = this;
	  me.callParent();
    /* me.addEvents('load'); */
  },
  onRender: function() {

	let me = this;
	  me.callParent();

    me.el.on('load', me.onLoad, me);
    if (me.resizable) {
      new Ext.Resizable(me.el, {
        wrap: true,
        pinned: true,
        minWidth: 50,
        width: me.width || 50,
        height: me.height || 50,
        minHeight: 50,
        preserveRatio: true
      });
    }
    if (me.url) {
      me.setSrc(me.url);
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

