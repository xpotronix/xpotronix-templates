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

	<xsl:include href="html.xsl"/>
	<xsl:include href="includes.xsl"/>
	<xsl:include href="attr.xsl"/>
	<xsl:include href="store.xsl"/>
	<xsl:include href="layout.xsl"/>
	<xsl:include href="panels.xsl"/>
	<xsl:include href="object.xsl"/>
	<xsl:include href="feat.xsl"/>
	<xsl:include href="log.xsl"/>
	<xsl:include href="menubar.xsl"/>
	<xsl:include href="application.xsl"/>

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:output method="text" encoding="UTF-8" indent="no"/>

	<xsl:variable name="session" select="//*:session"/>
	<xsl:variable name="metadata" select="//*:metadata"/>
	<xsl:variable name="model" select="//*:model"/>


	<xsl:param name="root_obj" select="$model/obj[1]"/>
	<xsl:param name="login_window" select="xp:get_feat($root_obj,'login_window')"/>
	<xsl:param name="current_user" select="$session/users/user_username"/>
	<xsl:param name="anon_user" select="$session/users/_anon"/>
	<xsl:param name="application_path" select="'/var/www/sites/xpotronix/xpay'"/>

	<!--<xsl:variable name="application_name" select="upper-case($session/feat/application)"/> -->
	<xsl:variable name="application_name" select="'app'"/>

	<!-- abre archivos de template -->
	<xsl:variable name="template_ext_ui" select="concat($session/feat/base_path,'/templates/ext4/ui.xml')"/>




	<xsl:template match="/"><!--{{{-->

		<!-- <xsl:message><xsl:value-of select="$session/sessions/user_id"/>:<xsl:value-of select="$session/sessions/session_id"/></xsl:message> -->
		<!-- <xsl:message terminate="yes"><xsl:value-of select="$metadata//renderer" disable-output-escaping="yes"/></xsl:message> -->


	<xsl:variable name="code">

		Ext.onReady(function() {

			/* module: <xsl:value-of select="$session/feat/module"/> */

			<xsl:apply-templates select="$metadata/obj" mode="config"/>
			<xsl:apply-templates mode="defines_code"/>

			app.getApplication().getController('<xsl:value-of select="$session/feat/module"/>').init();
			var tmp = <xsl:apply-templates mode="viewport"><xsl:with-param name="standalone" select="false()"/></xsl:apply-templates>
			var tp = Ext.getCmp('mainAppTabPanel');
			var ls = tp.lastSelection;
			console.log( "tabId: " + ls.get('tabId') + ", text: " + ls.get('text') );
			/* debugger; */
			var tab = tp.add( Ext.apply(tmp, 
				{
				/* itemId:ls.get('tabId'), */
				title:ls.get('text'),
				closable:true
			})).show();
			debugger;
			ls.set('tabId',tab.id);

		}); /* Ext.onReady ends */
	</xsl:variable>

	<!-- output final del codigo -->

	<xsl:choose>
		<xsl:when test="$session/var/UNNORMALIZED">
			<xsl:value-of select="$code" disable-output-escaping="yes"/>
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="replace(normalize-space($code),'/\*.*?\*/','')" disable-output-escaping="yes"/>
		</xsl:otherwise>
	</xsl:choose>

	</xsl:template><!--}}}-->

</xsl:stylesheet>


<!-- vim: foldmethod=marker sw=3 ts=8 ai: 
-->
