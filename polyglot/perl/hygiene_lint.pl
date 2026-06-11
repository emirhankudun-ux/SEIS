#!/usr/bin/env perl
# SEIS hygiene lint — whitespace & encoding hygiene for source files.
#
# Catches what diff reviews miss: UTF-8 BOMs (break shebangs and JSON
# parsers), CRLF line endings (pollute diffs on a LF repo), trailing
# whitespace, and files missing a final newline (POSIX text files end
# with one; concatenation and `cat` output break otherwise).
#
# Usage:
#   perl polyglot/perl/hygiene_lint.pl FILE...
#   perl polyglot/perl/hygiene_lint.pl --self-test
#
# Exit: 0 clean · 1 findings · 2 unreadable input

use strict;
use warnings;
use File::Temp qw(tempfile);

sub lint_bytes {
    my ($name, $bytes) = @_;
    my @findings;

    push @findings, "$name: UTF-8 BOM at start of file"
        if $bytes =~ /\A\xEF\xBB\xBF/;

    my $crlf = () = $bytes =~ /\r\n/g;
    push @findings, "$name: $crlf CRLF line ending(s)" if $crlf;

    my $trailing = 0;
    for my $line (split /\n/, $bytes, -1) {
        $line =~ s/\r\z//;
        $trailing++ if $line =~ /[ \t]+\z/;
    }
    push @findings, "$name: $trailing line(s) with trailing whitespace" if $trailing;

    push @findings, "$name: missing final newline"
        if length($bytes) && $bytes !~ /\n\z/;

    return @findings;
}

sub lint_file {
    my ($path) = @_;
    open my $fh, '<:raw', $path or do {
        warn "hygiene-lint: cannot open $path: $!\n";
        return (undef);
    };
    local $/;
    my $bytes = <$fh>;
    close $fh;
    return lint_bytes($path, $bytes // '');
}

sub self_test {
    my $failures = 0;
    my $check = sub {
        my ($name, $ok) = @_;
        unless ($ok) { print "  FAIL $name\n"; $failures++ }
    };

    $check->('clean text passes',
        0 == scalar lint_bytes('t', "line one\nline two\n"));
    $check->('BOM detected',
        grep { /BOM/ } lint_bytes('t', "\xEF\xBB\xBFhello\n"));
    $check->('CRLF detected',
        grep { /CRLF/ } lint_bytes('t', "a\r\nb\r\n"));
    $check->('trailing whitespace detected',
        grep { /trailing/ } lint_bytes('t', "a   \nb\t\n"));
    $check->('missing final newline detected',
        grep { /final newline/ } lint_bytes('t', "no newline"));
    $check->('empty file is clean',
        0 == scalar lint_bytes('t', ""));

    # round-trip through a real file handle
    my ($fh, $tmp) = tempfile(UNLINK => 1);
    binmode $fh; print {$fh} "ok\n"; close $fh;
    $check->('file read path works', 0 == scalar lint_file($tmp));

    printf "[%s] hygiene-lint self-test  7 checks, %d failures\n",
        $failures ? 'FAIL' : 'PASS', $failures;
    return $failures ? 1 : 0;
}

if (@ARGV && $ARGV[0] eq '--self-test') {
    exit self_test();
}

die "usage: $0 FILE... | --self-test\n" unless @ARGV;

my (@all, $unreadable);
for my $path (@ARGV) {
    my @findings = lint_file($path);
    if (@findings == 1 && !defined $findings[0]) { $unreadable = 1; next }
    push @all, @findings;
}

if (@all) {
    print "[FAIL] hygiene-lint  ${\ scalar @all} finding(s)\n";
    print "        $_\n" for @all;
    exit 1;
}
print "[PASS] hygiene-lint  ${\ scalar @ARGV} file(s) clean\n";
exit($unreadable ? 2 : 0);
