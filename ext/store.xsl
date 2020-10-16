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

	<xsl:template match="xpotronix:model" mode="stores"><!--{{{-->
		var tmp;
		<xsl:apply-templates select=".//obj" mode="store"/>
	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="store"><!--{{{-->
		<xsl:variable name="obj_name" select="@name"/>

		App.store.add( tmp = new Ext.ux.xpotronix.xpStore( Ext.apply( 
			{ 
			storeId: '<xsl:value-of select="@name"/>'
			,class_name: '<xsl:value-of select="@name"/>'
			,module: '<xsl:value-of select="//xpotronix:session/feat/module"/>'
			,primary_key: <xsl:apply-templates select="." mode="primary_key"/>
			<xsl:if test="../name()='obj'">
			,parent_store: App.store.item( '<xsl:value-of select="../@name"/>' )
			</xsl:if>
			,feat: <xsl:apply-templates select="." mode="feats"/>
			,acl: {<xsl:apply-templates select="$metadata/obj[@name=$obj_name]/acl"/>}

			<xsl:if test="foreign_key">
			,foreign_key: [<xsl:apply-templates select="foreign_key/ref"/>]
			<xsl:if test="foreign_key/@type">
			,foreign_key_type: '<xsl:value-of select="foreign_key/@type"/>'</xsl:if>
			<xsl:if test="foreign_key/@passive">
			,passive: <xsl:value-of select="foreign_key/@passive"/></xsl:if>
			</xsl:if>  


			,pageSize: <xsl:value-of select="xp:get_feat(.,'page_rows')"/>
			,remoteSort: <xsl:value-of select="xp:get_feat(.,'remote_sort')"/>
		 	,rs:  Ext.data.Record.create([
				{name: '__ID__', mapping: '@ID', type: 'string'},
				{name: '__new__', mapping: '@new', type: 'int'},
				{name: '__acl__', mapping: '@acl', type: 'string'},
				<xsl:apply-templates select="$metadata//obj[@name=$obj_name]/attr[not(@display) or @display='' or @display='hide' or @display='disabled']" mode="record">
					<xsl:with-param name="obj" select="." tunnel="yes"/>
				</xsl:apply-templates>
			])},{<xsl:value-of select="config"/>})
		));

		<xsl:if test="../name()='obj'">
		App.store.item( '<xsl:value-of select="../@name"/>' ).add_child( tmp );
		</xsl:if>
		/* Entry Helpers */
		<xsl:apply-templates select="queries/query/query" mode="Store"/>
		/* End Entry Helpers */
	</xsl:template><!--}}}-->

	<xsl:template match="obj" mode="primary_key">[<xsl:for-each select="primary_key/primary">'<xsl:value-of select="@name"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>]
	</xsl:template>

	<xsl:template match="ref"><!--{{{-->{ local: '<xsl:value-of select="@local"/>', remote: '<xsl:value-of select="@remote"/>', value: null }<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template><!--}}}-->

        <xsl:template match="query" mode="Store"><!--{{{-->

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
	App.store.add( new Ext.ux.xpotronix.xpStore({
		storeId: '<xsl:value-of select="concat(../from,'_',@name)"/>'
		,class_name: '<xsl:value-of select="$obj_name"/>'
		,module: '<xsl:value-of select="//xpotronix:session/feat/module"/>'
		,primary_key: ['id'] 
		,parent_store: App.store.item( '<xsl:value-of select="$parent_obj_name"/>' )
		<!-- DEBUG: aca hago piruetas para obtener el nombre del atributo que posee este eh. Hay que cambiar a fk -->
		,foreign_key: [{local:'id',remote:'<xsl:value-of select="$metadata/obj[@name=$parent_obj_name]/attr[@eh=$eh_name]/@name"/>'}]
		,foreign_key_type: 'parent'
		,remoteSort: true 
		,pageSize: 20
	 	,rs:  Ext.data.Record.create(<xsl:apply-templates select="." mode="ComboRecord"/>)
		,passive: true
	    	,baseParams: Ext.apply({q:'<xsl:value-of select="$eh_name"/>','f[query_field]':'_label'},{<xsl:apply-templates select="../../.." mode="extra_param"/>})
        	}));
        </xsl:template><!--}}}-->

        <xsl:template match="query" mode="ComboRecord">['id','_label'<xsl:for-each select="attr">,'<xsl:value-of select="@name"/>'</xsl:for-each>]</xsl:template><!--}}}-->

</xsl:stylesheet>

