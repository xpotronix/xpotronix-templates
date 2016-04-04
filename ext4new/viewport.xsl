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

	<xsl:variable name="session" select="//*:session"/>

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
	<xsl:apply-templates select="." mode="main_content"/>
</html>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="body"><!--{{{-->
		<body>
			<xsl:apply-templates select="." mode="application_context"/>
		</body>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="main_content"><!--{{{-->
		<xsl:message>current user: <xsl:value-of select="$current_user"/></xsl:message>
		<xsl:choose>
			<xsl:when test="($login_window='true') and ($anon_user='1' or $current_user='')">
				<xsl:apply-templates select="." mode="include-login-js"/>
				<xsl:apply-templates select="." mode="body_login"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:apply-templates select="." mode="include-all-js"/>
				<xsl:apply-templates select="." mode="body"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="application_context"><!--{{{-->
	
		<xsl:apply-templates select="*:metadata/obj" mode="divs"/>
		<xsl:apply-templates select="." mode="application"/>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="application"><!--{{{-->

	<xsl:variable name="menu_bar" select="xp:get_feat($root_obj,'menu_bar')"/>

	<xsl:variable name="code">

	<xsl:if test="//xpotronix:session/var/EVENTS_MONITOR=1">
		<xsl:call-template name="events_monitor"/>
	</xsl:if>

	Ext.Loader.setConfig({

		enabled: true,
		paths: {
			'Ux.xpotronix': '/ux4/xpotronix'
		}
	});


	<xsl:if test="//xpotronix:session/feat/theme">
	/* Ext.util.CSS.swapStyleSheet("theme","<xsl:value-of select="//xpotronix:session/feat/theme"/>"); */
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

	document.title= '<xsl:apply-templates select="$root_obj" mode="translate"/> :: <xsl:value-of select="//feat/page_title[1]"/>';

	/*
	var wait = Ext.LoadMask(document.body, {msg:'Aguarde por favor ...'});
	wait.show();
	*/

	<xsl:if test="$menu_bar='true'">
	App.menu = Ext.create( 'Ext.Toolbar', <xsl:apply-templates select="//xpotronix:session/menu"/> );
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

	<xsl:apply-templates select="*:model" mode="stores"/>

	<xsl:apply-templates select="*:metadata/obj" mode="config"/>

	<xsl:apply-templates select="*:metadata/obj" mode="panels"/>

	<xsl:apply-templates select="*:model" mode="controller"/>


		<xsl:if test="*:metadata/obj/files/file[@type='js' and @mode='events']">	
		/* Ext.Loader.load([<xsl:apply-templates select="*:metadata/obj/files/file[@type='js' and @mode='events']" mode="include-array-js"/>],null);  */
		</xsl:if>

		/* viewport */


		Ext.application( 'Ux.xpotronix.xpApp', {/*{{{*/

		    requires: ['Ext.container.Viewport'],

		    name: 'AM',
		    /* appFolder: 'app', */

		    controllers: [
			'Users'
		    ],

		    launch: function() {
			<xsl:apply-templates select="." mode="viewport"/>
		    }
		});/*}}}*/


		/* viewport ends */

		});

		/* var post_render_js = [<xsl:apply-templates select="*:metadata/obj/files/file[@type='js' and @mode='post_render']" mode="include-array-js"/>]; */


	</xsl:variable>
	<!-- output final del codigo -->

		
	<script type="text/javascript">
	<xsl:choose>
		<xsl:when test="//xpotronix:session/var/UNNORMALIZED=1">
			<xsl:value-of select="$code" disable-output-escaping="yes"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="normalize-space($code)" disable-output-escaping="yes"/>
		</xsl:otherwise>
	</xsl:choose>
	</script>

	</xsl:template><!--}}}-->

	<xsl:template match="*:model" mode="controller"><!--{{{-->

	/* controllers */

	</xsl:template><!--}}}-->


		<xsl:template match="*:document" mode="viewport"><!--{{{-->

			<xsl:choose>
				<xsl:when test="//*:model/obj/layout">
					<xsl:apply-templates select="//*:model/obj/layout">
						<xsl:with-param name="obj" select="//*:metadata/obj[1]" tunnel="yes"/>
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

	<xsl:template match="obj" mode="divs"><!--{{{-->
		<xsl:element name="div">
			<xsl:attribute name="id" select="concat(@name,'_El')"/>
		</xsl:element>

	</xsl:template><!--}}}-->

</xsl:stylesheet>

<!-- vim: foldmethod=marker sw=3 ts=8 ai: 
-->
