from __future__ import annotations

from contextlib import contextmanager
from dataclasses import replace
import importlib.util
import json
from pathlib import Path
import socket
import sys
import threading
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "packages" / "maria-runtime" / "python"))

from maria_runtime.fabric_router import CapabilityRequest, RouteDecision, RouteKind
from maria_runtime.models import ModelSpec
from maria_runtime.model_work_runner import ModelWorkInput, ModelWorkStepBinding, ModelWorkStepRunner
from maria_runtime.work_routing import WorkRouteStep

# The first hosted TDD run must fail with an assertion, not silently skip a
# missing implementation. Any later import error inside the module is surfaced.
ADAPTER_SPEC = importlib.util.find_spec("maria_runtime.local_model_adapter")
if ADAPTER_SPEC is not None:
    from maria_runtime.local_model_adapter import (
        LMStudioModelWorkAdapter, LocalModelLimits, OllamaModelWorkAdapter,
    )
    from maria_runtime.local_model_transport import (
        LocalModelRequest, LocalModelResponse, LoopbackModelHTTPTransport,
    )


def model(provider="ollama", **changes):
    result = ModelSpec(
        name="fixture-model", provider=provider, local=True,
        capabilities=("chat", "reasoning"), context_size=8192,
        reliability=0.98, latency_ms=10,
        input_cost_per_million=0.0, output_cost_per_million=0.0,
    )
    return replace(result, **changes)


def work_input(content="PRIVATE_INPUT_FIXTURE", estimate=20):
    return ModelWorkInput(
        {"messages": [{"role": "user", "content": content}]},
        estimated_input_tokens=estimate,
    )


def reply(provider="ollama"):
    message = {"role": "assistant", "content": "PRIVATE_OUTPUT_FIXTURE"}
    if provider == "ollama":
        return {"model": "fixture-model", "done": True, "done_reason": "stop",
                "message": message, "prompt_eval_count": 20, "eval_count": 8}
    return {"model": "fixture-model", "choices": [
        {"index": 0, "finish_reason": "stop", "message": message}],
        "usage": {"prompt_tokens": 20, "completion_tokens": 8, "total_tokens": 28}}


def response(payload=None, **changes):
    defaults = dict(status_code=200, content_type="application/json; charset=utf-8",
                    body=json.dumps(reply() if payload is None else payload).encode())
    defaults.update(changes)
    return LocalModelResponse(**defaults)


class RecordingTransport:
    def __init__(self, value):
        self.value = value
        self.calls = []

    def __call__(self, request):
        self.calls.append(request)
        if isinstance(self.value, Exception):
            raise self.value
        return self.value


@contextmanager
def loopback_fixture(wire, *, interval=0.0):
    """One harmless socket fixture; no real runtime, model, or external service."""
    stop = threading.Event()
    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    listener.bind(("127.0.0.1", 0))
    listener.listen(1)
    listener.settimeout(2)
    port = listener.getsockname()[1]
    captured = []
    errors = []

    def serve():
        try:
            with listener.accept()[0] as client:
                client.settimeout(2)
                data = b""
                while b"\r\n\r\n" not in data:
                    part = client.recv(4096)
                    if not part:
                        return
                    data += part
                    if len(data) > 32768:
                        raise AssertionError("fixture request headers are oversized")
                header, body = data.split(b"\r\n\r\n", 1)
                length = 0
                for line in header.split(b"\r\n")[1:]:
                    if line.lower().startswith(b"content-length:"):
                        length = int(line.split(b":", 1)[1])
                if not 0 <= length <= 1048576:
                    raise AssertionError("fixture request body is oversized")
                while len(body) < length:
                    part = client.recv(min(4096, length - len(body)))
                    if not part:
                        return
                    body += part
                captured.append((header, body))
                for part in wire:
                    if stop.is_set():
                        break
                    client.sendall(part)
                    if interval and stop.wait(interval):
                        break
        except (BrokenPipeError, ConnectionResetError):
            pass  # Expected when the client's absolute deadline closes the socket.
        except OSError as exc:
            if not stop.is_set():
                errors.append(type(exc).__name__)
        except Exception as exc:
            errors.append(type(exc).__name__)

    worker = threading.Thread(target=serve, name="maria-model-fixture", daemon=True)
    worker.start()
    try:
        yield port, captured
    finally:
        stop.set()
        listener.close()
        worker.join(3)
        if worker.is_alive() or errors:
            raise AssertionError("loopback fixture did not finish cleanly")


