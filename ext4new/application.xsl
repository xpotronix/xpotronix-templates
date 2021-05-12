<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<!DOCTYPE stylesheet [
<!ENTITY raquo  "&#187;" >
<!ENTITY laquo  "&#186;" >
]>

<xsl:stylesheet version="2.0" 

	xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/" 
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/" 
	xmlns:saxon="http://saxon.sf.net/"
	xmlns:fn="http://www.w3.org/2005/04/xpath-functions">

	<!-- <xsl:preserve-space elements="text"/> -->
		<!-- <xsl:strip-space elements="*"/> -->

	<xsl:template match="*:document" mode="application"><!--{{{-->

	<xsl:apply-templates select="." mode="defines_all_files">
		<xsl:with-param name="to_file" select="true()" tunnel="yes"/>
	</xsl:apply-templates>

	<xsl:variable name="code">

		var App;

		(function() {

		<xsl:apply-templates select="." mode="loader"/>

			Ext.onReady(function() {

				 Ext.isDefined( 'app' ) || Ext.namespace('app', 'app.model', 'app.controller', 'app.store', 'app.view');

				 var config_App = {state_manager:'http', feat:<xsl:call-template name="app-config"/>,user:<xsl:call-template name="user-session"/>};

				 /* Ext.Ajax.timeout = 60000; */

				 if ( App !== undefined ) {

					 App.reconfigure( config_App );

				 } else {

					 App = Ext.create( 'Ux.xpotronix.xpApp', config_App );
				 }

				 App.feat.root_obj = '<xsl:value-of select="$root_obj/@name"/>';

					 document.title= '<xsl:apply-templates select="$root_obj" mode="translate"/> :: <xsl:value-of select="$session/feat/page_title[1]"/>';

				 <xsl:if test="$session/feat/theme">
				 Ext.util.CSS.swapStyleSheet("default-theme","<xsl:value-of select="$session/feat/theme"/>");
				 </xsl:if>

				/* DEFINES START */
				console.log('defines start');

				<xsl:apply-templates select="$metadata/obj" mode="config"/>
				<xsl:apply-templates select="." mode="defines_code"/>

				/* DEFINES STOP */
				console.log('defines end');


				/* application/viewport */

				Ext.application({

					requires: ['Ext.container.Viewport'],
					name: '<xsl:value-of select="$application_name"/>',
					controllers: ['<xsl:value-of select="$session/feat/module"/>'],
					launch: function() {
					<xsl:apply-templates select="." mode="viewport"/>
					}
				});

			}); /* Ext.onReady ends */

		})(); /* function() ends */


	</xsl:variable>
	<!-- output final del codigo -->
		
	<script type="text/javascript">
	<xsl:choose>
		<xsl:when test="$session/var/UNNORMALIZED">
			<xsl:value-of select="$code" disable-output-escaping="yes"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="replace(normalize-space($code),'/\*.*?\*/','')" disable-output-escaping="yes"/>
		</xsl:otherwise>
	</xsl:choose>
	</script>

	<script type="text/javascript" src="/ux4/xpotronix/extensions.js"/>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="defines_all_files"><!--{{{-->

		<xsl:variable name="result_path" select="concat($base_path,'/',$application_name,'/',$session/feat/module,'.js')"/>
		<xsl:message>defines path: <xsl:value-of select="$result_path"/></xsl:message>

		<!-- model & store -->

		<xsl:result-document method="text"
		encoding="utf-8"
		href="{$result_path}">

		<xsl:apply-templates select="." mode="defines_code"/>

		</xsl:result-document>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="defines_code"><!--{{{-->

		<!-- model & store -->

		console.log('model store');

		<xsl:for-each select="$model//obj">

			<xsl:apply-templates select="." mode="model"/>
			<xsl:apply-templates select="." mode="store"/>

		</xsl:for-each>

		<!-- model & store eh -->

		console.log('model store eh');
		<xsl:for-each-group select="$model//queries/query/query" group-by="concat(../from,'_',@name)">

			<xsl:apply-templates select="." mode="model"/>
			<xsl:apply-templates select="." mode="store"/>

		</xsl:for-each-group>

		<!-- panel -->

		console.log('panel');
		<xsl:for-each select="$model//panel">

			<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>

			<xsl:choose>
				<xsl:when test="@include">
					<xsl:apply-templates select="." mode="include"/>
				</xsl:when>
				<xsl:otherwise>
					<xsl:apply-templates select="." mode="define"/>
				</xsl:otherwise>
			</xsl:choose>


		</xsl:for-each>

		<!-- controller -->
		console.log('controller');
		<xsl:apply-templates select="$model" mode="controller"/>

	</xsl:template><!--}}}-->

	<xsl:template name="output"><!--{{{-->

		<xsl:param name="code"/>
		<xsl:param name="class_path"/>
		<xsl:param name="to_file" select="false()" tunnel="yes"/>
		<xsl:param name="normalized" select="false()" tunnel="yes"/>

		<!-- <xsl:message>output: class_path: <xsl:value-of select="$class_path"/> to_file: <xsl:value-of select="$to_file"/>, normalize: <xsl:value-of select="$normalized"/></xsl:message> -->
		<!-- <xsl:message><xsl:value-of select="saxon:print-stack()"/></xsl:message> -->

		<xsl:variable name="code2">
			<xsl:choose>
				<xsl:when test="$normalized">
					<xsl:value-of select="normalize-space($code)"/>
				</xsl:when>
				<xsl:otherwise><xsl:value-of select="$code"/></xsl:otherwise>
			</xsl:choose>
		</xsl:variable>

		<xsl:choose>
			<xsl:when test="$to_file">
				<xsl:result-document method="text" encoding="UTF-8" indent="yes" href="{$class_path}">
					<xsl:value-of select="$code2"/>
				</xsl:result-document>
			</xsl:when>
			<xsl:otherwise><xsl:value-of select="$code2"/></xsl:otherwise>
		</xsl:choose>

	</xsl:template><!--}}}-->

	<xsl:template match="*:model" mode="controller"><!--{{{-->

		<xsl:variable name="module" select="$session/feat/module"/>

		<xsl:variable name="items">
			<xsl:for-each select=".//obj">
				<xsl:element name="model">
					<xsl:attribute name="name" select="@name"/>
				</xsl:element>
				<xsl:for-each select="queries/query/query">
					<xsl:element name="model">
						<xsl:attribute name="name" select="concat(../from,'_',@name)"/>
					</xsl:element>
				</xsl:for-each>
			</xsl:for-each>
		</xsl:variable>

		<xsl:variable name="module_name" select="$session/feat/module"/>
		<xsl:variable name="class_name" select="concat($application_name,'.controller.',$module_name)"/>
		<xsl:variable name="base_path" select="$session/feat/base_path"/>
		<xsl:variable name="class_path" select="concat($base_path,'/',replace($class_name,'\.','/'),'.js')"/>

		<xsl:variable name="code">
		Ext.ClassManager.isCreated( '<xsl:value-of select="$class_name"/>' ) || Ext.define( '<xsl:value-of select="$class_name"/>', {

		    extend: 'Ext.app.Controller',
		    models: [<xsl:for-each select="$items/*">'<xsl:value-of select="concat($module,'.',@name)"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>],
		    stores: [<xsl:for-each select="$items/*">'<xsl:value-of select="concat($module,'.',@name)"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>],
			    views: [<xsl:for-each select=".//panel">'<xsl:value-of select="$module_name"/>.<xsl:choose><xsl:when test="@include"><xsl:value-of select="@include"/></xsl:when><xsl:otherwise><xsl:apply-templates select="." mode="get_panel_id"/></xsl:otherwise></xsl:choose>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>],
		    init: function() {
			this.control({});
		    }

		});

		</xsl:variable>

		<xsl:call-template name="output">
			<xsl:with-param name="class_path" select="$class_path"/>
			<xsl:with-param name="code" select="$code"/>
		</xsl:call-template>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="viewport"><!--{{{-->

		<xsl:param name="standalone" select="true()"/>

		<xsl:variable name="layout"
		select="document($default_template_file)/application/table[@name=$root_obj/@name]/layout"/>

		<!-- <xsl:message terminate="yes">layout:<xsl:copy-of select="$layout"/></xsl:message> -->

		<xsl:choose>

			<xsl:when test="$layout"> 
				<xsl:apply-templates select="$layout"> 
				<xsl:with-param name="obj" select="$metadata/obj[1]" tunnel="yes"/> 
					<xsl:with-param name="standalone" select="true()"/> 
				</xsl:apply-templates> 
			</xsl:when> 


			<xsl:when test="$model/obj/layout">
				<xsl:apply-templates select="$model/obj/layout">
					<xsl:with-param name="obj" select="$metadata/obj[1]" tunnel="yes"/>
					<xsl:with-param name="standalone" select="$standalone"/>
				</xsl:apply-templates>
			</xsl:when>

			<xsl:otherwise>
				<xsl:apply-templates select="$model" mode="viewport">
					<xsl:with-param name="standalone" select="$standalone"/>
				</xsl:apply-templates>
			</xsl:otherwise>

		</xsl:choose>

	</xsl:template><!--}}}-->

<xsl:template match="*:document" mode="body_login"><!--{{{-->
<body class="login">

<script type="text/javascript">

<xsl:apply-templates select="." mode="loader"/>

Ext.namespace( 'App' );

var App = Ext.create( 'Ux.xpotronix.xpApp', {feat: <xsl:call-template name="app-config"/>, user: <xsl:call-template name="user-session"/> } );


Ext.onReady(function(){

	App.login();

});
</script>

<div id="login-container" style="width: 340px;">
	<div id="login-form-box">
		<div id="login-form"></div>
	</div>
</div>

</body>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="loader"><!--{{{-->

			Ext.Loader.setConfig({

				enabled: true,
				disableCaching: false,
				paths: {
					'Ux.xpotronix': '/ux4/xpotronix',
					'Ext.ux': '/ux4',
					'Ext': '/ext4/src'
				}
			});

			Ext.require([ 

				'Ext.tip.*',
				'Ext.Ajax',
				'Ext.data.Request',
				'Ux.xpotronix.xpProxy',
				'Ux.xpotronix.xpPagingToolbar',
				'Ux.xpotronix.xpImageToolbar',
				'Ux.xpotronix.xpCellEditing'
			]);

	</xsl:template><!--}}}-->

</xsl:stylesheet>

<!-- vim: foldmethod=marker sw=3 ts=4 ai: 
-->
