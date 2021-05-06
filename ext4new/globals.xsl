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

	xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/" 
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/" 
	xmlns:fn="http://www.w3.org/2005/04/xpath-functions">



	<xsl:param name="application_path" select="'/var/www/sites/xpotronix/alimentos4'"/>

	<xsl:variable name="application_name" select="'app'"/>
	<xsl:variable name="default_template" select="'ext4'"/>

    <xsl:variable name="session" select="//*:session"/>
    <xsl:variable name="metadata" select="//*:metadata"/>
    <xsl:variable name="model" select="//*:model"/>
	<!-- <xsl:variable name="application_name" select="upper-case($session/feat/application)"/> -->

	<xsl:param name="root_obj" select="$model/obj[1]"/>
	<xsl:param name="login_window" select="xp:get_feat($root_obj,'login_window')"/>
	<xsl:param name="current_user" select="$session/users/user_username"/>
	<xsl:param name="anon_user" select="$session/users/_anon"/>

	<!-- abre archivos de template -->
	<xsl:variable name="default_template_file" select="concat($application_path,'/conf/',$default_template,'-ui.xml')"/>

</xsl:stylesheet>



