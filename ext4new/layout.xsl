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
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/">

	<!-- layouts --> 

	<xsl:template match="*:model" mode="viewport"><!--{{{-->
		<xsl:param name="standalone" select="false()"/>

	<xsl:variable name="panels">
		<xsl:for-each select="//obj/panel[not(@display)]">
			<xsl:copy>
				<xsl:sequence select="@*"/>
				<xsl:attribute name="type" select="@type"/>
				<xsl:attribute name="region" select="@region"/>
				<xsl:attribute name="obj_name" select="../@name"/>
			</xsl:copy>
		</xsl:for-each>
	</xsl:variable>
	<!-- <xsl:message><xsl:sequence select="$panels"/></xsl:message> -->
	<xsl:variable name="obj_name" select="$panels/panel[1]/@obj_name"/>
	<!-- <xsl:message><xsl:value-of select="$obj_name"/></xsl:message> -->


        <xsl:variable name="menu_bar" select="xp:get_feat(//*:metadata/obj[1],'menu_bar')"/>
	<xsl:variable name="messages_panel" select="xp:get_feat(//*:metadata/obj[1],'messages_panel')"/>
       
	<xsl:variable name="top_margin">
		<xsl:choose>
       	 		<xsl:when test="$menu_bar='true'">
				<xsl:text>32</xsl:text>
        		</xsl:when>
			<xsl:otherwise>
				<xsl:text>0</xsl:text>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

	<xsl:variable name="north_panels">
		<xsl:sequence select="$panels/panel[(@obj_name=$obj_name and @region='') or (@obj_name!=$obj_name and @region='north')]"/>
	</xsl:variable>

	<xsl:variable name="center_panels">
		<xsl:sequence select="$panels/panel[(@obj_name!=$obj_name and @region='') or (@obj_name!=$obj_name and @region='center')]"/>
	</xsl:variable>

	<xsl:variable name="region">
		<xsl:choose>
			<xsl:when test="count($center_panels/*)">north</xsl:when>
			<xsl:otherwise>center</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

	<xsl:variable name="ui_class">
		<xsl:choose>
			<xsl:when test="$standalone">Viewport</xsl:when>
			<xsl:otherwise>Panel</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

	Ext.create( 'Ext.<xsl:value-of select="$ui_class"/>', {

		stateful: true,
		layout: 'border',
		bodyStyle: {border:0},

		items:[

		<xsl:if test="$menu_bar='true'">
		{  
			id: 'xpApp_menu',
			xtype: 'panel',
			layout: 'fit', 
			width: '100%', 
			region: '<xsl:value-of select="$region"/>', 
			tbar: App.menu },

		</xsl:if>

		{ 
			/*id: 'viewport_north_tabs',*/
			xtype: 'tabpanel',
			stateful: true,
			titleCollapse: false, 
			height: 200, 
			margins: '<xsl:value-of select="$top_margin"/> 0 0 0', 
			split: true, 
			region:'<xsl:value-of select="$region"/>', 
			layoutOnTabChange: true, 
			/* collapsible: true, 
			collapseMode:'mini',*/
			activeTab:0,
                  	items: [ <xsl:apply-templates select="$panels//*[@obj_name=$obj_name and @region='']|$panels//*[@region=$region]" mode="panel_list"/> ]
                }

		<xsl:if test="count($panels//*[@obj_name!=$obj_name])">
                ,{ region:'center', 
			/*id: 'viewport_center_tabs',*/
			xtype: 'tabpanel',
			stateful: true,
			layoutOnTabChange: true, 
			collapsible: false, 
			activeTab:0,
                  	items: [<xsl:apply-templates select="$panels//*[@obj_name!=$obj_name and @region='']|$panels//*[@region='center']" mode="panel_list"/>] 
                }</xsl:if>
		<xsl:if test="$messages_panel='true'">
		,{
			/*id: '__messagesPanel',*/
			stateful: true,
			region:'south',
			layout: 'fit',
			split:true,
			height: 100,
			collapsible: true,
			collapsed: true,
			title:'Mensajes',
			margins:'0 0 0 0'

                }</xsl:if>
		]
        });

	</xsl:template><!--}}}-->

	<xsl:template match="layout"><!--{{{-->

		<xsl:param name="standalone" select="false()"/>
		<xsl:variable name="obj_name" select="../@name"/>

		<xsl:variable name="ui_class">
			<xsl:choose>
				<xsl:when test="$standalone">Viewport</xsl:when>
				<xsl:otherwise>Panel</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

	Ext.create( 'Ext.<xsl:value-of select="$ui_class"/>', {

		stateful: true,
		layout: 'border',
		bodyStyle: {border:0},

		items:[
		<xsl:apply-templates select="*">
			<xsl:with-param name="obj_name" select="$obj_name"/>
		</xsl:apply-templates>
		]});

	</xsl:template><!--}}}-->

	<xsl:template match="panel" mode="panel_list"><!--{{{-->

		<!-- <xsl:message>panel_list: <xsl:sequence select="."/></xsl:message> -->
		<xsl:variable name="panel_id">
	               <xsl:choose>
        	               <xsl:when test="@id"><xsl:value-of select="@id"/></xsl:when>
                	       <xsl:otherwise><xsl:value-of select="concat(@obj_name,'_',@type)"/></xsl:otherwise>
	               </xsl:choose>
		</xsl:variable>
		{ xtype: '<xsl:value-of select="$panel_id"/>'}<xsl:if test="position()!=last()">,</xsl:if>	
	</xsl:template><!--}}}-->

</xsl:stylesheet>

