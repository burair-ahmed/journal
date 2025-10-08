from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from .mt5_fetch import connect_mt5, shutdown_mt5, fetch_trades, save_trades_to_supabase
from .db import supabase

app = FastAPI()

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
    # Fetch account credentials
    result = supabase.table("accounts").select("*").eq("id", account_id).single().execute()
    account = result.data
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    # ✅ connect using account-specific credentials
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
        return {"message": "No trades found"}

    save_trades_to_supabase(df, account_id=account_id)

    shutdown_mt5()
    return {"message": f"{len(df)} trades synced", "account_id": account_id}