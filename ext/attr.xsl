<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-1011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->


<xsl:stylesheet version="2.0"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns="http://xpotronix.com/namespace/xpotronix/"
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/"
	xmlns:fn="http://www.w3.org/2005/04/xpath-functions"
	exclude-result-prefixes="#all">

<xsl:template match="attr"><!--{{{-->
	<xsl:param name="obj" tunnel="yes"/>
	<xsl:variable name="name" select="@name"/>
	<!-- <xsl:message>attr: obj: <xsl:value-of select="$obj/@name"/>, attr: <xsl:value-of select="@name"/></xsl:message> -->

	<xsl:variable name="attr_meta" select="$obj/attr[@name=$name]"/>
	<xsl:variable name="attr_base" select="."/>

	<!-- <xsl:message>attr_meta: <xsl:sequence select="$attr_meta"/> </xsl:message> -->

	<xsl:variable name="attr_attrs">
		<xsl:apply-templates select="." mode="attr_attrs"/>
	</xsl:variable>

	<xsl:variable name="attr">
		<!-- attr override entre la definicion local y los datos del metadata -->
		<xsl:copy>
			<xsl:sequence select="$attr_meta/@*"/>
			<xsl:sequence select="@*"/>
			<!-- DEBUG: revisar si incluye los elementos propios y del metadata -->
			<xsl:for-each-group select="$attr_attrs/*|*|$attr_meta/*" group-by="name()">
				<xsl:sequence select="current-group()[last()]"/>
			</xsl:for-each-group> 
		</xsl:copy>
	</xsl:variable>

	<!-- <xsl:message>attr content: <xsl:sequence select="$attr"/> </xsl:message> -->

	<xsl:if test="position()-1">,</xsl:if><xsl:apply-templates select="$attr/attr" mode="field"/>
</xsl:template><!--}}}-->

<xsl:template match="attr" mode="attr_attrs"><!--{{{-->
	<xsl:for-each select="@*">
		<xsl:if test="name()='id' or name()='width' or name()='flex'">
			<xsl:element name="{name()}" namespace="">
				<xsl:value-of select="."/>
			</xsl:element>
		</xsl:if>
	</xsl:for-each>
</xsl:template><!--}}}-->

<!-- attr sections -->

<xsl:template match="attr" mode="record"><!--{{{-->
	<!-- <xsl:message>en record</xsl:message> -->
	<!-- <xsl:message><xsl:sequence select="."/></xsl:message> -->
	<xsl:variable name="type" select="@type"/>
	<xsl:variable name="attr_templates" select="document('attr-templates.xml')"/>

	<xsl:variable name="attr_attrs">
		<xsl:apply-templates select="." mode="attr_attrs"/>
	</xsl:variable>

	<xsl:variable name="all_attrs">

		<!-- defauts para todos los tipos de datos -->
		<xsl:sequence select="$attr_templates//record[not(@type)]/*"/>

		<!-- defaults de los templates -->
		<xsl:sequence select="$attr_templates//record[@type=$type]/*"/>

		<!-- los propios attrs del attr como elementos -->
		<xsl:sequence select="$attr_attrs"/>

		<!-- los propios de la definicion que no sean 'editor' o no 'column' -->
		<xsl:sequence select="*[name()!='editor' and name()!='column']"/>

	</xsl:variable>

	<xsl:if test="@type='xpentry_help'">
		<!-- <xsl:message>attr collection:<xsl:sequence select="$all_attrs"/></xsl:message> -->
	</xsl:if>


	<xsl:variable name="attr">
		<!-- attr override entre la definicion local y los templates: propios del tipo y por default (sin tipo) -->
		<xsl:copy>
			<xsl:sequence select="@*"/>
			<xsl:attribute name="section" select="'record'"/>
			<xsl:call-template name="recurse_override">
				<xsl:with-param name="nodes" select="$all_attrs"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:variable>
	<!-- <xsl:message>attr-list: <xsl:sequence select="$attr"/></xsl:message> -->
	<xsl:if test="//*:session/var/UNNORMALIZED=1">
	<xsl:text>
/* </xsl:text><xsl:value-of select="$attr/attr/@name"/><xsl:text> */
</xsl:text></xsl:if>
	<xsl:if test="position()-1">,</xsl:if>{<xsl:apply-templates select="$attr/attr/*"><xsl:with-param name="attr" select="$attr/attr" tunnel="yes"/></xsl:apply-templates>}<xsl:if test="@type='xpentry_help'">
	<xsl:variable name="attr_eh">
		<xsl:copy>
			<xsl:sequence select="@*"/>
			<xsl:attribute name="section" select="'record'"/>
			<xsl:attribute name="type" select="'eh_label'"/>
			<xsl:call-template name="recurse_override">
				<xsl:with-param name="nodes" select="$attr_templates//record[@type='eh_label' or not(@type)]"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:variable>
,{<xsl:apply-templates select="$attr_eh/attr/*"><xsl:with-param name="attr" select="$attr_eh/attr" tunnel="yes"/></xsl:apply-templates>}
<!-- <xsl:message>attr_eh: <xsl:sequence select="$attr_eh"/></xsl:message> -->
</xsl:if>
</xsl:template><!--}}}-->

