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

	<xsl:include href="globals.xsl"/>

	<xsl:include href="html.xsl"/>
	<xsl:include href="includes.xsl"/>
	<xsl:include href="attr.xsl"/>
	<xsl:include href="store.xsl"/>
	<xsl:include href="layout.xsl"/>
	<xsl:include href="panels.xsl"/>
	<xsl:include href="object.xsl"/>
	<xsl:include href="feat.xsl"/>
	<xsl:include href="log.xsl"/>

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:output method="html" version="4.0" encoding="UTF-8" indent="yes"/>

	<xsl:template match="/"><!--{{{-->
		<!-- <xsl:message><xsl:value-of select="$session/sessions/user_id"/>:<xsl:value-of select="$session/sessions/session_id"/></xsl:message> -->
		<!-- <xsl:message terminate="yes"><xsl:value-of select="$metadata//renderer" disable-output-escaping="yes"/></xsl:message> -->
		<xsl:apply-templates/>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document"><xsl:value-of select="$doctype_decl_strict" disable-output-escaping="yes"/><xsl:text>
</xsl:text><html>
	<xsl:apply-templates select="." mode="head"/>
<body> 
	<h1>Cargando <xsl:value-of select="$session/feat/page_title"/>  aguarde ... </h1>
	<!-- <xsl:message><xsl:value-of select="name()"/></xsl:message> -->

	<!-- <xsl:apply-templates select="." mode="include-login-js"/> -->
	<xsl:apply-templates select="." mode="include-all-js"/>

  	<!-- <script type="text/javascript" src="/ux/misc/miframe.js"></script> -->
 	<script type="text/javascript" src="/ux/misc/RowLayout.js"></script>

  	<script type="text/javascript">

	<xsl:if test="$session/var/EVENTS_MONITOR=1">
                <xsl:call-template name="events_monitor"/>
        </xsl:if>

	<xsl:variable name="code">

	<xsl:if test="$session/feat/theme">
		Ext.util.CSS.swapStyleSheet("theme","<xsl:value-of select="$session/feat/theme"/>");
	</xsl:if>
	Ext.namespace( 'App' );

	var App = new Ext.ux.xpotronix.xpApp( {state_manager:'http', var: {<xsl:apply-templates select="$session/var/*" mode="json-hash"/>}, feat: <xsl:call-template name="app-config"/>, user: <xsl:call-template name="user-session"/> });

	Ext.onReady(function() {

	var wait = new Ext.LoadMask(document.body, {msg:'Aguarde por favor ...'});
	wait.show();

	<xsl:choose>
		<xsl:when test="//xpotronix:model/obj/layout">
			<xsl:value-of select="//*:model/obj/layout"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:apply-templates select="//*:model" mode="treeport"/>
		</xsl:otherwise>
	</xsl:choose>

	<xsl:if test="$metadata/obj/files/file[@type='js' and @mode='events']">
	Ext.Loader.load([<xsl:apply-templates select="$metadata/obj/files/file[@type='js' and @mode='events']" mode="include-array-js"/>]);
	</xsl:if>

	if ( App.user._anon || ! App.user.user_username )
		App.login();

	wait.hide();
	});

	</xsl:variable>
	<xsl:value-of select="normalize-space($code)" disable-output-escaping="yes"/>
  	</script>

   	<div style="display:none">
	<div id="tips">
	<xsl:for-each select="//*:dataset/class/obj/class/obj[@name='help']">
		<xsl:element name="div">
			<xsl:attribute name="id" select="attr[@name='div_id']"/>
			<xsl:value-of select="attr[@name='text']" disable-output-escaping="yes"/>
		</xsl:element>
	</xsl:for-each>
	</div>
	<div id="helps">
	<xsl:for-each select="//*:dataset/class/obj/class/obj[@name='tip']">
		<xsl:element name="div">
			<xsl:attribute name="id" select="attr[@name='div_id']"/>
			<xsl:value-of select="attr[@name='text']" disable-output-escaping="yes"/>
		</xsl:element>
	</xsl:for-each>
	</div>
   	</div> 
 
</body> 
</html> 
	</xsl:template><!--}}}-->
</xsl:stylesheet>

<!-- vim: foldmethod=marker sw=3 ts=8 ai: 
-->
