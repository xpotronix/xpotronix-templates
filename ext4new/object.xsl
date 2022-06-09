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
	xmlns:ext4="http://xpotronix.com/templates/ext4/"
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/">

<!-- configuracion del objeto -->

	<xsl:template match="obj" mode="config"><!--{{{-->

	<xsl:variable name="obj" select="."/>
	<xsl:variable name="obj_name" select="@name"/>

    <xsl:variable name="session" select="//*:session"/>
    <xsl:variable name="metadata" select="//*:metadata"/>
	<xsl:variable name="model" select="//*:model"/>

	<xsl:variable name="roles" select="$session/roles"/>
	<xsl:variable name="role" select="$session/roles/role/@value"/>

	<xsl:variable name="module_name" select="$session/feat/module"/>

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

	<xsl:variable name="obj_buttons" select="$default_template_content//table[@name=$obj_name]/*:button"/>
	<xsl:variable name="obj_functions" select="$default_template_content//table[@name=$obj_name]/*:function"/>

	<!-- <xsl:message>obj_buttons: <xsl:copy-of select="$obj_buttons"/></xsl:message>
	<xsl:message>obj_functions: <xsl:copy-of select="$obj_functions"/></xsl:message>-->

		/* <xsl:value-of select="@name"/> xpObj */

	var obj_defaults = {

		class_name:'<xsl:value-of select="@name"/>'
		/* ,el:'contentEl_<xsl:value-of select="@name"/>' */
		,translate:'<xsl:apply-templates select="." mode="translate"/>'
		,parent_name:'<xsl:value-of select="$model//obj[@name=$obj_name]/../@name"/>'
		,acl:{<xsl:apply-templates select="acl"/>}
		,role:'<xsl:value-of select="$role"/>'
		,extra_param:{<xsl:apply-templates select="." mode="extra_param"/>}
		,store:'<xsl:value-of select="concat($module_name,'.',@name)"/>'
		,feat:<xsl:apply-templates select="." mode="feats"/>
		,inspect:<xsl:apply-templates select="." mode="inspect"/>

		<xsl:apply-templates select="$processes" mode="menu">
			<xsl:with-param name="obj" select="." tunnel="yes"/>
		</xsl:apply-templates> 

		};

		<!-- obj prop override -->

		var obj_functions;
		<xsl:if test="$obj_functions">
			obj_functions = { 
		<xsl:apply-templates select="$obj_functions" mode="define">
			<xsl:with-param name="obj" select="." tunnel="yes"/>
			</xsl:apply-templates>};

	</xsl:if>

		var obj_buttons;
		<xsl:if test="$obj_functions">
			obj_buttons = { buttons: {
		<xsl:apply-templates select="$obj_buttons" mode="define">
			<xsl:with-param name="obj" select="." tunnel="yes"/>
			</xsl:apply-templates>}};

	</xsl:if>

		var config = _.merge( obj_defaults, obj_functions, obj_buttons );

		App.obj.add( Ext.create( 'Ux.xpotronix.xpObj', config ));

	</xsl:template><!--}}}-->

	<!-- carga todos los inspects del objeto -->

	<xsl:template match="obj" mode="inspect">[
		<xsl:for-each select="$model//obj[@name=current()/@name]/panel[@display='inspect']">'<xsl:apply-templates select="." mode="get_panel_id"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>]
	</xsl:template>

	<xsl:template match="obj" mode="extra_param"><!--{{{-->
		<xsl:variable name="obj_name" select="@name"/>
		<xsl:for-each select="$session/var/e/*[name()=$obj_name or name()='_']/*">
			'e[<xsl:value-of select="$obj_name"/>][<xsl:value-of select="name()"/>]':'<xsl:value-of select="text()"/>'<xsl:if test="position()!=last()">,</xsl:if>			
		</xsl:for-each>
	</xsl:template><!--}}}-->

	<!-- templates auxiliares -->

	<xsl:template match="*:function" mode="define"><!--{{{-->

		<xsl:variable name="code">
			<xsl:choose>
				<xsl:when test="@include">
					<xsl:value-of select="$default_template_content//*:ui/*:function[@name=current()/@include]/text()"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="text()"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:value-of select="@name|@include"/>:<xsl:copy-of select="$code"/><xsl:if test="position()!=last()">, </xsl:if>

	</xsl:template><!--}}}-->

	<xsl:template match="*:button"><!--{{{-->

		<xsl:variable name="code">
			<xsl:choose>
				<xsl:when test="@include">
					<xsl:value-of select="$default_template_content//*:ui/*:button[@name=current()/@include]/text()"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="text()"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:value-of select="@name|@include"/>: "<xsl:copy-of select="$code"/>"<xsl:if test="position()!=last()">, </xsl:if>

	</xsl:template><!--}}}-->

	<xsl:template match="processes" mode="menu"><!--{{{-->

		<xsl:if test="count(process)">
		,processes_menu:[<xsl:apply-templates select="process" mode="item"/>]
		</xsl:if>

	</xsl:template><!--}}}-->

	<xsl:template match="process" mode="item"><!--{{{-->

		<xsl:param name="obj" tunnel="yes"/>
		<xsl:variable name="obj_name" select="$obj/@name"/>

		{ text:'<xsl:apply-templates select="." mode="translate"/>', 
			value:'<xsl:value-of select="@name"/>' 
			<xsl:if test="param">
			,param:{<xsl:apply-templates select="." mode="param"/>}
		</xsl:if>

		<xsl:variable name="process" 
			select=".|$default_template_content/*:processes/table[@name=$obj_name]//process[@name=current()/@name]"/>

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

