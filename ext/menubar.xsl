<?xml version="1.0" encoding="utf-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<xsl:stylesheet version="1.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/">
	<!-- para que no cuente los elementos en blanco http://www.dpawson.co.uk/xsl/sect2/N6099.html#d9389e73-->
	<xsl:strip-space elements="menu item"/>

	<xsl:template match="menu"><!--{{{-->
	[{ leaf: true, text: '<b><xsl:value-of select="@n"/></b>' <xsl:apply-templates select="." mode="status"/> },
	<xsl:apply-templates select="*[not(@access) or (@access and @access!='')]" mode="top"/>,
	{ leaf: true, xtype: 'tbtext', text: '<b><xsl:value-of select="@username"/></b>' <xsl:apply-templates select="." mode="status"/>}]
	</xsl:template><!--}}}-->

	<xsl:template match="menu" mode="top"><!--{{{-->
	{<xsl:if test="@h">href:'<xsl:value-of select="@h"/>',</xsl:if>text:'<b><xsl:value-of select="@n"/></b>',<xsl:if test="@iconCls">iconCls: '<xsl:value-of select="@iconCls"/>',</xsl:if>menu:{ items: [<xsl:apply-templates select="*[not(@access) or (@access and @access!='')]" mode="sub"/>]}}<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template><!--}}}-->

        <xsl:template match="menu" mode="sub"><!--{{{--> 
	{<xsl:if test="@h">href:'<xsl:value-of select="@h"/>',</xsl:if>text:'<b><xsl:value-of select="@n"/></b>'<xsl:apply-templates select="." mode="status"/>,menu:{<xsl:if test="@iconCls">iconCls: '<xsl:value-of select="@iconCls"/>',</xsl:if><xsl:if test="@align!=''">align:'<xsl:value-of select="@align"/>',</xsl:if>items:[<xsl:apply-templates select="*[not(@access) or (@access and @access!='')]" mode="sub"/>]}
	}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="item" mode="sub"><!--{{{-->
		{leaf:true,<xsl:if test="@iconCls">iconCls: '<xsl:value-of select="@iconCls"/>',</xsl:if> href: '<xsl:value-of select="@h"/>', text: '<xsl:value-of select="@n"/>' <xsl:apply-templates select="." mode="status"/>}<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template><!--}}}-->

	<xsl:template match="item|menu" mode="status">,disabled: <xsl:choose><xsl:when test="@access and @access=''">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose></xsl:template>

	<xsl:template match="fill" mode="top"><!--{{{-->
	{xtype: 'tbfill'}<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template><!--}}}-->

</xsl:stylesheet>
