<?xml version="1.0" encoding="UTF-8"?>

<!--
	@package xpotronix
	@version 2.0 - Areco 
	@copyright Copyright &copy; 2003-2011, Eduardo Spotorno
	@author Eduardo Spotorno
 
	Licensed under GPL v3
	@license http://www.gnu.org/licenses/gpl-3.0.txt
-->

<!-- includes.xsl

	xpotronix (c) 2011

-->

<xsl:stylesheet version="2.0" 

	xmlns="http://www.w3.org/1999/xhtml"
	xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
	xmlns:xpotronix="http://xpotronix.com/namespace/xpotronix/" 
	xmlns:xp="http://xpotronix.com/namespace/xpotronix/functions/" 
	xmlns:fn="http://www.w3.org/2005/04/xpath-functions">

	<!-- <xsl:preserve-space elements="text"/> -->
	<!-- <xsl:strip-space elements="*"/> -->

	<xsl:template match="*:document" mode="include-all-css"><!--{{{-->

		<!-- ext -->

		<link rel="stylesheet" type="text/css" href="/ext4/resources/css/ext-all.css" />
		<!-- <link rel="stylesheet" type="text/css" href="/ext4/resources/ext-theme-neptune/ext-theme-neptune-all.css" /> -->
		<!-- <link rel="stylesheet" type="text/css" href="/ext4/resources/ext-theme-access/ext-theme-access-all.css" /> -->

                <link rel="stylesheet" type="text/css" href="/ux4/DataView/DragSelector.css" />

		<!-- filterbar css -->

                <link rel="stylesheet" type="text/css" href="/ux4/resources/css/uxs.css" />
                <link rel="stylesheet" type="text/css" href="/ux4/resources/css/overrides.css" />
                <link rel="stylesheet" type="text/css" href="/ux4/resources/css/app.css" />


	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-ext-js"><!--{{{-->

		<xsl:choose>
			<xsl:when test="//*:session/var/EXT_DEBUG=1">
    				<script type="text/javascript" src="/ext4/ext-all-debug-w-comments.js"></script>
    				<!-- <script type="text/javascript" src="/ext4/ext-debug.js"></script> -->
			</xsl:when>
			<xsl:otherwise>
    				<script type="text/javascript" src="/ext4/ext-all.js"></script>
			</xsl:otherwise>
		</xsl:choose>

		<script type="text/javascript" src="/ux4/state/HttpProvider4.js"></script>
		<script type="text/javascript" src="/ux4/util.js"></script>

                
		<!-- FilterBar -->
		<script type="text/javascript" src="/ux4/form/field/ClearButton.js"></script>
                <script type="text/javascript" src="/ux4/form/field/OperatorButton.js"></script>
                <script type="text/javascript" src="/ux4/grid/column/ActionPro.js"></script>
                <script type="text/javascript" src="/ux4/grid/FilterBar.js"></script>
                <script type="text/javascript" src="/ux4/grid/AutoResizer.js"></script>


	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-xpotronix-js"><!--{{{-->

		<!-- ux -->

		<xsl:choose>
			<xsl:when test="//*:session/var/EXT_DEBUG=1">
			    	<!-- <script type="text/javascript" src="/ext4/examples/ux/ux-all-debug.js"></script> -->
			</xsl:when>
			<xsl:otherwise>
			    	<!-- <script type="text/javascript" src="/ext4/examples/ux/ux-all.js"></script> -->
			</xsl:otherwise>
		</xsl:choose>

		<script type="text/javascript" src="/ux4/xpotronix/misc.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpCellEditing.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpPagingToolbar.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpComboBox.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpProxy.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpApp.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpObj.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpGrid.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpForm.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpPanel.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpStore.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpImageViewer.js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpImageToolbar.js"/>

		<script type="text/javascript" src="/ux4/xpotronix/xpThumbs.js"/>
		<script type="text/javascript" src="/ux4/DataView/DragSelector.js"/>
		<script type="text/javascript" src="/ux4/DataView/LabelEditor.js"/>
	
		<!-- DateTimeField -->

		<!-- 
		<script type="text/javascript" src="/ux4/form/datetime/UX_TimePickerField.js"></script>
		<script type="text/javascript" src="/ux4/form/datetime/UX_DateTimePicker.js"></script>
		<script type="text/javascript" src="/ux4/form/datetime/UX_DateTimeField.js"></script>
		<script type="text/javascript" src="/ux4/form/datetime/UX_DateTimeMenu.js"></script> -->

		<script type="text/javascript" src="/ux4/form/DateTimePicker.js"></script>
		<script type="text/javascript" src="/ux4/form/DateTimeField.js"></script>

		<script type="text/javascript" src="/ux4/xpotronix/extensions.js"/>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-all-js"><!--{{{-->

		<xsl:apply-templates select="." mode="include-ext-js"/>
		<xsl:apply-templates select="." mode="include-xpotronix-js"/>

	</xsl:template><!--}}}-->

	<xsl:template match="file" mode="include-js"><!--{{{-->
		<xsl:variable name="base_dir" select="substring-before(substring-after(//*:session/server/PHP_SELF,'/'),'/')"/>
		<xsl:element name="script">
			<xsl:attribute name="type" select="'text/javascript'"/>
			<xsl:attribute name="src" select="@name"/>
		</xsl:element>
	</xsl:template>	<!--}}}-->

	<xsl:template match="file" mode="include-array-js"><!--{{{-->
			'<xsl:value-of select="@name"/>'<xsl:if test="position()!=last()">,</xsl:if>
	</xsl:template>	<!--}}}-->

	<xsl:template match="*:document" mode="include-ext-js-old"><!--{{{-->

		<!-- <script type="text/javascript" src="/ext4/compatibility/ext3-core-compat.js"></script> -->
		<!-- <script type="text/javascript" src="/ext4/compatibility/ext3-compat.js"></script> -->
		
		<!-- <script type="text/javascript" src="/ext4/src/locale/ext-lang-es.js"></script> -->
		<!-- <script type="text/javascript" src="/ext4/src/ext-core/src/core/Loader.js"></script> -->
		<script type="text/javascript" src="/ux4/state/HttpProvider4.js"></script>
		<script type="text/javascript" src="/ux4/util.js"></script>
		<script type="text/javascript">
		</script>


		<xsl:if test="//cmp[@type='ux.GMapPanel3']">
			<script type="text/javascript" src="http://maps.google.com.ar/maps/api/js?sensor=false"></script> 
			<script type="text/javascript" src="/ux4/map/Ext.ux.GMapPanel3.js"></script>
		</xsl:if>

	</xsl:template><!--}}}-->

	<xsl:template match="*:document" mode="include-login-js"><!--{{{-->
		<xsl:apply-templates select="." mode="include-ext-js"/>
		<script type="text/javascript" src="/ux4/xpotronix/xpApp.js"/>
	</xsl:template><!--}}}-->

</xsl:stylesheet>
