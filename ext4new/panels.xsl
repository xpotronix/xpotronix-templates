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

<!-- panel_config -->

	<xsl:template match="panel" mode="panel_config"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		<xsl:variable name="panel_id">
			<xsl:apply-templates select="." mode="get_panel_id"/>
		</xsl:variable>
		<!-- <xsl:message>obj: <xsl:copy-of select="$obj"/></xsl:message> -->
		<xsl:variable name="type_name" select="@type"/>
	{
		alias: 'widget.<xsl:value-of select="$panel_id"/>'
		,id:'<xsl:value-of select="$panel_id"/>'
		,class_name:'<xsl:value-of select="$obj/@name"/>'
		,obj:App.obj.get('<xsl:value-of select="$obj/@name"/>')
		,acl:App.obj.get('<xsl:value-of select="$obj/@name"/>').acl
		/* ,store:App.store.lookup('<xsl:value-of select="$obj/@name"/>') */
		,store:'<xsl:value-of select="$obj/@name"/>'
		,feat:<xsl:apply-templates select="$obj" mode="feats"/>
		,display_as:'<xsl:value-of select="@display"/>'
                ,title:'<xsl:apply-templates select="." mode="translate"/>'
	}</xsl:template><!--}}}-->

<!-- ui_overides -->

	<xsl:template match="panel[@type='xpGrid']" mode="panel_config_override"><!--{{{-->

		<xsl:param name="obj" tunnel="yes"/>

		<xsl:variable name="panel_id">
			<xsl:apply-templates select="." mode="get_panel_id"/>
		</xsl:variable>

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

		<xsl:variable name="panel_id">
			<xsl:apply-templates select="." mode="get_panel_id"/>
		</xsl:variable>

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

	<xsl:template match="panel[@type='xpPanel' or @type='Viewport' or @type='Window' or @type='Tab' or @type='xpThumbs' or @type='xpUploadPanel']" mode="panel_config_override"><!--{{{-->

		<xsl:param name="obj" tunnel="yes"/>

		<xsl:variable name="panel_id">
			<xsl:apply-templates select="." mode="get_panel_id"/>
		</xsl:variable>

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
 
	<xsl:template match="panel[@type='xpPanel']"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>

		<xsl:if test="position()-1">,</xsl:if>Ext.create( 'Ux.xpotronix.xpPanel', Ext.apply(
		<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,<xsl:apply-templates select="." mode="panel_config_override"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,{labelWidth:150,bodyStyle:{'background-color':'white','font-size':'13px',padding:'5px'},width:'100%',autoScroll:true}))

	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='xpForm']"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>

		<!-- <xsl:message>en panel/@xpForm, obj/@name:<xsl:value-of select="$obj/obj/@name"/>, panel/@id: <xsl:value-of select="@id"/></xsl:message> -->
		<xsl:if test="position()-1">,</xsl:if>Ext.create( 'Ux.xpotronix.xpForm', Ext.apply(
		<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,<xsl:apply-templates select="." mode="panel_config_override"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,{split:true,deferredRender:true,bodyStyle:'padding:5px',width:'100%',labelWidth:150,defaults:{width:400},defaultType:'textfield',autoScroll:true}))
	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='Form']"><!--{{{--> 

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>

		<xsl:if test="position()-1">,</xsl:if>Ext.create( 'Ext.form.FormPanel', Ext.apply(
		<xsl:apply-templates select="." mode="panel_config"/>
		,<xsl:apply-templates select="." mode="panel_config_override"/>
		,{split:true,deferredRender:true,bodyStyle:'padding:5px',width:'100%',labelWidth:70,defaults:{width:400},defaultType:'textfield',autoScroll:true}))

	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='xpGrid']"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>
		<xsl:variable name="panel_id">
			<xsl:apply-templates select="obj/obj" mode="get_panel_id"/>
		</xsl:variable>
		<!-- <xsl:message>en panel/@xpGrid, obj/@name:<xsl:value-of select="$obj/obj/@name"/>, panel/@id: <xsl:value-of select="@id"/></xsl:message>-->
		<xsl:if test="position()-1">,</xsl:if>Ext.define( '<xsl:value-of select="concat($application_name,'.view.',$obj/obj/@name,'_xpGrid')"/>', Ext.apply(
		{extend:'Ux.xpotronix.xpGrid',layout:'fit',deferredRender:true,split:true,syncSize:true,autoScroll:true}
		,<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,<xsl:apply-templates select="." mode="panel_config_override"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>));
		
	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='xpData']"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>

		<xsl:if test="position()-1">,</xsl:if>Ext.create( 'Ux.xpotronix.xpData', Ext.apply(
		<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,<xsl:apply-templates select="." mode="panel_config_override"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,{bodyStyle:'padding:5px 5px 0',defaults:{width:300},width:'100%',autoScroll:true}))

	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='xpThumbs']"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>

		<xsl:if test="position()-1">,</xsl:if>Ext.create( 'Ux.xpotronix.xpThumbs', Ext.apply(
		<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,<xsl:apply-templates select="." mode="panel_config_override"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,{deferredRender:true,layout:'fit',syncSize:true,autoScroll:true}))

	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='Tab']"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>

		<xsl:message>en Tab, obj/@name: <xsl:value-of select="$obj/obj/@name"/></xsl:message>
		<xsl:if test="position()-1">,</xsl:if>Ext.create( 'Ext.TabPanel', Ext.apply(
		<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,<xsl:apply-templates select="." mode="panel_config_override"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,{layoutOnTabChange:true,activeTab:0,defaults:{hideMode:'offsets'}}))
	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='Viewport']"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>

		<xsl:message>en Viewport, obj/@name: <xsl:value-of select="$obj/obj/@name"/></xsl:message>
		<xsl:if test="position()-1">,</xsl:if>Ext.create( 'Ext.Viewport', Ext.apply(
		<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,<xsl:apply-templates select="." mode="panel_config_override"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,{stateful:true,layout:'border',stateful: true,layout: 'border',deferredRender: true}))
	</xsl:template><!--}}}-->

	<xsl:template match="panel[@type='Window']"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>

		<xsl:message>en Window, obj/@name: <xsl:value-of select="$obj/obj/@name"/></xsl:message>
		<xsl:if test="position()-1">,</xsl:if>Ext.create( 'Ext.Window', Ext.apply(
		<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,<xsl:apply-templates select="." mode="panel_config_override"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,{
			width: 300
			,height:200
			,constrain: true
			,closable: true
			,closeAction : 'hide'
			,maximizable: true
			,layout: 'border'
			,plain:true
			,bodyStyle:'padding:5px;'
			,title:'confirmar'}
		))
	</xsl:template><!--}}}-->


	<xsl:template match="panel[@type='xpUploadPanel']"><!--{{{-->

		<xsl:variable name="obj"><xsl:apply-templates select="." mode="obj_metadata"/></xsl:variable>

		<xsl:variable name="panel_id">
			<xsl:choose>
				<xsl:when test="@id"><xsl:value-of select="@id"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="concat($obj/obj/@name,'_',@type)"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<xsl:if test="position()-1">,</xsl:if>Ext.create( 'Ux.xpotronix.xpUploadPanel', Ext.apply(
		<xsl:apply-templates select="." mode="panel_config"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>
		,{xtype:'<xsl:value-of select="@type"/>'
		,buttonsAt:'tbar'
		,id:'<xsl:value-of select="$panel_id"/>'
		,url:'?m=<xsl:value-of select="$obj/obj/@name"/>&amp;a=process&amp;p=upload'
		,path:'root'
		,maxFileSize:App.feat.max_file_size
		,enableProgress:false
		,title:'<xsl:apply-templates select="." mode="translate"><xsl:with-param name="obj" select="$obj/obj" tunnel="yes"/></xsl:apply-templates>'
		,name:'<xsl:value-of select="$obj/obj/@name"/>'
		,bodyStyle:'background-color:white'

		,addText:'Agregar'
		,clickRemoveText:'Click para quitar'
		,clickStopText:'Click para detener'
		,emptyText:'No hay archivos'
		,errorText:'Error'
		,fileQueuedText:'Archivo &lt;b&gt;{0}&lt;/b&gt; esta en cola para subir' 
		,fileDoneText:'Archivo &lt;b&gt;{0}&lt;/b&gt; ha subido satisfactoriamente'
		,fileFailedText:'Archivo &lt;b&gt;{0}&lt;/b&gt; falló en subir'
		,fileStoppedText:'Archivo &lt;b&gt;{0}&lt;/b&gt; detenido por el usuario'
		,fileUploadingText:'Subiendo Archivo &lt;b&gt;{0}&lt;/b&gt;'
		,removeAllText:'Quitar Todos'
		,removeText:'Quitar'
		,stopAllText:'Detener Todos'
		,uploadText:'Subir'}
	))
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
				<xsl:when test="@obj"><xsl:value-of select="@obj"/></xsl:when>
				<xsl:when test="$obj"><xsl:value-of select="$obj/@name"/></xsl:when>
				<xsl:otherwise><xsl:value-of select="parent::*[name()='obj']/@name"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
		<!-- <xsl:message>obj_local_name: <xsl:value-of select="$obj_name"/></xsl:message> -->
		<xsl:copy-of select="//*:metadata/obj[@name=$obj_name][1]"/>
		<!-- <xsl:message>obj: <xsl:copy-of select="//*:metadata/obj[@name=$obj_name]"/></xsl:message> -->
	</xsl:template><!--}}}-->

