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


	<xsl:template match="obj" mode="model">
		<xsl:variable name="obj_name" select="@name"/>

		Ext.define( '<xsl:value-of select="concat($application_name,'.model.',$obj_name)"/>', {
			extend: 'Ext.data.Model'
			,fields: [
				{name: '__ID__', mapping: '@ID', type: 'string'},
				{name: '__new__', mapping: '@new', type: 'int'},
				{name: '__acl__', mapping: '@acl', type: 'string'},
				<xsl:apply-templates select="//*:metadata//obj[@name=$obj_name]/attr[not(@display) or @display='' or @display='hide' or @display='disabled']" mode="record">
					<xsl:with-param name="obj" select="." tunnel="yes"/>
				</xsl:apply-templates>
			]});

	</xsl:template>


	<xsl:template match="obj" mode="store"><!--{{{-->

		<xsl:variable name="obj_name" select="@name"/>

		Ext.define('<xsl:value-of select="concat($application_name,'.store.',$obj_name)"/>', Ext.apply({ 

			extend: 'Ux.xpotronix.xpStore'
			,model: '<xsl:value-of select="concat($application_name,'.model.',$obj_name)"/>'
			,storeId: '<xsl:value-of select="@name"/>'
			,class_name: '<xsl:value-of select="@name"/>'
			,module: '<xsl:value-of select="//*:session/feat/module"/>'
			,feat: <xsl:apply-templates select="." mode="feats"/>
			,acl: {<xsl:apply-templates select="//*:metadata/obj[@name=$obj_name]/acl"/>}
			,pageSize: <xsl:value-of select="xp:get_feat(.,'page_rows')"/>
			,remoteSort: <xsl:value-of select="xp:get_feat(.,'remote_sort')"/>}
			,{<xsl:value-of select="config"/>}));

		/* Entry Helpers */
		<xsl:apply-templates select="queries/query/query" mode="store_eh"/>
		/* End Entry Helpers */

	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="primary_key">[<xsl:for-each select="primary_key/primary">'<xsl:value-of select="@name"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>]
	</xsl:template>

	<xsl:template match="ref"><!--{{{-->{ local: '<xsl:value-of select="@local"/>', remote: '<xsl:value-of select="@remote"/>', value: null }<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template><!--}}}-->

        <xsl:template match="query" mode="store_eh"><!--{{{-->

	<xsl:variable name="parent_obj_name" select="../../../@name"/>
	<xsl:variable name="obj_name" select="from"/>
	<xsl:variable name="eh_name" select="@name"/>

	<xsl:apply-templates select="." mode="model_eh"/>

	Ext.define('<xsl:value-of select="concat($application_name,'.store.',../from,'_',@name)"/>', {
		extend: 'Ux.xpotronix.xpStore'
		,storeId: '<xsl:value-of select="concat(../from,'_',@name)"/>'
		,model: '<xsl:value-of select="concat(../from,'_',@name)"/>'
		,class_name: '<xsl:value-of select="$obj_name"/>'
		,module: '<xsl:value-of select="//*:session/feat/module"/>'
		,primary_key: ['id'] 
		<!-- DEBUG: aca hago piruetas para obtener el nombre del atributo que posee este eh. Hay que cambiar a fk -->
		,foreign_key: [{local:'id',remote:'<xsl:value-of select="//*:metadata/obj[@name=$parent_obj_name]/attr[@eh=$eh_name]/@name"/>'}]
		,foreign_key_type: 'parent'
		,remoteSort: true 
		,pageSize: 20
		,passive: true
	    	,baseParams: Ext.apply({q:'<xsl:value-of select="$eh_name"/>','f[query_field]':'_label'},{<xsl:apply-templates select="../../.." mode="extra_param"/>})
        	});
        </xsl:template><!--}}}-->

	<xsl:template match="query" mode="model_eh">
		<xsl:variable name="obj_name" select="@name"/>

		Ext.define( '<xsl:value-of select="concat(../from,'_',@name)"/>', {
			extend: 'Ext.data.Model'
			,fields: ['id','_label'<xsl:for-each select="attr">,'<xsl:value-of select="@name"/>'</xsl:for-each>]});

	</xsl:template>

</xsl:stylesheet>

