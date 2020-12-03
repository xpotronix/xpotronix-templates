<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<!-- calendar.xsl

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

	<xsl:output method="html" version="4.0" encoding="UTF-8" indent="no"/>

	<xsl:include href="feat.xsl"/>
	<xsl:include href="includes.xsl"/>
	<xsl:include href="html.xsl"/>
	
	<xsl:template match="/"><xsl:value-of select="$doctype_decl_strict" disable-output-escaping="yes"/><xsl:text>
</xsl:text>
<html>
<head>
	<title id="page-title"><xsl:value-of select="$session/feat/page_title"/></title>

	<xsl:apply-templates select="." mode="meta"/>
	<xsl:apply-templates select="." mode="title"/>
	<xsl:apply-templates select="." mode="favicon"/>

	<link rel="stylesheet" type="text/css" href="/ext/resources/css/ext-all.css"/>
	<link rel="stylesheet" type="text/css" href="/ux/calendar/css/calendar_core.css" />
	<link rel="stylesheet" type="text/css" href="css/calendar.css" />

	<xsl:apply-templates select="." mode="include-ext-js"/>

</head>
<body>
	<xsl:variable name="obj" select="$metadata/obj[1]"/>
	<xsl:variable name="login_window" select="xp:get_feat($obj,'login_window')"/>
	<xsl:message>login_window: <xsl:value-of select="$login_window"/></xsl:message>
	<xsl:message><xsl:value-of select="$session/sessions/user_id"/>:<xsl:value-of select="$session/sessions/session_id"/></xsl:message>
	<xsl:if test="$session/feat/theme">
	<script type="text/javascript">
		/* Ext.util.CSS.swapStyleSheet("theme","<xsl:value-of select="$session/feat/theme"/>"); */
	</script>
	</xsl:if>
	<xsl:choose>
	<xsl:when test="($login_window='true') and (number($session/sessions/user_id) le 0)">
	<script type="text/javascript" src="/ux/xpotronix/xpApp.js"></script>
	<script type="text/javascript">
		Ext.onReady(function(){
	       	 	Ext.namespace( 'App' );
	        	var App = new Ext.ux.xpotronix.xpApp( {feat: <xsl:call-template name="app-config"/>, user: <xsl:call-template name="user-session"/> } );
	        	App.login();
		});
	</script>
	</xsl:when>
	<xsl:otherwise>
		<!-- define the default language here -->    
		<script type="text/javascript" src="/ux/calendar/common/CONST_XPOTRONIX.js"></script>
		<!-- <script type="text/javascript" src="/ux/calendar/holiday/ChineseHoliday.js"></script> -->
		<script type="text/javascript" src="/ux/calendar/common/LanManager.js"></script>
		<script type="text/javascript" src="/ux/calendar/common/Mask.js"></script>
		<script type="text/javascript" src="/ux/calendar/common/RepeatType.js"></script>
		<script type="text/javascript" src="/ux/calendar/DataSource.js"></script>
		<!-- <script type="text/javascript" src="/ux/calendar/calendar_core.js"></script> -->


		<script type="text/javascript" src="/ux/calendar/util/LabelField.js"></script>
		<script type="text/javascript" src="/ux/calendar/util/DatePicker.js"></script>
		<script type="text/javascript" src="/ux/calendar/util/SearchField.js"></script>

		<script type="text/javascript" src="/ux/calendar/CommentTip.js"></script>
		<script type="text/javascript" src="/ux/calendar/BasicView.js"></script>
		<script type="text/javascript" src="/ux/calendar/layout/Block.js"></script>
		<script type="text/javascript" src="/ux/calendar/layout/BlockMap.js"></script>
		<script type="text/javascript" src="/ux/calendar/layout/Line.js"></script>
		<script type="text/javascript" src="/ux/calendar/layout/LayoutGrid.js"></script>
		<script type="text/javascript" src="/ux/calendar/layout/CalendarLayout.js"></script>
		<script type="text/javascript" src="/ux/calendar/DataSource.js"></script>
		<script type="text/javascript" src="/ux/calendar/BackThread.js"></script>
		<script type="text/javascript" src="/ux/calendar/ExpirePopup.js"></script>
		<script type="text/javascript" src="/ux/calendar/SettingPopup.js"></script> 	
		<script type="text/javascript" src="/ux/calendar/Editor.js"></script>
		<script type="text/javascript" src="/ux/calendar/DetailEditor.js"></script>
		<script type="text/javascript" src="/ux/calendar/CalendarEditor.js"></script>
		<script type="text/javascript" src="/ux/calendar/EventHandler.js"></script>
		<script type="text/javascript" src="/ux/calendar/DayView.js"></script>
		<script type="text/javascript" src="/ux/calendar/HolidayView.js"></script>
		<script type="text/javascript" src="/ux/calendar/ResultView.js"></script>
		<script type="text/javascript" src="/ux/calendar/MonthView.js"></script>
		<script type="text/javascript" src="/ux/calendar/ResultView.js"></script>
		<script type="text/javascript" src="/ux/calendar/CalendarContainer.js"></script>
		<script type="text/javascript" src="/ux/calendar/WestPanel.js"></script>
		<script type="text/javascript" src="/ux/calendar/MainPanel.js"></script>
		<script type="text/javascript" src="/ux/calendar/CalendarWin.js"></script>
		<script type="text/javascript" src="/ux/calendar/Viewer-tabpanel.js"></script>


	</xsl:otherwise>
	</xsl:choose>
</body>
</html></xsl:template>
</xsl:stylesheet>
