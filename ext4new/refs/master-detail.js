/*
    Master Detail Record Set
    Version 1.0
    Original     -  03/12/2009
    Last Edited  -  03/30/2009
    Ben McLendon
*/
Ext.onReady(function () {
    Ext.BLANK_IMAGE_URL = '/s.gif';
    Ext.SSL_SECURE_URL = 'https://yourhost.yourdomain.com/ext-3.0-rc1/resources/images/default/s.gif';
    Ext.QuickTips.init();

    var masterSQLtable = 'o2conmaster';
    var detailSQLtable = 'o2condetail';

    //  Grid Data Stores
    var storeMasterGridRows = new Ext.data.JsonStore({
        url           : 'https://yourhost.yourdomain.com/json/grid_' + masterSQLtable + '.php',
        root          : masterSQLtable,
        totalProperty : 'total',
        id            : 'id',
        fields        : ['id', 'serial_number', 'hobbs_meter', 'manufacturer', 'model', 'comments', 'inactive'],
        remoteSort    : true,
        autoload      : true
    });
    storeMasterGridRows.load({params: {start: 0, limit: 8, sort: 'id', dir: 'ASC'}});

    var storeDetailGridRows = new Ext.data.JsonStore({
        url           : 'https://yourhost.yourdomain.com/json/grid_' + detailSQLtable + '.php',
        root          : detailSQLtable,
        totalProperty : 'total',
        id            : 'id',
        fields        : ['id', 'master_id', 'event_date', 'o2_percent', 'filter_maintenance', 'alarm', 'outlet_pressure', 'location', 'technician', 'patient_fname', 'patient_lname', 'patient_mm_id', 'comments', 'inactive'],
        remoteSort    : true,
        autoload      : true
    });
    storeDetailGridRows.load({params : {start : 0, limit : 15, sort : 'id', dir : 'DESC', master : '0'}});

    //  Combobox Data Stores
    var storeLocations = new Ext.data.JsonStore({
        url           : 'https://yourhost.yourdomain.com/json/selectLocation.php',
        root          : "location",
        totalProperty : 'total',
        id            : 'id',
        fields        : ['id', 'shortname'],
        remoteSort    : false,
        autoload      : true
    });
    storeLocations.load({params : {start : 0, limit : 999, sort : 'lname', dir : 'ASC'}});

    var storeEmployees = new Ext.data.JsonStore({
        url           : 'https://yourhost.yourdomain.com/json/selectEmployee.php',
        root          : "employee",
        totalProperty : 'total',
        id            : 'empid',
        fields        : ['empid', 'fullname'],
        remoteSort    : false,
        autoload      : true
    });
    storeEmployees.load({params : {start : 0, limit : 999, sort : 'lname', dir : 'ASC'}});

    function addMasterRecord() {
        addMasterWin.show();
    }

    // THE MASTER GRID
    var filtersMaster = new Ext.ux.grid.GridFilters({filters: [
        {type : 'numeric',    dataIndex : 'id'},
        {type : 'string',    dataIndex : 'serial_number'},
        {type : 'numeric',    dataIndex : 'hobbs_meter'},
        {type : 'string',    dataIndex : 'manufacturer'},
        {type : 'string',    dataIndex : 'model'}
    ]});

    //  Column Model
    var cmMaster = new Ext.grid.ColumnModel([{
        id        : 'gridID',
        dataIndex : 'id',
        header    : 'Id',
        sortable  : true,
        width     : 50
    }, {
        dataIndex : 'serial_number',
        header    : 'Serial #',
        sortable  : true,
        width     : 140
    }, {
        dataIndex : 'hobbs_meter',
        header    : 'Hours',
        sortable  : true,
        width     : 80
    }, {
        dataIndex : 'manufacturer',
        header    : 'Manufacturer',
        sortable  : true,
        width     : 130
    }, {
        dataIndex : 'model',
        header    : 'Model',
        sortable  : true,
        width     : 120
    }, {
        dataIndex : 'inactive',
        header    : 'Retired',
        sortable  : true,
        width     : 60
    }]);
    cmMaster.defaultSortable = true;

    // Grid Config
    var gridMaster = new Ext.grid.GridPanel({
        id            : masterSQLtable + 'Master',
        store         : storeMasterGridRows,
        ds            : storeMasterGridRows,
        cm            : cmMaster,
        width         : 0,
        flex          : 1,
        enableColLock : false,
        loadMask      : true,
        plugins       : filtersMaster,
        height        : 246,
        border        : false,
        stripeRows    : true,
        bbar          : new Ext.PagingToolbar({
            store     : storeMasterGridRows,
            pageSize  : 8,
            width     : '100%',
            plugins   : filtersMaster
        }),
        tbar: [{
            text      : 'Add Concentrator',
            tooltip   : 'Click to add a new concentrator',
            iconCls   : 'icon-add',
            handler   : addMasterRecord
        }]
    });

    gridMaster.on('rowclick', function (gridMaster, rowIndex, eventObj) {
        var recordMaster = gridMaster.getStore().getAt(rowIndex);
        editMasterPanel.form.setValues(recordMaster.data);
        editMasterPanel.doLayout();
        addEventButton.enable();
        addDetailForm.findById('masterID').setValue(recordMaster.id);
        storeDetailGridRows.load({params : {start : 0, limit : 15, sort : 'id', dir : 'DESC', master : recordMaster.id}});
    });

    var editMasterPanel = new Ext.form.FormPanel({
        url         : 'https://yourhost.yourdomain.com/json/crudO2ConMaster.php',
        width       : 300,
        flex        : 0,
        style       : 'background: #BAC9DC',
        bodyStyle   : {padding: '20,0,0,10', background: '#CAD9EC'},
        border      : false,
        defaultType : 'textfield',
        labelWidth  : 100,
        autoScroll  : true,
        defaults    : {
            width : 150
        },
        items: [{
            id         : 'editID',
            fieldLabel : 'ID',
            name       : 'id',
            xtype      : 'hidden'
        }, {
            fieldLabel : 'Serial Number',
            name       : 'serial_number',
            allowBlank : false

        }, {
            fieldLabel : 'Hours',
            name       : 'hobbs_meter'
        }, {
            fieldLabel : 'Manufacturer',
            name       : 'manufacturer',
            allowBlank : false

        }, {
            fieldLabel : 'Model',
            name       : 'model',
            allowBlank : false

        }, {
            xtype      : 'textarea',
            fieldLabel : 'comments',
            height     : '65px',
            name       : 'comments'
        }, {
            xtype      : 'checkbox',
            name       : 'inactive',
            fieldLabel : 'Retired',
            width      : 30
        }],
        buttons : [{
            text     : 'save',
            formBind : true,
            handler  : function () {
                editMasterPanel.getForm().submit({
                    method    : 'POST',
                    params    : {crud: "U"},
                    waitTitle : 'Processing',
                    waitMsg   : 'Please Wait',
                    success   : function () {
                    storeMasterGridRows.reload();
                    },
                    failure   : function (form, action) {
                        if (action.failureType === 'server') {
                            obj = Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('Process Failed!', obj.reason);
                        } else {
                            obj = Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('Warning!', obj.reason);
                        }
                    }
                });
            }
        }]
    });  //  EO Edit Master Form

    var addMasterPanel = new Ext.form.FormPanel({
        url         : 'https://yourhost.yourdomain.com/json/crudO2ConMaster.php',
        width       : 280,
        flex        : 0,
        height        : 170,
        bodyStyle: 'padding: 5px;',
        border      : false,
        defaultType : 'textfield',
        labelWidth  : 100,
        autoScroll  : true,
        defaults    : {
            width : 150
        },
        items: [{
            fieldLabel : 'Serial Number',
            name       : 'serial_number',
            allowBlank : false

        }, {
            fieldLabel : 'Hours',
            name       : 'hobbs_meter'
        }, {
            fieldLabel : 'Manufacturer',
            name       : 'manufacturer',
            allowBlank : false

        }, {
            fieldLabel : 'Model',
            name       : 'model',
            allowBlank : false

        }, {
            xtype      : 'textarea',
            fieldLabel : 'comments',
            height     : '65px',
            name       : 'comments'
        }, {
            xtype      : 'checkbox',
            name       : 'inactive',
            fieldLabel : 'Retired',
            width      : 30
        }],
        buttons : [{
            text     : 'save',
            formBind : true,
            handler  : function () {
                addMasterPanel.getForm().submit({
                    method    : 'POST',
                    params    : {crud: "C"},
                    waitTitle : 'Processing',
                    waitMsg   : 'Please Wait',
                    success   : function () {
                    storeMasterGridRows.reload();
                    addMasterWin.hide();
                    },
                    failure   : function (form, action) {
                        if (action.failureType === 'server') {
                            obj = Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('Process Failed!', obj.reason);
                        } else {
                            obj = Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('Warning!', obj.reason);
                        }
                    }
                });
            }
        }, {
            text: 'Cancel',
            handler: function () {
                addMasterWin.hide();
            }
        }]
    });  //  EO Add Master Form

    var addMasterWin = new Ext.Window({
        layout: 'fit',
        width: 300,
        height: 290,
        closable: false,
        resizable: false,
        plain: true,
        border: false,
        shadow: true,
        shadowOffset: 6,
        autoScroll: true,
        modal: true,
        animate: true,
        title: '&nbsp;&nbsp;Add Concentrator',
        items: [addMasterPanel]
    });

    function addDetailRecord() {
        addDetailWin.show();
    }

    // THE DETAIL GRID
    var filtersDetail = new Ext.ux.grid.GridFilters({filters: [
        {type: 'numeric', dataIndex: 'id'},
        {type: 'numeric', dataIndex: 'master_id'},
        {type: 'date',    dataIndex: 'event_date'},
        {type: 'numeric', dataIndex: 'o2_percent'},
        {type: 'string',  dataIndex: 'filter_maintenance'},
        {type: 'string',  dataIndex: 'alarm'},
        {type: 'numeric', dataIndex: 'outlet_pressure'},
        {type: 'numeric', dataIndex: 'location'},
        {type: 'numeric', dataIndex: 'technician'},
        {type: 'string',  dataIndex: 'model'}
    ]});

    var cmDetail = new Ext.grid.ColumnModel([{
        id        : 'gridID',
        dataIndex : 'id',
        header    : 'Id',
        sortable  : true,
        width     : 50
    }, {
        dataIndex : 'event_date',
        header    : 'Date',
        sortable  : true,
        width     : 90
    }, {
        dataIndex : 'o2_percent',
        header    : 'O2 %',
        width     : 50
    }, {
        dataIndex : 'filter_maintenance',
        header    : 'Filter',
        sortable  : true,
        width     : 120
    }, {
        dataIndex : 'alarm',
        header    : 'Alarm',
        sortable  : true,
        width     : 60
    }, {
        dataIndex : 'outlet_pressure',
        header    : 'Outlet Pressure',
        sortable  : true,
        width     : 90
    }, {
        dataIndex : 'location',
        header    : 'Loc',
        sortable  : true,
        width     : 60
    }, {
        dataIndex : 'technician',
        header    : 'Tech',
        sortable  : true,
        width     : 60
    }]);
    cmDetail.defaultSortable = true;

    var addEventButton = new Ext.Button({
        text      : 'Add Event',
        tooltip   : 'Click to add a new event',
        iconCls   : 'icon-add',
        disabled  : true,
        handler   : addDetailRecord
    });

    var gridDetail = new Ext.grid.GridPanel({
        id            : detailSQLtable + 'Master',
        store         : storeDetailGridRows,
        ds            : storeDetailGridRows,
        cm            : cmDetail,
        width         : 0,
        flex          : 1,
        enableColLock : false,
        loadMask      : true,
        plugins       : filtersDetail,
        height        : 266,
        border        : false,
        stripeRows    : true,
        bbar          : new Ext.PagingToolbar({
            store     : storeDetailGridRows,
            pageSize  : 15,
            width     : '100%',
            plugins   : filtersDetail
        }),
        tbar: [addEventButton]
    });

    gridDetail.on('rowclick', function (gridDetail, rowIndex, eventObj) {
        var recordDetail = gridDetail.getStore().getAt(rowIndex);
        editDetailPanel.form.setValues(recordDetail.data);
        editDetailPanel.doLayout();
    });

    var editDetailPanel = new Ext.form.FormPanel({
        url         : 'https://yourhost.yourdomain.com/json/crudO2ConDetail.php',
        width       : 300,
        flex        : 0,
        style       : 'background: #BAC9DC',
        bodyStyle   : {padding: '2,0,0,0'},
        border      : false,
        defaultType : 'textfield',
        labelWidth  : 100,
        autoScroll  : true,
        items: [{  // TabPanel
            xtype             : 'tabpanel',
            border            : false,
            layoutOnTabChange : true,
            deferredRender    : false,
            activeTab         : 0,
            height            : 227,
            defaults: {
                bodyStyle   : {padding: '10,0,0,10', background: '#CAD9EC'},
                defaults    : { width : 150 }
            },
            items : [{  // Tabs
                title       : 'Event',
                layout      : 'form',
                style       : 'background: #BAC9DC',
                defaultType : 'textfield',
                items: [{  //  Form Fields
                    id         : 'detailID',
                    fieldLabel : 'ID',
                    name       : 'id',
                    xtype      : 'hidden'
                }, {
                    id         : 'masterID',
                    fieldLabel : 'MASTERID',
                    name       : 'master_id',
                    xtype      : 'hidden'
                }, {
                    xtype      : 'datefield',
                    fieldLabel : 'Event Date',
                    name       : 'event_date',
                    format     : 'Y-m-d',
                    altFormats : 'm/d/y|n/j/y|Ymd',
                    allowBlank : false
                }, {
                    fieldLabel    : 'Location',
                    name          : 'editLocation',
                    xtype         : 'combo',
                    store         : storeLocations,            //  Select Datastore
                    id            : 'editLocation',    //  EXTJS Object ID
                    displayField  : 'shortname',            //  Select Datastore Column
                    valueField    : 'id',                    //  Select Datastore Column
                    hiddenName    : 'location',        //  Name used in $_POST, i.e column name
                    typeAhead     : false,
                    mode          : 'local',
                    selectOnFocus : true,
                    triggerAction : 'all',
                    allowBlank : false
                }, {
                    fieldLabel    : 'Technician',
                    name          : 'editTechnician',
                    xtype         : 'combo',
                    store         : storeEmployees,        //  Select Datastore
                    id            : 'editTechnician',    //  EXTJS Object ID
                    displayField  : 'fullname',            //  Select Datastore Column
                    valueField    : 'empid',            //  Select Datastore Column
                    hiddenName    : 'technician',        //  Name used in $_POST, i.e column name
                    typeAhead     : false,
                    mode          : 'local',
                    selectOnFocus : true,
                    triggerAction : 'all',
                    allowBlank : false
                }]
            }, {
                title: 'Patient',
                layout: 'form',
                defaults: {width: 150},
                defaultType: 'textfield',
                items: [{  //  Form Fields
                    fieldLabel : 'First Name',
                    name       : 'patient_fname'
                }, {
                    fieldLabel : 'Last Name',
                    name       : 'patient_lname'
                }, {
                    fieldLabel : 'MM #',
                    name       : 'patient_mm_id'
                }]
            }, {
                title: 'Maintenance',
                layout: 'form',
                defaults: {width: 150},
                defaultType: 'textfield',
                items: [{  //  Form Fields
                    fieldLabel : 'O2 %',
                    name       : 'o2_percent'
                }, {
                    fieldLabel : 'Filter Maint',
                    name       : 'filter_maintenance'
                }, {
                    fieldLabel : 'Alarm',
                    name       : 'alarm'
                }, {
                    fieldLabel : 'Outlet Pressure',
                    name       : 'outlet_pressure'
                }]
            }, {
                title: 'Other',
                layout: 'form',
                defaults: {width: 150},
                defaultType: 'textfield',
                items: [{  //  Form Fields
                    xtype      : 'textarea',
                    fieldLabel : 'comments',
                    height     : '65px',
                    width      : '150px',
                    name       : 'comments'
                }]
            }]
        }],
        buttons : [{
            text     : 'save',
            formBind : true,
            handler  : function () {
                editDetailPanel.getForm().submit({
                    method    : 'POST',
                    params    : {crud: "U"},
                    waitTitle : 'Processing',
                    waitMsg   : 'Please Wait',
                    success   : function () {
                    storeDetailGridRows.reload();
                    },
                    failure   : function (form, action) {
                        if (action.failureType === 'server') {
                            obj = Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('Process Failed!', obj.reason);
                        } else {
                            obj = Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('Warning!', obj.reason);
                        }
                    }
                });
            }
        }]
    });  //  EO Detail Form

    var addDetailForm = new Ext.form.FormPanel({
        url         : 'https://yourhost.yourdomain.com/json/crudO2ConDetail.php',
        border      : false,
        defaultType : 'textfield',
        labelWidth  : 100,
        autoScroll  : true,
        items: [{  // TabPanel
            xtype: 'tabpanel',
            layoutOnTabChange: true,
            deferredRender: false,
            activeTab : 0,
            height: 227,
            bodyStyle: 'padding: 5px;',
            items: [{  // Tabs
                title       : 'Event',
                layout      : 'form',
                defaults    : {width: 150},
                defaultType : 'textfield',
                items: [{  //  Form Fields
                    xtype      : 'hidden',
                    id         : 'masterID',
                    fieldLabel : 'ID',
                    name       : 'master_id'
                }, {
                    xtype      : 'datefield',
                    fieldLabel : 'Event Date',
                    name       : 'event_date',
                    format     : 'Y-m-d',
                    altFormats : 'm/d/y|n/j/y|mdY',
                    allowBlank : false
                }, {
                    fieldLabel    : 'Location',
                    name          : 'addLocation',
                    xtype         : 'combo',
                    store         : storeLocations,            //  Select Datastore
                    id            : 'addLocation',            //  EXTJS Object ID
                    displayField  : 'shortname',            //  Select Datastore Column
                    valueField    : 'id',                    //  Select Datastore Column
                    hiddenName    : 'location',                //  Name used in $_POST, i.e column name
                    typeAhead     : false,
                    mode          : 'local',
                    selectOnFocus : true,
                    triggerAction : 'all',
                    allowBlank : false
                }, {
                    fieldLabel    : 'Technician',
                    name          : 'addTechnician',
                    xtype         : 'combo',
                    store         : storeEmployees,        //  Select Datastore
                    id            : 'addTechnician',    //  EXTJS Object ID
                    displayField  : 'fullname',            //  Select Datastore Column
                    valueField    : 'empid',            //  Select Datastore Column
                    hiddenName    : 'technician',        //  Name used in $_POST, i.e column name
                    typeAhead     : false,
                    mode          : 'local',
                    selectOnFocus : true,
                    triggerAction : 'all',
                    allowBlank : false
                }]
            }, {
                title: 'Patient',
                layout: 'form',
                defaults: {width: 150},
                defaultType: 'textfield',
                items: [{  //  Form Fields
                    fieldLabel : 'First Name',
                    name       : 'patient_fname'
                }, {
                    fieldLabel : 'Last Name',
                    name       : 'patient_lname'
                }, {
                    fieldLabel : 'MM #',
                    name       : 'patient_mm_id'
                }]
            }, {
                title: 'Maintenance',
                layout: 'form',
                defaults: {width: 150},
                defaultType: 'textfield',
                items: [{  //  Form Fields
                    fieldLabel : 'O2 %',
                    name       : 'o2_percent'
                }, {
                    fieldLabel : 'Filter Maint',
                    name       : 'filter_maintenance'
                }, {
                    fieldLabel : 'Alarm',
                    name       : 'alarm'
                }, {
                    fieldLabel : 'Outlet Pressure',
                    name       : 'outlet_pressure'
                }]
            }, {
                title: 'Other',
                layout: 'form',
                defaults: {width: 150},
                defaultType: 'textfield',
                items: [{  //  Form Fields
                    xtype      : 'textarea',
                    fieldLabel : 'comments',
                    height     : '65px',
                    width      : '150px',
                    name       : 'comments'
                }]
            }]
        }],
        buttons : [{
            text     : 'save',
            formBind : true,
            handler  : function () {
                addDetailForm.getForm().submit({
                    method    : 'POST',
                    params    : {crud: "C"},
                    waitTitle : 'Processing',
                    waitMsg   : 'Please Wait',
                    success   : function () {
                        addDetailWin.hide();
                        storeDetailGridRows.reload();
                    },
                    failure   : function (form, action) {
                        if (action.failureType === 'server') {
                            obj = Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('Process Failed!', obj.reason);
                        } else {
                            obj = Ext.util.JSON.decode(action.response.responseText);
                            Ext.Msg.alert('Warning!', obj.reason);
                        }
                    }
                });
            }
        }, {
            text: 'Cancel',
            handler: function () {
                addDetailWin.hide();
            }
        }]
    });  //  EO ADD Detail Form


    var addDetailWin = new Ext.Window({
        layout: 'fit',
        width: 300,
        height: 300,
        closable: false,
        resizable: false,
        plain: true,
        border: false,
        shadow: true,
        shadowOffset: 6,
        autoScroll: true,
        modal: true,
        animate: true,
        title: '&nbsp;&nbsp;Add Concentrator Event',
        items: [addDetailForm]
    });


//  Outer Container

    var mdWindow = new Ext.Window({
        layout       : 'vbox',
        height       : 600,
        width        : 900,
        closable     : false,
        resizable    : false,
        plain        : false,
        border       : false,
        layoutConfig : {
            align : 'stretch'
        },
        defaults : {
            frame : false
        },
        items : [{
            title        : 'Concentrator',
            flex         : 1,
            layout       : 'hbox',
            layoutConfig : {
                align    : 'stretch'
            },
            style        : 'background: #CAD9EC',
            items        : [gridMaster, editMasterPanel]
        }, {
            title        : 'History',
            flex         : 1,
            layout       : 'hbox',
            layoutConfig : {
                align    : 'stretch'
            },
            items        : [gridDetail, editDetailPanel]
        }]
    });
    mdWindow.show();

});

