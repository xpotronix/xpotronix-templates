/*
 * File: DateTimeField.js
 *
 * This file requires use of the Ext JS library, under independent license.
 * This is part of the UX for DateTimeField developed by Guilherme Portela
 */
Ext.define('Ext.ux.form.DateTimeField', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.datetimefield',
    requires: ['Ext.ux.form.DateTimePicker'],

    //<locale>
    /**
     * @cfg {String} format
     * The default date format string which can be overriden for localization support. The format must be valid
     * according to {@link Ext.Date#parse}.
     */
    format: "m/d/Y H:i",
    //</locale>
    //<locale>
    /**
     * @cfg {String} altFormats
     * Multiple date formats separated by "|" to try when parsing a user input value and it does not match the defined
     * format.
     */
    altFormats: "m/d/Y H:i:s|c",
    width: 270,

    mimicBlur: function(e) {
        var me = this,
            picker = me.picker;

        // ignore mousedown events within the picker element
        if (!picker || !e.within(picker.el, false, true) && !e.within(picker.timePicker.el, false, true)) {
            me.callParent(arguments);
        }
    },


	/*
    triggerBlur: function() {
        return true;
    },
    */

    collapseIf: function(e) {
        var me = this,
            picker = me.picker;

        if (picker.timePicker && !e.within(picker.timePicker.el, false, true)) {
            me.callParent([e]);
        }
    },

    createPicker: function() {
        var me = this,
            parentPicker = this.callParent(),
            config = Ext.clone(Ext.merge(me.initialConfig, parentPicker.initialConfig)),
            excludes = ['renderTo', 'width', 'height', 'id', 'itemId'];

        // Avoiding duplicate ids error
        parentPicker.destroy();
        
        for (var i=0; i < excludes.length; i++) {
            if (config.hasOwnProperty([excludes[i]])) {
                delete config[excludes[i]];
            }
        }
        
        return Ext.create('Ext.ux.form.DateTimePicker', config);
    },

    getErrors: function(value) {
        value = arguments.length > 0 ? value : this.formatDate(this.processRawValue(this.getRawValue()));

        var me = this,
            format = Ext.String.format,
            errors = me.superclass.superclass.getErrors.apply(this, arguments),
            disabledDays = me.disabledDays,
            disabledDatesRE = me.disabledDatesRE,
            minValue = me.minValue,
            maxValue = me.maxValue,
            len = disabledDays ? disabledDays.length : 0,
            i = 0,
            svalue,
            fvalue,
            day,
            time;

        if (value === null || value.length < 1) { // if it's blank and textfield didn't flag it then it's valid
             return errors;
        }

        svalue = value;
        value = me.parseDate(value);
        if (!value) {
            errors.push(format(me.invalidText, svalue, Ext.Date.unescapeFormat(me.format)));
            return errors;
        }

        time = value.getTime();
        if (minValue && time < minValue.getTime()) {
            errors.push(format(me.minText, me.formatDate(minValue)));
        }

        if (maxValue && time > maxValue.getTime()) {
            errors.push(format(me.maxText, me.formatDate(maxValue)));
        }

        if (disabledDays) {
            day = value.getDay();

            for(; i < len; i++) {
                if (day === disabledDays[i]) {
                    errors.push(me.disabledDaysText);
                    break;
                }
            }
        }

        fvalue = me.formatDate(value);
        if (disabledDatesRE && disabledDatesRE.test(fvalue)) {
            errors.push(format(me.disabledDatesText, fvalue));
        }

        return errors;
    }
});
