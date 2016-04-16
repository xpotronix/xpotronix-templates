/*


Always put your Proxies in your Models, not your Stores, unless you have a very good reason not to *
Always require your child models if using them in hasMany relationships. ** 
Always use foreignKey if you want to load the children at will
Always use associationKey if you return the children in the same response as the parent
You can use both foreignKey and associationKey if you like
Always name your hasMany relationships
Always use fully qualified model names in your hasMany relationship
Consider giving the reader root a meaningful name (other than "data")
The child model does not need a belongsTo relationship for the hasMany to work


*/



Ext.define('Assoc.model.Contact', {

    extend:'Ext.data.Model',

    requires:[
        'Assoc.model.PhoneNumber'          /* rule 2 */
    ],

    fields:[
        'name'                             /* id field is inherited from Ext.data.Model */
    ],

    hasMany:[
    {
        foreignKey: 'contact_id',          /* rule 3, 5 */
        associationKey: 'phoneNumbers',    /* rule 4, 5 */
        name: 'phoneNumbers',              /* rule 6 */
        model: 'Assoc.model.PhoneNumber'   /* rule 7 */
}
    ],

    proxy:{                                /* rule 1 */
        type: 'ajax',
        url: 'assoc/data/contacts.json',
        
        reader: {
            type: 'json',
            root: 'contacts'               /* rule 8 */
        }
    }
});

// example usage:

var c = new Assoc.model.Contact({id:99});

/*
 * assuming that PhoneNumber.proxy is AJAX and has a url set to 'phonenumbers', the below function would make an http request like this:
 * /phonenumbers?page=1&start=0&limit=25&filter=[{"property":"contact_id","value":"99"}]
 * ie, it would make a request for all phone numbers, but ask the server to filter them by the contact_id of the Contact, which is 99 in this case
 */
c.phoneNumbers().load(); 
