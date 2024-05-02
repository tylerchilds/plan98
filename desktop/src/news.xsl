<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
<html> 
<body>
  <xsl:for-each select="rss/channel">
		<h1>
			<xsl:value-of select="title"/>
		</h1>
		<p>
			<xsl:value-of select="description"/>
		</p>
		<xsl:for-each select="item">
			<h2><xsl:value-of select="title"/></h2>
			<time><xsl:value-of select="date"/></time>
      <xsl:call-template name="outputHtml">
        <xsl:with-param name="html" select="description"/>
      </xsl:call-template>
		</xsl:for-each>
	</xsl:for-each>
</body>
</html>
</xsl:template>


<xsl:template name="outputHtml">
  <xsl:param name="html"/>
  <xsl:copy-of select="node()|@*"/>
</xsl:template>

</xsl:stylesheet>

