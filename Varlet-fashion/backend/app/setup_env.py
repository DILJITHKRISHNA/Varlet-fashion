"""Writes backend/.env for local development with freshly generated secrets.

python -m app.setup_env
"""

import secrets
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]


def main() -> None:
    target = BACKEND_DIR / ".env"
    if target.exists():
        print(".env already exists, left unchanged.")
        return
    values = {"JWT_SECRET": secrets.token_urlsafe(48), "SEED_PASSWORD": secrets.token_urlsafe(9)}
    lines = []
    for line in (BACKEND_DIR / ".env.example").read_text().splitlines():
        key = line.split("=", 1)[0]
        lines.append(f"{key}={values[key]}" if key in values and "=" in line else line)
    target.write_text("\n".join(lines) + "\n")
    target.chmod(0o600)
    print("Wrote backend/.env (local development only). Demo password is in SEED_PASSWORD.")


if __name__ == "__main__":
    main()
