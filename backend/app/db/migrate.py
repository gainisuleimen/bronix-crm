from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine

USER_PROFILE_COLUMNS = (
    ("phone", "VARCHAR(50)"),
    ("position", "VARCHAR(255)"),
    ("photo_url", "VARCHAR(500)"),
)


def migrate_user_profile_columns(engine: Engine) -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("users")}

    with engine.begin() as conn:
        for name, column_type in USER_PROFILE_COLUMNS:
            if name not in existing:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {name} {column_type}"))


def migrate_lead_assigned_column(engine: Engine) -> None:
    inspector = inspect(engine)
    if "leads" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("leads")}
    if "assigned_to_id" in existing:
        return

    with engine.begin() as conn:
        conn.execute(
            text(
                "ALTER TABLE leads ADD COLUMN assigned_to_id INTEGER "
                "REFERENCES users(id) ON DELETE SET NULL"
            )
        )
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_leads_assigned_to_id ON leads (assigned_to_id)"))


LEAD_SCHEDULE_COLUMNS = (
    ("scheduled_date", "DATE"),
    ("scheduled_time", "TIME"),
    ("deadline_at", "TIMESTAMP WITH TIME ZONE"),
)


def migrate_lead_schedule_columns(engine: Engine) -> None:
    inspector = inspect(engine)
    if "leads" not in inspector.get_table_names():
        return

    existing = {column["name"] for column in inspector.get_columns("leads")}

    with engine.begin() as conn:
        for name, column_type in LEAD_SCHEDULE_COLUMNS:
            if name not in existing:
                conn.execute(text(f"ALTER TABLE leads ADD COLUMN {name} {column_type}"))

        if "scheduled_date" not in existing:
            conn.execute(
                text("CREATE INDEX IF NOT EXISTS ix_leads_scheduled_date ON leads (scheduled_date)")
            )
        if "deadline_at" not in existing:
            conn.execute(
                text("CREATE INDEX IF NOT EXISTS ix_leads_deadline_at ON leads (deadline_at)")
            )


def migrate_leads_client_cascade(engine: Engine) -> None:
    inspector = inspect(engine)
    if "leads" not in inspector.get_table_names():
        return

    foreign_keys = inspector.get_foreign_keys("leads")
    client_fk = next((fk for fk in foreign_keys if fk.get("referred_table") == "clients"), None)
    if client_fk is None:
        return

    if client_fk.get("options", {}).get("ondelete") == "CASCADE":
        return

    constraint_name = client_fk["name"]

    with engine.begin() as conn:
        conn.execute(text(f'ALTER TABLE leads DROP CONSTRAINT "{constraint_name}"'))
        conn.execute(
            text(
                "ALTER TABLE leads ADD CONSTRAINT leads_client_id_fkey "
                "FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE"
            )
        )


def migrate_photo_url_to_text(engine: Engine) -> None:
    inspector = inspect(engine)
    if "users" not in inspector.get_table_names():
        return

    columns = {column["name"]: column for column in inspector.get_columns("users")}
    if "photo_url" not in columns:
        return

    column_type = str(columns["photo_url"]["type"]).upper()
    if "TEXT" in column_type:
        return

    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE users ALTER COLUMN photo_url TYPE TEXT"))


def run_migrations(engine: Engine) -> None:
    migrate_user_profile_columns(engine)
    migrate_lead_assigned_column(engine)
    migrate_lead_schedule_columns(engine)
    migrate_leads_client_cascade(engine)
    migrate_photo_url_to_text(engine)
