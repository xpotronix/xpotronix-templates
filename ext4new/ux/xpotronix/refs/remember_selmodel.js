Ext.application({
    name: 'HelloExt',
    launch: function() {
        // Model definition and remote store (used Ext examples data)
        Ext.define('ForumThread', {
            extend: 'Ext.data.Model',
            fields: [
                'title', 'forumtitle', 'forumid', 'username',
                {name: 'replycount', type: 'int'},
                {name: 'lastpost', type: 'date', dateFormat: 'timestamp'},
                'lastposter', 'excerpt', 'threadid'
            ],
            idProperty: 'threadid'
        });
        var store = Ext.create('Ext.data.Store', {
            pageSize: 20,
            model: 'ForumThread',
            autoLoad: true,
            proxy: {
                type: 'jsonp',
                url: 'http://www.sencha.com/forum/topics-browse-remote.php',
                reader: {
                    root: 'topics',
                    totalProperty: 'totalCount'
                }
            }
        });

        // Define grid that will automatically restore its selection after store reload
        Ext.define('PersistantSelectionGridPanel', {
            extend: 'Ext.grid.Panel',
            selectedRecords: [],
            initComponent: function() {
                this.callParent(arguments);
                
                this.getStore().on('beforeload', this.rememberSelection, this);
                this.getView().on('refresh', this.refreshSelection, this);
            },
            rememberSelection: function(selModel, selectedRecords) {
                this.selectedRecords = this.getSelectionModel().getSelection();
                this.getView().saveScrollState();
            },
            refreshSelection: function() {
                if (0 >= this.selectedRecords.length) {
                    return;
                }

                var newRecordsToSelect = [];
                for (var i = 0; i < this.selectedRecords.length; i++) {
                    record = this.getStore().getById(this.selectedRecords[i].getId());
                    if (!Ext.isEmpty(record)) {
                        newRecordsToSelect.push(record);
                    }
                }

                this.getSelectionModel().select(newRecordsToSelect);   Ext.defer(this.setScrollTop, 30, this, [this.getView().scrollState.top]);
            }
        });
        
        // Create instance of previously defined persistant selection grid panel
        var grid = Ext.create('PersistantSelectionGridPanel', {
            autoscroll: true,
            height: 300,
            renderTo: Ext.getBody(),
            //region: 'center',
            store: store,
            multiSelect: true, // Delete this if you only need single row selection
            stateful: true,
            forceFit: true,
            loadMask: false,
            stateId: 'stateGrid',
            viewConfig: {
                stripeRows: true
            },
            columns:[{
                id: 'topic',
                text: "Topic",
                dataIndex: 'title',
                flex: 1,
                sortable: false
            },{
                text: "Replies",
                dataIndex: 'replycount',
                width: 70,
                align: 'right',
                sortable: true
            },{
                id: 'last',
                text: "Last Post",
                dataIndex: 'lastpost',
                width: 150,
                sortable: true
            }],
            buttons: [{
                text: 'Reload Store',
                handler: function() {
                    grid.getStore().load();
                }
            }]
        });
    }
});
