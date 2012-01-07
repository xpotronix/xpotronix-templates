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

/**
 * @author jagszent
 * needs this style
 .ux-combowithbutton-button {
     position:absolute;
     right:20px;
     top:2px;
     width:16px;
     height:16px;
     cursor:pointer;
 }
 */


Ext.ux.ComboWithButton = Ext.extend(Ext.form.ComboBox, {
    buttonCls:'',
    buttonQtip:'',
    
    initComponent: function() {
        Ext.ux.ComboWithButton.superclass.initComponent.apply(this, arguments);
    },
    onRender: function(ct, position) {
        Ext.ux.ComboWithButton.superclass.onRender.apply(this, arguments);

   this.pageTb.add('-', {
        // pressed: true,
        // enableToggle:true,
        text: 'Agregar' //,
        // cls: 'x-btn-text-icon details',
        // toggleHandler: toggleDetails
    });

    }
});

Ext.reg('combowithbutton', Ext.ux.ComboWithButton);

Ext.override(Ext.form.HtmlEditor, {
        defaultValue: (Ext.isOpera || Ext.isIE6) ? ' ' : '​',
        initEvents: function(){
            this.originalValue = Ext.isGecko ? '&nbsp;' : this.getValue();
            if(Ext.isGecko){
                this.setValue('&nbsp;');
            }
        },
        cleanHtml: function(html) {
            html = String(html);
            if(Ext.isWebKit){ // strip safari nonsense
                html = html.replace(/\sclass="(?:Apple-style-span|khtml-block-placeholder)"/gi, '');
            }
            if(html.charCodeAt(0) == this.defaultValue.replace(/\D/g, '')){
                html = html.substring(1);
            }
            return html;
        }
});

Ext.override(Ext.form.CompositeField, {
    initComponent: Ext.form.CompositeField.prototype.initComponent.createSequence(function() {
        /**
         * @property innerCt
         * @type Ext.Container
         * A container configured with hbox layout which is responsible for laying out the subfields
         */
        this.innerCt = new Ext.Container({
            layout  : 'hbox',
            items   : this.items,
            cls     : 'x-form-composite',
            defaultMargins: '0 3 0 0'
        });

        var fields = this.innerCt.findBy(function(c) {
            return c.isFormField;
        }, this);

        /**
         * @property items
         * @type Ext.util.MixedCollection
         * Internal collection of all of the subfields in this Composite
         */
        this.items = new Ext.util.MixedCollection();
        this.items.addAll(fields);
    }),

    /**
     * @private
     * Creates an internal container using hbox and renders the fields to it
     */
    onRender: function(ct, position){
        if (!this.el) {
            var innerCt = this.innerCt;
            innerCt.render(ct);

            this.el = innerCt.getEl();

            //if we're combining subfield errors into a single message, override the markInvalid and clearInvalid
            //methods of each subfield and show them at the Composite level instead
            if (this.combineErrors) {
                this.eachItem(function(field) {
                    Ext.apply(field, {
                        markInvalid : this.onFieldMarkInvalid.createDelegate(this, [field], 0),
                        clearInvalid: this.onFieldClearInvalid.createDelegate(this, [field], 0)
                    });
                });
            }

            //set the label 'for' to the first item
            var l = this.el.parent().parent().child('label', true);
            if (l) {
                l.setAttribute('for', this.items.items[0].id);
            }
        }

        Ext.form.CompositeField.superclass.onRender.apply(this, arguments);
    }
});

Ext.override(Ext.form.BasicForm, {
    findField : function(id) {
        var field = this.items.get(id);

        if (!Ext.isObject(field)) {
            //searches for the field corresponding to the given id. Used recursively for composite fields
            var findMatchingField = function(f) {
                if (f.isFormField) {
                    if (f.dataIndex == id || f.id == id || f.getName() == id) {
                        field = f;
                        return false;
                    } else if (f.isComposite) {
                        return f.items.each(findMatchingField);
                    }
                }
            };

            this.items.each(findMatchingField);
        }
        return field || null;
    }
});


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

