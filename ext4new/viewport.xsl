<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<!DOCTYPE stylesheet [
<!ENTITY raquo  "&#187;" >
<!ENTITY laquo  "&#186;" >
]>
<xsl:stylesheet version="2.0" 

	xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/" 
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/" 
	xmlns:fn="http://www.w3.org/2005/04/xpath-functions">

	<xsl:include href="html.xsl"/>
	<xsl:include href="includes.xsl"/>
	<xsl:include href="attr.xsl"/>
	<xsl:include href="store.xsl"/>
	<xsl:include href="layout.xsl"/>
	<xsl:include href="panels.xsl"/>
	<xsl:include href="object.xsl"/>
	<xsl:include href="feat.xsl"/>
	<xsl:include href="log.xsl"/>
	<xsl:include href="menubar.xsl"/>

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:output method="html" version="4.0" encoding="UTF-8" indent="no"/>

	<xsl:param name="root_obj" select="//*:metadata/obj[1]"/>
	<xsl:param name="login_window" select="xp:get_feat($root_obj,'login_window')"/>
	<xsl:param name="current_user" select="//*:session/users/user_username"/>
	<xsl:param name="anon_user" select="//*:session/users/_anon"/>
	<xsl:param name="application_path" select="'/var/www/sites/xpotronix/xpay'"/>

	<xsl:variable name="session" select="//*:session"/>
	<!-- <xsl:variable name="application_name" select="upper-case(//*:session/feat/application)"/> -->
	<xsl:variable name="application_name" select="'app'"/>

	<xsl:template match="/"><!--{{{-->
		<!-- <xsl:message><xsl:value-of select="*:session/sessions/user_id"/>:<xsl:value-of select="*:session/sessions/session_id"/></xsl:message> -->
		<!-- <xsl:message terminate="yes"><xsl:value-of select="//*:metadata//renderer" disable-output-escaping="yes"/></xsl:message> -->
		<xsl:apply-templates/>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document"><!--{{{--> 
<xsl:value-of select="$doctype_decl_strict" disable-output-escaping="yes"/><xsl:text>
</xsl:text>
<html>
	<xsl:apply-templates select="." mode="head"/>
	<xsl:message>current user: <xsl:value-of select="$current_user"/></xsl:message>
	<xsl:choose>
		<xsl:when test="($login_window='true') and ($anon_user='1' or $current_user='')">
			<xsl:apply-templates select="." mode="include-login-js"/>
			<xsl:apply-templates select="." mode="body_login"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:apply-templates select="." mode="include-all-js"/>
			<body>
			<xsl:apply-templates select="." mode="application"/>
			</body>
		</xsl:otherwise>
	</xsl:choose>
</html>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="application"><!--{{{-->

	<xsl:variable name="menu_bar" select="xp:get_feat($root_obj,'menu_bar')"/>

		<!-- model -->

		<xsl:for-each select="*:model//obj">

			<xsl:result-document method="text"
			encoding="utf-8"
			href="{concat($application_path,'/',$application_name,'/model/',@name,'.js')}">

			<xsl:apply-templates select="." mode="model"/>

			</xsl:result-document>

			<!-- model_eh -->

			<xsl:for-each select="queries/query/query">

				<xsl:result-document method="text"
				encoding="utf-8"
				href="{concat($application_path,'/',$application_name,'/model/',../from,'_',@name,'.js')}">

				<xsl:apply-templates select="." mode="model_eh"/>

				</xsl:result-document>

			</xsl:for-each>

		</xsl:for-each>

		<!-- store -->

		<xsl:for-each select="*:model//obj">

			<xsl:result-document method="text"
			encoding="utf-8"
			href="{concat($application_path,'/',$application_name,'/store/',@name,'.js')}">

			<xsl:apply-templates select="." mode="store"/>

			</xsl:result-document>

			<!-- store_eh -->

			<xsl:for-each select="queries/query/query">

				<xsl:result-document method="text"
				encoding="utf-8"
				href="{concat($application_path,'/',$application_name,'/store/',../from,'_',@name,'.js')}">

				<xsl:apply-templates select="." mode="store_eh"/>

				</xsl:result-document>

			</xsl:for-each>

		</xsl:for-each>

		<!-- panel -->

		<xsl:for-each select="*:model/obj">

			<xsl:variable name="obj_name" select="@name"/>

			<xsl:for-each select="panel">

				<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>

				<xsl:result-document method="text"
				encoding="utf-8"
				href="{concat($application_path,'/',$application_name,'/view/',$panel_id,'.js')}">

					<xsl:apply-templates select=".">
						<xsl:with-param name="obj" select="*:metadata/obj[@name=$obj_name]" tunnel="yes"/>
						<xsl:with-param name="obj_name" select="$obj_name" tunnel="yes"/>
					</xsl:apply-templates>

				</xsl:result-document>

			</xsl:for-each>

		</xsl:for-each>

		<!-- controller -->

		<xsl:result-document method="text"
		encoding="utf-8"
		href="{concat($application_path,'/',$application_name,'/controller/',*:session/feat/module,'.js')}">
	
			<xsl:apply-templates select="*:model" mode="controller"/>

		</xsl:result-document>



	<xsl:variable name="code">

	<xsl:if test="*:session/var/EVENTS_MONITOR=1">
		<xsl:call-template name="events_monitor"/>
	</xsl:if>

	Ext.Loader.setConfig({

		enabled: true,
		paths: {
			'Ux.xpotronix': '/ux4/xpotronix'
		}
	});


	<xsl:if test="*:session/feat/theme">
	/* Ext.util.CSS.swapStyleSheet("theme","<xsl:value-of select="*:session/feat/theme"/>"); */
	</xsl:if>

	Ext.Ajax.timeout = 60000;
	var App;

	Ext.onReady(function() {


		var config_App = {state_manager:'http', feat:<xsl:call-template name="app-config"/>,user:<xsl:call-template name="user-session"/>};

		if ( App ) {

			App.reconfigure( config_App );

		} else {

			Ext.namespace('App');
			App = Ext.create( 'Ux.xpotronix.xpApp', config_App );
		}

		document.title= '<xsl:apply-templates select="$root_obj" mode="translate"/> :: <xsl:value-of select="*:session/feat/page_title[1]"/>';

		/*
		var wait = Ext.LoadMask(document.body, {msg:'Aguarde por favor ...'});
		wait.show();
		*/

		<xsl:if test="$menu_bar='true'">
		App.menu = Ext.create( 'Ext.Toolbar', <xsl:apply-templates select="*:session/menu"/> );
		/*
		Ext.Ajax.request({
			url: '?a=menu&amp;v=ext4/menubar',
			success: function(resp) {
				var arr = Ext.decode( resp.responseText ); 
				App.menu = Ext.create( 'Ext.Toolbar' );

				Ext.each( arr, function(o) { 
					App.menu.add(o); 
				});
		
				App.fireEvent( 'configready' );
			}});
		*/
		</xsl:if>

		/* config objects */

		<xsl:apply-templates select="*:metadata/obj" mode="config"/>

		// Ext.Loader.setConfig({enabled:false});

		/* application/viewport */

		Ext.application({/*{{{*/

		    requires: ['Ext.container.Viewport'],

		    name: '<xsl:value-of select="$application_name"/>',
		    //appFolder: 'modules', 

		    controllers: [
			'<xsl:value-of select="*:session/feat/module"/>'
		    ],

		    launch: function() {

			<xsl:apply-templates select="*:model" mode="viewport"/>

		    }
		});/*}}}*/

	}); /* onReady ends */


	</xsl:variable>
	<!-- output final del codigo -->

		
	<script type="text/javascript">
	<xsl:choose>
		<xsl:when test="//*:session/var/UNNORMALIZED=1">
			<xsl:value-of select="$code" disable-output-escaping="yes"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="normalize-space($code)" disable-output-escaping="yes"/>
		</xsl:otherwise>
	</xsl:choose>
	</script>

	</xsl:template><!--}}}-->

	<xsl:template match="*:model" mode="controller"><!--{{{-->

	<xsl:variable name="items">
		<xsl:for-each select=".//obj">
			<xsl:element name="model">
				<xsl:attribute name="name" select="@name"/>
			</xsl:element>
			<xsl:for-each select="queries/query/query">
				<xsl:element name="model">
					<xsl:attribute name="name" select="concat(../from,'_',@name)"/>
				</xsl:element>
			</xsl:for-each>
		</xsl:for-each>
	</xsl:variable>

/* controller */

	
Ext.define('<xsl:value-of select="concat($application_name,'.controller.',../*:session/feat/module)"/>', {/*{{{*/

    extend: 'Ext.app.Controller',

    views: [<xsl:for-each select="obj/panel">'<xsl:apply-templates select="." mode="get_panel_id"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>],

    stores: [<xsl:for-each select="$items/*">'<xsl:value-of select="@name"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>],

    models: [<xsl:for-each select="$items/*">'<xsl:value-of select="@name"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>],

    init: function() {
        this.control({

	/*
            'viewport > panel': {
                render: this.onPanelRendered
            },

	    'userlist': {
                itemdblclick: this.editUser
            },

	    'useredit button[action=save]': {
                click: this.updateUser
            } */
        });
    },

	/*

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

	*/

});/*}}}*/


	</xsl:template><!--}}}-->

		<xsl:template match="*:document" mode="viewport"><!--{{{-->

			<xsl:choose>
				<xsl:when test="*:model/obj/layout">
					<xsl:apply-templates select="*:model/obj/layout">
						<xsl:with-param name="obj" select="*:metadata/obj[1]" tunnel="yes"/>
						<xsl:with-param name="standalone" select="true()"/>
					</xsl:apply-templates>
				</xsl:when>

				<xsl:otherwise>
					<xsl:apply-templates select="*:model" mode="viewport">
						<xsl:with-param name="standalone" select="true()"/>
					</xsl:apply-templates>
				</xsl:otherwise>

			</xsl:choose>

		</xsl:template><!--}}}-->

<xsl:template match="*:document" mode="body_login"><!--{{{-->
<body class="login">

<script type="text/javascript">
Ext.namespace( 'App' );
var App = Ext.create( 'Ux.xpotronix.xpApp', {feat: <xsl:call-template name="app-config"/>, user: <xsl:call-template name="user-session"/> } );

Ext.onReady(function(){

	App.login();

});
</script>

<div id="login-container" style="width: 340px;">
	<div id="login-form-box">
		<div id="login-form"></div>
	</div>
</div>

</body>
	</xsl:template><!--}}}-->

</xsl:stylesheet>

<!-- vim: foldmethod=marker sw=3 ts=8 ai: 
-->