<xsl:template match="attr" mode="column"><!--{{{-->
	<xsl:variable name="type" select="@type"/>
	<xsl:variable name="attr_templates" select="document('attr-templates.xml')"/>
	<!--<xsl:message>en column, @type: <xsl:value-of select="@type"/></xsl:message>-->


	<xsl:variable name="attr_attrs">
		<xsl:apply-templates select="." mode="attr_attrs"/>
	</xsl:variable>

	<!-- <xsl:message>attr_attrs: <xsl:sequence select="$attr_attrs"/></xsl:message> -->

	<xsl:variable name="all_attrs">

		<!-- defauts para todos los tipos de datos -->
		<xsl:sequence select="$attr_templates//column[not(@type)]/*"/>

		<!-- defaults de los templates pero de field para completar la definicion (solo para column) -->
		<xsl:element name="editor" namespace="">
			<xsl:sequence select="$attr_templates//field[@type=$type]/*"/>
		</xsl:element>

		<!-- defaults de los templates -->
		<xsl:sequence select="$attr_templates//column[@type=$type]/*"/>

		<!-- los propios attrs del attr como elementos -->
		<xsl:sequence select="$attr_attrs"/>

		<!-- los propios de la definicion que no sean 'record' -->
		<xsl:sequence select="*[name()!='record']"/>

	</xsl:variable>

	<!-- <xsl:if test="@type='xpentry_help' and @name='IDAREAAN'">
		<xsl:message>
			<xsl:element name="attr" namespace="">
				<xsl:sequence select="@*"/>
				<xsl:sequence select="$all_attrs"/>
			</xsl:element>
		</xsl:message>
	</xsl:if>-->

	<xsl:variable name="attr">
		<xsl:element name="attr" namespace="">
			<xsl:sequence select="@*"/>
			<xsl:attribute name="section" select="'column'"/>
			<xsl:call-template name="recurse_override">
				<xsl:with-param name="nodes" select="$all_attrs"/>
			</xsl:call-template>
		</xsl:element>
	</xsl:variable>

	<!-- <xsl:if test="@type='xpentry_help' and @name='IDAREAAN'">
		<xsl:message><xsl:sequence select="$attr"/></xsl:message>
	</xsl:if> -->

	<xsl:if test="//*:session/var/UNNORMALIZED=1">
	<xsl:text>
/* </xsl:text><xsl:value-of select="$attr/attr/@name"/><xsl:text> */
</xsl:text></xsl:if>
	<xsl:if test="position()-1">,</xsl:if>{<xsl:apply-templates select="$attr/attr/*"><xsl:with-param name="attr" select="$attr/attr" tunnel="yes"/></xsl:apply-templates>}
</xsl:template><!--}}}-->