class LocalModelAdapterTests(unittest.TestCase):
    def setUp(self):
        self.assertIsNotNone(ADAPTER_SPEC, "bounded local model adapters are missing")

    def invoke(self, adapter, *, selected=None, data=None, **changes):
        options = {"timeout_ms": 1000, "max_output_tokens": 64}
        options.update(changes)
        return adapter.invoke(model() if selected is None else selected,
                              work_input() if data is None else data, **options)

    def test_ollama_builds_exact_bounded_request_and_returns_only_text(self):
        payload = reply()
        payload["message"]["thinking"] = "PRIVATE_REASONING_FIXTURE"
        transport = RecordingTransport(response(payload))
        result = self.invoke(OllamaModelWorkAdapter(transport=transport))
        self.assertTrue(result.succeeded)
        self.assertEqual((result.input_tokens, result.output_tokens), (20, 8))
        self.assertEqual(result.output, "PRIVATE_OUTPUT_FIXTURE")
        request = transport.calls[0]
        body = json.loads(request.body)
        self.assertEqual(request.path, "/api/chat")
        self.assertEqual(request.port, 11434)
        self.assertEqual(body, {"model": "fixture-model", "messages": work_input().payload["messages"],
                               "stream": False, "options": {"num_predict": 64, "num_ctx": 8192}})
        self.assertEqual(request.timeout_ms, 1000)
        for value in (request, result):
            self.assertNotIn("PRIVATE_", repr(value))

    def test_lm_studio_uses_compatible_endpoint_without_arbitrary_payload_forwarding(self):
        transport = RecordingTransport(response(reply("lm-studio")))
        result = self.invoke(LMStudioModelWorkAdapter(transport=transport), selected=model("lm-studio"))
        self.assertTrue(result.succeeded)
        request = transport.calls[0]
        self.assertEqual((request.port, request.path), (1234, "/v1/chat/completions"))
        self.assertEqual(json.loads(request.body), {
            "model": "fixture-model", "messages": work_input().payload["messages"],
            "stream": False, "max_tokens": 64,
        })

    def test_model_identity_locality_availability_and_chat_capability_precede_transport(self):
        invalid = [model("lm-studio"), model(local=False), model(available=False),
                   model(capabilities=("embedding",)), model(name="fixture-model\n"),
                   model(name="x" * 513), model(context_size=True)]
        for selected in invalid:
            with self.subTest(selected=selected):
                transport = RecordingTransport(response())
                result = self.invoke(OllamaModelWorkAdapter(transport=transport), selected=selected)
                self.assertFalse(result.succeeded)
                self.assertFalse(result.retryable)
                self.assertEqual(transport.calls, [])

    def test_input_schema_and_hidden_override_fields_fail_before_transport(self):
        invalid = ["prompt", {}, {"messages": []},
                   {"messages": [{"role": "tool", "content": "x"}]},
                   {"messages": [{"role": "user", "content": [{"image_url": "x"}]}]},
                   {"messages": [{"role": "user", "content": "x", "tool_calls": []}]},
                   {"messages": [{"role": "user", "content": "x"}] * 65},
                   {"messages": [{"role": "user", "content": "\ud800"}]},
                   {**work_input().payload, "model": "other"},
                   {**work_input().payload, "tools": []},
                   {**work_input().payload, "stream": True}]
        for payload in invalid:
            with self.subTest(payload_type=type(payload).__name__):
                transport = RecordingTransport(response())
                result = self.invoke(OllamaModelWorkAdapter(transport=transport),
                                     data=ModelWorkInput(payload, estimated_input_tokens=20))
                self.assertEqual(result.failure_category, "invalid-model-input")
                self.assertEqual(transport.calls, [])

    def test_limits_validate_types_and_hard_ceiling(self):
        for name, ceiling in (("max_request_bytes", 1048576), ("max_response_bytes", 4194304),
                              ("max_context_tokens", 65536), ("max_timeout_ms", 300000)):
            for value in (0, -1, True, 1.5, float("nan"), ceiling + 1):
                with self.subTest(name=name, value=value):
                    with self.assertRaises(ValueError):
                        LocalModelLimits(**{name: value})
        for port in (0, True, "1234", 65536):
            with self.assertRaises(ValueError):
                OllamaModelWorkAdapter(port=port)
        with self.assertRaises(TypeError):
            OllamaModelWorkAdapter(base_url="http://example.com")

    def test_declared_request_and_context_budgets_fail_before_transport(self):
        cases = [
            (LocalModelLimits(max_request_bytes=128), work_input("é" * 100), {}, "request-too-large"),
            (LocalModelLimits(max_context_tokens=64), work_input(), {}, "context-budget-exceeded"),
            (LocalModelLimits(), work_input(estimate=0), {}, "invalid-model-input"),
            (LocalModelLimits(), work_input(), {"timeout_ms": 120001}, "policy-rejected"),
            (LocalModelLimits(), work_input(), {"max_output_tokens": True}, "policy-rejected"),
        ]
        for limits, data, options, reason in cases:
            with self.subTest(reason=reason):
                transport = RecordingTransport(response())
                result = self.invoke(OllamaModelWorkAdapter(transport=transport, limits=limits),
                                     data=data, **options)
                self.assertEqual(result.failure_category, reason)
                self.assertEqual(transport.calls, [])

    def test_ollama_context_allocation_is_capped_not_model_maximum(self):
        transport = RecordingTransport(response())
        result = self.invoke(OllamaModelWorkAdapter(transport=transport), selected=model(context_size=131072))
        self.assertTrue(result.succeeded)
        self.assertEqual(json.loads(transport.calls[0].body)["options"]["num_ctx"], 8192)

    def test_transport_statuses_are_normalized_and_never_retried_by_adapter(self):
        for status, category, retryable in (
            (301, "policy-rejected", False), (401, "authentication-required", False),
            (403, "authentication-required", False), (404, "provider-failure", False),
            (408, "timeout", True), (429, "rate-limited", True),
            (500, "provider-failure", False), (502, "temporarily-unavailable", True),
            (503, "temporarily-unavailable", True), (504, "timeout", True),
        ):
            with self.subTest(status=status):
                transport = RecordingTransport(response(status_code=status, body=b"PRIVATE_SERVER_ERROR"))
                result = self.invoke(OllamaModelWorkAdapter(transport=transport))
                self.assertEqual((result.failure_category, result.retryable), (category, retryable))
                self.assertEqual(len(transport.calls), 1)
                self.assertNotIn("PRIVATE_", repr(result))

    def test_transport_exceptions_and_late_results_are_safely_normalized(self):
        for error, expected in ((TimeoutError("PRIVATE_ERROR"), "timeout"),
                                (OSError("PRIVATE_ERROR"), "transport-failure"),
                                (RuntimeError("PRIVATE_ERROR"), "transport-failure")):
            result = self.invoke(OllamaModelWorkAdapter(transport=RecordingTransport(error)))
            self.assertEqual(result.failure_category, expected)
            self.assertNotIn("PRIVATE_", repr(result))
        ticks = iter((10.0, 12.0))
        result = self.invoke(OllamaModelWorkAdapter(transport=RecordingTransport(response()),
                                                   clock=lambda: next(ticks)))
        self.assertEqual(result.failure_category, "timeout")

    def test_response_metadata_and_json_fail_closed(self):
        malformed = [None, {}, response(redirected=True), response(status_code=True),
                     response(content_type="text/event-stream"), response(body="not-bytes"),
                     response(body=b"\xff"), response(body=b"[]"), response(body=b"null"),
                     response(body=b'{"model":"a","model":"b"}'),
                     response(body=b'{"counter":NaN}'), response(body=b"[" * 2000)]
        for value in malformed:
            with self.subTest(value_type=type(value).__name__):
                result = self.invoke(OllamaModelWorkAdapter(transport=RecordingTransport(value)))
                self.assertFalse(result.succeeded)
                self.assertFalse(result.retryable)
                self.assertIsNone(result.output)

    def test_response_byte_bound_includes_utf8_and_error_envelopes(self):
        transport = RecordingTransport(response(body=b" " * 257))
        result = self.invoke(OllamaModelWorkAdapter(transport=transport,
                                                   limits=LocalModelLimits(max_response_bytes=256)))
        self.assertEqual(result.failure_category, "response-too-large")

    def test_response_model_mismatch_never_returns_output(self):
        for provider, adapter_type in (("ollama", OllamaModelWorkAdapter), ("lm-studio", LMStudioModelWorkAdapter)):
            payload = reply(provider)
            payload["model"] = "another-model"
            result = self.invoke(adapter_type(transport=RecordingTransport(response(payload))), selected=model(provider))
            self.assertEqual(result.failure_category, "model-mismatch")
            self.assertIsNone(result.output)

    def test_missing_or_malformed_usage_is_not_invented_as_zero(self):
        for provider, adapter_type in (("ollama", OllamaModelWorkAdapter), ("lm-studio", LMStudioModelWorkAdapter)):
            for invalid in (None, True, -1, 2.5, "8"):
                payload = reply(provider)
                target = payload if provider == "ollama" else payload["usage"]
                key = "eval_count" if provider == "ollama" else "completion_tokens"
                if invalid is None:
                    del target[key]
                else:
                    target[key] = invalid
                result = self.invoke(adapter_type(transport=RecordingTransport(response(payload))), selected=model(provider))
                self.assertEqual(result.failure_category, "invalid-response")
                self.assertIsNone(result.output)
        payload = reply("lm-studio")
        payload["usage"]["total_tokens"] = 999
        result = self.invoke(LMStudioModelWorkAdapter(transport=RecordingTransport(response(payload))), selected=model("lm-studio"))
        self.assertEqual(result.failure_category, "invalid-response")

    def test_actual_output_and_context_budget_are_rechecked(self):
        for counts, expected in (((20, 65), "output-budget-exceeded"),
                                 ((8190, 8), "context-budget-exceeded")):
            payload = reply()
            payload["prompt_eval_count"], payload["eval_count"] = counts
            result = self.invoke(OllamaModelWorkAdapter(transport=RecordingTransport(response(payload))))
            self.assertEqual(result.failure_category, expected)
            self.assertIsNone(result.output)

    def test_partial_generations_and_tool_calls_are_not_successful_cognition(self):
        for provider, adapter_type in (("ollama", OllamaModelWorkAdapter), ("lm-studio", LMStudioModelWorkAdapter)):
            for variant in ("unfinished", "length", "tool_calls", "role", "empty", "images"):
                payload = reply(provider)
                item = payload if provider == "ollama" else payload["choices"][0]
                message = item["message"]
                if variant == "unfinished":
                    if provider == "ollama":
                        payload["done"] = False
                    else:
                        item["finish_reason"] = None
                elif variant == "length":
                    item["done_reason" if provider == "ollama" else "finish_reason"] = "length"
                elif variant == "tool_calls":
                    message["tool_calls"] = [{"function": {"name": "unexpected"}}]
                elif variant == "role":
                    message["role"] = "tool"
                elif variant == "images":
                    message["images"] = ["not-text"]
                else:
                    message["content"] = ""
                result = self.invoke(adapter_type(transport=RecordingTransport(response(payload))), selected=model(provider))
                self.assertFalse(result.succeeded, (provider, variant))
                self.assertFalse(result.retryable)
                self.assertIsNone(result.output)

    def test_error_envelope_and_multiple_choices_are_rejected(self):
        payload = reply()
        payload["error"] = "PRIVATE_ERROR"
        result = self.invoke(OllamaModelWorkAdapter(transport=RecordingTransport(response(payload))))
        self.assertFalse(result.succeeded)
        payload = reply("lm-studio")
        payload["choices"] *= 2
        result = self.invoke(LMStudioModelWorkAdapter(transport=RecordingTransport(response(payload))), selected=model("lm-studio"))
        self.assertEqual(result.failure_category, "invalid-response")

    def test_request_and_response_repr_do_not_contain_payloads_or_server_headers(self):
        request = LocalModelRequest(provider_id="ollama", port=11434,
                                    body=b"PRIVATE_INPUT_FIXTURE", timeout_ms=1000, max_response_bytes=1024)
        received = response(content_type="PRIVATE_HEADER", body=b"PRIVATE_OUTPUT_FIXTURE")
        self.assertNotIn("PRIVATE_", repr(request))
        self.assertNotIn("PRIVATE_", repr(received))

    def test_direct_transport_request_cannot_select_remote_urls_paths_or_methods(self):
        for changes in ({"provider_id": "cloud"}, {"port": True}, {"timeout_ms": 0},
                        {"max_response_bytes": 4194305}, {"body": "text"}):
            defaults = dict(provider_id="ollama", port=11434, body=b"{}",
                            timeout_ms=1000, max_response_bytes=1024)
            defaults.update(changes)
            with self.assertRaises((ValueError, TypeError)):
                LocalModelRequest(**defaults)
        with self.assertRaises(TypeError):
            LocalModelRequest(provider_id="ollama", port=11434, body=b"{}", timeout_ms=1000,
                              max_response_bytes=1024, url="http://example.com")

    def test_runner_consumes_real_adapter_result_with_dependency_input(self):
        selected = model()
        transport = RecordingTransport(response())
        runner = ModelWorkStepRunner(bindings={"chat": ModelWorkStepBinding(
            model=selected, adapter=OllamaModelWorkAdapter(transport=transport),
            input_factory=lambda deps: work_input(deps["prepare"]),
            timeout_ms=1000, max_output_tokens=64,
        )})
        step = WorkRouteStep(step_id="chat", depends_on=("prepare",),
            request=CapabilityRequest(capability="chat", execution_required=False, estimated_context_tokens=20),
            route=RouteDecision(capability="chat", kind=RouteKind.MODEL, target_name=selected.name))
        result = runner.run(step, dependency_results={"prepare": "PRIVATE_DEPENDENCY"}, attempt=1, idempotency_key=None)
        self.assertTrue(result.succeeded)
        self.assertEqual(result.result, "PRIVATE_OUTPUT_FIXTURE")
        self.assertEqual(json.loads(transport.calls[0].body)["messages"][0]["content"], "PRIVATE_DEPENDENCY")
        self.assertNotIn("PRIVATE_", repr(result))

    def test_native_transport_uses_real_loopback_fixture_and_closes(self):
        body = json.dumps(reply()).encode()
        wire = [b"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: "
                + str(len(body)).encode() + b"\r\nConnection: close\r\n\r\n" + body]
        with loopback_fixture(wire) as (port, captured):
            result = self.invoke(OllamaModelWorkAdapter(port=port))
        self.assertTrue(result.succeeded)
        self.assertTrue(captured[0][0].startswith(b"POST /api/chat HTTP/1.1"))
        self.assertNotIn(b"Authorization:", captured[0][0])
        self.assertFalse(any(t.name == "maria-model-deadline" for t in threading.enumerate()))

    def test_native_transport_enforces_deadline_against_slow_headers_and_body(self):
        cases = [([b"HTTP/1.1 200 OK\r\n"] + [b"X"] * 100),
                 ([b"HTTP/1.0 200 OK\r\nContent-Type: application/json\r\nContent-Length: 100\r\n\r\n"]
                  + [b" "] * 100)]
        for wire in cases:
            with loopback_fixture(wire, interval=0.04) as (port, _captured):
                started = time.monotonic()
                result = self.invoke(OllamaModelWorkAdapter(port=port), timeout_ms=150)
                elapsed = time.monotonic() - started
            self.assertEqual(result.failure_category, "timeout")
            self.assertLess(elapsed, 1.5)
            self.assertFalse(any(t.name == "maria-model-deadline" for t in threading.enumerate()))

    def test_native_transport_never_follows_redirects_and_bounds_read(self):
        wires = [([b"HTTP/1.1 302 Found\r\nLocation: http://example.com/\r\nContent-Length: 0\r\n\r\n"], "policy-rejected"),
                 ([b"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: 500\r\n\r\n" + b" " * 500], "response-too-large")]
        for wire, expected in wires:
            with loopback_fixture(wire) as (port, _captured):
                result = self.invoke(OllamaModelWorkAdapter(port=port, limits=LocalModelLimits(max_response_bytes=256)))
            self.assertEqual(result.failure_category, expected)


if __name__ == "__main__":
    unittest.main()
