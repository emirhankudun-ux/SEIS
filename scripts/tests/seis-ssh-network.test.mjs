import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { isLocalOrLanHost } from "../lib/seis-ssh-network.mjs";

describe("SEIS-SSH network boundary", () => {
  it("blocks localhost and the complete IPv4 loopback range", () => {
    for (const host of ["localhost", "localhost.", "dev.localhost", "127.0.0.1", "127.0.0.2", "127.255.255.254"]) {
      assert.equal(isLocalOrLanHost(host), true, host);
    }
  });

  it("blocks private, link-local, and unspecified addresses", () => {
    for (const host of ["0.0.0.0", "10.1.2.3", "100.64.0.1", "100.127.255.254", "127.0.0.2", "172.16.0.1", "172.31.255.254", "192.168.1.8", "169.254.20.1", "224.0.0.1", "255.255.255.255", "::", "::1", "fc00::1", "fd12::1", "fe80::1", "::ffff:10.1.2.3", "::ffff:127.0.0.2", "workspace.local"]) {
      assert.equal(isLocalOrLanHost(host), true, host);
    }
  });

  it("keeps public and GitHub Codespaces host shapes eligible", () => {
    for (const host of ["github.codespaces", "ssh.example.com", "203.0.113.10", "2001:db8::10"]) {
      assert.equal(isLocalOrLanHost(host), false, host);
    }
  });
});