<xsl:template match="attr" mode="field"><!--{{{-->
	<xsl:variable name="type" select="@type"/>
	<xsl:variable name="attr_templates" select="document('attr-templates.xml')"/>
	<!-- <xsl:message>en field</xsl:message> -->

	<xsl:variable name="attr_attrs">
		<xsl:apply-templates select="." mode="attr_attrs"/>
	</xsl:variable>

	<!-- <xsl:message>attr_attrs: <xsl:sequence select="$attr_attrs"/></xsl:message> -->

	<xsl:variable name="all_attrs">

		<!-- defauts para todos los tipos de datos -->
		<xsl:sequence select="$attr_templates//field[not(@type)]/*"/>

		<!-- defaults de los templates -->
		<xsl:sequence select="$attr_templates//field[@type=$type]/*"/>

		<!-- los propios attrs del attr como elementos -->
		<xsl:sequence select="$attr_attrs"/>

		<!-- los propios de la definicion que no sean 'record' -->
		<xsl:sequence select="*[name()!='record' and name()!='editor']"/>

		<!-- los propios de la definicion que sean 'editor' -->
		<xsl:sequence select="*[name()='editor']/*"/>


	</xsl:variable>

	<!-- entry_help -->

	<xsl:if test="@type='xpentry_help'">
		<!-- <xsl:message>attr collection:<xsl:sequence select="$all_attrs"/></xsl:message> -->
	</xsl:if>


	<xsl:variable name="attr">
		<xsl:copy>
			<xsl:sequence select="@*"/>
			<xsl:attribute name="section" select="'field'"/>
			<xsl:call-template name="recurse_override">
				<xsl:with-param name="nodes" select="$all_attrs"/>
			</xsl:call-template>
		</xsl:copy>
	</xsl:variable>
	<!-- <xsl:message>session: <xsl:sequence select="//*"/></xsl:message> -->
	<!-- <xsl:message>attr-list: <xsl:sequence select="$attr"/></xsl:message> -->
 	<xsl:if test="position()-1">,</xsl:if>{<xsl:apply-templates select="$attr/attr/*"><xsl:with-param name="attr" select="$attr/attr" tunnel="yes"/></xsl:apply-templates>}
</xsl:template><!--}}}-->

<xsl:template name="recurse_override"><!--{{{-->
	<xsl:param name="nodes"/>
	<xsl:for-each-group select="$nodes/*" group-by="name()">
		<xsl:choose>
			<xsl:when test="not(current-group()/*)">
				<xsl:sequence select="current-group()[last()]"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:copy>
					<xsl:call-template name="recurse_override">
						<xsl:with-param name="nodes" select="current-group()"/>
					</xsl:call-template>
				</xsl:copy>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:for-each-group> 
</xsl:template><!--}}}-->

<!-- vars -->

<!-- 
	por ahora voy a suprimir los tags generados por la coleccion de attrs del attr (metadata) 
	entonces suprimo los tags por default del controlador de xpotronix 
	hay que implementar namespaces para diferenciar ej.
	controller:* extjs:* etc.

<xsl:template match="*:validate|*:max_length|*:scale|*:table|*:dbtype|*:length|*:modified|*:type|*:translate|*:not_null|*:display|*:eh|*:entry_help|*:entry_help_table|*:enums|*:alias_of|*:virtual|*:filters|*:has_default|*:primary|*:primary_key|*:default_value|*:auto_increment|*:foreign"/>

-->

<xsl:template match="*:id"><!--{{{-->
<xsl:param name="obj" tunnel="yes"/>
<xsl:param name="attr" tunnel="yes"/>
<xsl:param name="panel_id" tunnel="yes"/>
<!-- <xsl:message>id/parent: <xsl:sequence select="parent::*/name()"/></xsl:message> -->
<!-- <xsl:message>id: <xsl:sequence select="parent::*"/></xsl:message> -->
<xsl:if test="parent::*/name()='editor' or parent::*/@section='field'">
<xsl:if test="position()-1">,</xsl:if>id:'<xsl:choose>
<xsl:when test=". and .!='*'"><xsl:value-of select="."/></xsl:when>
<xsl:otherwise><xsl:value-of select="concat($panel_id,'_',$obj/@name,'_',$attr/@name)"/></xsl:otherwise></xsl:choose>'
</xsl:if></xsl:template><!--}}}-->

<xsl:template match="name"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if><xsl:value-of select="name()"/>:'<xsl:value-of select="$attr/@name"/>'</xsl:template><!--}}}-->

<xsl:template match="dataIndex"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if><xsl:value-of select="name()"/>:'<xsl:value-of select="$attr/@name"/>'</xsl:template><!--}}}-->

<xsl:template match="name[ancestor::*/@type='eh_label']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>name:'<xsl:value-of select="$attr/@name"/>_label'</xsl:template><!--}}}-->

<xsl:template match="*:renderer"><!--{{{-->
<!-- <xsl:message>renderer: <xsl:copy-of select=".."/></xsl:message> -->
<xsl:if test=".!=''"><xsl:if test="position()-1">,</xsl:if>renderer:function(value,p,record){return <xsl:value-of select="." disable-output-escaping="yes"/>}</xsl:if></xsl:template><!--}}}-->

