import psycopg2
from psycopg2 import sql
from typing import List, Dict, Any
import os

class PostgreSQLService:
    def __init__(self, host: str, port: int, user: str, password: str, database: str):
        self.host = host
        self.port = port
        self.user = user
        self.password = password
        self.database = database
        self.connection = None
        self.last_error = None
        self.resolved_host = host

    def _is_running_in_docker(self) -> bool:
        return os.path.exists("/.dockerenv")

    def _resolve_host(self) -> str:
        if self._is_running_in_docker() and self.host in {"localhost", "127.0.0.1", "::1"}:
            return "host.docker.internal"
        return self.host

    def connect(self):
        """Establish connection to PostgreSQL"""
        try:
            self.resolved_host = self._resolve_host()
            self.connection = psycopg2.connect(
                host=self.resolved_host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database
            )
            self.last_error = None
            return True
        except psycopg2.Error as e:
            self.last_error = str(e)
            print(f"Error connecting to PostgreSQL using host '{self.resolved_host}': {e}")
            return False

    def disconnect(self):
        """Close connection"""
        if self.connection:
            self.connection.close()

    def get_databases(self) -> List[str]:
        """Get list of all databases"""
        if not self.connection:
            return []
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(
                "SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname"
            )
            databases = [row[0] for row in cursor.fetchall()]
            cursor.close()
            return databases
        except psycopg2.Error as e:
            print(f"Error fetching databases: {e}")
            return []

    def get_tables(self) -> List[str]:
        """Get list of all tables in current database"""
        if not self.connection:
            return []
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(
                """SELECT table_name FROM information_schema.tables 
                   WHERE table_schema = 'public' ORDER BY table_name"""
            )
            tables = [row[0] for row in cursor.fetchall()]
            cursor.close()
            return tables
        except psycopg2.Error as e:
            print(f"Error fetching tables: {e}")
            return []

    def get_relations(self) -> List[Dict[str, Any]]:
        """Get user-facing relations across non-system schemas"""
        if not self.connection:
            return []

        relation_types = {
            "r": "table",
            "p": "partitioned table",
            "v": "view",
            "m": "materialized view",
            "f": "foreign table",
        }

        try:
            cursor = self.connection.cursor()
            cursor.execute(
                """
                SELECT
                    n.nspname AS schema_name,
                    c.relname AS relation_name,
                    c.relkind AS relation_kind,
                    COALESCE(c.reltuples::bigint, 0) AS row_estimate
                FROM pg_class c
                INNER JOIN pg_namespace n ON n.oid = c.relnamespace
                WHERE c.relkind IN ('r', 'p', 'v', 'm', 'f')
                  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
                  AND n.nspname NOT LIKE 'pg_toast%'
                ORDER BY n.nspname, c.relname
                """
            )
            relations = []
            for schema_name, relation_name, relation_kind, row_estimate in cursor.fetchall():
                relations.append(
                    {
                        "schema": schema_name,
                        "name": relation_name,
                        "type": relation_types.get(relation_kind, relation_kind),
                        "row_estimate": row_estimate,
                    }
                )
            cursor.close()
            return relations
        except psycopg2.Error as e:
            print(f"Error fetching relations: {e}")
            return []

    def get_relation_columns(self, schema_name: str, relation_name: str) -> List[Dict[str, Any]]:
        """Get column metadata for a relation"""
        if not self.connection:
            return []

        try:
            cursor = self.connection.cursor()
            cursor.execute(
                """
                SELECT
                    column_name,
                    data_type,
                    is_nullable,
                    COALESCE(column_default, '') AS column_default
                FROM information_schema.columns
                WHERE table_schema = %s AND table_name = %s
                ORDER BY ordinal_position
                """,
                (schema_name, relation_name),
            )
            columns = [
                {
                    "name": row[0],
                    "type": row[1],
                    "nullable": row[2] == "YES",
                    "default": row[3] or None,
                }
                for row in cursor.fetchall()
            ]
            cursor.close()
            return columns
        except psycopg2.Error as e:
            print(f"Error fetching relation columns: {e}")
            return []

    def get_relation_relationships(self, schema_name: str, relation_name: str) -> Dict[str, List[Dict[str, Any]]]:
        """Get outgoing and incoming foreign-key relationships for a relation"""
        if not self.connection:
            return {"outgoing": [], "incoming": []}

        try:
            cursor = self.connection.cursor()
            cursor.execute(
                """
                SELECT
                    tc.constraint_name,
                    kcu.column_name,
                    ccu.table_schema AS foreign_table_schema,
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name
                FROM information_schema.table_constraints AS tc
                INNER JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                INNER JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                  AND tc.table_schema = %s
                  AND tc.table_name = %s
                ORDER BY tc.constraint_name, kcu.ordinal_position
                """,
                (schema_name, relation_name),
            )
            outgoing = [
                {
                    "constraint_name": row[0],
                    "column": row[1],
                    "references_schema": row[2],
                    "references_relation": row[3],
                    "references_column": row[4],
                }
                for row in cursor.fetchall()
            ]

            cursor.execute(
                """
                SELECT
                    tc.constraint_name,
                    kcu.table_schema AS source_schema,
                    kcu.table_name AS source_table,
                    kcu.column_name AS source_column,
                    ccu.column_name AS target_column
                FROM information_schema.table_constraints AS tc
                INNER JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                INNER JOIN information_schema.constraint_column_usage AS ccu
                    ON ccu.constraint_name = tc.constraint_name
                    AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY'
                  AND ccu.table_schema = %s
                  AND ccu.table_name = %s
                ORDER BY tc.constraint_name, kcu.ordinal_position
                """,
                (schema_name, relation_name),
            )
            incoming = [
                {
                    "constraint_name": row[0],
                    "source_schema": row[1],
                    "source_relation": row[2],
                    "source_column": row[3],
                    "target_column": row[4],
                }
                for row in cursor.fetchall()
            ]
            cursor.close()
            return {"outgoing": outgoing, "incoming": incoming}
        except psycopg2.Error as e:
            print(f"Error fetching relation relationships: {e}")
            return {"outgoing": [], "incoming": []}

    def get_table_data(self, table_name: str, limit: int = 100, schema_name: str = "public") -> Dict[str, Any]:
        """Get data from a specific table"""
        if not self.connection:
            return {"columns": [], "rows": []}
        
        try:
            cursor = self.connection.cursor()
            
            # Get column names
            cursor.execute(
                f"""SELECT column_name, data_type FROM information_schema.columns 
                   WHERE table_schema = %s AND table_name = %s ORDER BY ordinal_position""",
                (schema_name, table_name)
            )
            columns = [{"name": row[0], "type": row[1]} for row in cursor.fetchall()]
            
            # Get table data
            cursor.execute(sql.SQL("SELECT * FROM {}.{} LIMIT %s").format(
                sql.Identifier(schema_name),
                sql.Identifier(table_name)
            ), (limit,))
            
            rows = cursor.fetchall()
            cursor.close()
            
            return {
                "columns": columns,
                "rows": rows
            }
        except psycopg2.Error as e:
            print(f"Error fetching table data: {e}")
            return {"columns": [], "rows": []}

    def get_table_row_count(self, table_name: str, schema_name: str = "public") -> int:
        """Get row count for a table"""
        if not self.connection:
            return 0
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(sql.SQL("SELECT COUNT(*) FROM {}.{}").format(
                sql.Identifier(schema_name),
                sql.Identifier(table_name)
            ))
            count = cursor.fetchone()[0]
            cursor.close()
            return count
        except psycopg2.Error as e:
            print(f"Error fetching row count: {e}")
            return 0

    def get_relation_details(self, schema_name: str, relation_name: str, limit: int = 100) -> Dict[str, Any]:
        """Get combined metadata and sample rows for a relation"""
        columns = self.get_relation_columns(schema_name, relation_name)
        relationships = self.get_relation_relationships(schema_name, relation_name)
        row_count = self.get_table_row_count(relation_name, schema_name)
        data = self.get_table_data(relation_name, limit, schema_name)

        return {
            "relation": {
                "schema": schema_name,
                "name": relation_name,
            },
            "columns": columns,
            "relationships": relationships,
            "row_count": row_count,
            "rows": data.get("rows", []),
        }
