-- Tracks whether ingredients for an order have already been deducted from
-- inventory, so deduction (on confirmation) and restoration (on
-- cancellation) each happen exactly once regardless of which status path
-- an order takes.
alter table orders add column inventory_deducted boolean not null default false;