<xsl:template match="*:renderer[ancestor::*/@type='xpdecimal']"><!--{{{-->
<xsl:if test=".!=''"><xsl:if test="position()-1">,</xsl:if>renderer: "<xsl:value-of select="." disable-output-escaping="yes"/>"</xsl:if></xsl:template><!--}}}-->

<xsl:template match="*:renderer[ancestor::*/@type='xpboolean']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<!-- <xsl:message>renderer: <xsl:sequence select="$attr"/></xsl:message> -->
<xsl:if test="position()-1">,</xsl:if>renderer:<xsl:choose>
	<xsl:when test=".!=''">function(value,p,record) {return <xsl:value-of select="." disable-output-escaping="yes"/>}</xsl:when>
	<xsl:otherwise><xsl:value-of select="."/></xsl:otherwise>
</xsl:choose></xsl:template><!---}}}-->

<xsl:template match="*:renderer[ancestor::*/@type='xpentry_help']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>renderer:<xsl:choose>
	<xsl:when test=".!=''">function(value,p,record) {return <xsl:value-of select="."  disable-output-escaping="yes"/>}</xsl:when>
	<xsl:otherwise>function(value, p, record){return record.data['<xsl:value-of select="$attr/@name"/>_label'];}</xsl:otherwise>
</xsl:choose></xsl:template><!---}}}-->

<xsl:template match="*:renderer[ancestor::*/@type='xpdate']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>renderer:<xsl:choose>
	<xsl:when test=".!=''">function(value,p,record){return <xsl:value-of select="." disable-output-escaping="yes"/>}</xsl:when>
	<xsl:otherwise>Ext.util.Format.dateRenderer(App.feat.date_format)</xsl:otherwise>
</xsl:choose></xsl:template><!--}}}-->

<xsl:template match="*:renderer[ancestor::*/@type='xpdatetime']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>renderer:<xsl:choose>
	<xsl:when test=".!=''">function(value,p,record){return <xsl:value-of select="." disable-output-escaping="yes"/>}</xsl:when>
	<xsl:otherwise>Ext.util.Format.dateRenderer(App.feat.date_format + ' ' + App.feat.time_format)</xsl:otherwise>
</xsl:choose></xsl:template><!--}}}-->



<xsl:template match="filter"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>filter:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="editor"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>editor:new Ed(new fm.TextField({<xsl:apply-templates select="*"/>}))</xsl:template><!--}}}-->

<xsl:template match="editor[ancestor::*/@type='xptext']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>editor:new Ed(new fm.<xsl:choose>
	<xsl:when test="$attr/@uitype='html'">HtmlEditor</xsl:when>
	<xsl:otherwise>TextArea</xsl:otherwise>
</xsl:choose>(<xsl:choose>
	<xsl:when test="*">{<xsl:apply-templates select="*"/>}</xsl:when>
	<xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise></xsl:choose>))</xsl:template><!--}}}-->

<xsl:template match="editor[ancestor::*/@type='xpint']"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>editor:new Ed(new fm.NumberField(<xsl:choose>
	<xsl:when test="*">{<xsl:apply-templates select="*"/>}</xsl:when>
	<xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise></xsl:choose>))</xsl:template><!--}}}-->

<xsl:template match="editor[ancestor::*/@type='xpdate']"><!--{{{--> 
<!-- <xsl:message><xsl:sequence select="."/></xsl:message> -->
<xsl:if test="position()-1">,</xsl:if>editor:new Ed(new fm.DateField(<xsl:choose>
	<xsl:when test="*">{<xsl:apply-templates select="*"/>}</xsl:when>
	<xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise></xsl:choose>))</xsl:template><!--}}}-->

<xsl:template match="editor[ancestor::*/@type='xpdatetime']"><!--{{{--> 
<xsl:if test="position()-1">,</xsl:if>editor:new Ed(new Ext.ux.form.DateTime(<xsl:choose>
	<xsl:when test="*">{<xsl:apply-templates select="*"/>}</xsl:when>
	<xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise></xsl:choose>))</xsl:template><!--}}}-->

<xsl:template match="editor[ancestor::*/@type='xpboolean']"><!--{{{--> 
<xsl:if test="position()-1">,</xsl:if>editor:new Ed(new fm.Checkbox(<xsl:choose>
	<xsl:when test="*">{<xsl:apply-templates select="*"/>}</xsl:when>
	<xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise></xsl:choose>))</xsl:template><!--}}}-->

