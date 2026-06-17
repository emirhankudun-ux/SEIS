Public Structure SeisReleasePolicy
    Public ReducedMotionRequired As Boolean
    Public DependencyBudgetLocked As Boolean
    Public LiveUploadRequiresTarget As Boolean
End Structure

Module SeisPolicyModule
    Public ReadOnly DefaultPolicy As New SeisReleasePolicy With {
        .ReducedMotionRequired = True,
        .DependencyBudgetLocked = True,
        .LiveUploadRequiresTarget = True
    }
End Module
