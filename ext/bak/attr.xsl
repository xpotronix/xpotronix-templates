<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->


<xsl:stylesheet version="2.0"
	xmlns="http://www.w3.org/TR/REC-html40"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/"
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/"
	xmlns:fn="http://www.w3.org/2005/04/xpath-functions"
	exclude-result-prefixes="#all">

<!-- formats -->

        <xsl:template match="attr[@type='xpdate']" mode="format_parser">'<xsl:value-of select="xp:get_feat(..,'date_long_format')"/>'</xsl:template>
        <xsl:template match="attr[@type='xpdate']" mode="format_renderer">'<xsl:value-of select="xp:get_feat(..,'date_format')"/>'</xsl:template>
        <xsl:template match="attr[@type='xpdatetime']" mode="format_parser">'<xsl:value-of select="xp:get_feat(..,'date_long_format')"/><xsl:text> </xsl:text><xsl:value-of select="xp:get_feat(..,'time_format')"/>'</xsl:template>
        <xsl:template match="attr[@type='xpdatetime']" mode="format_renderer">'<xsl:value-of select="xp:get_feat(..,'date_format')"/><xsl:text> </xsl:text><xsl:value-of select="xp:get_feat(..,'time_format')"/>'</xsl:template>


        <xsl:template match="attr[@type='xpdatetime'] | attr[@type='xpdate']" mode="renderer"><!--{{{-->
	   renderer: <xsl:choose>
	   <xsl:when test="renderer">function(value,p,record) { return <xsl:value-of select="renderer" disable-output-escaping="yes"/>}</xsl:when>
           <xsl:otherwise>Ext.util.Format.dateRenderer(<xsl:apply-templates select="." mode="format_renderer"/>)</xsl:otherwise>
	   </xsl:choose>
        </xsl:template><!--}}}-->

<!-- filter_to -->

	<xsl:template match="attr" mode="filter_to"><!--{{{-->
	<!-- DEBUG: deberia ir como un Ext.apply() para poder incluir otros listeners -->
	<xsl:variable name="obj_name">
		<xsl:choose>
			<xsl:when test="contains(@filter_to,'/')">
				<xsl:value-of select="substring-before(@filter_to,'/')"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="../@name"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="attr_name">
		<xsl:choose>
			<xsl:when test="contains(@filter_to,'/')">
				<xsl:value-of select="substring-after(@filter_to,'/')"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="@filter_to"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
			,listeners:
			{select:{fn:function(combo, value) {
                            var attr =  Ext.getCmp('cmp_<xsl:value-of select="translate(@filter_to,'/','_')"/>');
                            attr.setValue('');
                            attr.setDisabled(false);
                            attr.store.reload({
                                params: { 's[<xsl:value-of select="//xpotronix:metadata//obj[@name=$obj_name]/attr[@name=$attr_name]/@entry_help_table"/>][<xsl:value-of select="@name"/>]': combo.getValue() }
                            });
                         }}
			}

	</xsl:template><!--}}}-->

<!-- with -->

	<xsl:template match="attr" mode="with"><!--{{{-->
	<xsl:variable name="local">
		<xsl:choose>
			<xsl:when test="contains(@with,'=')">
				<xsl:value-of select="substring-before(@with,'=')"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="with"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
	<xsl:variable name="remote">
		<xsl:choose>
			<xsl:when test="contains(@with,'/')">
				<xsl:value-of select="substring-after(@with,'/')"/>
			</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="@with"/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>
			,listeners:
			{select:{fn:function(combo, value) {
                            var attr =  Ext.getCmp('cmp_<xsl:value-of select="translate(@with,'/','_')"/>');
                            attr.setValue('');
                            attr.setDisabled(false);
                            attr.store.reload({
                            });
                         }}
			}
	</xsl:template><!--}}}-->

