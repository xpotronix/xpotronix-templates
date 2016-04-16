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

sim(app.model.ProductType.proxy, '<ProductResultSet><ProductType>    <id>55</id>    <name>Product Name</name>    <sometag>asdf</sometag>    <addressList>        <address>            <street>12345 a</street>            <city>myCity</city>        </address>        <address>            <street>234567 b</street>            <city>Denver</city>        </address>    </addressList>    <phoneContactList>        <phoneContact>            <primary>234</primary>            <cell>4667</cell>        </phoneContact>        <phoneContact>            <primary>5467</primary>            <cell>87904</cell>        </phoneContact>    </phoneContactList>    <oneToOne>        <firstField>value</firstField>        <secondField>value</secondField>    </oneToOne></ProductType></ProductResultSet>');

app.model.ProductType.load(55, {
    scope: this,
    callback: function(record, operation) {
        alert(record.addresses().count());
    }
});