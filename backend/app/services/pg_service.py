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

    def connect(self):
        """Establish connection to PostgreSQL"""
        try:
            self.connection = psycopg2.connect(
                host=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database
            )
            return True
        except psycopg2.Error as e:
            print(f"Error connecting to PostgreSQL: {e}")
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

    def get_table_data(self, table_name: str, limit: int = 100) -> Dict[str, Any]:
        """Get data from a specific table"""
        if not self.connection:
            return {"columns": [], "rows": []}
        
        try:
            cursor = self.connection.cursor()
            
            # Get column names
            cursor.execute(
                f"""SELECT column_name, data_type FROM information_schema.columns 
                   WHERE table_name = %s ORDER BY ordinal_position""",
                (table_name,)
            )
            columns = [{"name": row[0], "type": row[1]} for row in cursor.fetchall()]
            
            # Get table data
            cursor.execute(sql.SQL("SELECT * FROM {} LIMIT %s").format(
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

    def get_table_row_count(self, table_name: str) -> int:
        """Get row count for a table"""
        if not self.connection:
            return 0
        
        try:
            cursor = self.connection.cursor()
            cursor.execute(sql.SQL("SELECT COUNT(*) FROM {}").format(
                sql.Identifier(table_name)
            ))
            count = cursor.fetchone()[0]
            cursor.close()
            return count
        except psycopg2.Error as e:
            print(f"Error fetching row count: {e}")
            return 0
