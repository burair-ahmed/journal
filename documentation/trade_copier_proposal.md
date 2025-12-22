# Advanced Trade Copier: Master Functional Specification

**Status**: Deep Planning / Specification Phase
**Version**: 2.0 (Deep Dive)

This document details the functional logic, edge-case handling, and architectural requirements for an equivalent of an "Institutional Grade" Copy Trading Engine.

---

## 1. Core Architecture: "Synapse" Event Engine

### The Problem
Traditional copiers use "Polling" (checking every 1 second). This causes:
1.  **Slippage**: Price moves during the 1s delay.
2.  **Server Load**: 1000 users polling = 1000 requests/sec, mostly empty.

### The Solution: Event-Driven Push Architecture
The system functions as a high-speed message broker.

#### Components
1.  **The Listener (Ingest Node)**
    -   **Function**: Sits directly on the Master account usage (MetaApi, cTrader Fix API).
    -   **Logic**: Listens for socket events (`OrderOpened`, `OrderModified`, `OrderClosed`).
    -   **Throughput**: Must handle bursts of 1000 signals/sec (during news events).
    -   **Redundancy**: Dual-node active-passive failover. If Node A misses a heartbeat, Node B takes over ingestion instantly.

2.  **The Brain (Normalization & Routing)**
    -   **Symbol Map**: `Master(US30)` -> `System(DJI30)` -> `SlaveA(WS30)`, `SlaveB(DowJones)`. mapping is N-to-N.
    -   **Serialization**: Converts "Buy 1.0 Lot EURUSD @ 1.0500" into a standard internal JSON event.

3.  **The Executor (Egress Node)**
    -   **Queueing**: Uses a Priority Queue. `Close` signals have higher priority than `Open` signals (Capital Protection).
    -   **Concurrency**: 1 Worker per Slave Account. Async non-blocking execution.

#### Disaster Recovery Protocol
-   **"Ghosts"**: What if Master Modify -> Close -> Open sequence arrives as Open -> Close -> Modify?
-   **Sequence ID**: Every Master signal is stamped with a monotonic ID. Slaves reject ID 5 if ID 4 hasn't been processed, or request a State Sync.

---

## 2. Advanced Copying Logic

### A. "Portfolio" / Basket Trading
**Scenario**: User allocates $1000. 50% to Conservative Master, 50% to Aggressive Master.
-   **Virtual Wallet Logic**:
    -   Slave Account Balance: $1000.
    -   Virtual Allocation A: $500.
    -   Virtual Allocation B: $500.
-   **Sizing Calculation**:
    -   Master A trades 1% risk.
    -   Copier calculates 1% of *$500* (not $1000).
    -   Sends order for calculated volume.

### B. Reverse Copying (The Inverse Engine)
**Logic**: "Master Loses = I Win".
-   **Entry Inversion**: Master `BUY` -> Slave `SELL`.
-   **Price Compensation**:
    -   Master Buys at `Ask`. Slave Sells at `Bid`.
    -   **Spread Penalty**: The strategy immediately eats the spread *twice*.
    -   **Mitigation**: Feature to "Wait for Better Price". Slave waits until `Bid >= MasterJoinPrice` before entering.
-   **TP/SL Inversion**:
    -   Master TP (Above Price) -> Slave SL (Above Price).
    -   Master SL (Below Price) -> Slave TP (Below Price).

---

## 3. Intelligent Risk Guardrails (The "Shield")

The Copier is not just a pipe; it's a firewall.

### A. Execution Guardrails
1.  **Max Slippage Tolerance**:
    -   Master Entry: 1.05000.
    -   Current User Price: 1.05020.
    -   Config: `MaxSlippage = 1 Pip (10 points)`.
    -   Result: **REJECT**. Log reason: "Price drift > 1 pip".
2.  **Stale Tick Filter**:
    -   If signal timestamp is > 500ms old (indicating network lag), **REJECT**. Prevent "Ghost Trades".

