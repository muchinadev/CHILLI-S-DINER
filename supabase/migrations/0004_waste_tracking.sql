-- Waste tracking: extends the existing inventory_transactions ledger
-- (rather than a separate table) with a 'waste' type and a structured
-- reason, so all stock movement stays in one place.

alter table inventory_transactions drop constraint inventory_transactions_type_check;
alter table inventory_transactions add constraint inventory_transactions_type_check
  check (type in ('purchase', 'usage', 'adjustment', 'waste'));

alter table inventory_transactions add column reason text
  check (reason is null or reason in (
    'spoilage', 'overproduction', 'prep_waste', 'cancelled_order', 'failed_delivery', 'damaged', 'other'
  ));
