<?xml version="1.0" encoding="utf-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<xsl:stylesheet version="2.0" 
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/"
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/">

<!-- stores --> 

	<xsl:template match="*:model" mode="stores"><!--{{{-->

		<xsl:apply-templates select=".//obj" mode="store"/>

	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="model"><!--{{{-->

		<xsl:variable name="obj_name" select="@name"/>
		<xsl:variable name="module_name" select="$session/feat/module"/>
		<xsl:variable name="class_name" select="concat($application_name,'.model.',$module_name,'.',$obj_name)"/>
		<xsl:variable name="base_path" select="$session/feat/base_path"/>
		<xsl:variable name="class_path" select="concat($base_path,'/',replace($class_name,'\.','/'),'.js')"/>

		<xsl:variable name="code">
		/* path: <xsl:value-of select="$class_path"/> */
		Ext.ClassManager.isCreated( '<xsl:value-of select="$class_name"/>' ) || Ext.define( '<xsl:value-of select="$class_name"/>', {
			extend: 'Ext.data.Model'
			,class_name: '<xsl:value-of select="@name"/>'
			,module: '<xsl:value-of select="$module_name"/>'
			,proxy: { type: 'xpProxy', class_name: '<xsl:value-of select="@name"/>', module: '<xsl:value-of select="$module_name"/>' }
			,associations:[<xsl:apply-templates select="." mode="associations"/>]

			,fields: [
				{name: '__ID__', mapping: '@ID', type: 'string'},
				{name: '__new__', mapping: '@new', type: 'int'},
				{name: '__acl__', mapping: '@acl', type: 'string'},
				<xsl:apply-templates select="$metadata//obj[@name=$obj_name]/attr[not(@display) or @display='' or @display='hide' or @display='disabled']" mode="record">
					<xsl:with-param name="module" select="$module_name" tunnel="yes"/>
					<xsl:with-param name="obj" select="." tunnel="yes"/>
				</xsl:apply-templates>
			]});
		</xsl:variable>

		<xsl:call-template name="output">
			<xsl:with-param name="class_path" select="$class_path"/>
			<xsl:with-param name="code" select="$code"/>
		</xsl:call-template>

	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="store"><!--{{{-->

		<xsl:variable name="obj_name" select="@name"/>
		<xsl:variable name="module_name" select="$session/feat/module"/>
		<xsl:variable name="class_name" select="concat($application_name,'.store.',$module_name,'.',$obj_name)"/>
		<xsl:variable name="base_path" select="$session/feat/base_path"/>
		<xsl:variable name="class_path" select="concat($base_path,'/',replace($class_name,'\.','/'),'.js')"/>

		<xsl:variable name="config" 
			select="config|document($default_template_file)/application/table[@name=$obj_name]/config/text()"/>

		<!-- <xsl:message>$config: <xsl:copy-of select="$config"/></xsl:message> -->



		<xsl:variable name="code">
		/* path: <xsl:value-of select="$class_path"/> */
		Ext.ClassManager.isCreated( '<xsl:value-of select="$class_name"/>' ) || Ext.define('<xsl:value-of select="$class_name"/>', Ext.apply({ 

			extend: 'Ux.xpotronix.xpStore'
			,model: '<xsl:value-of select="concat($application_name,'.model.',$module_name,'.',$obj_name)"/>'
			,alias: '<xsl:value-of select="concat($module_name,'.',@name)"/>'
			,class_name: '<xsl:value-of select="@name"/>'
			,module: '<xsl:value-of select="$module_name"/>'
			,feat: <xsl:apply-templates select="." mode="feats"/>
			,acl: {<xsl:apply-templates select="$metadata/obj[@name=$obj_name]/acl"/>}

			,primary_key: <xsl:apply-templates select="." mode="primary_key"/>
			<xsl:if test="../name()='obj'">
			,parent_store: '<xsl:value-of select="concat($module_name,'.',../@name)"/>'
			<xsl:if test="foreign_key">
			,foreign_key: <xsl:apply-templates select="foreign_key"/>
			</xsl:if>
			</xsl:if>

			,pageSize: <xsl:value-of select="xp:get_feat(.,'page_rows')"/>
			,remoteSort: <xsl:value-of select="xp:get_feat(.,'remote_sort')"/>}
			,{<xsl:value-of select="$config"/>}));
		</xsl:variable>

		<xsl:call-template name="output">
			<xsl:with-param name="class_path" select="$class_path"/>
			<xsl:with-param name="code" select="$code"/>
		</xsl:call-template>

	</xsl:template><!--}}}-->

        <xsl:template match="query" mode="store"><!--{{{-->

	<xsl:variable name="parent_obj_name" select="../../../@name"/>
	<xsl:variable name="obj_name">
		<xsl:choose>
			<xsl:when test="contains(from,'.')">
				<xsl:value-of select="substring-after(from,'.')"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="from"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="eh_name" select="@name"/>
	<xsl:variable name="module_name" select="$session/feat/module"/>
	<xsl:variable name="class_name" select="concat($application_name,'.store.',$module_name,'.',../from,'_',@name)"/>
	<xsl:variable name="base_path" select="$session/feat/base_path"/>
	<xsl:variable name="class_path" select="concat($base_path,'/',replace($class_name,'\.','/'),'.js')"/>

	<xsl:variable name="code">
	/* path: <xsl:value-of select="$class_path"/> */
	Ext.ClassManager.isCreated( '<xsl:value-of select="$class_name"/>' ) || Ext.define('<xsl:value-of select="$class_name"/>', {
		extend:'Ux.xpotronix.xpStore'
		,alias:'<xsl:value-of select="concat($module_name,'.',../from,'_',@name)"/>'
		,model:'<xsl:value-of select="concat($application_name,'.model.',$module_name,'.',../from,'_',@name)"/>'
		,class_name:'<xsl:value-of select="$obj_name"/>'
		,module:'<xsl:value-of select="$module_name"/>'
		,parent_store:'<xsl:value-of select="concat($module_name,'.',$parent_obj_name)"/>'
		,primary_key:['id'] 
		<!-- DEBUG: aca hago piruetas para obtener el nombre del atributo que posee este eh. Hay que cambiar a fk -->
		,foreign_key:{type:'eh',refs: [{local:'id',remote:'<xsl:value-of select="$metadata/obj[@name=$parent_obj_name]/attr[@eh=$eh_name]/@name"/>'}] }
		,remoteSort:true 
		,pageSize:20
		,passive:true
        	});
	</xsl:variable>

		<xsl:call-template name="output">
			<xsl:with-param name="class_path" select="$class_path"/>
			<xsl:with-param name="code" select="$code"/>
		</xsl:call-template>

        </xsl:template><!--}}}-->

	<xsl:template match="query" mode="model"><!--{{{-->

		<xsl:variable name="parent_obj_name" select="../../../@name"/>
		<xsl:variable name="obj_name" select="from"/>
		<xsl:variable name="eh_name" select="@name"/>
		<xsl:variable name="module_name" select="$session/feat/module"/>
		<xsl:variable name="class_name" select="concat($application_name,'.model.',$module_name,'.',../from,'_',@name)"/>
		<xsl:variable name="base_path" select="$session/feat/base_path"/>
		<xsl:variable name="class_path" select="concat($base_path,'/',replace($class_name,'\.','/'),'.js')"/>

		<xsl:variable name="code">	
		/* path: <xsl:value-of select="$class_path"/> */
		Ext.ClassManager.isCreated( '<xsl:value-of select="$class_name"/>' ) || Ext.define( '<xsl:value-of select="$class_name"/>', {
		extend: 'Ext.data.Model'
		,class_name: '<xsl:value-of select="@name"/>'
		,module: '<xsl:value-of select="$module_name"/>'
		,proxy: { type: 'xpProxy', class_name: '<xsl:value-of select="$obj_name"/>', module: '<xsl:value-of select="$module_name"/>', 
		extraParams: Ext.apply({q:'<xsl:value-of select="$eh_name"/>',},{<xsl:apply-templates select="../../.." mode="extra_param"/>}) 
		}
		,fields: ['id','_label'<xsl:for-each select="attr">,'<xsl:value-of select="@name"/>'</xsl:for-each>]});
		</xsl:variable>

		<xsl:call-template name="output">
			<xsl:with-param name="class_path" select="$class_path"/>
			<xsl:with-param name="code" select="$code"/>
		</xsl:call-template>

	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="associations"><!--{{{-->

		<!-- <xsl:message>en associations</xsl:message> -->

		<xsl:variable name="obj_name" select="@name"/>

		<xsl:variable name="assocs">
		<xsl:variable name="module_name" select="$session/feat/module"/>

		<xsl:if test="foreign_key">

			<xsl:variable name="parent"><xsl:if test="../name()='obj'"><xsl:value-of select="../@name"/></xsl:if></xsl:variable>

			<xsl:variable name="assoc_type">
				<xsl:choose>
					<xsl:when test="foreign_key/@type='parent'">hasOne</xsl:when>
					<xsl:otherwise>belongsTo</xsl:otherwise>
				</xsl:choose>
			</xsl:variable>

			<xsl:for-each select="foreign_key/ref">
			<assoc>

				
			{	name:'<xsl:value-of select="$parent"/>'
				,model:'<xsl:value-of select="concat($application_name,'.model.',$module_name,'.',$parent)"/>'
				,type:'<xsl:value-of select="$assoc_type"/>'
				/* ,autoload:true */
				,primaryKey:'<xsl:value-of select="@local"/>'
				,foreignKey:'<xsl:value-of select="@remote"/>'
				/*,associationKey:'c_><xsl:value-of select="$obj_name"/>' */

			}</assoc></xsl:for-each>

		</xsl:if>

		<xsl:if test="count(obj/foreign_key)">

			<xsl:variable name="parent" select="@name"/>

			<xsl:variable name="assoc_type">hasMany</xsl:variable>

			<xsl:for-each select="obj/foreign_key/ref">

			<xsl:variable name="child" select="../../@name"/>
			<assoc>
			{	name:'<xsl:value-of select="$child"/>'
				,model:'<xsl:value-of select="concat($application_name,'.model.',$module_name,'.',$child)"/>'
				,type:'<xsl:value-of select="$assoc_type"/>'
				/* ,autoload: true */
				,primaryKey:'<xsl:value-of select="@remote"/>'
				,foreignKey:'<xsl:value-of select="@local"/>'

			}</assoc></xsl:for-each>

		</xsl:if>
		</xsl:variable>


		<xsl:for-each select="$assocs/*"><xsl:value-of select="text()"/><xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>

	</xsl:template><!--}}}-->

	<xsl:template match="foreign_key"><!--{{{-->{type:'<xsl:value-of select="@type"/>',<xsl:if test="@passive">passive: <xsl:value-of select="@passive"/>,</xsl:if>refs:[<xsl:apply-templates select="ref"/>]} 
	</xsl:template><!--}}}-->

	<xsl:template match="ref"><!--{{{-->{local:'<xsl:value-of select="@local"/>',remote:'<xsl:value-of select="@remote"/>'}<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="primary_key">[<xsl:for-each select="primary_key/primary">'<xsl:value-of select="@name"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>]
	</xsl:template>

</xsl:stylesheet>

