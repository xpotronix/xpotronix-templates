
Ext.onReady( function() {

/* model */

Ext.define('AM.model.User', {/*{{{*/

    extend: 'Ext.data.Model',

    fields: ['name', 'email']

});/*}}}*/

/* store */

Ext.define('AM.store.Users', {/*{{{*/

    extend: 'Ext.data.Store',

    model: 'AM.model.User',

    autoLoad: true,

    proxy: {
        type: 'ajax',

	    api: {
		read: 'data/users.json',
		update: 'data/updateUsers.json'
	    },

	reader: {
            type: 'json',
            root: 'users',
            successProperty: 'success'
        }
    },

    fields: ['name', 'email'],
	
});/*}}}*/

/* panel */

Ext.define('AM.view.user.List' , {/*{{{*/

    extend: 'Ext.grid.Panel',
    alias: 'widget.userlist',

    title: 'All Users',

    initComponent: function() {

        this.store = 'Users';

        this.columns = [
            {header: 'Name',  dataIndex: 'name',  flex: 1},
            {header: 'Email', dataIndex: 'email', flex: 1}
        ];

        this.callParent(arguments);
    }
});/*}}}*/

Ext.define('AM.view.user.Edit', {/*{{{*/

    extend: 'Ext.window.Window',
    alias: 'widget.useredit',

    title: 'Edit User',
    layout: 'fit',
    autoShow: true,

    initComponent: function() {
        this.items = [
            {
                xtype: 'form',
                items: [
                    {
                        xtype: 'textfield',
                        name : 'name',
                        fieldLabel: 'Name'
                    },
                    {
                        xtype: 'textfield',
                        name : 'email',
                        fieldLabel: 'Email'
                    }
                ]
            }
        ];

        this.buttons = [
            {
                text: 'Save',
                action: 'save'
            },
            {
                text: 'Cancel',
                scope: this,
                handler: this.close
            }
        ];

        this.callParent(arguments);
    }
});/*}}}*/

/* controller */

Ext.define('AM.controller.Users', {/*{{{*/

    extend: 'Ext.app.Controller',

    views: [
        'user.List',
	'user.Edit'
    ],

    stores: [
        'Users'
    ],

    models: ['User'],

    init: function() {
        this.control({
            'viewport > panel': {
                render: this.onPanelRendered
            },

	    'userlist': {
                itemdblclick: this.editUser
            },

	    'useredit button[action=save]': {
                click: this.updateUser
            }
        });
    },

    onPanelRendered: function() {
        console.log('The panel was rendered');
    },

    editUser: function(grid, record) {

        console.log('Double clicked on ' + record.get('name'));
        var view = Ext.widget('useredit');
        view.down('form').loadRecord(record);
    },

	updateUser: function(button) {
	    var win    = button.up('window'),
		form   = win.down('form'),
		record = form.getRecord(),
		values = form.getValues();

	    record.set(values);
	    win.close();
	    // synchronize the store after editing the record
	    this.getUsersStore().sync();
	}

});/*}}}*/

/* application */

Ext.application({/*{{{*/

    requires: ['Ext.container.Viewport'],

    name: 'AM',
    /* appFolder: 'app', */

    controllers: [
        'Users'
    ],

    launch: function() {
        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [
                {
                    xtype: 'userlist',
                }
            ]
        });
    }
});/*}}}*/


});