<xsl:template match="editor[ancestor::*/@type='xpenum']"><!--{{{--> 
 <xsl:if test="position()-1">,</xsl:if>editor:new Ed(new fm.ComboBox(<xsl:choose>
	<xsl:when test="*">{<xsl:apply-templates select="*"/>}</xsl:when>
	<xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise></xsl:choose>))</xsl:template><!--}}}-->

<xsl:template match="editor[ancestor::*/@type='xpentry_help']"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>editor:new Ed(new fm.ComboBox(<xsl:choose>
	<xsl:when test="*">{<xsl:apply-templates select="*"/>}</xsl:when>
	<xsl:otherwise><xsl:value-of select="text()"/></xsl:otherwise></xsl:choose>))</xsl:template><!--}}}-->

<!-- events & listeners -->

<xsl:template match="listeners"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>listeners:{<xsl:apply-templates select="*"/>}</xsl:template><!--}}}-->

<xsl:template match="event"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if><xsl:value-of select="@name"/>:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="comboReload"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>beforequery:function(q){delete q.combo.lastQuery}</xsl:template><!--}}}-->

<!-- stores -->

<xsl:template match="store[ancestor::*/@type='xpenum']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>store:<xsl:apply-templates select="$attr" mode="SimpleStore"/></xsl:template><!--}}}-->

<xsl:template match="store[ancestor::*/@type='xpentry_help']"><!--{{{-->
<xsl:param name="obj" tunnel="yes"/>
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>store:App.store.item('<xsl:value-of select="$obj/@name"/>_<xsl:value-of select="$attr/@eh"/>')
</xsl:template><!--}}}-->

<!-- vars -->

<xsl:template match="mode"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>mode:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="displayField[ancestor::*/@type='xpenum']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>displayField:'<xsl:value-of select="$attr/@name"/>'</xsl:template><!--}}}-->

<xsl:template match="valueField[ancestor::*/@type='xpenum']"><!--{{{--> 
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>valueField:'<xsl:value-of select="$attr/@name"/>'</xsl:template><!--}}}-->

<xsl:template match="hidden"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="$attr/@display='hide'">
<xsl:if test="position()-1">,</xsl:if>hidden:true</xsl:if></xsl:template><!--}}}-->

<xsl:template match="editable"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="$attr/@display='disabled'">
<xsl:if test="position()-1">,</xsl:if>editable:false</xsl:if></xsl:template><!--}}}-->

<xsl:template match="allowBlank"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<!-- <xsl:message>allowBlank: <xsl:sequence select="$attr"/></xsl:message> -->
<xsl:if test="$attr/@validate='empty'">
<xsl:if test="position()-1">,</xsl:if>allowBlank:false</xsl:if></xsl:template><!--}}}-->

<xsl:template match="allowDecimals"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>allowDecimals:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="decimalPrecision"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>decimalPrecision:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="fieldLabel|header"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if><xsl:value-of select="name()"/>:'<xsl:apply-templates select="$attr" mode="translate"/>'</xsl:template><!--}}}-->

<xsl:template match="xtype"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>xtype:'<xsl:choose><xsl:when test="$attr/@uitype='html' and .='textarea'">htmleditor</xsl:when><xsl:otherwise><xsl:value-of select="."/></xsl:otherwise></xsl:choose>'</xsl:template><!--}}}-->

<xsl:template match="type"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>type:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="grow"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>grow:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="align"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>align:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="style"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>style:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="*:width"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>width:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="*:flex"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>flex:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="format[ancestor::*/@type='xpdate']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>format:App.feat.date_format</xsl:template><!--}}}-->

<xsl:template match="field/format[ancestor::*/@type='xpdatetime']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:param name="obj" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>format:App.feat.date_format</xsl:template><!--}}}-->

<xsl:template match="format[ancestor::*/@type='xpdatetime']"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>format:App.feat.date_long_format</xsl:template><!--}}}-->

<xsl:template match="dateFormat[ancestor::*/@type='xpdatetime' and ../@section='record']"><!--{{{-->
<xsl:param name="obj" tunnel="yes"/>
<xsl:param name="attr" tunnel="yes"/>
<!--<xsl:message><xsl:value-of select="."/></xsl:message>-->
<xsl:if test="position()-1">,</xsl:if>dateFormat:App.feat.date_long_format + ' ' + App.feat.time_format</xsl:template><!--}}}-->

