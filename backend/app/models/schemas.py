from pydantic import BaseModel
from typing import List

class DatabaseConnection(BaseModel):
    host: str
    port: int
    user: str
    password: str
    database: str

class TableData(BaseModel):
    columns: List[dict]
    rows: List[tuple]

class TableInfo(BaseModel):
    name: str
    row_count: int
