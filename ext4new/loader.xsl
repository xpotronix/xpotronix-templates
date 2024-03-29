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

	<xsl:include href="globals.xsl"/>

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:output method="text" encoding="UTF-8" indent="no"/>

	<xsl:template match="/"><!--{{{-->

		<!-- <xsl:message><xsl:value-of select="$session/sessions/user_id"/>:<xsl:value-of select="$session/sessions/session_id"/></xsl:message> -->
		<!-- <xsl:message terminate="yes"><xsl:value-of select="$metadata//renderer" disable-output-escaping="yes"/></xsl:message> -->


		<xsl:variable name="code">/* ext4/loader module: <xsl:value-of select="$session/feat/module"/> */

Ext.onReady(function() {

	/* DEFINES START */
	console.log('defines start');

	<xsl:apply-templates select="$metadata/obj" mode="config"/>
	<xsl:apply-templates select="." mode="defines_code"/>


	/* DEFINES END */
	console.log('defines end');

	app.getApplication().getController('<xsl:value-of select="$session/feat/module"/>').init();

	/* VIEWPORT */
	var tmp = <xsl:apply-templates mode="viewport">
		<xsl:with-param name="standalone" select="false()"/>
	</xsl:apply-templates>
	/* VIEWPORT END */

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
		/* debugger; */
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
