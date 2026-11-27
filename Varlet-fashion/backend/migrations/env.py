from alembic import context
from sqlalchemy import text

from app.db import get_engine
from app.models import SCHEMA, Base


def include_name(name, type_, parent_names):
    # Never look at (or touch) other schemas, such as Supabase's own tables.
    return name == SCHEMA if type_ == "schema" else True


def run() -> None:
    with get_engine().connect() as connection:
        connection.execute(text(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA}"))
        connection.commit()
        context.configure(
            connection=connection,
            target_metadata=Base.metadata,
            include_schemas=True,
            include_name=include_name,
            version_table_schema=SCHEMA,
        )
        with context.begin_transaction():
            context.run_migrations()


run()
