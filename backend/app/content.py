"""
Loads the static content library (content.json) once at startup and builds
lookup structures used throughout the app. This is read-only reference
data, not user data, so a JSON file (not a DB table) is the right fit —
it can be reviewed, diffed, and edited by non-engineers directly.
"""

import json

from app.config import CONTENT_PATH


class ContentLibrary:
    def __init__(self, path=CONTENT_PATH):
        with open(path, encoding="utf-8") as f:
            data = json.load(f)

        self.categories: list[dict] = data["categories"]
        self.posts: list[dict] = data["posts"]

        self.category_ids: list[str] = [c["id"] for c in self.categories]
        self.category_names: dict[str, str] = {c["id"]: c["name"] for c in self.categories}
        self.category_action_tips: dict[str, str] = {
            c["id"]: c.get("action_tip", "") for c in self.categories
        }
        self.posts_by_id: dict[str, dict] = {p["id"]: p for p in self.posts}
        self.posts_by_category: dict[str, list[dict]] = {
            cat: [p for p in self.posts if p["category"] == cat] for cat in self.category_ids
        }

    def category_options(self) -> list[dict]:
        return [{"id": c["id"], "name": c["name"]} for c in self.categories]


# Loaded once, shared across requests — content never changes at runtime.
library = ContentLibrary()