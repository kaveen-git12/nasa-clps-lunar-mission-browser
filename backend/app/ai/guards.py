from __future__ import annotations

import json
import re
import time
from collections import defaultdict, deque
from typing import Any

THINK_BLOCK_RE = re.compile(r"<think>.*?</think>", re.DOTALL | re.IGNORECASE)
UNCLOSED_THINK_RE = re.compile(r"<think>.*$", re.DOTALL | re.IGNORECASE)
EXTERNAL_MD_LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^\)]+)\)", re.IGNORECASE)
NUMBER_TOKEN_RE = re.compile(r"(?<![a-zA-Z_])-?\d+(?:\.\d+)?(?![a-zA-Z_])")


class RateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def allow(self, client_ip: str, limit_per_min: int) -> bool:
        now = time.monotonic()
        window_start = now - 60.0
        q = self._hits[client_ip]
        while q and q[0] < window_start:
            q.popleft()
        if len(q) >= limit_per_min:
            return False
        q.append(now)
        return True


rate_limiter = RateLimiter()


def sanitize_output(text: str) -> str:
    cleaned = THINK_BLOCK_RE.sub("", text)
    cleaned = UNCLOSED_THINK_RE.sub("", cleaned)
    cleaned = EXTERNAL_MD_LINK_RE.sub(r"\1", cleaned)
    return cleaned.strip()


def extract_numbers(text: str) -> set[str]:
    nums: set[str] = set()
    for match in NUMBER_TOKEN_RE.findall(text):
        try:
            val = float(match)
            nums.add(str(int(val)) if val.is_integer() else str(val))
        except ValueError:
            nums.add(match)
    return nums


def check_faithfulness(
    answer: str,
    tool_Payloads: list[Any],
    user_messages: list[str],
    strict: bool = False,
    fallback_summary: str | None = None,
) -> tuple[str, list[str]]:
    """
    Compares numbers in `answer` against numbers present in tool results and user messages.
    Returns (final_answer, warnings).
    """
    answer_nums = extract_numbers(answer)
    if not answer_nums:
        return answer, []

    allowed_corpus = " ".join(user_messages) + " " + json.dumps(tool_Payloads, default=str)
    allowed_nums = extract_numbers(allowed_corpus)

    unmatched = answer_nums - allowed_nums
    if not unmatched:
        return answer, []

    warning = "Some figures could not be matched to retrieved data."
    if strict:
        safe_text = fallback_summary or "I could not verify all figures against retrieved mission data."
        return safe_text, [warning]
    return answer, [warning]
