<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->


<!-- feat.xsl -->

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

	<xsl:template name="app-config">
		{<xsl:for-each select="//*:session/feat/*"><xsl:value-of select="name()"/>:<xsl:apply-templates select="." mode="json-value"/><xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>}
	</xsl:template>

	<xsl:template match="obj" mode="feats"><!--{{{-->
		<xsl:variable name="obj_name" select="@name"/>{<xsl:for-each select="//*:metadata/obj[@name=$obj_name]/feat/*">
			<xsl:value-of select="name()"/>:<xsl:apply-templates select="." mode="json-value"/><xsl:if test="position()!=last()">,</xsl:if>
		</xsl:for-each>}
	</xsl:template><!--}}}-->

	<xsl:function name="xp:get_feat"><!--{{{-->
		<xsl:param name="obj"/>
		<xsl:param name="feat_name"/>
		<!-- <xsl:message>get_feat: feat_name: <xsl:value-of select="$feat_name"/> obj: <xsl:sequence select="$obj"/></xsl:message> -->
		<xsl:apply-templates select="$obj" mode="get_feat">
			<xsl:with-param name="feat_name" select="$feat_name"/>
		</xsl:apply-templates>
	</xsl:function><!--}}}-->

<xsl:template match="obj" mode="get_feat"><!--{{{-->

		<xsl:param name="feat_name"/>
		<!-- <xsl:message>**** get_feat:</xsl:message> -->
		<!-- <xsl:message>obj: <xsl:copy-of select="."/></xsl:message>-->

		<xsl:variable name="feats" select="//*:session/feat"/>
		<xsl:variable name="obj_name" select="@name"/>

		<!-- <xsl:message>obj_name: <xsl:value-of select="$obj_name"/></xsl:message> -->
		<!-- <xsl:message>feat_name: <xsl:value-of select="$feat_name"/></xsl:message> -->

		<xsl:variable name="feat">
			<xsl:choose>
				<xsl:when test="$feats/obj[@name=$obj_name]/feat/*[name()=$feat_name]">
					<!--<xsl:message>local</xsl:message>-->
					<xsl:value-of select="$feats/obj[@name=$obj_name]/feat/*[name()=$feat_name][last()]"/>
				</xsl:when>
				<xsl:otherwise>
					<!-- <xsl:message>global</xsl:message>-->
					<xsl:value-of select="$feats/*[name()=$feat_name][last()]"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<!-- <xsl:message>feat_value: <xsl:copy-of select="$feat"/></xsl:message> -->

		<xsl:variable name="feat_type">
			<xsl:choose>
				<xsl:when test="$feats/*[name()=$feat_name]">
					<xsl:value-of select="$feats/*[name()=$feat_name]/@type"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="$feats/obj[@name=$obj_name]/feat/*[name()=$feat_name]/@type"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:apply-templates select="$feat" mode="json-value">
			<xsl:with-param name="type" select="$feat_type"/>
		</xsl:apply-templates>

	</xsl:template><!--}}}--> 

	<xsl:template match="*" mode="json-value"><!--{{{-->
		<xsl:param name="type" select="@type"/>
		<xsl:choose>
			<xsl:when test=".=''">null</xsl:when>
			<xsl:when test="$type='bool' or $type='boolean'">
				<xsl:choose>
					<xsl:when test=".='true'">true</xsl:when>
					<xsl:when test=".='false'">false</xsl:when>
				</xsl:choose>
			</xsl:when>
			<xsl:when test="$type='int' or $type='integer'"><xsl:value-of select="."/></xsl:when>
			<xsl:otherwise>'<xsl:value-of select="."/>'</xsl:otherwise>
		</xsl:choose>
	</xsl:template><!--}}}-->

	<xsl:template match="*" mode="guess-json-value"><!--{{{-->
		<xsl:choose>
			<xsl:when test=".='null'">null</xsl:when>
			<xsl:when test=".='true'">true</xsl:when>
			<xsl:when test=".='false'">false</xsl:when>
			<xsl:when test="number(.)=number(.)"><xsl:value-of select="."/></xsl:when>
			<xsl:otherwise>'<xsl:value-of select="."/>'</xsl:otherwise>
		</xsl:choose>
	</xsl:template><!--}}}-->


	<xsl:template name="user-session">{<xsl:for-each select="//*:session/users/*"><xsl:value-of select="name()"/>:<xsl:apply-templates select="." mode="json-value"/><xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>}
	</xsl:template>

</xsl:stylesheet>

<!-- vim: foldmethod=marker sw=3 ts=8 ai: 
-->
