-module(seis_native_kernel).
-export([roadmap/0, top_lane/0]).

roadmap() ->
    [
        #{lane => "Apple First", score => 100, language => "Swift"},
        #{lane => "Data AI", score => 88, language => "Python"},
        #{lane => "Systems", score => 84, language => "Rust"},
        #{lane => "Android", score => 76, language => "Kotlin"},
        #{lane => "Windows", score => 72, language => "CSharp"},
        #{lane => "Infrastructure", score => 70, language => "Go"}
    ].

top_lane() ->
    hd(roadmap()).
