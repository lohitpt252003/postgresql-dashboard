from fastapi import APIRouter, HTTPException
from app.models.schemas import DatabaseConnection
from app.services.pg_service import PostgreSQLService

router = APIRouter(prefix="/api/database", tags=["database"])

# Store current connection (in production, use session/auth)
current_connection: PostgreSQLService = None

@router.post("/connect")
async def connect_database(connection: DatabaseConnection):
    """Connect to PostgreSQL database"""
    global current_connection
    
    try:
        current_connection = PostgreSQLService(
            host=connection.host,
            port=connection.port,
            user=connection.user,
            password=connection.password,
            database=connection.database
        )
        
        if current_connection.connect():
            return {
                "status": "connected",
                "message": "Successfully connected to database",
                "resolved_host": current_connection.resolved_host,
            }
        else:
            raise HTTPException(
                status_code=400,
                detail=current_connection.last_error or "Failed to connect to database",
            )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/databases")
async def get_databases():
    """Get list of all databases"""
    if not current_connection:
        raise HTTPException(status_code=400, detail="Not connected to database")
    
    databases = current_connection.get_databases()
    return {"databases": databases}

@router.get("/tables")
async def get_tables():
    """Get list of tables in the public schema for backward compatibility"""
    if not current_connection:
        raise HTTPException(status_code=400, detail="Not connected to database")
    
    tables = current_connection.get_tables()
    return {"tables": tables}

@router.get("/relations")
async def get_relations():
    """Get list of non-system relations with schema metadata"""
    if not current_connection:
        raise HTTPException(status_code=400, detail="Not connected to database")

    relations = current_connection.get_relations()
    return {"relations": relations}

@router.get("/relation-details")
async def get_relation_details(schema: str, name: str, limit: int = 100):
    """Get relation fields, relationships, and sample rows"""
    if not current_connection:
        raise HTTPException(status_code=400, detail="Not connected to database")

    details = current_connection.get_relation_details(schema, name, limit)
    return details

@router.get("/table/{table_name}")
async def get_table_data(table_name: str, limit: int = 100, schema: str = "public"):
    """Get data from a specific table"""
    if not current_connection:
        raise HTTPException(status_code=400, detail="Not connected to database")
    
    data = current_connection.get_table_data(table_name, limit, schema)
    return data

@router.get("/table/{table_name}/count")
async def get_table_row_count(table_name: str, schema: str = "public"):
    """Get row count for a table"""
    if not current_connection:
        raise HTTPException(status_code=400, detail="Not connected to database")
    
    count = current_connection.get_table_row_count(table_name, schema)
    return {"table_name": table_name, "schema": schema, "row_count": count}

@router.post("/disconnect")
async def disconnect_database():
    """Disconnect from database"""
    global current_connection
    
    if current_connection:
        current_connection.disconnect()
        current_connection = None
    
    return {"status": "disconnected", "message": "Disconnected from database"}
