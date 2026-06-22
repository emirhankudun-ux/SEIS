const PACKAGE_PATH = 'dist/seis-static.zip';
const REDUCED_MOTION_REQUIRED = 1;
const LIVE_UPLOAD_REQUIRES_TARGET = 1;

fn can_upload(target_confirmed: felt252, checksum_matched: felt252) -> felt252 {
    if target_confirmed == 1 && checksum_matched == 1 {
        return 1;
    }
    return 0;
}
