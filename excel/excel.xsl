<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
xmlns="urn:schemas-microsoft-com:office:spreadsheet"
xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
xmlns:x="urn:schemas-microsoft-com:office:excel">
    <xsl:template match="/">
        <xsl:processing-instruction name="mso-application">progid="Excel.Sheet"</xsl:processing-instruction>
        <Workbook>
            <xsl:apply-templates/>
        </Workbook>
    </xsl:template>
    <xsl:template match="/*">
        <Worksheet ss:Name="{*/*/*[local-name()='docDescription']}">
            <Table x:FullColumns="1" x:FullRows="1">
                <Row>
                    <xsl:for-each select="*/*/*[local-name()='checkItem'][1]//*[not(*)]">
                        <Cell>
                            <Data ss:Type="String">
                                <xsl:value-of select="local-name()"/>
                            </Data>
                        </Cell>
                    </xsl:for-each>
                </Row>
                <xsl:apply-templates select="*/*/*[local-name()='checkItem']"/>
            </Table>
        </Worksheet>
    </xsl:template>
    <xsl:template match="*[local-name()='checkItem']" priority="1">
        <Row>
            <xsl:apply-templates select=".//*[not(*)]"/>
        </Row>
    </xsl:template>
    <xsl:template match="*[not(*)]">
        <Cell>
            <Data ss:Type="String">
                <xsl:value-of select="."/>
            </Data>
        </Cell>
    </xsl:template>
</xsl:stylesheet>
