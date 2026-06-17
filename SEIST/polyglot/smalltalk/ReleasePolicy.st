Object subclass: #SeisReleasePolicy
    instanceVariableNames: ''
    classVariableNames: ''
    package: 'SEIS-ReleasePolicy'.

SeisReleasePolicy class >> serverTargetConfirmed [
    ^ false
]

SeisReleasePolicy class >> readyForUploadWithAccessibility: accessibilityReviewed rollback: rollbackPlanned [
    ^ self serverTargetConfirmed & accessibilityReviewed & rollbackPlanned
]
