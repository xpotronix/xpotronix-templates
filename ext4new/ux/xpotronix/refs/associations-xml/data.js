Ext.define('app.model.Address', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'city',
        mapping: 'city',
        type: 'string'},
    {
        name: 'street',
        mapping: 'street',
        type: 'string'}]
});

Ext.define('app.model.ProductType', {
    extend: 'Ext.data.Model',
    fields: [{
        name: 'id',
        mapping: 'id',
        type: 'int'},
    {
        name: 'name',
        mapping: 'name',
        type: 'string'},
    {
        name: 'sometag',
        mapping: 'sometag',
        type: 'string'}],

    associations: [{
        type: 'hasMany',
        model: 'app.model.Address',
        name: 'addresses',
        associationKey: 'addressList',
        reader: {
            type: 'xml',
            record: 'address',
            root: 'addressList'
        }}
    ],
    proxy: {
        type: 'ajax',
        url: 'data/example.xml',
        reader: {
            type: 'xml',
            record: 'ProductType',
            root: 'ProductResultSet'
        }
    }
});

app.model.ProductType.load(55, {
    scope: this,
    callback: function(record, operation) {
        alert(record.addresses().count());
    }
});
