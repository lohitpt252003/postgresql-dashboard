from pydantic import BaseModel
from typing import Any, Dict, List

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


class RowUpdateRequest(BaseModel):
    schema: str
    relation: str
    primary_key: Dict[str, Any]
    values: Dict[str, Any]
