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

	<xsl:variable name="doctype_decl_transitional"><![CDATA[<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">]]></xsl:variable>
	<xsl:variable name="doctype_decl_strict"><![CDATA[<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">]]></xsl:variable>
	<xsl:variable name="doctype_decl"><![CDATA[<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">]]></xsl:variable>


	<xsl:template match="*:document" mode="head"><!--{{{-->
<head>
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
	<xsl:attribute name="content">text/html;charset=<xsl:value-of select="//feat/charset[1]"/></xsl:attribute>
</xsl:element>
<xsl:element name="meta">
	<xsl:attribute name="name">Keywords</xsl:attribute>
	<xsl:attribute name="content">xpotronix</xsl:attribute>
</xsl:element>

<xsl:element name="title">
<xsl:value-of select="//feat/application[1]"/> :: <xsl:value-of select="//feat/generator[1]"/><xsl:if test="//feat/page_title[1]"> :: <xsl:value-of select="//feat/page_title[1]"/>
</xsl:if>
</xsl:element>
<xsl:if test="//feat/favicon">
	<xsl:element name="link">
		<xsl:attribute name="rel">shortcut icon</xsl:attribute>
		<xsl:attribute name="href"><xsl:value-of select="//feat/favicon[1]"/></xsl:attribute>
		<xsl:attribute name="type">image/ico</xsl:attribute>
	</xsl:element>
</xsl:if>

<xsl:apply-templates select="." mode="include-all-css"/>

</head>

	</xsl:template><!--}}}-->


</xsl:stylesheet>

<!-- vim600: fdm=marker sw=3 ts=8 ai: 
-->
