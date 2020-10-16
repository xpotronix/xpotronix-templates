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

	<xsl:template match="*:model" mode="treeport"><!--{{{-->

	App.layout = new Ext.Viewport({
		 layout:'border'
		,minWidth:600
		,items:[{
			 region:'north'
			,xtype:'panel'
			,html: '<xsl:value-of select="//*:dataset/class/obj[@name='home' and attr[@name='div_id']='banner'][1]/attr[@name='text']" disable-output-escaping="yes"/>'

			/*,height:99, pageTitle:Ext.fly('page-title').dom.innerHTML*/

		},{
			 region:'west'
			,layout:'ux.row'
			,width:180
			,minWidth:50
			,maxWidth:300
			/*,collapsible:true*/
			,collapseMode:'mini'
			,split:true
			,items:[{
				 id:'mainTreePanel'
				,rowHeight:1
				,layout:'fit'
				,autoScroll:true
				,useArrows:true
				,title:'Menú Principal'
				,dataUrl: '?v=xml&amp;a=menu&amp;v=ext/menu-js'

				,root: new Ext.tree.AsyncTreeNode()
				,rootVisible: false 

				,border:false
				,xtype:'treepanel'
				,defaultTools:false
				,sort:false
				,bodyStyle:'padding:5px'
				,singleExpand:true
				,collapsible: true
				,stateful: true
			},{
				 height:240
				,id:'detail'
				,border:false
				,bodyStyle:'padding:4px'
				,title:'Ayuda'
				,autoScroll:true
			}]
		},{
			 region:'center'
			,id:'iframe'
			,xtype:'panel'
			,layout:'fit'
			,defaultSrc:'<xsl:value-of select="$session/feat/defaultSrc"/>'
			/*,border:true*/
			/*,title:'&#160;'*/
		}]
	});



	</xsl:template><!--}}}-->

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

    <xsl:variable name="menu_bar" select="xp:get_feat($metadata/obj[1],'menu_bar')"/>
	<xsl:variable name="messages_panel" select="xp:get_feat($metadata/obj[1],'messages_panel')"/>
       
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

	<xsl:variable name="ui_class">
		<xsl:choose>
			<xsl:when test="$standalone">Viewport</xsl:when>
			<xsl:otherwise>Panel</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

	<xsl:variable name="region">
		<xsl:choose>
			<xsl:when test="count($center_panels/*)">north</xsl:when>
			<xsl:otherwise>center</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

	new Ext.<xsl:value-of select="$ui_class"/>({
            id: 'xpApp_layout',
	    stateful: true,
            layout: 'border',
	    hideMode:'offsets',
	    deferredRender: true,
	    bodyStyle: {border:0},
            items:[

		<xsl:if test="$menu_bar='true'">
		new Ext.Panel({  
				id: 'xpApp_menu',
				layout: 'fit', 
				width: '100%', 
				region: '<xsl:value-of select="$region"/>', 
				tbar: App.menu }),
		</xsl:if>

		new Ext.TabPanel({ 
				id: 'viewport_north_tabs',
				stateful: true,
				titleCollapse: false, 
				height: 200, 
				margins: '<xsl:value-of select="$top_margin"/> 0 0 0', 
				split: true, 
				region:'<xsl:value-of select="$region"/>', 
				deferredRender: true, 
				layoutOnTabChange: true, 
				/* collapsible: true, 
				collapseMode:'mini',*/
				activeTab:0,
				items: App.accessible( [ 
					<xsl:apply-templates 
						select="$panels//*[@obj_name=$obj_name and @region='']|$panels//*[@region=$region]"
						mode="panel_list"/> ])
                })

		<xsl:if test="count($panels//*[@obj_name!=$obj_name])">
                , new Ext.TabPanel({ region:'center', 
				id: 'viewport_center_tabs',
				stateful: true,
				deferredRender: true, 
				layoutOnTabChange: true, 
				collapsible: false, 
				activeTab:0,
                  		items: App.accessible( [<xsl:apply-templates select="$panels//*[@obj_name!=$obj_name and @region='']|$panels//*[@region='center']" mode="panel_list"/>] )
                })</xsl:if>
		<xsl:if test="$messages_panel='true'">
		,{
	  	    id: '__messagesPanel',
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

	<xsl:template match="*:model" mode="wizard"><!--{{{-->

	<!-- DEBUG: queda hacer funcionar correctamente las funcion de navegacion -->
	<xsl:variable name="panels">
		<xsl:for-each select=".//panel[@display='tab' or not(@display)]">
			<xsl:copy>
				<xsl:attribute name="type" select="@type"/>
				<xsl:attribute name="obj_name" select="../@name"/>
			</xsl:copy>
		</xsl:for-each>
	</xsl:variable>
	<!-- <xsl:message><xsl:sequence select="$panels"/></xsl:message> -->
	<xsl:variable name="obj_name" select="$panels/panel[1]/@obj_name"/>
	<!-- <xsl:message><xsl:value-of select="$obj_name"/></xsl:message> -->
	<xsl:variable name="region">
		<xsl:choose>
			<xsl:when test="count($panels//*[@obj_name!=$obj_name])">north</xsl:when>
			<xsl:otherwise>center</xsl:otherwise>
		</xsl:choose>
	</xsl:variable>

        <xsl:variable name="menu_bar" select="xp:get_feat($metadata/obj[1],'menu_bar')"/>
       
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


var currentItem = 0;
var maxItem = <xsl:value-of select="count($panels//panel)"/>;


var cardNav = function(incr){

    var l = Ext.getCmp('card-wizard-panel').getLayout();

    currentItem += incr;
    l.setActiveItem(currentItem);

    Ext.getCmp('card-prev').setDisabled(currentItem==0);
    Ext.getCmp('card-next').setDisabled(currentItem==maxItem-1);
};

var cardWizard = {
	id:'card-wizard-panel',
	title: 'Card Layout (Wizard)',
    	layout:'card',
	activeItem: 0,
	region: 'center',
	/*bodyStyle: 'padding:15px',*/
	defaults: {border:true},
	bbar: ['->', {
		id: 'card-prev',
		text: 'Previous', 
		handler: cardNav.createDelegate(this, [-1]),
		disabled: true
	},{
		id: 'card-next',
		text: 'Next', 
		handler: cardNav.createDelegate(this, [1])
	}],
	items: [<xsl:apply-templates select="$panels//panel" mode="panel_list"/>]

};

	var contentPanel = {
		id: 'content-panel',
		region: 'center', /*this is what makes this panel into a region within the containing layout*/
		layout: 'card',
		margins: '2 5 5 0',
		activeItem: 0,
		border: false,
		items: [ cardWizard ]
	};


            App.layout = new Ext.Viewport({
                layout:'border',
		deferredRender: true,
                items:[
			new Ext.Panel({  layout: 'fit', width: '100%', region: 'north', collapsible: false, tbar: App.menu }),
			contentPanel]
            });

	App.layout.show();

	</xsl:template><!--}}}-->

	<xsl:template match="*:model" mode="accordion"><!--{{{-->

            var accordion = new Ext.Panel({
                region:'center',
                margins:'5 0 5 5',
                split:true,
                width: 210,
                layout:'accordion',
		items: [ <xsl:apply-templates select=".//obj/panel" mode="panel_list"/> ]
            });

            App.layout = new Ext.Viewport({
                layout:'border',
                items:[
			new Ext.Panel({  layout: 'fit', width: '100%', region: 'north', collapsible: false, tbar: App.menu }),
			accordion]
            });

	</xsl:template><!--}}}-->

	<xsl:template match="layout"><!--{{{-->
		<xsl:variable name="obj_name" select="../@name"/>
		<xsl:apply-templates select="*">
			<xsl:with-param name="obj_name" select="$obj_name"/>
		</xsl:apply-templates>;
	</xsl:template><!--}}}-->

	<xsl:template match="panel" mode="panel_list"><!--{{{-->

		<xsl:variable name="panel_id">
	               <xsl:choose>
        	               <xsl:when test="@include"><xsl:value-of select="@include"/></xsl:when>
        	               <xsl:when test="@name"><xsl:value-of select="@name"/></xsl:when>
        	               <xsl:when test="@id"><xsl:value-of select="@id"/></xsl:when>
                	       <xsl:otherwise><xsl:value-of select="concat(@obj_name,'_',@type)"/></xsl:otherwise>
	               </xsl:choose>
		</xsl:variable>'<xsl:value-of select="$panel_id"/>'<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template><!--}}}-->

</xsl:stylesheet>

