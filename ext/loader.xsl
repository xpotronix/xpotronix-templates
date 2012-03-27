<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<!-- viewport.xsl

plantilla de interfaz usuario
eduardo spotorno, julio 2007

con musica de Schubert por Claudio Arrau

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

	<xsl:include href="html.xsl"/>
	<xsl:include href="includes.xsl"/>
	<xsl:include href="attr.xsl"/>
	<xsl:include href="store.xsl"/>
	<xsl:include href="layout.xsl"/>
	<xsl:include href="panels.xsl"/>
	<xsl:include href="object.xsl"/>
	<xsl:include href="feat.xsl"/>
	<xsl:include href="log.xsl"/>

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:output method="text" version="4.0" encoding="UTF-8" indent="no"/>

	<xsl:param name="root_obj" select="//*:metadata/obj[1]"/>
	<xsl:param name="login_window" select="xp:get_feat($root_obj,'login_window')"/>
	<xsl:param name="current_user" select="//*:session/users/user_username"/>

	<xsl:variable name="session" select="//*:session"/>

	<xsl:template match="/"><!--{{{-->
		<xsl:apply-templates select="." mode="js_code"/>
	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="js_code"><!--{{{-->
	
	<xsl:variable name="code">

	<xsl:if test="//xpotronix:session/var/EVENTS_MONITOR=1">
		<xsl:call-template name="events_monitor"/>
	</xsl:if>


	/* shortcuts */

        var fm = Ext.form, Ed = Ext.grid.GridEditor;

	<xsl:if test="//xpotronix:session/feat/theme">
		Ext.util.CSS.swapStyleSheet("theme","<xsl:value-of select="//xpotronix:session/feat/theme"/>");
	</xsl:if>


	Ext.Ajax.timeout = 60000;	

	var config_App = {state_manager:'http', feat:<xsl:call-template name="app-config"/>,user:<xsl:call-template name="user-session"/>};

	if ( App ) {

		App.reconfigure( config_App );

	} else {

		Ext.namespace('App');
		var App = new Ext.ux.xpotronix.xpApp();
	}
		


	Ext.onReady(function() {

		document.title= '<xsl:apply-templates select="$root_obj" mode="translate"/> :: <xsl:value-of select="//feat/page_title[1]"/>';

		var wait = new Ext.LoadMask(document.body, {msg:'Aguarde por favor ...'});
		wait.show();

	<xsl:apply-templates select="*:model" mode="stores"/>

	<xsl:apply-templates select="*:metadata/obj" mode="config"/>

	<xsl:apply-templates select="*:metadata/obj" mode="panels"/>

	<xsl:choose>
		<xsl:when test="//*:model/obj/layout">
			<xsl:apply-templates select="//*:model/obj/layout">
				<xsl:with-param name="obj" select="//*:metadata/obj[1]" tunnel="yes"/>
			</xsl:apply-templates>
		</xsl:when>
		<xsl:otherwise>
			<xsl:apply-templates select="*:model" mode="viewport"/>
		</xsl:otherwise>
	</xsl:choose>

		var events_js = [<xsl:apply-templates select="*:metadata/obj/files/file[@type='js' and @mode='events']" mode="include-array-js"/>];

		if ( events_js.length )
			Ext.Loader.load( events_js, function() { App.fireEvent('configready'); } );
		else 
			App.fireEvent('configready');

		var post_render_js = [<xsl:apply-templates select="*:metadata/obj/files/file[@type='js' and @mode='post_render']" mode="include-array-js"/>];

		if ( post_render_js.length ) 
			Ext.Loader.load( post_render_js );

		wait.hide();

	});
	</xsl:variable>
	<!-- output final del codigo -->

		
	<script type="text/javascript">
	<xsl:choose>
		<xsl:when test="//xpotronix:session/var/UNNORMALIZED=1">
			<xsl:value-of select="$code" disable-output-escaping="yes"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="normalize-space($code)" disable-output-escaping="yes"/>
		</xsl:otherwise>
	</xsl:choose>
	</script>

	</xsl:template><!--}}}-->

</xsl:stylesheet>

<!-- vim: foldmethod=marker sw=3 ts=8 ai: 
-->
