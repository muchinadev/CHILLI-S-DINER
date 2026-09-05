-- Allow recording cash payments (e.g. cash-on-pickup/delivery), alongside
-- the existing mock/mpesa provider, so cash reconciliation has real data.
alter table payments drop constraint payments_provider_check;
alter table payments add constraint payments_provider_check
  check (provider in ('mock', 'mpesa', 'cash'));
