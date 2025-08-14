<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<!-- html.xsl

plantilla de interfaz usuario
para ExtJs 2.0
eduardo spotorno, julio 2007

-->
<!DOCTYPE stylesheet [
<!ENTITY raquo  "&#187;" >
]>
<xsl:stylesheet version="2.0" 
	xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/" 
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/" 
	xmlns:fn="http://www.w3.org/2005/xpath-functions">

	<xsl:template match="*:document" mode="head"><!--{{{-->
<head>
<xsl:apply-templates select="." mode="meta"/>
<xsl:apply-templates select="." mode="title"/>
<xsl:apply-templates select="." mode="favicon"/>
<xsl:apply-templates select="." mode="include-all-css"/>
</head>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="meta"><!--{{{-->
<xsl:element name="meta">
	<xsl:attribute name="name">Description</xsl:attribute>
	<xsl:attribute name="content">Xpotronix Application</xsl:attribute>
</xsl:element>
<xsl:element name="meta">
	<xsl:attribute name="name">Version</xsl:attribute>
	<xsl:attribute name="content"><xsl:value-of select="//feat/version[1]"/></xsl:attribute>
</xsl:element>
<xsl:element name="meta">
	<xsl:attribute name="http-equiv">Content-Type</xsl:attribute>
	<xsl:attribute name="content">text/html;charset=<xsl:value-of select="//feat/encoding[last()]"/></xsl:attribute>
</xsl:element>
<xsl:element name="meta">
	<xsl:attribute name="name">Keywords</xsl:attribute>
	<xsl:attribute name="content">xpotronix</xsl:attribute>
</xsl:element>

	<meta http-equiv="Cache-Control" content="no-store"/>
	<meta http-equiv="Cache-Control" content="no-cache"/>
	<meta http-equiv="Expires" content="0"/>
	<meta http-equiv="Pragma" content="no-cache, must-revalidate, no-store"/>
	<meta name="revisit-after" content="10 days"/>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="title"><!--{{{-->
<xsl:element name="title">
<!-- <xsl:value-of select="//config/application[1]"/> :: <xsl:value-of select="//feat/generator[1]"/><xsl:if test="//feat/page_title[1]"> :: <xsl:value-of select="//feat/page_title[1]"/> -->
<xsl:value-of select="//config/application[1]"/> <xsl:if test="//feat/page_title[1]"> <xsl:value-of select="//feat/page_title[1]"/>
</xsl:if>
</xsl:element>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="favicon"><!--{{{-->
<xsl:if test="//feat/favicon">
	<xsl:element name="link">
		<xsl:attribute name="rel">shortcut icon</xsl:attribute>
		<xsl:attribute name="href"><xsl:value-of select="//feat/favicon[1]"/></xsl:attribute>
		<xsl:attribute name="type">image/ico</xsl:attribute>
	</xsl:element>
</xsl:if>
	</xsl:template><!--}}}-->

</xsl:stylesheet>

<!-- vim600: fdm=marker sw=3 ts=8 ai: 
-->
