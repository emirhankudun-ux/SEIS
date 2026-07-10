Object subclass: #SeisNativeKernel
    instanceVariableNames: ''
    classVariableNames: ''
    package: 'SEIS-NativeKernel'.

SeisNativeKernel class >> roadmap
    ^ #(
        ('Apple First' 100 'Swift')
        ('Data AI' 88 'Python')
        ('Systems' 84 'Rust')
        ('Android' 76 'Kotlin')
        ('Windows' 72 'CSharp')
        ('Infrastructure' 70 'Go')
    ).

SeisNativeKernel class >> topLane
    ^ self roadmap first.
