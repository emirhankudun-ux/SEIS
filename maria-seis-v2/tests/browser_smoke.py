"""Real-browser acceptance checks. Requires Python Playwright plus Chromium.
Run: python3 tests/browser_smoke.py --output /path/to/evidence
No model/provider credentials, network calls or operating-system control.
"""
from __future__ import annotations
import argparse
import base64
import re
import functools
import json
import shutil
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def offline_document(root: Path) -> str:
    """Load the exact local modules without navigating to a network address.
    Only import specifiers are replaced; no JS transformation or fake app code.
    """
    imports = {}
    for path in sorted((root/'src').rglob('*.js')):
        key = 'seis/' + path.relative_to(root).as_posix()
        source = path.read_text()
        def resolve(match):
            dependency = (path.parent / match.group(2)).resolve()
            if not dependency.is_relative_to(root.resolve()):
                raise ValueError('Import outside app root')
            return match.group(1) + "'seis/" + dependency.relative_to(root.resolve()).as_posix() + "'"
        source = re.sub(r"(from\s+)[\"'](\.[^\"']+)[\"']", resolve, source)
        imports[key] = 'data:text/javascript;base64,' + base64.b64encode(source.encode()).decode()
    html = (root/'index.html').read_text()
    html = html.replace('<link rel="stylesheet" href="./src/styles.css" />', '<style>' + (root/'src/styles.css').read_text() + '</style>')
    html = html.replace('<script type="module" src="./src/app.js"></script>',
        '<script type="importmap">' + json.dumps({'imports':imports}) + '</script>'
        '<script type="module">import "seis/src/app.js";</script>')
    return html

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path)
    parser.add_argument('--offline', action='store_true', help='Render supplied modules without HTTP navigation')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    output = args.output or Path(tempfile.mkdtemp(prefix='maria-browser-'))
    output.mkdir(parents=True, exist_ok=True)
    server = None
    thread = None
    origin = ''
    if not args.offline:
        server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(root)))
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        origin = f'http://127.0.0.1:{server.server_port}'
    checks: list[str] = []
    errors: list[str] = []
    external: list[str] = []
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, executable_path=shutil.which('chromium') or None,
                                                  args=['--no-sandbox','--disable-dev-shm-usage'])
            page = browser.new_page(viewport={'width':1440,'height':900}, reduced_motion='reduce')
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.on('request', lambda request: external.append(request.url) if request.url.startswith(('http://','https://')) and (args.offline or not request.url.startswith(origin)) else None)
            def load_page():
                if args.offline:
                    page.goto('about:blank')
                    page.set_content(offline_document(root), wait_until='load')
                    expect(page.locator('#systemList .nav-row')).to_have_count(5)
                else:
                    page.goto(origin, wait_until='networkidle')
            load_page()
            expect(page.locator('#healthScore')).to_have_text('0 bağlı')
            expect(page.locator('#stateText')).to_have_text('READY')
            checks.append('initial state distinguishes unconfigured capabilities')
            page.screenshot(path=str(output/'desktop.png'), full_page=True, animations='disabled')

            page.get_by_role('button',name='Son build durumunu kontrol et',exact=True).click()
            expect(page.locator('#stateText')).to_have_text('SIMULATED')
            expect(page.locator('#assistantText')).to_contain_text('Harici işlem yapılmadı')
            expect(page.locator('#activityResult')).to_have_text('Gerçek görev doğrulanmadı')
            checks.append('simulation completion never claims a real build passed')
            page.screenshot(path=str(output/'simulation.png'), full_page=True, animations='disabled')

            page.locator('#commandInput').fill('build kontrol et')
            page.get_by_role('button',name='Gönder',exact=True).click()
            expect(page.locator('#projectSwitch')).to_be_disabled()
            page.get_by_role('button',name='Durdur',exact=True).click()
            expect(page.locator('#stateText')).to_have_text('CANCELLED')
            page.wait_for_timeout(700)
            expect(page.locator('#stateText')).to_have_text('CANCELLED')
            expect(page.locator('#commandInput')).to_be_enabled()
            checks.append('cancel stops work, unlocks controls and ignores late progress')

            page.locator('#commandInput').fill('production deploy yap')
            page.get_by_role('button',name='Gönder',exact=True).click()
            expect(page.locator('#stateText')).to_have_text('APPROVAL REQUIRED')
            page.locator('#approvalCard').click()
            expect(page.locator('#assistantText')).to_have_text('Onay verilmedi; harici işlem yapılmadı.')
            checks.append('dismissal does not authorize a high-impact action')

            page.locator('#commandInput').fill('<img src=x onerror="window.__unsafe=1">')
            page.get_by_role('button',name='Gönder',exact=True).click()
            expect(page.locator('#stateText')).to_have_text('SIMULATED')
            assert page.evaluate('window.__unsafe') is None
            assert page.locator('#assistantText img').count() == 0
            checks.append('user input is rendered as text, not HTML')

            page.get_by_role('button',name='Mikrofon',exact=True).click()
            expect(page.locator('#stateText')).to_have_text('UNAVAILABLE')
            assert not page.locator('#micBtn').evaluate("e=>e.classList.contains('active')")
            page.get_by_role('button',name='Vision',exact=True).click()
            expect(page.locator('#headline')).to_have_text('Vision bağlı değil.')
            checks.append('microphone and vision do not falsely enter active states')

            page.locator('#expandAgents').click()
            assert page.locator('#agentList .agent-row').count() == 6
            page.locator('#expandAgents').click()
            assert page.locator('#agentList .agent-row').count() == 4
            checks.append('role catalog expands without spawning fake workers')

            page.get_by_role('button',name='Ayarlar',exact=True).click()
            expect(page.get_by_role('dialog')).to_be_visible()
            expect(page.locator('[data-setting="wakeWord"]')).to_have_attribute('aria-checked','false')
            expect(page.locator('[data-setting="wakeWord"]')).to_be_disabled()
            expect(page.locator('#closeSettings')).to_be_focused()
            page.keyboard.press('Shift+Tab')
            expect(page.locator('[data-setting="localFirst"]')).to_be_focused()
            page.keyboard.press('Tab')
            expect(page.locator('#closeSettings')).to_be_focused()
            page.screenshot(path=str(output/'settings.png'), animations='disabled')
            page.keyboard.press('Escape')
            expect(page.get_by_role('button',name='Ayarlar',exact=True)).to_be_focused()
            checks.append('settings focus trap, disabled capabilities and focus restoration')

            page.locator('#projectSwitch').click()
            page.locator('#projectMenu [data-project="portfolio"]').click()
            expect(page.locator('#contextText')).to_have_text('PORTFOLIO')
            checks.append('project switch changes context without external file access')

            for width,height in [(1440,900),(1280,800),(1024,768),(768,900),(720,900),(390,844),(320,568)]:
                page.set_viewport_size({'width':width,'height':height})
                load_page()
                assert page.evaluate('document.documentElement.scrollWidth<=innerWidth'), f'Horizontal overflow at {width}'
                expect(page.locator('#sendBtn')).to_be_visible()
                checks.append(f'responsive layout {width}x{height} without horizontal overflow')
                if width == 390:
                    page.screenshot(path=str(output/'mobile.png'),full_page=True,animations='disabled')
            assert not errors, errors
            assert not external, external
            checks.append('no uncaught browser errors or external network requests')
            report={'transport':'offline module import map' if args.offline else 'HTTP', 'result':'passed','browser':browser.version,'checks':checks,'total':len(checks),
                    'uncaughtErrors':errors,'externalRequests':external,'scope':'web simulation; no live adapters tested'}
            (output/'browser-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
            browser.close()
    finally:
        if server:
            server.shutdown(); server.server_close()
        if thread:
            thread.join(timeout=2)
    print(json.dumps({'browser':'passed','checks':len(checks),'evidence':str(output)},ensure_ascii=False))

if __name__ == '__main__':
    main()
