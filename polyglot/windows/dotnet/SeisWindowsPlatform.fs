namespace Seis.Windows

type Capability =
    { Id: string
      Languages: string list
      QualityGates: string list
      OfflineHelper: bool
      RemoteBridge: bool }

module SeisWindowsPlatform =
    let capability =
        { Id = "windows-dotnet-fsharp"
          Languages = [ "F#"; "C#"; "Visual Basic"; "PowerShell" ]
          QualityGates =
            [ "dotnet_readiness"
              "windows_path_safety"
              "permission_scope"
              "offline_fallback"
              "event_log_awareness" ]
          OfflineHelper = true
          RemoteBridge = true }

    let isReady capability =
        capability.Languages.Length >= 4
        && capability.QualityGates.Length >= 5
        && capability.OfflineHelper
        && capability.RemoteBridge
