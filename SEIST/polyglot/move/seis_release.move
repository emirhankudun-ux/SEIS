module seis::release_contract {
    const PACKAGE_PATH: vector<u8> = b"dist/seis-static.zip";
    const REDUCED_MOTION_REQUIRED: bool = true;
    const LIVE_UPLOAD_REQUIRES_TARGET: bool = true;

    public fun package_path(): vector<u8> {
        PACKAGE_PATH
    }

    public fun can_upload(target_confirmed: bool, checksum_matched: bool): bool {
        target_confirmed && checksum_matched
    }
}
