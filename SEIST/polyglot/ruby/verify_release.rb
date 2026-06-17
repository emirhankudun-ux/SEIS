require "digest"
require "json"

root = ARGV[0] || "dist"
package_path = File.join(root, "seis-static.zip")
manifest_path = File.join(root, "server-upload-manifest.json")

abort("missing package") unless File.file?(package_path)
abort("missing manifest") unless File.file?(manifest_path)

manifest = JSON.parse(File.read(manifest_path))
digest = Digest::SHA256.file(package_path).hexdigest
abort("sha256 mismatch") unless digest == manifest["sha256"]

puts JSON.pretty_generate({
  ok: true,
  package: package_path,
  sha256: digest,
  bytes: File.size(package_path)
})

