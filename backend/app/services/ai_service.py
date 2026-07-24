import logging
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """
    AI Service integrating Google Gemini API (`google.generativeai`) with rich deterministic
    fallbacks so the enterprise platform runs out-of-the-box in local/dev environments without API keys.
    """
    @staticmethod
    def _get_gemini_model():
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                return genai.GenerativeModel('gemini-1.5-pro')
            except Exception as exc:
                logger.warning(f"Failed to initialize Gemini model: {exc}")
        return None

    @classmethod
    def summarize_task(cls, title: str, description: str, comments: List[str] = None) -> Dict[str, Any]:
        """Generate concise bullet points summarizing task scope and comment history."""
        model = cls._get_gemini_model()
        if model:
            try:
                prompt = f"Summarize the following task into 3 concise executive bullet points.\nTitle: {title}\nDescription: {description}\nComments: {comments or []}"
                response = model.generate_content(prompt)
                return {"summary": response.text, "provider": "Gemini-1.5-Pro"}
            except Exception as exc:
                logger.warning(f"Gemini generation error: {exc}")

        # High-quality fallback simulation
        bullets = [
            f"**Objective**: Deliver core functionality for *{title}* matching enterprise FAANG requirements.",
            "**Key Deliverables**: Complete rich markdown documentation, UI components, and unit test coverage.",
            f"**Status & Engagement**: Currently active with {len(comments or [])} collaborative team comments."
        ]
        return {"summary": "\n- ".join([""] + bullets), "provider": "Simulation Engine (Fallback)"}

    @classmethod
    def suggest_priority_and_severity(cls, title: str, description: str) -> Dict[str, str]:
        """Suggest optimal priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`) and severity (`TRIVIAL`, `MINOR`, `MAJOR`, `CRITICAL`, `BLOCKER`)."""
        text_lower = f"{title} {description}".lower()
        if any(w in text_lower for w in ["crash", "security", "data loss", "blocker", "urgent", "production down"]):
            return {"priority": "URGENT", "severity": "BLOCKER", "reasoning": "Detected critical keywords indicating immediate production or security impact."}
        elif any(w in text_lower for w in ["bug", "error", "fail", "slow", "exception"]):
            return {"priority": "HIGH", "severity": "MAJOR", "reasoning": "Identified functional error requiring timely resolution in the next sprint."}
        else:
            return {"priority": "MEDIUM", "severity": "MINOR", "reasoning": "Standard feature enhancement or UI refinement suitable for regular sprint scheduling."}

    @classmethod
    def generate_description(cls, draft_notes: str) -> Dict[str, str]:
        """Expand rough bullet points or notes into a structured markdown specification."""
        model = cls._get_gemini_model()
        if model:
            try:
                prompt = f"Convert these rough notes into a professional Jira/ClickUp engineering task specification with User Story, Acceptance Criteria, and Technical Implementation details:\n\n{draft_notes}"
                response = model.generate_content(prompt)
                return {"generated_description": response.text, "provider": "Gemini-1.5-Pro"}
            except Exception:
                pass

        markdown_output = f"""### User Story
As an enterprise user, I want to execute workflow improvements based on:
> {draft_notes}

### Acceptance Criteria
- [ ] Feature is built with clean architecture and zero TypeScript/lint errors.
- [ ] Responsive UI verified across Desktop and Mobile breakpoints.
- [ ] End-to-end unit tests and API integration verification completed.

### Technical Implementation Notes
- Ensure state synchronization via TanStack Query and Zustand.
- Emit WebSocket events on state mutations (`task:updated`).
"""
        return {"generated_description": markdown_output, "provider": "Simulation Engine (Fallback)"}

    @classmethod
    def detect_duplicates(cls, new_title: str, existing_tasks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Identify potentially duplicate tasks based on title similarity."""
        new_words = set(new_title.lower().split())
        duplicates = []
        for t in existing_tasks:
            t_words = set(t.get("title", "").lower().split())
            if not new_words or not t_words:
                continue
            intersection = new_words.intersection(t_words)
            similarity = len(intersection) / max(len(new_words), len(t_words))
            if similarity > 0.4:
                duplicates.append({"task_id": t["id"], "title": t["title"], "similarity_score": round(similarity * 100, 1)})
        return sorted(duplicates, key=lambda x: x["similarity_score"], reverse=True)[:3]

    @classmethod
    def parse_nlp_task(cls, text: str) -> Dict[str, Any]:
        """Parse natural language into task fields (title, priority, etc) using Gemini."""
        model = cls._get_gemini_model()
        if model:
            try:
                import json
                prompt = f"""Extract task details from this natural language text and return ONLY a valid JSON object with no markdown formatting or backticks.
                Text: "{text}"
                Required keys: "title" (string), "priority" (string: LOW, MEDIUM, HIGH, URGENT), "description" (string)."""
                
                response = model.generate_content(prompt)
                
                # Clean up response string (in case Gemini returns markdown JSON blocks)
                json_str = response.text.strip()
                if json_str.startswith("```json"):
                    json_str = json_str[7:]
                if json_str.startswith("```"):
                    json_str = json_str[3:]
                if json_str.endswith("```"):
                    json_str = json_str[:-3]
                    
                data = json.loads(json_str.strip())
                return {
                    "title": data.get("title", "New Task"),
                    "priority": data.get("priority", "MEDIUM").upper(),
                    "description": data.get("description", f"Generated from AI Copilot request: '{text}'"),
                    "provider": "Gemini-1.5-Pro"
                }
            except Exception as exc:
                logger.warning(f"Gemini generation error in parse_nlp_task: {exc}")

        # Fallback simulation
        text_lower = text.lower()
        priority = "MEDIUM"
        if "urgent" in text_lower or "blocker" in text_lower:
            priority = "URGENT"
        elif "high" in text_lower:
            priority = "HIGH"
        elif "low" in text_lower or "minor" in text_lower:
            priority = "LOW"
        
        clean_title = text
        for kw in ["urgent", "high priority", "low priority", "high", "low"]:
            clean_title = clean_title.replace(kw, "")
        
        clean_title = clean_title.strip().capitalize()
        if not clean_title:
            clean_title = "New AI Task"

        return {
            "title": clean_title,
            "priority": priority,
            "description": f"Generated from AI Copilot request: '{text}'",
            "provider": "Simulation Engine (Fallback)"
        }
