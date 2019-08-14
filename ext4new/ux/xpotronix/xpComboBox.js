/**
 * @package xpotronix
 * @version 2.0 - Areco 
 * @copyright Copyright &copy; 2003-2011, Eduardo Spotorno
 * @author Eduardo Spotorno
 *
 * Licensed under GPL v3
 * @license http://www.gnu.org/licenses/gpl-3.0.txt
 */

Ext.define('Ux.xpotronix.xpComboBox', {

	extend: 'Ext.form.field.ComboBox',
	alias: 'widget.xpcombo',
	debug: false,
	panel: null,
	alternateClassName: ['xpcombobox'],
	requires: ['Ext.form.field.ComboBox'],

	listeners: {/*{{{*/

		beforequery: {

			fn: function( queryPlan ) { 

				var value = this.getRawValue();
				this.store.clearFilter(true);

				if ( value ) 
					this.store.addFilter({property:'_label',value:this.getRawValue()}, false);
			}
		
		},

		blur: {

			fn: function( me, newValue, oldValue ) {

				if ( newValue !== oldValue ) {

					var p = this.panel,
					me = this,
					record = p.store.selections[0];

					/* cambia el valor del _label correspondiente a este field en el record */

					if ( record ) {

						if ( me.isEqual( me.getValue(), record.get( me.name ) ) )
							return true;

						this.debug && console.log( me.name + ': ' + me.lastValue + ' << ' + me.getValue() );
						record.set(me.name, me.getValue());
						record.set(me.name+'_label', me.getRawValue());
					}
				}
			}
		}
	},/*}}}*/

	onRender: function() {/*{{{*/

		this.callParent(arguments);
		this.panel = this.up('grid') || this.up('form');

	},	/*}}}*/

    setValue: function(value, doSelect) {/*{{{*/
        var me = this,
            valueNotFoundText = me.valueNotFoundText,
            inputEl = me.inputEl,
            i, len, record,
            dataObj,
            matchedRecords = [],
            displayTplData = [],
            processedValue = [];

        if (me.store.loading) {
            // Called while the Store is loading. Ensure it is processed by the onLoad method.
            me.value = value;
            me.setHiddenValue(me.value);
            return me;
        }

        // This method processes multi-values, so ensure value is an array.
        value = Ext.Array.from(value);

        // Loop through values, matching each from the Store, and collecting matched records
        for (i = 0, len = value.length; i < len; i++) {
            record = value[i];
            if (!record || !record.isModel) {
                record = me.findRecordByValue(record);
            }
            // record found, select it.
            if (record) {
                matchedRecords.push(record);
                displayTplData.push(record.data);
                processedValue.push(record.get(me.valueField));
            }
            // record was not found, this could happen because
            // store is not loaded or they set a value not in the store
            else {
                // If we are allowing insertion of values not represented in the Store, then push the value and
                // create a fake record data object to push as a display value for use by the displayTpl
                if (!me.forceSelection) {
                    processedValue.push(value[i]);
                    dataObj = {};
                    dataObj[me.displayField] = value[i];
                    displayTplData.push(dataObj);
                    // TODO: Add config to create new records on selection of a value that has no match in the Store
                }
                // Else, if valueNotFoundText is defined, display it, otherwise display nothing for this value
                else if (Ext.isDefined(valueNotFoundText)) {

                    displayTplData.push(valueNotFoundText);

                } else {

			if ( value !== undefined ) {

				/* carga un registro fake para que pueda machear el valor en forceSelection */

				var p = this.panel; 

				if ( p ) {

					var s = this.store;

					var data = s.get_foreign_key_record( p.store.getSelection(), true );
					this.debug && console.log(data);

					record = s.model.create(data[0]);

					matchedRecords.push(record);
					displayTplData.push(record.data);
					processedValue.push(record.get(me.valueField));
			 
					if ( p = this.up('form') ) {

						this.valueNotFoundText = record.get( this.name + '_label' );

					}
				} 
			}
		}
            }
        }

        // Set the value of this field. If we are multiselecting, then that is an array.
        me.setHiddenValue(processedValue);
        me.value = me.multiSelect ? processedValue : processedValue[0];
        if (!Ext.isDefined(me.value)) {
            me.value = null;
        }
        me.displayTplData = displayTplData; //store for getDisplayValue method
        me.lastSelection = me.valueModels = matchedRecords;

        if (inputEl && me.emptyText && !Ext.isEmpty(value)) {
            inputEl.removeCls(me.emptyCls);
        }

        // Calculate raw value from the collection of Model data
        me.setRawValue(me.getDisplayValue());
        me.checkChange();

        if (doSelect !== false) {
            me.syncSelection();
        }
        me.applyEmptyText();

        return me;
    }/*}}}*/

});
