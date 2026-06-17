Namespace Seis.Windows
    Public Module SeisWindowsPlatform
        Public Function Languages() As String()
            Return New String() {"Visual Basic", "C#", "F#", "PowerShell"}
        End Function

        Public Function IsReadyForSeisAgent(ByVal qualityGateCount As Integer,
                                           ByVal offlineHelper As Boolean,
                                           ByVal remoteBridge As Boolean) As Boolean
            Return qualityGateCount >= 5 AndAlso offlineHelper AndAlso remoteBridge
        End Function
    End Module
End Namespace
