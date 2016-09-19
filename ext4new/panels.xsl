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
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/"
	xmlns:saxon="http://saxon.sf.net/"
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/">

	<xsl:variable name="templates" select="document('templates.xml')"/>

	<!-- panel_config -->

	<xsl:template match="panel" mode="panel_config"><!--{{{-->

		<xsl:param name="obj" tunnel="yes"/>
		<!-- <xsl:message terminate="yes">object: <xsl:copy-of select="$obj/@name"/></xsl:message> -->
		<!-- <xsl:message>obj: <xsl:copy-of select="$obj"/></xsl:message> -->
		<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>
		<xsl:variable name="panel_type" select="@type"/>	

		<xsl:variable name="config">

			<alias>'widget.<xsl:value-of select="$panel_id"/>'</alias>
			<stateId>'<xsl:value-of select="$panel_id"/>'</stateId>
			<class_name>'<xsl:value-of select="$obj/@name"/>'</class_name>
			<obj>App.obj.get('<xsl:value-of select="$obj/@name"/>')</obj>
			<acl>App.obj.get('<xsl:value-of select="$obj/@name"/>').acl</acl>
			<store>'<xsl:value-of select="$obj/@name"/>'</store>
			<feat><xsl:apply-templates select="$obj" mode="feats"/></feat>
			<display_as>'<xsl:value-of select="@display"/>'</display_as>
			<title>'<xsl:apply-templates select="." mode="translate"/>'</title>

			<!-- attributos por default en templates.xml -->
			<xsl:for-each select="$templates//panel[@type=$panel_type]/*">
				<xsl:element name="{name()}"><xsl:apply-templates select="." mode="guess-json-value"/></xsl:element>
			</xsl:for-each>
	
			<!-- attributos en el elemnto <panel/> -->
			<xsl:for-each select="@*">
				<xsl:element name="{name()}">'<xsl:apply-templates select="." mode="json-value"/>'</xsl:element>
			</xsl:for-each>
			
		</xsl:variable>
		{<xsl:for-each select="$config/*"><xsl:value-of select="name()"/>:<xsl:value-of select="."/><xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>}
	</xsl:template><!--}}}-->

	<!-- ui_overides -->

	<xsl:template match="panel[@type='xpGrid']" mode="panel_config_override"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>
		<!-- <xsl:message>panel_config_override: type: <xsl:value-of select="@type"/>, id: <xsl:value-of select="$panel_id"/>, obj/@name: <xsl:value-of select="$obj/@name"/></xsl:message> -->
		/* panel_config_override: start */
		{<xsl:choose>
			<xsl:when test="config or items">
				<xsl:apply-templates select="config|items" mode="column"><xsl:with-param name="panel_id" select="$panel_id" tunnel="yes"/></xsl:apply-templates>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="default_column"><xsl:with-param name="panel_id" select="$panel_id" tunnel="yes"/></xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>}
		/* panel_config_override: end */

	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='xpForm' or @type='Form']" mode="panel_config_override"><!--{{{-->

		<xsl:param name="obj" tunnel="yes"/>
		<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>

		<!-- <xsl:message>panel_config_override: type: <xsl:value-of select="@type"/>, id: <xsl:value-of select="$panel_id"/>, obj/@name: <xsl:value-of select="$obj/@name"/></xsl:message> -->

		/* panel_config_override: start */
		{<xsl:choose>
			<xsl:when test="config or items">
				<xsl:apply-templates select="config|items"><xsl:with-param name="panel_id" select="$panel_id" tunnel="yes"/></xsl:apply-templates>
			</xsl:when>
			<xsl:otherwise>
				<xsl:call-template name="default_items"><xsl:with-param name="panel_id" select="$panel_id" tunnel="yes"/></xsl:call-template>
			</xsl:otherwise>
		</xsl:choose>}
		/* panel_config_override: end */

	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='xpPanel' or @type='Viewport' or @type='Window' or @type='Tab' or @type='xpThumbs' or @type='xpImageViewer' or @type='xpUploadPanel']" mode="panel_config_override"><!--{{{-->

		<xsl:param name="obj" tunnel="yes"/>
		<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>

		<!-- <xsl:message>panel_config_override: type: <xsl:value-of select="@type"/>, id: <xsl:value-of select="$panel_id"/>, obj/@name: <xsl:value-of select="$obj/@name"/></xsl:message> -->

		/* panel_config_override: start */
		{<xsl:if test="config or items">
			<xsl:apply-templates select="config|items" mode="panel"><xsl:with-param name="panel_id" select="$panel_id" tunnel="yes"/></xsl:apply-templates>
		</xsl:if>}
		/* panel_config_override: end */

	</xsl:template><!--}}}-->

	<!-- para los paneles sin items -->

	<xsl:template match="config" mode="panel"><!--{{{-->
		<xsl:if test="position()-1">,</xsl:if><xsl:value-of select="."/>
	</xsl:template><!--}}}-->

	<xsl:template match="items" mode="panel"><!--{{{-->
		<xsl:if test="position()-1">,</xsl:if>items:[<xsl:apply-templates select="./*"/>]
	</xsl:template><!--}}}-->

	<!-- para los paneles con default items -->

	<xsl:template match="config"><!--{{{-->
		<xsl:if test="position()-1">,</xsl:if><xsl:value-of select="."/><xsl:if test="not(../items)">,<xsl:call-template name="default_items"/></xsl:if>
	</xsl:template><!--}}}-->

	<xsl:template match="items"><!--{{{-->
		<xsl:if test="position()-1">,</xsl:if>items:[<xsl:apply-templates select="./*"/>]
	</xsl:template><!--}}}-->

	<xsl:template name="default_items"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		items:[<xsl:apply-templates select="$obj/attr[not(@display) or @display='' or @display='disabled' or @display='password']" mode="field"/>]
	</xsl:template><!--}}}-->

	<!-- para los paneles con column model -->

	<xsl:template match="config" mode="column"><!--{{{-->
		<xsl:if test="position()-1">,</xsl:if><xsl:value-of select="."/><xsl:if test="not(../items)">,<xsl:call-template name="default_column"/></xsl:if>
	</xsl:template><!--}}}-->

	<xsl:template match="items" mode="column"><!--{{{-->
		<xsl:if test="position()-1">,</xsl:if>
		columns:[<xsl:apply-templates select="./*" mode="column"/>]
	</xsl:template><!--}}}-->

	<xsl:template name="default_column"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		columns:[<xsl:apply-templates select="$obj/attr[not(@display) or @display='' or @display='hide' or @display='disabled' or @display='password']" mode="column"/>]
	</xsl:template><!--}}}-->

