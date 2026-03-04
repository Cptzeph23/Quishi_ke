"""
FILE:     backend/apps/chatbot/services.py
PURPOSE:  AI service layer — translates natural language into property filters.
          Pluggable: set AI_PROVIDER=openai or AI_PROVIDER=anthropic in .env
"""
import json
from django.conf import settings

# ── System Prompt ──────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are SmartRealty AI, a knowledgeable and friendly real estate assistant.

Your capabilities:
1. Help users find properties using natural language
2. Answer questions about the platform and real estate in general
3. Extract structured search filters from conversational queries

When a user is looking for a property, respond with:
- A helpful, natural language response
- A JSON block inside <filters></filters> tags

Filter JSON schema (use null for any absent field):
<filters>
{
  "city":          "string or null",
  "min_price":     number_or_null,
  "max_price":     number_or_null,
  "bedrooms":      number_or_null,
  "property_type": "apartment|house|studio|penthouse|office or null",
  "status":        "available|rented|sold or null",
  "min_area":      number_or_null,
  "max_area":      number_or_null,
  "amenities":     ["wifi","parking",...] or null
}
</filters>

If the message is NOT a property search (e.g. platform question, greeting),
just respond helpfully — no <filters> tag needed.

Always be concise, professional, and helpful."""


def get_ai_response(messages: list) -> tuple:
    """
    Send conversation to the configured AI provider.
    Returns: (text_response: str, extracted_filters: dict | None)
    """
    provider = getattr(settings, "AI_PROVIDER", "openai")
    if provider == "anthropic":
        return _call_anthropic(messages)
    return _call_openai(messages)


def _call_openai(messages: list) -> tuple:
    from openai import OpenAI
    client  = OpenAI(api_key=settings.OPENAI_API_KEY)
    payload = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
    resp    = client.chat.completions.create(
        model       = "gpt-4o-mini",
        messages    = payload,
        max_tokens  = 800,
        temperature = 0.3,
    )
    return _parse_response(resp.choices[0].message.content)


def _call_anthropic(messages: list) -> tuple:
    import anthropic
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    resp   = client.messages.create(
        model    = "claude-haiku-4-5-20251001",
        system   = SYSTEM_PROMPT,
        messages = messages,
        max_tokens = 800,
    )
    return _parse_response(resp.content[0].text)


def _parse_response(raw: str) -> tuple:
    """Extract <filters> JSON and return (clean_text, filters_dict | None)."""
    filters = None
    text    = raw

    if "<filters>" in raw and "</filters>" in raw:
        start  = raw.index("<filters>") + len("<filters>")
        end    = raw.index("</filters>")
        before = raw[:raw.index("<filters>")]
        after  = raw[end + len("</filters>"):]
        text   = (before + after).strip()
        try:
            filters = json.loads(raw[start:end].strip())
            # Remove null values so the frontend doesn't need to handle them
            filters = {k: v for k, v in filters.items() if v is not None}
            if not filters:
                filters = None
        except json.JSONDecodeError:
            filters = None

    return text, filters