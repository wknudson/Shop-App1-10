# Shop App — In-Class CH 17

A Next.js (App Router) web application built on top of the `shop.db` SQLite operational database. This app demonstrates a complete end-to-end pattern: operational data → analytics pipeline → trained model file → automated scoring → operational workflow improvement.

## Prerequisites

- **Node.js** 18+ (with npm)
- **Python 3** (for the inference script)
- `shop.db` must exist in the parent directory (one level up from `shop-app/`)

## Setup

```bash
cd shop-app
npm install
```

## Run

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
In-Class CH 17/
  shop.db                              # operational SQLite database (DO NOT delete)
  jobs/
    run_inference.py                   # placeholder ML inference script
  shop-app/
    lib/
      db.js                           # better-sqlite3 helper (singleton, auto-migrates)
      migrate.js                      # adds fulfilled column + order_predictions table
    app/
      layout.js                       # sidebar nav + customer banner
      page.js                         # redirects to /select-customer
      globals.css                     # clean minimal styles
      select-customer/page.js         # choose a customer to act as
      dashboard/page.js               # customer summary stats
      place-order/page.js             # create new orders with line items
      orders/page.js                  # order history list
      orders/[orderId]/page.js        # order detail with line items
      warehouse/priority/page.js      # late delivery priority queue (top 50)
      scoring/page.js                 # run ML inference button
      debug/schema/page.js            # developer tool: view DB schema
```

## Database Schema Adaptations

On first run, the app automatically migrates the database:

1. **Adds `fulfilled` column** to `orders` (INTEGER, default 0). Existing orders with shipments are marked as fulfilled.
2. **Creates `order_predictions` table** for storing ML model output (keyed by `order_id`).

These migrations are idempotent and safe to run multiple times.

## Pages

| Route | Description |
|-------|-------------|
| `/select-customer` | Searchable list of 250 customers. Select one to "act as." |
| `/dashboard` | Summary stats: total orders, total spend, 5 most recent orders. |
| `/place-order` | Add products + quantities, computes totals, inserts via transaction. |
| `/orders` | Full order history table for the selected customer. |
| `/orders/:id` | Order detail with line items, subtotal/shipping/tax breakdown. |
| `/warehouse/priority` | Top 50 unfulfilled orders ranked by late delivery probability. |
| `/scoring` | Button to trigger `python3 jobs/run_inference.py`. |
| `/debug/schema` | Developer page showing all tables and columns in shop.db. |

## Manual QA Checklist

Follow these steps in order to verify the full end-to-end flow:

1. **Select a customer**
   - Go to `/select-customer`
   - Search for a customer (e.g., "Patricia")
   - Click to select — you should be redirected to `/dashboard`
   - Verify the sidebar banner shows "Acting as: [name]"

2. **View the dashboard**
   - Confirm customer name, email, total orders, and total spend display correctly
   - Verify the recent orders table shows up to 5 orders

3. **Place a new order**
   - Go to `/place-order`
   - Select a product, set quantity, optionally add more line items
   - Click "Place Order"
   - Verify redirect to `/orders` with a green success banner

4. **View order history**
   - Confirm the new order appears at the top (fulfilled = No)
   - Click the order ID to see line item details

5. **Run scoring**
   - Go to `/scoring` and click "Run Scoring"
   - Verify it reports "Scored 1 orders" (or however many unfulfilled orders exist)

6. **View priority queue**
   - Go to `/warehouse/priority`
   - Verify the newly placed (and scored) order appears in the queue
   - Confirm it shows late delivery probability and predicted status

## How It Works (End-to-End)

```
Customer places order → orders table (fulfilled=0)
                          ↓
Run Scoring button → jobs/run_inference.py
                          ↓
                    order_predictions table
                          ↓
Priority Queue page ← JOIN orders + customers + order_predictions
                          ↓
Warehouse staff sees high-risk orders first
```
