#!/usr/bin/env perl
# SEIS robots.txt auditor — validates robots.txt syntax and content.
#
# Checks:
#   • At least one User-agent: directive present
#   • Disallow: values are empty or start with /
#   • Sitemap: URLs use https://
#   • No HTML tags (would indicate a misconfigured 404 response)
#
# Usage: perl polyglot/perl/robots_txt_audit.pl [--self-test] [file]
# Exit:  0 PASS, 1 FAIL

use strict;
use warnings;

my $ROBOTS_FILE = "apps/web/robots.txt";

sub audit_robots {
    my ($content) = @_;
    my @lines   = split /\n/, $content;
    my @results;

    # User-agent directive present
    my @user_agents = grep { /^User-agent\s*:/i } @lines;
    push @results, { ok    => scalar(@user_agents) > 0,
                     label => "User-agent directive present" };

    # Disallow paths are empty or start with /
    my $bad_disallow = 0;
    for my $line (grep { /^Disallow\s*:/i } @lines) {
        if ($line =~ /^Disallow\s*:\s*(\S.*)$/i) {
            $bad_disallow = 1 unless $1 =~ m{^/};
        }
    }
    push @results, { ok    => !$bad_disallow,
                     label => "Disallow paths are empty or start with /" };

    # Sitemap URLs use https://
    my $bad_sitemap = 0;
    for my $line (grep { /^Sitemap\s*:/i } @lines) {
        if ($line =~ /^Sitemap\s*:\s*(\S+)/i) {
            $bad_sitemap = 1 unless $1 =~ m{^https://};
        }
    }
    push @results, { ok    => !$bad_sitemap,
                     label => "Sitemap URLs use https://" };

    # No HTML tags (not a 404 page)
    push @results, { ok    => ($content !~ /<html|<!DOCTYPE/i),
                     label => "No HTML markup (not a 404 page)" };

    return @results;
}

sub self_test {
    my ($pass, $total) = (0, 0);
    my $check = sub {
        my ($label, $ok) = @_;
        $total++;
        if ($ok) { $pass++ }
        else     { print "  [FAIL] self-test: $label\n" }
    };

    # Good robots.txt
    my $good = "User-agent: *\nDisallow:\n\nSitemap: https://example.com/sitemap.xml\n";
    my @r = audit_robots($good);
    $check->("good robots.txt: all pass", !grep { !$_->{ok} } @r);

    # Missing User-agent
    $check->("missing User-agent detected",
        !!grep { !$_->{ok} && $_->{label} =~ /User-agent/ }
            audit_robots("Disallow: /private/\n"));

    # Invalid Disallow path (no leading /)
    $check->("invalid Disallow path detected",
        !!grep { !$_->{ok} && $_->{label} =~ /Disallow/ }
            audit_robots("User-agent: *\nDisallow: secret/files\n"));

    # Empty Disallow is valid
    $check->("empty Disallow is valid",
        !!grep { $_->{ok} && $_->{label} =~ /Disallow/ }
            audit_robots("User-agent: *\nDisallow:\n"));

    # Non-https Sitemap
    $check->("non-https Sitemap detected",
        !!grep { !$_->{ok} && $_->{label} =~ /Sitemap/ }
            audit_robots("User-agent: *\nDisallow:\nSitemap: http://example.com/sitemap.xml\n"));

    # HTML content (404 page)
    $check->("HTML content detected",
        !!grep { !$_->{ok} && $_->{label} =~ /HTML/ }
            audit_robots("<!DOCTYPE html><html><body>Not Found</body></html>"));

    # Multiple User-agents accepted
    $check->("multiple User-agents accepted",
        !!grep { $_->{ok} && $_->{label} =~ /User-agent/ }
            audit_robots("User-agent: Googlebot\nDisallow: /tmp/\nUser-agent: *\nDisallow:\n"));

    printf "[%s] robots-txt-audit  %d/%d self-tests passed\n",
        ($pass == $total ? "PASS" : "FAIL"), $pass, $total;
    return $pass == $total;
}

# ─── main ────────────────────────────────────────────────────────────────────

if (@ARGV && $ARGV[0] eq '--self-test') {
    exit(self_test() ? 0 : 1);
}

my $file = @ARGV ? $ARGV[0] : $ROBOTS_FILE;

unless (-f $file) {
    print "[FAIL] robots-txt-audit  $file not found\n";
    exit 1;
}

open my $fh, '<:utf8', $file or do {
    print "[FAIL] robots-txt-audit  cannot read $file: $!\n";
    exit 1;
};
my $content = do { local $/; <$fh> };
close $fh;

unless (length($content) > 0) {
    print "[FAIL] robots-txt-audit  $file is empty\n";
    exit 1;
}

my @results  = audit_robots($content);
my @failures = grep { !$_->{ok} } @results;

my @directives = grep { /\S/ && !/^\s*#/ } split /\n/, $content;
printf "       %s: %d directive line(s)\n", $file, scalar(@directives);

if (!@failures) {
    printf "[PASS] robots-txt-audit  %d/%d checks passed\n",
        scalar(@results), scalar(@results);
} else {
    printf "[FAIL] robots-txt-audit  %d check(s) failed:\n", scalar(@failures);
    print  "       failed: $_->{label}\n" for @failures;
    exit 1;
}
