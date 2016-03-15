<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<xsl:stylesheet version="1.0"
	xmlns="http://www.w3.org/TR/REC-html40"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/">

	<xsl:preserve-space elements="text"/>
	<xsl:output method="xml" version="1.0" encoding="UTF-8" indent="yes"/>

	<xsl:template match="/"><!--{{{--> 
		<xsl:apply-templates select="//xpotronix:dataset/class/obj"/>
	</xsl:template><!--}}}-->

	<xsl:template match="obj">
		<div class="x-panel-body">
			<xsl:apply-templates select="attr"/>
		</div>
	</xsl:template>

	<xsl:template match="attr">
		<xsl:variable name="obj_name" select="../@name"/>
		<xsl:variable name="attr_name" select="@name"/>
		
		<div class="x-form-item">
			<label class="x-form-item-label">
				<xsl:apply-templates select="//xpotronix:metadata/obj[@name=$obj_name]/attr[@name=$attr_name]" mode="translate"/>
			</label><div class="x-form-element">
				<xsl:choose>
					<xsl:when test="@label"><xsl:value-of select="@label"/></xsl:when>
					<xsl:otherwise><xsl:value-of select="." disable-output-escaping="yes"/></xsl:otherwise>
				</xsl:choose>
			</div>
		</div>
		<div class="x-form-clear-left"></div>
	</xsl:template>


        <xsl:template match="*" mode="translate"><!--{{{-->
                <xsl:choose>
                        <xsl:when test="@translate!=''">
                                <xsl:value-of select="@translate"/>
                        </xsl:when>
                        <xsl:otherwise>
                                <xsl:value-of select="@name"/>
                        </xsl:otherwise>
                </xsl:choose>
        </xsl:template><!--}}}-->


</xsl:stylesheet>
<!-- vim600: fdm=marker sw=3 ts=8 ai: 
-->
