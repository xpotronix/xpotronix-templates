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
	<xsl:include href="object.xsl"/>
	<xsl:include href="panels.xsl"/>
	<xsl:include href="feat.xsl"/>
	<xsl:include href="log.xsl"/>
	<xsl:include href="menubar.xsl"/>
	<xsl:include href="application.xsl"/>

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:output method="html" version="4.0" encoding="UTF-8" indent="no"/>

        <xsl:variable name="session" select="//*:session"/>
        <xsl:variable name="metadata" select="//*:metadata"/>
        <xsl:variable name="model" select="//*:model"/>

	<xsl:param name="root_obj" select="$model/obj[1]"/>
	<xsl:param name="login_window" select="xp:get_feat($root_obj,'login_window')"/>
	<xsl:param name="current_user" select="$session/users/user_username"/>
	<xsl:param name="anon_user" select="$session/users/_anon"/>
	<xsl:param name="application_path" select="'/var/www/sites/xpotronix/xpay'"/>

	<!-- <xsl:variable name="application_name" select="upper-case($session/feat/application)"/> -->
	<xsl:variable name="application_name" select="'app'"/>

	<!-- abre archivos de template -->
	<xsl:variable name="template_ext_ui" select="concat($session/feat/base_path,'/templates/ext4/ui.xml')"/>



	<xsl:template match="/"><!--{{{-->
		<!-- <xsl:message><xsl:value-of select="$session/sessions/user_id"/>:<xsl:value-of select="$session/sessions/session_id"/></xsl:message> -->
		<!-- <xsl:message terminate="yes"><xsl:value-of select="$metadata//renderer" disable-output-escaping="yes"/></xsl:message> -->
		<xsl:apply-templates/>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document"><!--{{{--> 
<xsl:value-of select="$doctype_decl_strict" disable-output-escaping="yes"/><xsl:text>
</xsl:text>
<html>
	<xsl:apply-templates select="." mode="head"/>
	<!--<xsl:message>** CURRENT_USER: <xsl:value-of select="$current_user"/></xsl:message> -->
	<xsl:choose>
		<xsl:when test="($login_window='true') and ($anon_user='1' or $current_user='')">
			<xsl:apply-templates select="." mode="body_login"/>
		</xsl:when>
		<xsl:otherwise>
			<body>
			<xsl:apply-templates select="." mode="application"/>
			</body>
		</xsl:otherwise>
	</xsl:choose>
</html>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="head"><!--{{{-->
<head>
<xsl:apply-templates select="." mode="meta"/>
<xsl:apply-templates select="." mode="title"/>
<xsl:apply-templates select="." mode="favicon"/>
<xsl:apply-templates select="." mode="include-all-css"/>
<xsl:apply-templates select="." mode="include-all-js"/>

<xsl:for-each select="$metadata/obj/files/file[@type='js' and @mode='events']">
	<script type="text/javascript" src="{@name}"/>
</xsl:for-each>

</head>
	</xsl:template><!--}}}-->

</xsl:stylesheet>

<!-- vim: foldmethod=marker sw=3 ts=8 ai: 
-->
