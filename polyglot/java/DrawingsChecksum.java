/**
 * SEIS drawings checksum ledger — SHA-256 integrity manifest for the
 * curated artwork. The drawings are the portfolio's irreplaceable assets;
 * a silent bit-flip or accidental re-export would ship corrupted art.
 *
 * Modes:
 *   emit   <dir>             print "sha256␣␣relative-path" lines, sorted
 *   verify <dir> <manifest>  recompute and diff against a saved manifest
 *   --self-test              run embedded vectors + tmpdir round-trip
 *
 * Runs directly on Java 11+:  java polyglot/java/DrawingsChecksum.java …
 */
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public final class DrawingsChecksum {

    static String sha256Hex(byte[] data) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(data);
            StringBuilder hex = new StringBuilder(64);
            for (byte b : digest) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }

    /** Sorted relative-path → digest map for every regular file under dir. */
    static Map<String, String> ledger(Path dir) throws IOException {
        Map<String, String> entries = new TreeMap<>();
        try (Stream<Path> walk = Files.walk(dir)) {
            List<Path> files = walk.filter(Files::isRegularFile).collect(Collectors.toList());
            for (Path f : files) {
                String rel = dir.relativize(f).toString().replace('\\', '/');
                entries.put(rel, sha256Hex(Files.readAllBytes(f)));
            }
        }
        return entries;
    }

    static String render(Map<String, String> entries) {
        StringBuilder out = new StringBuilder();
        entries.forEach((rel, digest) -> out.append(digest).append("  ").append(rel).append('\n'));
        return out.toString();
    }

    static Map<String, String> parseManifest(String text) {
        Map<String, String> entries = new LinkedHashMap<>();
        for (String line : text.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.startsWith("#")) continue;
            int gap = trimmed.indexOf("  ");
            if (gap == 64) entries.put(trimmed.substring(gap + 2), trimmed.substring(0, 64));
        }
        return entries;
    }

    /** @return human-readable problems; empty list means verified. */
    static List<String> verify(Map<String, String> current, Map<String, String> expected) {
        List<String> problems = new ArrayList<>();
        expected.forEach((rel, digest) -> {
            String actual = current.get(rel);
            if (actual == null) problems.add("missing: " + rel);
            else if (!actual.equals(digest)) problems.add("changed: " + rel);
        });
        current.keySet().stream()
            .filter(rel -> !expected.containsKey(rel))
            .forEach(rel -> problems.add("untracked: " + rel));
        return problems;
    }

    static int selfTest() throws IOException {
        int failures = 0;

        // NIST-style known answer: sha256("abc")
        String abc = sha256Hex("abc".getBytes(StandardCharsets.UTF_8));
        if (!abc.equals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad")) {
            System.out.println("  FAIL known-answer sha256(\"abc\"): " + abc);
            failures++;
        }

        // Round-trip: emit a ledger over a temp tree, verify clean, then tamper.
        Path tmp = Files.createTempDirectory("seis-ledger");
        try {
            Files.createDirectories(tmp.resolve("sub"));
            Files.write(tmp.resolve("a.jpg"), new byte[] {1, 2, 3});
            Files.write(tmp.resolve("sub/b.jpg"), "drawing".getBytes(StandardCharsets.UTF_8));

            Map<String, String> ledger = ledger(tmp);
            Map<String, String> reparsed = parseManifest(render(ledger));
            if (!reparsed.equals(ledger)) {
                System.out.println("  FAIL render/parse round-trip");
                failures++;
            }
            if (!verify(ledger(tmp), reparsed).isEmpty()) {
                System.out.println("  FAIL clean tree should verify");
                failures++;
            }

            Files.write(tmp.resolve("a.jpg"), new byte[] {9, 9, 9});   // tamper
            Files.write(tmp.resolve("new.jpg"), new byte[] {5});        // add
            List<String> problems = verify(ledger(tmp), reparsed);
            boolean sawChange = problems.stream().anyMatch(p -> p.equals("changed: a.jpg"));
            boolean sawUntracked = problems.stream().anyMatch(p -> p.equals("untracked: new.jpg"));
            if (!sawChange || !sawUntracked) {
                System.out.println("  FAIL tamper detection: " + problems);
                failures++;
            }
        } finally {
            try (Stream<Path> walk = Files.walk(tmp)) {
                walk.sorted((x, y) -> y.compareTo(x)).forEach(p -> p.toFile().delete());
            }
        }

        System.out.printf("[%s] drawings-checksum self-test  4 checks, %d failures%n",
            failures == 0 ? "PASS" : "FAIL", failures);
        return failures == 0 ? 0 : 1;
    }

    public static void main(String[] args) throws IOException {
        if (args.length >= 1 && args[0].equals("--self-test")) {
            System.exit(selfTest());
        }
        if (args.length >= 2 && args[0].equals("emit")) {
            System.out.print(render(ledger(Paths.get(args[1]))));
            return;
        }
        if (args.length >= 3 && args[0].equals("verify")) {
            Map<String, String> expected =
                parseManifest(Files.readString(Paths.get(args[2]), StandardCharsets.UTF_8));
            List<String> problems = verify(ledger(Paths.get(args[1])), expected);
            if (problems.isEmpty()) {
                System.out.printf("[PASS] drawings-checksum  %d files verified%n", expected.size());
            } else {
                System.out.println("[FAIL] drawings-checksum");
                problems.forEach(p -> System.out.println("        " + p));
                System.exit(1);
            }
            return;
        }
        System.err.println("usage: DrawingsChecksum emit <dir> | verify <dir> <manifest> | --self-test");
        System.exit(2);
    }
}
