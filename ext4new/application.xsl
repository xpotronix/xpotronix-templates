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
	xmlns:fn="http://www.w3.org/2005/04/xpath-functions">

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:template match="*:document" mode="application"><!--{{{-->

	<xsl:variable name="code">

		<xsl:apply-templates select="." mode="loader"/>

		var config_App = {state_manager:'http', feat:<xsl:call-template name="app-config"/>,user:<xsl:call-template name="user-session"/>};

		Ext.Ajax.timeout = 60000;
		var App;

		if ( App !== undefined ) {

			App.reconfigure( config_App );

		} else {

			Ext.namespace('App');
			App = Ext.create( 'Ux.xpotronix.xpApp', config_App );
		}

		App.feat.root_obj = '<xsl:value-of select="$root_obj/@name"/>';

		document.title= '<xsl:apply-templates select="$root_obj" mode="translate"/> :: <xsl:value-of select="*:session/feat/page_title[1]"/>';

		<xsl:if test="*:session/feat/theme">
		/* Ext.util.CSS.swapStyleSheet("theme","<xsl:value-of select="*:session/feat/theme"/>"); */
		</xsl:if>

		<xsl:apply-templates select="." mode="defines"/>

		Ext.onReady(function() {

			/* application/viewport */

			Ext.application({

			    requires: ['Ext.container.Viewport'],

			    name: '<xsl:value-of select="$application_name"/>',

			    controllers: [
				'<xsl:value-of select="*:session/feat/module"/>'
			    ],

			    launch: function() {

				<xsl:apply-templates select="." mode="viewport"/>
		    }
		});

	}); /* onReady ends */


	</xsl:variable>
	<!-- output final del codigo -->
		
	<script type="text/javascript">
	<xsl:choose>
		<xsl:when test="//*:session/var/UNNORMALIZED">
			<xsl:value-of select="$code" disable-output-escaping="yes"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="normalize-space($code)" disable-output-escaping="yes"/>
		</xsl:otherwise>
	</xsl:choose>
	</script>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="defines"><!--{{{-->

		<!-- objects -->

		<xsl:apply-templates select="*:metadata/obj" mode="config"/>


		<!-- model -->

		<xsl:for-each select="*:model//obj">

			<xsl:apply-templates select="." mode="model"/>

			<!-- model_eh -->

			<xsl:for-each select="queries/query/query">

				<xsl:apply-templates select="." mode="model_eh"/>

			</xsl:for-each>

		</xsl:for-each>

		<!-- store -->

		<xsl:for-each select="*:model//obj">

			<xsl:apply-templates select="." mode="store"/>

			<!-- store_eh -->

			<xsl:for-each select="queries/query/query">

				<xsl:apply-templates select="." mode="store_eh"/>

			</xsl:for-each>

		</xsl:for-each>

		<!-- panel -->

		<xsl:for-each select="*:model//panel">

			<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>

				<xsl:apply-templates select="." mode="define"/>

		</xsl:for-each>

		<!-- controller -->

		<xsl:apply-templates select="*:model" mode="controller"/>


	</xsl:template><!--}}}-->

	<xsl:template match="*:model" mode="controller"><!--{{{-->

	<xsl:variable name="module" select="//*:session/feat/module"/>

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

/* controller */

	
	Ext.define('<xsl:value-of select="concat($application_name,'.controller.',../*:session/feat/module)"/>', {/*{{{*/

	    extend: 'Ext.app.Controller',

	    views: [<xsl:for-each select=".//panel">'<xsl:apply-templates select="." mode="get_panel_id"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>],

	    stores: [<xsl:for-each select="$items/*">'<xsl:value-of select="concat($module,'.',@name)"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>],

	    models: [<xsl:for-each select="$items/*">'<xsl:value-of select="concat($module,'.',@name)"/>'<xsl:if test="position()!=last()">,</xsl:if></xsl:for-each>],

	    init: function() {
		this.control({});
	    }


	});/*}}}*/


	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="viewport"><!--{{{-->

		<xsl:param name="standalone" select="true()"/>

		<xsl:choose>
			<xsl:when test="*:model/obj/layout">
				<xsl:apply-templates select="*:model/obj/layout">
					<xsl:with-param name="obj" select="*:metadata/obj[1]" tunnel="yes"/>
					<xsl:with-param name="standalone" select="$standalone"/>
				</xsl:apply-templates>
			</xsl:when>

			<xsl:otherwise>
				<xsl:apply-templates select="*:model" mode="viewport">
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

		enabled: false,
		disableCaching: false,
		paths: {
			'Ux.xpotronix': '/ux4/xpotronix',
			'Ext.ux': '/ux4',
			'Ext': '/ext4'
		}
	});

	Ext.require([ 

		'Ext.tip.*', 
		'Ext.Window.*', 
		'Ext.grid.*', 
		'Ext.data.*', 
		'Ext.dd.*' 
	]);

	</xsl:template><!--}}}-->

<!-- extra -->

	<xsl:template match="*:document" mode="defines_files"><!--{{{-->

		<!-- objects -->

		<xsl:apply-templates select="*:metadata/obj" mode="config"/>

		<!-- model -->

		<xsl:for-each select="*:model//obj">

			<xsl:result-document method="text"
			encoding="utf-8"
			href="{concat($application_path,'/',$application_name,'/model/',@name,'.js')}">

			<xsl:apply-templates select="." mode="model"/>

			</xsl:result-document>

			<!-- model_eh -->

			<xsl:for-each select="queries/query/query">

				<xsl:result-document method="text"
				encoding="utf-8"
				href="{concat($application_path,'/',$application_name,'/model/',../from,'_',@name,'.js')}">

				<xsl:apply-templates select="." mode="model_eh"/>

				</xsl:result-document>

			</xsl:for-each>

		</xsl:for-each>

		<!-- store -->

		<xsl:for-each select="*:model//obj">

			<xsl:result-document method="text"
			encoding="utf-8"
			href="{concat($application_path,'/',$application_name,'/store/',@name,'.js')}">

			<xsl:apply-templates select="." mode="store"/>

			</xsl:result-document>

			<!-- store_eh -->

			<xsl:for-each select="queries/query/query">

				<xsl:result-document method="text"
				encoding="utf-8"
				href="{concat($application_path,'/',$application_name,'/store/',../from,'_',@name,'.js')}">

				<xsl:apply-templates select="." mode="store_eh"/>

				</xsl:result-document>

			</xsl:for-each>

		</xsl:for-each>

		<!-- panel -->

		<xsl:for-each select="*:model//panel">

			<xsl:variable name="panel_id"><xsl:apply-templates select="." mode="get_panel_id"/></xsl:variable>

			<xsl:message>****** PANEL_ID: <xsl:value-of select="$panel_id"/></xsl:message>

			<xsl:result-document method="text"
			encoding="utf-8"
			href="{concat($application_path,'/',$application_name,'/view/',$panel_id,'.js')}">

				<xsl:apply-templates select="." mode="define"/>

			</xsl:result-document>

		</xsl:for-each>

		<!-- controller -->

		<xsl:result-document method="text"
		encoding="utf-8"
		href="{concat($application_path,'/',$application_name,'/controller/',*:session/feat/module,'.js')}">
	
			<xsl:apply-templates select="*:model" mode="controller"/>

		</xsl:result-document>


	</xsl:template><!--}}}-->

</xsl:stylesheet>

<!-- vim: foldmethod=marker sw=3 ts=8 ai: 
-->
