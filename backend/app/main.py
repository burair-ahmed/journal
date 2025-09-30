from fastapi import FastAPI
from .mt5_fetch import init_mt5, shutdown_mt5, fetch_trades, save_trades_to_supabase

app = FastAPI()

@app.on_event("startup")
def startup_event():
    init_mt5()

@app.on_event("shutdown")
def shutdown_event():
    shutdown_mt5()

@app.get("/")
def root():
    return {"status": "Trading Journal API running"}

@app.post("/sync_trades")
def sync_trades(days: int = 90):
    df = fetch_trades(days=days)
    if df is None or df.empty:
        return {"message": "No trades found"}
    save_trades_to_supabase(df)
    return {"message": f"{len(df)} trades synced"}
