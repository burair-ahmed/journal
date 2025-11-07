import MetaTrader5 as mt5
import pandas as pd
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from .db import supabase
import re
load_dotenv()

# MT5 credentials (default, can be overridden dynamically per account)
LOGIN = int(os.getenv("MT5_LOGIN"))
PASSWORD = os.getenv("MT5_PASSWORD")
SERVER = os.getenv("MT5_SERVER")
PATH = os.getenv("MT5_PATH")


def connect_mt5(login: int = LOGIN, password: str = PASSWORD, server: str = SERVER):
    print(f"👉 Starting MT5 connection for {login}@{server}...")
    if not mt5.initialize(PATH, login=login, password=password, server=server):
        print(f"❌ MT5 initialization failed: {mt5.last_error()}")
        return False
    print("✅ Connected to MT5:", server, "Account:", login)
    return True


def shutdown_mt5():
    mt5.shutdown()
    print("🛑 MT5 connection closed")


def fetch_trades(days=90):
    utc_from = datetime.now() - timedelta(days=days)
    utc_to = datetime.now()

    deals = mt5.history_deals_get(utc_from, utc_to)
    if not deals:
        print("❌ No deals found:", mt5.last_error())
        return []

    df = pd.DataFrame(list(deals), columns=deals[0]._asdict().keys())
    return df


def serialize_trade(trade: dict) -> dict:
    """Convert datetime/timestamp objects inside a dict into JSON-serializable strings."""
    serialized = {}
    for k, v in trade.items():
        if isinstance(v, (datetime, pd.Timestamp)):
            serialized[k] = v.isoformat()
        else:
            serialized[k] = v
    return serialized


def save_trades_to_supabase(df: pd.DataFrame, account_id: int):
    def fetch_tp_sl_from_open_order(position_id: int, open_order_id: int):
        tp = sl = 0.0

        # 1️⃣ Try live position snapshot
        pos = mt5.positions_get(ticket=position_id)
        if pos:
            p = pos[0]
            tp, sl = getattr(p, "tp", 0.0), getattr(p, "sl", 0.0)
            if tp or sl:
                print(f"📍 From live position: tp={tp}, sl={sl}")
                return float(tp or 0.0), float(sl or 0.0)

        # 2️⃣ Fetch from order history (including modification orders)
        related_orders = mt5.history_orders_get(position=position_id)
        if related_orders:
            # Sort by modification time
            related_orders = sorted(related_orders, key=lambda o: getattr(o, "time_done", 0))
            for o in related_orders:
                otp, osl = getattr(o, "tp", 0.0), getattr(o, "sl", 0.0)
                comment = getattr(o, "comment", "") or ""
                if otp or osl:
                    tp, sl = otp or tp, osl or sl
                if re.search(r"modify|update", comment, re.IGNORECASE):
                    # This is a modification order — keep updating tp/sl to last one
                    tp, sl = otp or tp, osl or sl

        # 3️⃣ Check deals for backup (not always populated)
        if tp == 0.0 or sl == 0.0:
            related_deals = mt5.history_deals_get(position=position_id)
            if related_deals:
                for d in related_deals:
                    comment = getattr(d, "comment", "") or ""
                    if "tp" in comment.lower() or "sl" in comment.lower():
                        tp_match = re.search(r"tp\s*[:=]?\s*([\d.]+)", comment, re.IGNORECASE)
                        sl_match = re.search(r"sl\s*[:=]?\s*([\d.]+)", comment, re.IGNORECASE)
                        if tp_match:
                            tp = float(tp_match.group(1))
                        if sl_match:
                            sl = float(sl_match.group(1))

        # print(f"✅ Final derived TP/SL for position {position_id}: tp={tp}, sl={sl}")
        return float(tp or 0.0), float(sl or 0.0)

    trades = []
    grouped = df.groupby("position_id")

    for position_id, group in grouped:
        group_sorted = group.sort_values("time")
        open_deal = group_sorted.iloc[0]
        close_deal = group_sorted.iloc[-1]

        # --- Determine close reason
        reason_code = int(close_deal.get("reason", -1))
        if reason_code == mt5.DEAL_REASON_TP:
            close_reason = "TP Hit"
        elif reason_code == mt5.DEAL_REASON_SL:
            close_reason = "SL Hit"
        elif reason_code in (
            mt5.DEAL_REASON_CLIENT,
            mt5.DEAL_REASON_EXPERT,
            mt5.DEAL_REASON_MOBILE,
            mt5.DEAL_REASON_WEB,
        ):
            close_reason = "Manual Close"
        elif reason_code == mt5.DEAL_REASON_MARGIN:
            close_reason = "Margin Call"
        else:
            close_reason = "Other"

        # --- Get TP/SL from order history (correct source for closed trades)
        tp_price, sl_price = fetch_tp_sl_from_open_order(int(position_id),int(open_deal.get("order", 0)))


        trade = {
            "account_id": account_id,
            "position_id": int(position_id),
            "ticket": int(open_deal.get("ticket", 0)),
            "order_id": int(open_deal.get("order", 0)),
            "symbol": str(open_deal["symbol"]),
            "type": int(open_deal["type"]),
            "open_time": datetime.utcfromtimestamp(int(open_deal["time"])).isoformat(),
            "close_time": datetime.utcfromtimestamp(int(close_deal["time"])).isoformat(),
            "open_price": float(open_deal["price"]),
            "close_price": float(close_deal["price"]),
            "volume": float(open_deal["volume"]),
            "tp_price": tp_price,
            "sl_price": sl_price,
            "close_reason": close_reason,
            "profit": float(group["profit"].sum()),
            "commission": float(group["commission"].sum() if "commission" in group else 0),
            "swap": float(group["swap"].sum() if "swap" in group else 0),
            "comment": str(open_deal["comment"]) if "comment" in open_deal else "",
            "mt5_raw": group.to_dict(orient="records"),
        }

        trades.append(trade)

    if not trades:
        print("⚠️ No trades to save")
        return

    existing_resp = (
        supabase.table("trades")
        .select("position_id, profit")
        .eq("account_id", account_id)
        .execute()
    )
    existing = {row["position_id"]: row for row in existing_resp.data} if existing_resp.data else {}

    new_trades = []
    updated_trades = []

    for trade in trades:
        position_id = trade["position_id"]
        if position_id in existing:
            existing_trade = existing[position_id]
            if existing_trade.get("profit", 0) == 0 or trade["profit"] != existing_trade.get("profit"):
                updated_trades.append(trade)
        else:
            new_trades.append(trade)

    if new_trades:
        supabase.table("trades").insert(new_trades).execute()
        print(f"✅ {len(new_trades)} new trades saved for account {account_id}")

    for trade in updated_trades:
        supabase.table("trades") \
            .update({
                "profit": trade["profit"],
                "close_time": trade["close_time"],
                "close_price": trade["close_price"],
                "commission": trade["commission"],
                "swap": trade["swap"],
                "tp_price": trade["tp_price"],
                "sl_price": trade["sl_price"],
                "mt5_raw": trade["mt5_raw"]
            }) \
            .eq("account_id", account_id) \
            .eq("position_id", trade["position_id"]) \
            .execute()

    if updated_trades:
        print(f"🔁 {len(updated_trades)} trades updated for account {account_id}")
    else:
        print("⚠️ No trades required updating")

    # ✅ Return counts for frontend display
    return {
        "new_count": len(new_trades),
        "updated_count": len(updated_trades),
    }
