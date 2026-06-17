use strict;
use warnings;
use JSON::PP;

my $manifest_path = "dist/server-upload-manifest.json";
die "missing manifest\n" unless -f $manifest_path;

open my $fh, "<", $manifest_path or die "cannot read manifest\n";
my $payload = do { local $/; <$fh> };
my $manifest = decode_json($payload);

die "missing sha256\n" unless length($manifest->{sha256} // "") == 64;
die "live upload must stay blocked without target\n"
  unless ($manifest->{liveUploadBlocked} // 0);

print "SEIS Perl manifest contract passed\n";
