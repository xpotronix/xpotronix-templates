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
	<xsl:variable name="roles" select="$session/roles"/>
	<xsl:variable name="role" select="$session/roles/role/@value"/>

	<xsl:variable name="processes">
		<xsl:element name="processes" namespace="">
			<xsl:for-each select="processes/process[(not(@display) or @display!='hide') and acl/@action='permit']">
				<xsl:variable name="role" select="acl/@role"/>
				<xsl:if test="acl/@role='*' or count($roles/role[@value=$role])">
					<xsl:sequence select="."/>
				</xsl:if>
			</xsl:for-each>
		</xsl:element>
	</xsl:variable>

	/* <xsl:value-of select="@name"/> xpObj */

	App.obj.add( new Ext.ux.xpotronix.xpObj({

		class_name:'<xsl:value-of select="@name"/>'
		/* ,el:'contentEl_<xsl:value-of select="@name"/>' */
		,translate:'<xsl:apply-templates select="." mode="translate"/>'
		,parent_name:'<xsl:value-of select="//*:model//obj[@name=$obj_name]/../@name"/>'
		,acl:{<xsl:apply-templates select="acl"/>}
		,role:'<xsl:value-of select="$role"/>'
		,extra_param:{<xsl:apply-templates select="." mode="extra_param"/>}
		,store:App.store.item('<xsl:value-of select="@name"/>')
		,feat:<xsl:apply-templates select="." mode="feats"/>
		<xsl:apply-templates select="$processes" mode="menu">
			<xsl:with-param name="obj" select="." tunnel="yes"/>
		</xsl:apply-templates>
	}));

	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="panels"><!--{{{-->

	<!-- sobre $metadata/obj -->

	<xsl:variable name="obj" select="."/>
	<xsl:variable name="obj_name" select="@name"/>

	<xsl:if test="//*:model//obj[@name=$obj_name]/panel">
	/* panels para <xsl:value-of select="@name"/> */
	App.obj.item('<xsl:value-of select="@name"/>').panels.addAll([
	<xsl:apply-templates select="//*:model//obj[@name=$obj_name]/panel">
		<xsl:with-param name="obj" select="." tunnel="yes"/>
	</xsl:apply-templates>]);
	</xsl:if>

	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="extra_param"><!--{{{-->
		<xsl:variable name="obj_name" select="@name"/>
		<xsl:for-each select="//xpotronix:session/var/e/*[name()=$obj_name or name()='_']/*">
			'e[<xsl:value-of select="$obj_name"/>][<xsl:value-of select="name()"/>]':'<xsl:value-of select="text()"/>'<xsl:if test="position()!=last()">,</xsl:if>
		</xsl:for-each>
	</xsl:template><!--}}}-->

<!-- templates auxiliares -->

	<xsl:template match="processes" mode="menu"><!--{{{-->

		<xsl:if test="count(process)">
		,processes_menu:[<xsl:apply-templates select="process" mode="item"/>]
		</xsl:if>

	</xsl:template><!--}}}-->

	<xsl:template match="process" mode="item"><!--{{{-->

		<xsl:param name="obj" tunnel="yes"/>
		<xsl:variable name="obj_name" select="$obj/@name"/>

		<!-- abre archivos de template -->
		<xsl:variable name="processes_file" select="concat($session/feat/base_path,'/templates/ext/processes.xml')"/>
		<!-- <xsl:message>include: <xsl:value-of select="$obj_name"/>/<xsl:value-of select="@include"/> </xsl:message> -->

		{ text:'<xsl:apply-templates select="." mode="translate"/>', 
			value:'<xsl:value-of select="@name"/>' 
			<xsl:if test="param">
			,param:{<xsl:apply-templates select="." mode="param"/>}
		</xsl:if>

		<xsl:variable name="process" 
			select="document($processes_file)/application/table[@name=$obj_name]//process[@name=current()/@name]"/>

		<xsl:choose>
			<xsl:when test="count($process)">
				<xsl:if test="$process/dialog"><xsl:apply-templates select="$process/dialog"/></xsl:if>
				<xsl:if test="$process/script"><xsl:apply-templates select="$process/script"/></xsl:if>
			</xsl:when>
			<xsl:otherwise>
				<xsl:message>no encontre procesos para documento para <xsl:value-of select="$obj_name"/>/<xsl:value-of select="@name"/></xsl:message>
			</xsl:otherwise>
		</xsl:choose>

		}<xsl:if test="position()!=last()">, </xsl:if>


	</xsl:template><!--}}}-->

	<xsl:template match="script"><!--{{{-->
			,script:{ fn:function( selections, command, item ) {
			<xsl:value-of select="."/>
		}<xsl:if test="@scope">, scope:<xsl:value-of select="@scope"/></xsl:if> }

	</xsl:template><!--}}}-->
	
	<xsl:template match="dialog"><!--{{{-->
		,dialog: { fn: function( selections, command, item ) {

			var obj = App.obj.item('<xsl:value-of select="../../@name"/>');
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

	<xsl:template match="obj" mode="GridFilters"><!--{{{-->

	/* <xsl:value-of select="@name"/> Plugis / Filters */

	obj.filters = new Ext.ux.grid.xpGridFilters({
		menuFilterText:'Buscar',
		paramPrefix:'s[<xsl:value-of select="@name"/>]',
		filters:[<xsl:apply-templates select="attr[not(@display) or @display='' or @display='hide' or @display='disabled']" mode="Filter"/>]
	});

	</xsl:template><!--}}}-->

</xsl:stylesheet>

