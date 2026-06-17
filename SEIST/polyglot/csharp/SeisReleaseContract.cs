namespace Seis.Polyglot;

public sealed record SeisReleaseContract(
    string PackagePath,
    long PackageBytes,
    string Sha256,
    string DeployStatus,
    bool LiveUploadBlocked
)
{
    public bool IsPreservable => PackageBytes > 0 && !string.IsNullOrWhiteSpace(Sha256);
}