<!-- text (default type) -->

        <xsl:template match="attr" mode="Record"><!--{{{-->

		<xsl:variable name="apos" select='"&apos;"' />
		<xsl:variable name="type">
			<xsl:choose>
				<xsl:when test="@virtual">
					<xsl:value-of select="''"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:value-of select="concat(', type: ',$apos,'string',$apos)"/>
				</xsl:otherwise>
			</xsl:choose>
		</xsl:variable>
					{name: '<xsl:value-of select="@name"/>'<xsl:value-of select="$type"/>}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr" mode="Filter"><!--{{{-->
           {dataIndex: '<xsl:value-of select="@name"/>', type: 'string'}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

         <xsl:template match="attr" mode="ColumnModel"><!--{{{-->
        {
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
        ,header: '<xsl:apply-templates select="." mode="translate"/>'
        ,dataIndex: '<xsl:value-of select="@name"/>'
	<xsl:if test="renderer">,renderer: function(value,p,record) { return <xsl:value-of select="renderer" disable-output-escaping="yes"/> }
	</xsl:if><xsl:if test="@display='hide'">,hidden: true</xsl:if>
	,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	,filter: { id: 'filter_<xsl:value-of select="concat(@table,'_',@name)"/>', showFilterIcon: false, stateful: true }
        ,editor: new Ed( <xsl:apply-templates select="." mode="Field"/> )
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

	<xsl:template match="attr" mode="Field"><!--{{{-->
	new fm.TextField({
               allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
		<xsl:if test="@display='password'">,inputType: 'password'</xsl:if>
	})
	</xsl:template><!--}}}-->

         <xsl:template match="attr" mode="formField"><!--{{{-->
        {
        xtype: 'textfield'
	,id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
        ,fieldLabel: '<xsl:apply-templates select="." mode="translate"/>'
        ,allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	<xsl:if test="renderer">,renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>}</xsl:if>
        ,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose> 
  	<xsl:if test="@display='password'">,inputType: 'password'</xsl:if>
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

<!-- int -->

      <xsl:template match="attr[@type='xpint']" mode="Record"><!--{{{-->
           				{name: '<xsl:value-of select="@name"/>', type: 'int'}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->
 
      <xsl:template match="attr[@type='int']" mode="Filter"><!--{{{-->
           {dataIndex: '<xsl:value-of select="@name"/>', type: 'numeric'}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpint']" mode="ColumnModel"><!--{{{-->
        {
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
        ,header: '<xsl:apply-templates select="." mode="translate"/>'
        ,dataIndex: '<xsl:value-of select="@name"/>'
	<xsl:if test="@display='hide'">,hidden: true</xsl:if>
	<xsl:if test="renderer">,renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>}</xsl:if>
        ,align: 'right'
	,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	,filter: { showFilterIcon: false }
        ,editor: new Ed( <xsl:apply-templates select="." mode="Field"/> )
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}} -->

        <xsl:template match="attr[@type='xpint']" mode="formField"><!--{{{-->
        {
	   xtype: 'numberfield',
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>',
	   name: '<xsl:value-of select="@name"/>',
           fieldLabel: '<xsl:apply-templates select="." mode="translate"/>',
           allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>,
	   <xsl:if test="renderer">renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>},</xsl:if>
	   style: 'text-align:right;'
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpint']" mode="Field"><!--{{{-->
	new fm.NumberField({
               allowNegative: false,
               allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	})
        </xsl:template><!--}}}-->

<!-- textarea -->

    <xsl:template match="attr[@type='xptext']" mode="ColumnModel"><!--{{{-->
        {
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
        ,header: '<xsl:apply-templates select="." mode="translate"/>'
        ,dataIndex: '<xsl:value-of select="@name"/>'
	<xsl:if test="@display='hide'">,hidden: true</xsl:if>
	<xsl:if test="renderer">,renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>}</xsl:if>
	,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	,filter: { showFilterIcon: false }
        ,editor: new Ed( <xsl:apply-templates select="." mode="Field"/> )
        }<xsl:if test="position()!=last()">,</xsl:if>

        </xsl:template><!--}}}--> 

	<xsl:template match="attr[@type='xptext']" mode="formField"><!--{{{-->
        {
   	   xtype: <xsl:choose><xsl:when test="@uitype='html'">'htmleditor'</xsl:when><xsl:otherwise>'textarea'</xsl:otherwise></xsl:choose>,
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>',
	   name: '<xsl:value-of select="@name"/>',
	   <xsl:if test="renderer">renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>},</xsl:if>
           allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>,
           fieldLabel: '<xsl:apply-templates select="." mode="translate"/>',
	   grow:true

        }<xsl:if test="position()!=last()">,</xsl:if>

        </xsl:template><!--}}}--> 

    <xsl:template match="attr[@type='xptext']" mode="Field"><!--{{{-->
	new fm.<xsl:choose><xsl:when test="@uitype='html'">HtmlEditor</xsl:when><xsl:otherwise>TextArea</xsl:otherwise></xsl:choose>({
	       grow:true,
               allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	})
    </xsl:template><!--}}}--> 

<!-- decimal -->

      <xsl:template match="attr[@type='xpdecimal']" mode="Record"><!--{{{-->
           				{name: '<xsl:value-of select="@name"/>', type: 'float'}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->
 
        <xsl:template match="attr[@type='xpdecimal']" mode="ColumnModel"><!--{{{-->
        {
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
        ,header: '<xsl:apply-templates select="." mode="translate"/>'
        ,dataIndex: '<xsl:value-of select="@name"/>'
	<xsl:if test="@display='hide'">,hidden: true</xsl:if>
	<xsl:choose>
	<xsl:when test="renderer">,renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>}</xsl:when>
	<xsl:otherwise>,renderer: 'usMoney'</xsl:otherwise>
	</xsl:choose>
        ,align: 'right'
	,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	,filter: { showFilterIcon: false }
        ,editor: new Ed( <xsl:apply-templates select="." mode="Field"/> )
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

	<xsl:template match="attr[@type='xpdecimal']" mode="formField"><!--{{{-->
        {
	   xtype: 'numberfield',
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>',
	   name: '<xsl:value-of select="@name"/>',
	   <xsl:if test="renderer">renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>},</xsl:if>
           style: 'text-align:right;',
	   // labelStyle: 'text-align: right;',
	   allowDecimals: true,
	   decimalPrecision: 2,
           allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>,
           fieldLabel: '<xsl:apply-templates select="." mode="translate"/>'
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpdecimal']" mode="Field"><!--{{{-->
	new fm.NumberField({
               allowNegative: false,
               align: 'right',
               renderer: 'usMoney',
               allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	})
        </xsl:template><!--}}}-->

<!-- entry help -->


<!--

,{name:'AREAORI',
header:'Area Origen',
dataIndex:'AREAORI',
align:'left',
filter:{showFilterIcon:false,
nameSuffix:'_label'},

editor:new Ed(new fm.ComboBox({xtype:'combo',
	valueField:'id',
	hiddenName:'AREAORI',
	displayField:'_label',
	store:App.store.item('_mesa_AREAS_ANT'),
	pageSize:'10',
	loadingText:'Aguarde ...',
	typeAhead:true,
	lazyRender:true,
	hideTrigger:false,
	triggerAction:'all',
	forceSelection:true,
	minChars:4})),

renderer:function(value,
 p,
 record){return record.data['AREAORI_label'];}

-->

       <xsl:template match="attr[@type='xpentry_help']" mode="Record"><!--{{{-->
		{name: '<xsl:value-of select="@name"/>_label', mapping: '<xsl:value-of select="@name"/>/@label', type: 'string'},
		{name: '<xsl:value-of select="@name"/>', type: 'string'}<xsl:if test="position()!=last()">,</xsl:if>
       </xsl:template><!--}}}--> 

       <xsl:template match="attr[@type='xpentry_help']" mode="Filter"><!--{{{-->
           {dataIndex: '<xsl:value-of select="@name"/>', type: 'string', searchField: '<xsl:value-of select="@name"/>_label' }<xsl:if test="position()!=last()">,</xsl:if>
       </xsl:template><!--}}}--> 

        <xsl:template match="attr[@type='xpentry_help']" mode="ColumnModel"><!--{{{-->
	<xsl:variable name="entry_help_table" select="@entry_help_table"/>
	{
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
	,dataIndex: '<xsl:value-of select="@name"/>'
        ,header: '<xsl:apply-templates select="." mode="translate"/>'
	<xsl:if test="@display='hide'">,hidden: true</xsl:if>
	<xsl:choose>
		<xsl:when test="renderer">,renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>}</xsl:when>
		<xsl:otherwise>,renderer:function(value, p, record){ return record.data['<xsl:value-of select="@name"/>_label'];}</xsl:otherwise>
	</xsl:choose>
	,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	,filter: { showFilterIcon: false, nameSuffix: '_label' }
        ,editor: new Ed( <xsl:apply-templates select="." mode="Field"/> )
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpentry_help']" mode="Field"><!--{{{-->
	<xsl:variable name="entry_help_table" select="@entry_help_table"/>new Ext.form.ComboBox({

            id: '<xsl:value-of select="concat('xpGrid_',../@name,'_',@name)"/>',
	    name: '<xsl:value-of select="@name"/>',
            store: App.store.item('<xsl:value-of select="../@name"/>_<xsl:value-of select="@eh"/>'),

            fieldLabel: '<xsl:value-of select="@name"/>',
            valueField: 'id',
	    hiddenName: '<xsl:value-of select="@name"/>',
            displayField:'_label',

	    pageSize: 10,
            loadingText: 'Aguarde ...',
            typeAhead: true,
	    lazyRender: true,
            hideTrigger: false,
	    triggerAction: 'all',
            forceSelection: true,
            allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	    <xsl:if test="./@filter_to!=''">
	    	<xsl:apply-templates select="." mode="filter_to"/>
	    </xsl:if>
         ,minChars: 4
        })
        </xsl:template><!--}}}--> 

        <xsl:template match="attr[@type='xpentry_help']" mode="formField"><!--{{{-->
	<xsl:variable name="entry_help_table" select="@entry_help_table"/>
	{

	    xtype: 'combo',
	    id: '<xsl:value-of select="concat('xpForm_',../@name,'_',@name)"/>',
	    name: '<xsl:value-of select="@name"/>',
            store: App.store.item('<xsl:value-of select="../@name"/>_<xsl:value-of select="@eh"/>'),

            fieldLabel: '<xsl:apply-templates select="." mode="translate"/>',
            valueField: 'id',
            displayField:'_label',
            hiddenName: 'id',

	    pageSize: 10,
            loadingText: 'Aguarde ...',
            typeAhead: true,
	    lazyRender: true,
            hideTrigger: false,
	    triggerAction: 'all',
            forceSelection: true,
            allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>,            
            disabled: <xsl:choose><xsl:when test="@display='disabled'">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose>,
            minChars: 4
		//,listWidth: 300
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

<!-- date -->

        <xsl:template match="attr[@type='xpdate']" mode="Record"><!--{{{-->
	{name: '<xsl:value-of select="@name"/>', type: 'date', dateFormat: <xsl:apply-templates select="." mode="format_parser"/>}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpdate']" mode="Filter"><!--{{{-->
           {dataIndex: '<xsl:value-of select="@name"/>', type: 'date'}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpdate']" mode="ColumnModel"><!--{{{-->
        {
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
        ,header: '<xsl:apply-templates select="." mode="translate"/>'
        ,dataIndex: '<xsl:value-of select="@name"/>'
	<xsl:if test="@display='hide'">,hidden: true</xsl:if>
	,<xsl:apply-templates select="." mode="renderer"/>
	,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	,filter: { showFilterIcon: false }
        ,editor: new Ed( <xsl:apply-templates select="." mode="Field"/> )
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpdate']" mode="Field"><!--{{{-->
	new fm.DateField({
                format: <xsl:apply-templates select="." mode="format_renderer"/>,
                // minValue: '01/01/06',
                // disabledDays: [0, 6],
                // disabledDaysText: 'Elija solo dias habiles' 
                allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	})
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpdate']" mode="formField"><!--{{{-->
        {
	   xtype: 'datefield',
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>',
	   name: '<xsl:value-of select="@name"/>',
           fieldLabel: '<xsl:apply-templates select="." mode="translate"/>',
	   <xsl:apply-templates select="." mode="renderer"/>,
           format: <xsl:apply-templates select="." mode="format_renderer"/>,
           allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>,
           disabled: <xsl:choose><xsl:when test="@display='disabled'">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose> 
           // minValue: '01/01/06',
           // disabledDays: [0, 6],
           // disabledDaysText: 'Elija solo dias habiles'
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

<!-- datetime -->

        <xsl:template match="attr[@type='xpdatetime']" mode="Record"><!--{{{-->
		{name: '<xsl:value-of select="@name"/>', type: 'date', dateFormat: <xsl:apply-templates select="." mode="format_parser"/>}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='datetime']" mode="Filter"><!--{{{-->
           {dataIndex: '<xsl:value-of select="@name"/>', type: 'date'}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpdatetime']" mode="ColumnModel"><!--{{{-->
        {
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
        ,header: '<xsl:apply-templates select="." mode="translate"/>'
        ,dataIndex: '<xsl:value-of select="@name"/>'
	<xsl:if test="@display='hide'">,hidden: true</xsl:if>
	,<xsl:apply-templates select="." mode="renderer"/>
	,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	,filter: { showFilterIcon: false }
        ,editor: new Ed( <xsl:apply-templates select="." mode="Field"/> )
        }<xsl:if test="position()!=last()">,</xsl:if>

        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpdatetime']" mode="Field"><!--{{{-->
	new Ext.ux.form.DateTime({
		timeConfig: {
				minValue: '7:00 AM',
			maxValue: '6:00 PM',
			increment: 1 
			},
		timePosition:'below',
		otherToNow: false,
		dateFormat: <xsl:apply-templates select="." mode="format_parser"/>,
                allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	})
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpdatetime']" mode="formField"><!--{{{-->
        {
		id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
		,name: '<xsl:value-of select="@name"/>'
		,xtype: 'xdatetime'
		,fieldLabel: '<xsl:apply-templates select="." mode="translate"/>'
		,timeConfig: {
			minValue: '7:00 AM'
			,maxValue: '6:00 PM'
			,increment: 1 
			}
		,timePosition:'right'
		,<xsl:apply-templates select="." mode="renderer"/>
		,dateFormat: '<xsl:value-of select="xp:get_feat(..,'date_format')"/><xsl:text>'
		,timeFormat: '</xsl:text><xsl:value-of select="xp:get_feat(..,'time_format')"/>'
		,allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
		,disabled: <xsl:choose><xsl:when test="@display='disabled'">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose>
	}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

<!-- boolean -->

        <xsl:template match="attr[@type='xpboolean']" mode="Record"><!--{{{-->
		{name: '<xsl:value-of select="@name"/>', type: 'boolean'}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

       <xsl:template match="attr[@type='xpboolean']" mode="ColumnModel"><!--{{{-->
        {
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
        ,header: '<xsl:apply-templates select="." mode="translate"/>'
        ,dataIndex: '<xsl:value-of select="@name"/>'
	<xsl:if test="@display='hide'">,hidden: true</xsl:if>
	<xsl:if test="renderer">,renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>}</xsl:if>
	,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	,filter: { showFilterIcon: false }
        ,renderer: formatBoolean
        ,editor: new Ed( <xsl:apply-templates select="." mode="Field"/> )
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

       <xsl:template match="attr[@type='xpboolean']" mode="Field"><!--{{{-->
	new fm.Checkbox({
	})
       </xsl:template><!--}}}-->

       <xsl:template match="attr[@type='xpboolean']" mode="formField"><!--{{{-->
        {
	   xtype: 'checkbox',
	   id: '<xsl:value-of select="concat(@table,'_',@name)"/>',
	   name: '<xsl:value-of select="@name"/>',
           fieldLabel: '<xsl:apply-templates select="." mode="translate"/>',
           allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>,
	   <xsl:if test="renderer">renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>},</xsl:if>
           renderer: formatBoolean,
            disabled: <xsl:choose><xsl:when test="@display='disabled'">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose> 
	   
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

        <xsl:template match="attr[@type='xpboolean']" mode="Filter"><!--{{{-->
           {dataIndex: '<xsl:value-of select="@name"/>', type: 'boolean'}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

<!-- enum -->

       <xsl:template match="attr[@type='xpenum']" mode="Record"><!--{{{-->
						{name: '<xsl:value-of select="@name"/>'}<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

	<xsl:template match="attr[@type='xpenum']" mode="ColumnModel"><!--{{{-->
	{
	id: '<xsl:value-of select="concat(@table,'_',@name)"/>'
	,name: '<xsl:value-of select="@name"/>'
       	,header: '<xsl:apply-templates select="." mode="translate"/>'
	,dataIndex: '<xsl:value-of select="@name"/>'
	<xsl:if test="@display='hide'">,hidden: true</xsl:if>
	<xsl:if test="renderer">,renderer: function(value,p,record) { return <xsl:value-of select="renderer"  disable-output-escaping="yes"/>}</xsl:if>
	,editable: <xsl:choose><xsl:when test="@display='disabled'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	,filter: { showFilterIcon: false }
	,editor: new Ed( <xsl:apply-templates select="." mode="Field"/> ) 
	}<xsl:if test="position()!=last()">,</xsl:if>

 	</xsl:template><!--}}}-->

	<xsl:template match="attr[@type='xpenum']" mode="Field"><!--{{{-->
	new Ext.form.ComboBox({
    		mode : 'local',    
    		store : <xsl:apply-templates select="." mode="SimpleStore"/>,
		displayField: '<xsl:value-of select="@name"/>',
    		valueField: '<xsl:value-of select="@name"/>',
		triggerAction: 'all',
		forceSelection: true,
		minChars: 1,
		typeAhead: true,
        	allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>
	})
 	</xsl:template><!--}}}-->

       <xsl:template match="attr[@type='xpenum']" mode="formField"><!--{{{-->
	<xsl:variable name="enum_table" select="@enum_table"/>
	{

	    xtype: 'combo',
    	    mode : 'local',    
	    id: '<xsl:value-of select="concat(@table,'_',@name)"/>',
	    name: '<xsl:value-of select="@name"/>',
            store: <xsl:apply-templates select="." mode="SimpleStore"/>,
            fieldLabel: '<xsl:apply-templates select="." mode="translate"/>',
            allowBlank: <xsl:choose><xsl:when test="@validate='empty'">false</xsl:when><xsl:otherwise>true</xsl:otherwise></xsl:choose>,
            valueField: '<xsl:value-of select="@name"/>',
            displayField:'<xsl:value-of select="@name"/>',
	    triggerAction: 'all',
            forceSelection: true,
            disabled: <xsl:choose><xsl:when test="@display='disabled'">true</xsl:when><xsl:otherwise>false</xsl:otherwise></xsl:choose>,
            minChars: 1
	//,listWidth: 300
        }<xsl:if test="position()!=last()">,</xsl:if>
        </xsl:template><!--}}}-->

	<xsl:template  match="attr[@type='xpenum']" mode="SimpleStore"><!--{{{-->
	new Ext.data.SimpleStore({
    		fields: ['<xsl:value-of select="@name"/>'],
    		data: [<xsl:apply-templates select="." mode="enum_values"/>] })
	</xsl:template><!--}}}-->


<!-- misc -->

	<xsl:template match="attr" mode="enum_values"><!--{{{-->
		<xsl:variable name="obj_name" select="../@name"/>
		<xsl:variable name="attr_name" select="@name"/>

		<xsl:variable name="values" select="//xpotronix:metadata//obj[@name=$obj_name]/attr[@name=$attr_name]/@enums"/>
		<!-- <xsl:variable name="tokens" select="replace($values,',','],[')"/> -->
		<xsl:variable name="tokens">
			<xsl:call-template name="string-replace-all">
			   <xsl:with-param name="text" select="$values"/>
			   <xsl:with-param name="replace" select="','"/>
			   <xsl:with-param name="by" select="'],['"/>
    			</xsl:call-template>
		</xsl:variable>
		<!-- <xsl:message><xsl:value-of select="$tokens"/></xsl:message> -->
		<xsl:value-of select="concat( '[',$tokens,']')"/>

	</xsl:template><!--}}}-->

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

	<xsl:template match="attr" mode="extra_param"><!--{{{-->
                <xsl:variable name="obj_name" select="@entry_help_table"/>
                <xsl:for-each select="//xpotronix:session/var/e/*[name()=$obj_name or name()='_']/*">
                        'e[<xsl:value-of select="$obj_name"/>][<xsl:value-of select="name()"/>]': '<xsl:value-of select="text()"/>'<xsl:if test="position()!=last()">,</xsl:if>
                </xsl:for-each>
        </xsl:template><!--}}}-->

<xsl:template name="string-replace-all">
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
</xsl:template>

</xsl:stylesheet>

<!-- vim600: fdm=marker sw=3 ts=8 ai: 
-->