<!-- paneles por tipo -->

	<xsl:template match="panel" mode="define"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>
		<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>
		<xsl:variable name="panel_class" select="concat($application_name,'.view.',$panel_id)"/>
		/* PANEL type: xpGrid, panel_class: <xsl:value-of select="$panel_class"/> */
		Ext.define('<xsl:value-of select="$panel_class"/>',
		Ext.apply(<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>,<xsl:apply-templates select="." mode="panel_config_override"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>));

	</xsl:template><!--}}}-->

	<xsl:template match="items/panel"><!--{{{-->
		<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>
		<xsl:if test="position()-1">,</xsl:if>{xtype:'<xsl:value-of select="$panel_id"/>'}
	</xsl:template><!--}}}-->

	<!-- cmp -->

	<xsl:template match="cmp"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		<xsl:param name="standalone" tunnel="yes"/>
		<!-- <xsl:message>obj/cmp: <xsl:value-of select="$obj/@name"/></xsl:message> -->
		<xsl:if test="position()-1">,</xsl:if><xsl:apply-templates select="." mode="sub"></xsl:apply-templates>
	</xsl:template><!--}}}-->

	<xsl:template match="cmp[not(@ref)]" mode="sub"><!--{{{-->
		<xsl:variable name="xtype">
			<xsl:choose>
				<xsl:when test="@type"><xsl:value-of select="@type"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="'panel'"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		{	xtype: '<xsl:value-of select="$xtype"/>',
			<xsl:if test="@id">id:'<xsl:value-of select="@id"/>'<xsl:if test="config or items">,</xsl:if></xsl:if>
			<xsl:if test="config"><xsl:value-of select="config"/><xsl:if test="items/*">,</xsl:if></xsl:if>
			<xsl:if test="items/*">items:[<xsl:apply-templates select="items/*"></xsl:apply-templates>]</xsl:if>
		}
	</xsl:template><!--}}}-->

	<xsl:template match="cmp[@ref]" mode="sub"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		<xsl:param name="standalone" tunnel="yes" select="false()"/>
		<!-- <xsl:message>obj/cmp: <xsl:value-of select="$obj"/>, type: <xsl:value-of select="@type"/></xsl:message> -->
		Ext.apply(Ext.getCmp('<xsl:value-of select="@ref"/>'),{
			<xsl:if test="@id">id:'<xsl:value-of select="@id"/>'<xsl:if test="config or items">,</xsl:if></xsl:if>
			<xsl:if test="config"><xsl:value-of select="config"/><xsl:if test="items/*">,</xsl:if></xsl:if>
			<xsl:if test="items/*">items:[<xsl:apply-templates select="items/*"></xsl:apply-templates>]</xsl:if>
		})
	</xsl:template><!--}}}-->

	<!-- misc templates -->

	<xsl:template match="panel" mode="translate"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		<!-- <xsl:message terminate="yes">panel/object: <xsl:sequence select="$obj"/></xsl:message> -->
		<xsl:choose>
			<xsl:when test="@translate!=''"><xsl:value-of select="@translate"/></xsl:when>
			<xsl:otherwise>
				<xsl:apply-templates select="$obj" mode="translate"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template><!--}}}-->

 	<xsl:template match="panel" mode="get_panel_id"><!--{{{-->
		<xsl:variable name="obj" select=".."/>
		<!-- <xsl:message><xsl:value-of select="$obj/@name"/></xsl:message> -->
		<xsl:variable name="panel_id">
			<xsl:choose>
				<xsl:when test="@id"><xsl:value-of select="@id"/></xsl:when>
				<xsl:when test="@obj"><xsl:value-of select="concat(@obj,'_',@type)"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="concat($obj/@name,'_',@type)"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<!-- <xsl:message>panel_id: <xsl:value-of select="$panel_id"/></xsl:message> -->
		<xsl:value-of select="$panel_id"/>
	</xsl:template><!--}}}-->

 	<xsl:template match="panel" mode="obj_metadata"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		<xsl:variable name="obj_name">
			<xsl:choose>
				<xsl:when test="@obj">
					<xsl:value-of select="@obj"/>
				</xsl:when>
				<xsl:when test="parent::*[name()='obj']">
					<xsl:value-of select="parent::*[name()='obj']/@name"/>
				</xsl:when>
				<xsl:otherwise>
					<!-- closest ancestor -->
					<xsl:value-of select="ancestor-or-self::*[name()='obj'][1]/@name"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<!-- <xsl:message>obj_local_name: <xsl:value-of select="$obj_name"/></xsl:message> -->
		<xsl:sequence select="//*:metadata/obj[@name=$obj_name][1]"/>
		<!-- <xsl:message>obj: <xsl:copy-of select="//*:metadata/obj[@name=$obj_name]"/></xsl:message> -->
	</xsl:template><!--}}}-->

</xsl:stylesheet>