### B. Equity Protection (Circuit Breakers)
1.  **Daily Loss Limit**:
    -   Reset at 00:00 UTC.
    -   If `Realized + Floating P/L < -$X`:
        -   Action 1: Close All Open Trades for this Master.
        -   Action 2: Block New Opens until Reset Time.
2.  **Global Equity Floor**:
    -   "If Account Equity drops below $5,000, Stop EVERYTHING." protection against rogue algos.

### C. News Event Filtering
-   **Integration**: Connect to ForexFactory/Bloomberg API.
-   **Rule**: "No Opens +/- 15 mins of High Impact USD News".
-   **Logic**: Calendar check runs periodically. Toggles a `TradingAllowed` boolean flag in Redis.

---

## 4. AI-Driven Analytics & Scoring

### A. "Zella Score" for Masters (Quality Metric)
Don't just show ROI. Show *Playability*.
-   **Sortino Ratio**: Downside risk-adjusted return.
-   **Execution Quality**: Average trade duration. (Scalpers < 10s are dangerous for copiers).
-   **Simulated Slippage**: Estimate "User P/L" vs "Master P/L" to predict copy viability.

### B. Toxic Flow Detection
-   **Pattern**: Master opens/closes 50 times in 1 minute (Churning).
-   **Action**: System detects anomaly -> Flags Master as "Toxic" -> Shadow Bans signals (stops broadcasting) -> Alerts Admin.

---

## 5. Admin Control & RBAC (Correspondence Scenarios)

### Scenario 1: The "Rogue Master"
**User View**: Sees trades copying normally.
**Admin View**:
-   **Monitoring**: Sees Master A has huge slippage across 500 users.
-   **Action**: "Suspend Master".
-   **Outcome**: All Slaves receive "Close All" command for Master A trades. Users notified via Email/Push.

### Scenario 2: Subscription Overrides
**User View**: Has "Basic Plan" (Max 1 Master). Wants to test a 2nd one.
**Admin View**:
-   **Override**: Admin grants "Trial Boost - 7 Days" on User Profile.
-   **System**: Updates User's `MaxSlots` in Redis from 1 to 2. No code change needed.

### Scenario 3: Dispute Resolution
**User View**: "My trade didn't open! I lost money!"
**Admin View**:
-   **Audit Log Deep Dive**: Pulls "Trace ID" for that specific trade.
-   **Log Result**: "Signal Received 10:00:01.050. Rejected at 10:00:01.055. Reason: User Margin Free < Required."
-   **Evidence**: Admin exports PDF trace log to User. Dispute closed.

---

## 6. Technical Stack Recommendation
Based on your current infrastructure, the Advanced Copier will be built using:

### Core Stack
-   **Backend**: **Python (FastAPI)**
    -   *Why*: seamless integration with the `MetaTrader5` Python library and `pandas` for analytics. FastAPI provides the high-performance async capabilities needed for low-latency signal processing.
-   **Frontend**: **React (Vite) + TypeScript**
    -   *UI*: Tailwind CSS + Shadcn UI (Pink/Fuchsia Theme).
    -   *State*: React Query (TanStack Query) for real-time dashboard updates.
-   **Database**: **Supabase (PostgreSQL)**
    -   *Role*: User data, subscription management, and trade history logs.
    -   *Realtime*: Supabase Realtime can be used for basic dashboard notifications.
-   **Event Engine**: **Redis** (Required Addition)
    -   *Role*: The high-speed "Synapse" bus. Using just a DB for 10ms latency copying is too slow. Redis Streams will handle the `Signal -> Distributor -> Slave` pipeline.

### Infrastructure
-   **Execution Nodes**: Windows VPS / Dedicated Servers (Required for `MetaTrader5` terminal execution).
    -   *Architecture*: The FastAPI backend will control headless MetaTrader 5 terminals via the `MetaTrader5` python package.
-   **Process Management**: PM2 or Systemd for keeping the Python listeners alive 24/7.
