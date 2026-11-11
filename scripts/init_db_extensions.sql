-- ==============================================================================
-- Initialisation des Extensions & Permissions PostgreSQL pour LevelUp
-- ==============================================================================

ALTER USER levelup_master WITH SUPERUSER CREATEDB;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "unaccent";

GRANT ALL ON SCHEMA public TO CURRENT_USER;
ALTER SCHEMA public OWNER TO CURRENT_USER;
