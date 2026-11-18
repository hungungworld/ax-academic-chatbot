"""DESIGN.md 9장의 CSS를 design.css로 뽑고, index.html 안의 CSS와 앱(app/design.css)도 같은 내용으로 바꾼다.

DESIGN.md의 CSS를 고친 뒤 실행:  python preview/sync_css.py
"""
import io
import pathlib
import re

here = pathlib.Path(__file__).resolve().parent
md = (here.parent / "DESIGN.md").read_text(encoding="utf-8")

section = md[md.index("## 9."):]
css = re.search(r"```css\n(.*?)\n```", section, re.S).group(1) + "\n"
io.open(here / "design.css", "w", encoding="utf-8", newline="\n").write(css)
io.open(here.parent / "app" / "design.css", "w", encoding="utf-8", newline="\n").write(css)

html_path = here / "index.html"
html = html_path.read_text(encoding="utf-8")
start = "/* ===== DESIGN.md 9장 CSS (design.css와 같은 내용) ===== */\n"
i = html.index(start) + len(start)
j = html.index("</style>", i)
html = html[:i] + css + html[j:]
io.open(html_path, "w", encoding="utf-8", newline="\n").write(html)
print("synced", len(css.splitlines()), "lines")
