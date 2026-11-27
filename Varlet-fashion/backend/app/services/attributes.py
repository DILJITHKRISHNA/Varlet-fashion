"""Works out garment type and colour families from the words shops already type."""

import re

_TYPE_WORDS: list[tuple[str, str]] = [
    ("footwear", r"sneakers?|shoes?|boots?|loafers?|heels?|sandals?|slippers?|flats?|footwear"),
    (
        "ethnic",
        r"kurtas?|kurtis?|sarees?|saris?|lehengas?|sherwanis?|anarkali|salwar|dupatta|dhoti",
    ),
    ("outerwear", r"jackets?|blazers?|coats?|puffers?|hoodies?|sweatshirts?|cardigans?|shrugs?"),
    ("dress", r"dress(es)?|gowns?|jumpsuits?|frocks?"),
    (
        "bottom",
        r"jeans|pants?|trousers?|joggers?|shorts|skirts?|chinos|cargos?|leggings?|palazzos?",
    ),
    (
        "accessory",
        r"bags?|belts?|caps?|hats?|watch(es)?|sunglasses|scarf|scarves|wallets?|jewell?ery",
    ),
    ("top", r"tees?|t-?shirts?|shirts?|tops?|blouses?|polos?|sweaters?|tanks?"),
]

_COLOR_FAMILIES = {
    "black": ("black", "charcoal", "jet"),
    "white": ("white", "ivory", "cream", "off-white", "offwhite"),
    "grey": ("grey", "gray", "slate", "silver"),
    "blue": ("blue", "navy", "denim", "indigo", "teal", "turquoise"),
    "green": ("green", "olive", "mint", "emerald", "sage"),
    "red": ("red", "maroon", "crimson", "wine", "burgundy"),
    "pink": ("pink", "rose", "blush", "fuchsia", "magenta"),
    "orange": ("orange", "rust", "coral", "peach"),
    "yellow": ("yellow", "mustard", "gold"),
    "purple": ("purple", "lavender", "violet", "lilac", "mauve"),
    "brown": ("brown", "tan", "coffee", "chocolate", "camel"),
    "beige": ("beige", "khaki", "nude", "sand"),
}


def infer_item_type(*texts: str | None) -> str | None:
    """The last matching word wins: "Denim Jacket Shirt" is a shirt, "Cargo Joggers" is a bottom."""
    for text in texts:
        if not text:
            continue
        best: tuple[int, str] | None = None
        for item_type, pattern in _TYPE_WORDS:
            for found in re.finditer(rf"\b(?:{pattern})\b", text.lower()):
                if best is None or found.end() > best[0]:
                    best = (found.end(), item_type)
        if best:
            return best[1]
    return None


def color_families(names: list[str]) -> set[str]:
    families: set[str] = set()
    for name in names:
        words = set(re.split(r"[^a-z-]+", name.lower()))
        for family, synonyms in _COLOR_FAMILIES.items():
            if words.intersection(synonyms):
                families.add(family)
    return families