<!-- cmp -->

	<xsl:template match="cmp"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		<xsl:param name="standalone" tunnel="yes"/>
		<!-- <xsl:message>obj/cmp: <xsl:value-of select="$obj/@name"/></xsl:message> -->
		<xsl:if test="position()-1">,</xsl:if><xsl:apply-templates select="." mode="sub"></xsl:apply-templates>
	</xsl:template><!--}}}-->

	<xsl:template match="cmp[not(@ref)]" mode="sub"><!--{{{-->
		<xsl:param name="obj" tunnel="yes"/>
		<xsl:param name="standalone" tunnel="yes" select="false()"/>
		<!-- <xsl:message>obj/cmp: <xsl:value-of select="$obj/@name"/>, type: <xsl:value-of select="@type"/></xsl:message> -->

		<xsl:variable name="panel_type">
			<xsl:choose>
				<xsl:when test="$standalone and (@type='Panel' or not(@type))">Viewport</xsl:when>
				<xsl:when test="$standalone=false() and not(@type)">Panel</xsl:when>
				<xsl:otherwise><xsl:value-of select="@type"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		Ext.create( '<xsl:value-of select="$panel_type"/>', {
			<xsl:if test="@id">id:'<xsl:value-of select="@id"/>'<xsl:if test="config or items">,</xsl:if></xsl:if>
			<xsl:if test="config"><xsl:value-of select="config"/><xsl:if test="items/*">,</xsl:if></xsl:if>
			<xsl:if test="items/*">items:[<xsl:apply-templates select="items/*"></xsl:apply-templates>]</xsl:if>
		})
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

</xsl:stylesheet>

