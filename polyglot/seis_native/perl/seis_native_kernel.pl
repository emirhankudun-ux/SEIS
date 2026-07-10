use strict;
use warnings;

my @roadmap = (
    { lane => 'Apple First', score => 100, language => 'Swift' },
    { lane => 'Data AI', score => 88, language => 'Python' },
    { lane => 'Systems', score => 84, language => 'Rust' },
    { lane => 'Android', score => 76, language => 'Kotlin' },
    { lane => 'Windows', score => 72, language => 'CSharp' },
    { lane => 'Infrastructure', score => 70, language => 'Go' },
);

sub top_lane {
    return $roadmap[0];
}

1;
