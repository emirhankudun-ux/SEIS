<?xml version="1.0" encoding="UTF-8"?>
<!--
  SEIS Release Policy — XSLT 2.0
  Transforms a release gate XML document into an accessible HTML report.
-->
<xsl:stylesheet
  version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:seis="https://seis.emirhankudun.com/schema/release"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  exclude-result-prefixes="seis xs">

  <xsl:output method="html" version="5" encoding="UTF-8" indent="yes"/>

  <!-- ─── Parameters ──────────────────────────────────────────────── -->
  <xsl:param name="motion-mode" as="xs:string" select="'full'"/>
  <xsl:param name="base-url"    as="xs:string" select="'/'"/>

  <!-- ─── Motion Duration Resolver ──────────────────────────────── -->
  <xsl:function name="seis:motion-duration-ms" as="xs:integer">
    <xsl:param name="token" as="xs:string"/>
    <xsl:param name="mode"  as="xs:string"/>

    <xsl:variable name="base" as="xs:integer">
      <xsl:choose>
        <xsl:when test="$token = 'instant'">0</xsl:when>
        <xsl:when test="$token = 'fast'">150</xsl:when>
        <xsl:when test="$token = 'standard'">300</xsl:when>
        <xsl:when test="$token = 'slow'">500</xsl:when>
        <xsl:when test="$token = 'cinematic'">800</xsl:when>
        <xsl:otherwise>300</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>

    <xsl:sequence select="if ($mode = ('reduced','manual-low')) then 0 else $base"/>
  </xsl:function>

  <!-- ─── Root Template ───────────────────────────────────────────── -->
  <xsl:template match="/seis:releaseGate | /releaseGate">
    <xsl:variable name="status"     select="(status | seis:status)/text()"/>
    <xsl:variable name="version"    select="(version | seis:version)/text()"/>
    <xsl:variable name="can-deploy" select="(canDeploy | seis:canDeploy) = 'true'"/>
    <xsl:variable name="motion"     select="$motion-mode"/>

    <xsl:variable name="std-ms"  select="seis:motion-duration-ms('standard', $motion)"/>
    <xsl:variable name="fast-ms" select="seis:motion-duration-ms('fast', $motion)"/>

    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>SEIS Release Gate — <xsl:value-of select="$version"/></title>
        <style>
          :root {
            --motion-standard: <xsl:value-of select="$std-ms"/>ms;
            --motion-fast:     <xsl:value-of select="$fast-ms"/>ms;
          }
        </style>
        <link rel="stylesheet" href="{$base-url}styles/release-policy.css"/>
      </head>
      <body class="motion-mode--{$motion}">
        <main id="main-content" class="page">

          <header class="page__header">
            <h1 class="page__title">SEIS Release Gate</h1>
            <span class="release-badge release-badge--{$status}"
                  role="status"
                  aria-label="Release status: {$status}">
              <xsl:value-of select="upper-case($status)"/>
            </span>
          </header>

          <xsl:if test="$motion = ('reduced','manual-low')">
            <aside class="motion-notice" role="note">
              Reduced-motion mode active — animations suppressed.
            </aside>
          </xsl:if>

          <section class="release-gate" aria-labelledby="gate-heading">
            <h2 id="gate-heading">
              <xsl:value-of select="$version"/> — Deploy Readiness
            </h2>

            <dl class="release-meta">
              <xsl:for-each select="branch | commitSha | deployer | environment">
                <dt><xsl:value-of select="local-name()"/></dt>
                <dd><xsl:value-of select="."/></dd>
              </xsl:for-each>
            </dl>

            <ul class="release-gate__checks" aria-label="Readiness checks">
              <xsl:apply-templates select="checks/check | seis:checks/seis:check"/>
            </ul>

            <xsl:choose>
              <xsl:when test="$can-deploy">
                <p class="gate-summary gate-summary--ready" role="status">
                  All checks passed — deploy ready.
                </p>
              </xsl:when>
              <xsl:otherwise>
                <p class="gate-summary gate-summary--blocked" role="alert">
                  <xsl:value-of select="blockedReason | seis:blockedReason"/>
                </p>
              </xsl:otherwise>
            </xsl:choose>
          </section>

        </main>
        <footer class="page__footer" role="contentinfo">
          <p>SEIS — cinematic, minimal, accessible.</p>
        </footer>
      </body>
    </html>
  </xsl:template>

  <!-- ─── Check Item Template ─────────────────────────────────────── -->
  <xsl:template match="check | seis:check">
    <xsl:variable name="passed" select="(passed | seis:passed) = 'true'"/>
    <xsl:variable name="label"  select="if ($passed) then 'passed' else 'failed'"/>
    <li class="check check--{$label}"
        aria-label="{(name | seis:name)/text()}: {$label}">
      <span class="check__icon" aria-hidden="true">
        <xsl:value-of select="if ($passed) then '✓' else '✗'"/>
      </span>
      <span class="check__name">
        <xsl:value-of select="name | seis:name"/>
      </span>
    </li>
  </xsl:template>

</xsl:stylesheet>
