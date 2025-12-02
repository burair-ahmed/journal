from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from .mt5_fetch import connect_mt5, shutdown_mt5, fetch_trades, save_trades_to_supabase
from .ohlc_fetch import sync_ohlc_for_account, DEFAULT_TIMEFRAMES
from .db import supabase
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:5173", "http://localhost:8080"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------------
# Pydantic Schemas
# -------------------------
class AccountCreate(BaseModel):
    user_id: str
    mt5_login: int
    mt5_password: str
    mt5_server: str
    alias: str | None = None


class Account(BaseModel):
    id: int
    user_id: str
    mt5_login: int
    mt5_server: str
    alias: str | None


@app.get("/")
def root():
    return {"status": "Trading Journal API running"}


# -------------------------
# Accounts Endpoints
# -------------------------
@app.post("/accounts", response_model=Account)
def create_account(account: AccountCreate):
    data = {
        "user_id": account.user_id,
        "mt5_login": account.mt5_login,
        "mt5_password": account.mt5_password,   # ⚠️ consider encrypting
        "mt5_server": account.mt5_server,
        "alias": account.alias,
    }
    result = supabase.table("accounts").insert(data).execute()

    if not result.data:
        raise HTTPException(status_code=400, detail="Failed to create account")

    return result.data[0]


@app.get("/accounts", response_model=List[Account])
def list_accounts(user_id: str):
    result = supabase.table("accounts").select("*").eq("user_id", user_id).execute()

    if not result.data:
        return []

    return result.data


@app.post("/sync_trades/{account_id}")
def sync_trades(account_id: int, days: int = 90):
    result = supabase.table("accounts").select("*").eq("id", account_id).single().execute()
    account = result.data
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    connected = connect_mt5(
        login=account["mt5_login"],
        password=account["mt5_password"],
        server=account["mt5_server"]
    )
    if not connected:
        raise HTTPException(status_code=400, detail="MT5 login failed")

    df = fetch_trades(days=days)
    if df is None or df.empty:
        shutdown_mt5()
        return {"message": "No trades found", "new_count": 0, "updated_count": 0, "account_id": account_id}

    result = save_trades_to_supabase(df, account_id=account_id) or {"new_count": 0, "updated_count": 0}
    shutdown_mt5()

    # ✅ Decide message based on trade counts
    if result.get("new_count", 0) == 0 and result.get("updated_count", 0) == 0:
        message = "No new trades to update"
    else:
        message = "Trades synced successfully"

    return {
        "message": message,
        "account_id": account_id,
        "new_count": result.get("new_count", 0),
        "updated_count": result.get("updated_count", 0),
    }


# -------------------------
# OHLC Data Sync Endpoint
# -------------------------
@app.post("/sync-ohlc/{account_id}")
def sync_ohlc(account_id: int, timeframes: List[str] = None, days: int = 90):
    """
    Sync OHLC (candlestick) data from MT5 to Supabase.
    
    Process:
    - Fetches OHLC data for all traded symbols in the account
    - Uses server-based storage (shares data across accounts on same server)
    - Smart sync: checks for existing data before fetching
    
    Args:
        account_id: Account ID to sync
        timeframes: List of timeframes to sync (e.g., ['5m', '1h', '1d']). 
                   Defaults to ['5m', '1h', '1d']
        days: Number of days of historical data to fetch (default: 90)
    
    Returns:
        JSON with sync results
    """
    # Use default timeframes if none provided
    if timeframes is None:
        timeframes = DEFAULT_TIMEFRAMES
    
    # Validate timeframes
    valid_timeframes = ['1m', '3m', '5m', '30m', '1h', '4h', '1d']
    invalid_tf = [tf for tf in timeframes if tf not in valid_timeframes]
    if invalid_tf:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid timeframes: {invalid_tf}. Valid options: {valid_timeframes}"
        )
    
    # Execute sync
    result = sync_ohlc_for_account(
        account_id=account_id,
        timeframes=timeframes,
        days_back=days
    )
    
    # Check for errors
    if 'error' in result:
        raise HTTPException(status_code=400, detail=result['error'])
    
    return result

