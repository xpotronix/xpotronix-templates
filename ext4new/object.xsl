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

<!-- configuracion del objeto -->

	<xsl:template match="obj" mode="config"><!--{{{-->

	<xsl:variable name="obj" select="."/>
	<xsl:variable name="obj_name" select="@name"/>
	<xsl:variable name="session" select="//*:session"/>
	<xsl:variable name="role" select="$session/roles/role/@value"/>

	/* <xsl:value-of select="@name"/> xpObj */

	App.obj.add( Ext.create( 'Ux.xpotronix.xpObj', {

		class_name:'<xsl:value-of select="@name"/>'
		/* ,el:'contentEl_<xsl:value-of select="@name"/>' */
		,translate:'<xsl:apply-templates select="." mode="translate"/>'
		,parent_name:'<xsl:value-of select="//*:model//obj[@name=$obj_name]/../@name"/>'
		,acl:{<xsl:apply-templates select="acl"/>}
		,role:'<xsl:value-of select="$role"/>'
		,extra_param:{<xsl:apply-templates select="." mode="extra_param"/>}
		,store:'<xsl:value-of select="@name"/>'
		,feat:<xsl:apply-templates select="." mode="feats"/>
		,inspect:<xsl:apply-templates select="." mode="inspect"/>
		<xsl:if test="count(processes/process[(not(@display) or @display!='hide') and acl/@action='permit' and acl/@role=$role])">

		,processes_menu:<xsl:apply-templates select="processes">
				<xsl:with-param name="obj" select="." tunnel="yes"/>
				</xsl:apply-templates>
		</xsl:if>
	}));

	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="inspect">[<xsl:for-each select="//*:model//obj[@name=current()/@name]/panel[@display='inspect']">'<xsl:apply-templates select="." mode="get_panel_id"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>]</xsl:template>


	<xsl:template match="obj" mode="extra_param"><!--{{{-->
		<xsl:variable name="obj_name" select="@name"/>
		<xsl:for-each select="//*:session/var/e/*[name()=$obj_name or name()='_']/*">
			'e[<xsl:value-of select="$obj_name"/>][<xsl:value-of select="name()"/>]':'<xsl:value-of select="text()"/>'<xsl:if test="position()!=last()">,</xsl:if>			
		</xsl:for-each>
	</xsl:template><!--}}}-->

<!-- templates auxiliares -->

	<xsl:template match="processes"><!--{{{-->
		<xsl:variable name="role" select="//*:session/roles/role/@value"/>
                [<xsl:apply-templates select="process[(not(@display) or @display!='hide') and acl/@action='permit' and acl/@role=$role]"/>]
	</xsl:template><!--}}}-->

	<xsl:template match="process"><!--{{{-->
		{ 
			text:'<xsl:apply-templates select="." mode="translate"/>'
			<xsl:if test="@icon">,icon:'<xsl:value-of select="@icon"/>'</xsl:if>
			<xsl:if test="@cls">,cls:'<xsl:value-of select="@cls"/>'</xsl:if>
			,value:'<xsl:value-of select="@name"/>'

		<xsl:if test="param">
			,param:{<xsl:apply-templates select="." mode="param"/>}
		</xsl:if>

		<xsl:if test="dialog/*"><xsl:apply-templates select="dialog"/></xsl:if>

		<xsl:if test="script"><xsl:apply-templates select="script"/></xsl:if>

		}<xsl:if test="position()!=last()">, </xsl:if>


	</xsl:template><!--}}}-->

	<xsl:template match="script"><!--{{{-->
			,script:{ fn:function( selections, command, item ) {
			<xsl:value-of select="."/>
		}<xsl:if test="@scope">, scope:<xsl:value-of select="@scope"/></xsl:if> }

	</xsl:template>
	
	<xsl:template match="dialog">
		,dialog: { fn: function( selections, command, item ) {

			var obj = App.obj.get('<xsl:value-of select="../../@name"/>');
			var panel_id = '<xsl:apply-templates select="*[1]" mode="get_panel_id"/>';

			var panel = obj.panels.item( panel_id );

			if ( ! panel ) {

				obj.panels.addAll([<xsl:apply-templates select="*"/>]);
				panel = obj.panels.item( panel_id );
			}

			panel.show(); 

		}<xsl:if test="@scope">, scope:<xsl:value-of select="@scope"/></xsl:if> }

	</xsl:template><!--}}}-->

	<xsl:template match="process" mode="param"><!--{{{-->
		<xsl:for-each select="param/*">
<xsl:value-of select="name()"/>:'<xsl:value-of select="text()"/>'<xsl:if test="position()!=last()">, </xsl:if>
		</xsl:for-each>
	</xsl:template><!--}}}-->

	<xsl:template match="acl"><!--{{{-->
		<xsl:for-each select="*">
			<xsl:variable name="acl_name">
				<xsl:choose>
					<xsl:when test="name()='delete'"><xsl:value-of select="'del'"/></xsl:when>
					<xsl:otherwise><xsl:value-of select="name()"/></xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:variable name="acl_value">
				<xsl:choose>
					<xsl:when test="text()='1'">true</xsl:when>
					<xsl:otherwise>false</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>
			<xsl:value-of select="$acl_name"/>:<xsl:value-of select="$acl_value"/><xsl:if test="position()!=last()">, </xsl:if>
		</xsl:for-each>
	</xsl:template><!--}}}-->

</xsl:stylesheet>

