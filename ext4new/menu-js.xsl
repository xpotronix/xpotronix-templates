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
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<!-- para que no cuente los elementos en blanco http://www.dpawson.co.uk/xsl/sect2/N6099.html#d9389e73-->
	<xsl:strip-space elements="menu item"/>
	<xsl:output method="html" version="4.0"/>

	<xsl:param name="debug" select="true()"/>
	
	<xsl:template match="/">
		<xsl:variable name="result">[<xsl:apply-templates select="menu/*[not(@access) or (@access and @access!='')]"/>]</xsl:variable>
		<xsl:choose>
			<xsl:when test="//*:session/var/UNNORMALIZED=1 or $debug=true()"><xsl:value-of select="$result"/></xsl:when>
			<xsl:otherwise><xsl:value-of select="normalize-space($result)"/></xsl:otherwise>
		</xsl:choose>
	</xsl:template>

        <xsl:template match="menu">{
		<xsl:if test="@h">href:'<xsl:value-of select="@h"/>',</xsl:if>
		text:'<xsl:value-of select="@n"/>'
		<xsl:apply-templates select="." mode="status"/>,
		<xsl:if test="@id">itemId:'<xsl:value-of select="@id"/>',</xsl:if>
		<xsl:if test="@iconCls">iconCls:'<xsl:value-of select="@iconCls"/>',</xsl:if>
		<xsl:if test="@align!=''">align:'<xsl:value-of select="@align"/>',</xsl:if>
		children:[<xsl:apply-templates select="*[not(@access) or (@access and @access!='')]"/>]}
		<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template>

        <xsl:template match="item">
		<xsl:variable name="url">
			<xsl:choose>
				<xsl:when test="@e"><xsl:value-of select="concat(@m,'&amp;',@e)"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="@m"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		{itemId:'<xsl:choose>
			<xsl:when test="@id"><xsl:value-of select="@id"/></xsl:when>
			<xsl:otherwise><xsl:value-of select="concat(@m,@e)"/></xsl:otherwise>
		</xsl:choose>',
		<xsl:if test="@iconCls">iconCls:'<xsl:value-of select="@iconCls"/>',</xsl:if>
		href:'<xsl:choose>
			<xsl:when test="@h"><xsl:value-of select="@h"/></xsl:when>
			<xsl:otherwise><xsl:value-of select="concat('?m=',$url)"/></xsl:otherwise>
		</xsl:choose>',
		leaf:true,
		module:'<xsl:value-of select="@m"/>',
		extra:'<xsl:value-of select="@e"/>',
		<xsl:apply-templates select="." mode="status"/>
		text:'<xsl:choose>
			<xsl:when test="@n"><xsl:value-of select="@n"/></xsl:when>
			<xsl:otherwise><xsl:value-of select="concat(@m,@e)"/></xsl:otherwise>
		</xsl:choose>'}
		<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template>


	<xsl:template match="item|menu" mode="status"><xsl:if test="@access and @access=''">disabled:true,</xsl:if></xsl:template>

</xsl:stylesheet>