<xsl:template match="dateFormat[ancestor::*/@type='xpdate' and ../@section='record']"><!--{{{-->
<xsl:param name="obj" tunnel="yes"/>
<xsl:param name="attr" tunnel="yes"/>
<!--<xsl:message><xsl:value-of select="."/></xsl:message>-->
<xsl:if test="position()-1">,</xsl:if>dateFormat:App.feat.date_long_format</xsl:template><!--}}}-->

<xsl:template match="dateFormat[../@section='field' or not(../@section)]"><!--{{{-->
<xsl:param name="obj" tunnel="yes"/>
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>dateFormat:App.feat.date_format</xsl:template><!--}}}-->

<xsl:template match="timeFormat"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>timeFormat:App.feat.time_format</xsl:template><!--}}}-->

<xsl:template match="timeConfig"><!--{{{-->
 <xsl:if test="position()-1">,</xsl:if>timeConfig:{<xsl:apply-templates select="*"/>}</xsl:template><!--}}}-->

<xsl:template match="minValue"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>minValue:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="maxValue"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>maxValue:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="increment"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>increment:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="otherToNow"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>otherToNow:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="timePosition"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>timePosition:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="valueField"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>valueField:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="hiddenName"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>hiddenName:'<xsl:value-of select="$attr/@name"/>'</xsl:template><!--}}}-->

<xsl:template match="mapping"><!--{{{-->
<xsl:param name="attr" tunnel="yes"/>
<xsl:if test="position()-1">,</xsl:if>mapping:'<xsl:value-of select="$attr/@name"/>/@label'</xsl:template><!--}}}-->

<xsl:template match="displayField"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>displayField:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="pageSize"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>pageSize:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="loadingText"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>loadingText:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="typeAhead"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>typeAhead:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="lazyRender"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>lazyRender:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="hideTrigger"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>hideTrigger:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="triggerAction"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>triggerAction:'<xsl:value-of select="."/>'</xsl:template><!--}}}-->

<xsl:template match="forceSelection"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>forceSelection:<xsl:value-of select="."/></xsl:template><!--}}}-->

<xsl:template match="minChars"><!--{{{-->
<xsl:if test="position()-1">,</xsl:if>minChars:<xsl:value-of select="."/></xsl:template><!--}}}-->

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

<!-- misc -->

<xsl:template match="attr" mode="extra_param"><!--{{{-->
	<xsl:variable name="entry_help_table" select="@entry_help_table"/>
	<xsl:for-each select="//*:session/var/e/*[name()=$entry_help_table or name()='_']/*">'e[<xsl:value-of select="$entry_help_table"/>][<xsl:value-of select="name()"/>]': '<xsl:value-of select="text()"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>
</xsl:template><!--}}}-->

<xsl:template  match="attr" mode="SimpleStore"><!--{{{-->
new Ext.data.SimpleStore({fields:['<xsl:value-of select="@name"/>'],data:[<xsl:apply-templates select="." mode="enum_values"/>]})</xsl:template><!--}}}-->

<xsl:template match="attr" mode="enum_values"><!--{{{-->

	<!-- <xsl:message terminate="yes">enum_values: <xsl:sequence select="."/></xsl:message> -->
	<xsl:variable name="attr_name" select="@name"/>
	<!-- <xsl:variable name="tokens" select="replace($values,',','],[')"/> -->
	<xsl:variable name="tokens">
	<xsl:call-template name="string-replace-all">
		   <xsl:with-param name="text" select="@enums"/>
		   <xsl:with-param name="replace" select="','"/>
		   <xsl:with-param name="by" select="'],['"/>
    		</xsl:call-template>
	</xsl:variable>
	<!-- <xsl:message><xsl:value-of select="$tokens"/></xsl:message> -->
	<xsl:value-of select="concat( '[',$tokens,']')"/></xsl:template><!--}}}-->

<xsl:template name="string-replace-all"><!--{{{-->
	<xsl:param name="text"/>
	<xsl:param name="replace"/>
	<xsl:param name="by"/>
	<xsl:choose>
		<xsl:when test="contains($text,$replace)">
			<xsl:value-of select="substring-before($text,$replace)"/>
			<xsl:value-of select="$by"/>
			<xsl:call-template name="string-replace-all">
				<xsl:with-param name="text" select="substring-after($text,$replace)"/>
				<xsl:with-param name="replace" select="$replace"/>
				<xsl:with-param name="by" select="$by"/>
			</xsl:call-template>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="$text"/>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template><!--}}}-->

</xsl:stylesheet>

<!-- vim600: fdm=marker sw=3 ts=8 ai: 
-->
