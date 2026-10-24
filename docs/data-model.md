# Modelo de Datos — Cyclon P2P

Este documento detalla el esquema relacional para **PostgreSQL en Neon** utilizando **Drizzle ORM**.

---

## 1. Entidades del Sistema

### 1.1 Autenticación y Cuentas (Better Auth / Sistema)
- **`users`**:
  - `id` (text / uuid, PK)
  - `name` (text)
  - `email` (text, UNIQUE)
  - `email_verified` (boolean, default false)
  - `image` (text, nullable)
  - `role` (text, default 'merchant') — Valores: `'merchant'`, `'platform_owner'`
  - `account_status` (text, default 'active') — Valores: `'active'`, `'suspended'`, `'deactivated'`, `'pending_verification'`
  - `status_reason` (text, nullable) — Motivo administrativo en caso de suspensión o baja
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

- **`sessions`**:
  - `id` (text, PK)
  - `user_id` (text, FK -> `users.id`)
  - `token` (text, UNIQUE)
  - `expires_at` (timestamptz)
  - `ip_address` (text, nullable)
  - `user_agent` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- **`accounts`**:
  - `id` (text, PK)
  - `user_id` (text, FK -> `users.id`)
  - `account_id` (text)
  - `provider_id` (text)
  - `password_hash` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- **`verifications`**:
  - `id` (text, PK)
  - `identifier` (text)
  - `value` (text)
  - `expires_at` (timestamptz)
  - `created_at` (timestamptz)

---

### 1.2 Espacios de Trabajo (Multi-Tenancy)
- **`workspaces`**:
  - `id` (uuid, PK, default gen_random_uuid())
  - `name` (text, default 'Mi Espacio P2P')
  - `owner_id` (text, FK -> `users.id`, UNIQUE)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

- **`workspace_settings`**:
  - `id` (uuid, PK, default gen_random_uuid())
  - `workspace_id` (uuid, FK -> `workspaces.id`, UNIQUE)
  - `primary_country` (varchar(2), default 'VE') — Códigos: VE, CO, BR, AR, EC, PE, CL
  - `timezone` (text, default 'America/Caracas')
  - `enabled_fiat_currencies` (jsonb / text array, default '["VES","USD"]')
  - `tax_id` (text, nullable) — Información fiscal opcional para reportes
  - `business_name` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

---

### 1.3 Planes y Facturación Simulada (Demo Billing)
- **`plans`**:
  - `id` (uuid, PK)
  - `code` (varchar(50), UNIQUE) — `'free_trial'`, `'business'`, `'enterprise'`
  - `name` (varchar(100))
  - `description` (text)
  - `features` (jsonb) — Listado de capacidades activadas
  - `trial_days` (integer, default 0)
  - `demo_price_usd` (numeric(10, 2), default 0.00)
  - `is_active` (boolean, default true)

- **`subscriptions`**:
  - `id` (uuid, PK, default gen_random_uuid())
  - `workspace_id` (uuid, FK -> `workspaces.id`)
  - `plan_id` (uuid, FK -> `plans.id`)
  - `status` (varchar(50)) — `'trialing'`, `'active'`, `'expired'`, `'cancelled'`
  - `started_at` (timestamptz, default now())
  - `ends_at` (timestamptz, nullable)
  - `provider` (varchar(50), default 'demo')
  - `is_simulated` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- **`billing_events`**:
  - `id` (uuid, PK, default gen_random_uuid())
  - `workspace_id` (uuid, FK -> `workspaces.id`)
  - `plan_id` (uuid, FK -> `plans.id`)
  - `promotion_id` (uuid, nullable)
  - `amount_displayed` (numeric(10, 2))
  - `currency` (varchar(3), default 'USD')
  - `outcome` (varchar(50)) — `'approved'`, `'pending'`, `'failed'`
  - `demo_reference` (varchar(100)) — Prefijo ficticio: `DEMO-CHK-XXXXX`
  - `is_simulated` (boolean, default true)
  - `created_at` (timestamptz, default now())

---

### 1.4 Catálogos Globales y Privados
- **`countries`** (Global):
  - `code` (varchar(2), PK) — `VE`, `CO`, `BR`, `AR`, `EC`, `PE`, `CL`
  - `name` (varchar(100))
  - `default_fiat` (varchar(3)) — `VES`, `COP`, `BRL`, `ARS`, `USD`, `PEN`, `CLP`
  - `is_active` (boolean, default true)

- **`fiat_currencies`** (Global):
  - `code` (varchar(3), PK) — `VES`, `COP`, `BRL`, `ARS`, `USD`, `PEN`, `CLP`
  - `name` (varchar(100))
  - `symbol` (varchar(10))
  - `decimals` (integer, default 2)
  - `is_active` (boolean, default true)

- **`assets`** (Global):
  - `symbol` (varchar(20), PK) — `USDT`, `USDC`, `BTC`, `ETH`, `SOL`, `BNB`
  - `name` (varchar(100))
  - `decimals` (integer, default 8)
  - `is_active` (boolean, default true)

- **`exchanges`** (Global / Extendible):
  - `code` (varchar(50), PK) — `binance`, `bybit`, `bitget`, `custom`
  - `name` (varchar(100))
  - `is_active` (boolean, default true)

- **`banks`** (Privado por Workspace):
  - `id` (uuid, PK, default gen_random_uuid())
  - `workspace_id` (uuid, FK -> `workspaces.id`)
  - `country_code` (varchar(2), FK -> `countries.code`)
  - `name` (varchar(150))
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)

- **`payment_methods`** (Privado por Workspace):
  - `id` (uuid, PK, default gen_random_uuid())
  - `workspace_id` (uuid, FK -> `workspaces.id`)
  - `country_code` (varchar(2), nullable, FK -> `countries.code`)
  - `name` (varchar(150)) — Ej: Transferencia bancaria, Pago móvil, Zinli
  - `requires_bank` (boolean, default false)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)

---

### 1.5 Perfiles de Comisiones por País
- **`commission_profiles`**:
  - `id` (uuid, PK, default gen_random_uuid())
  - `workspace_id` (uuid, FK -> `workspaces.id`)
  - `country_code` (varchar(2), FK -> `countries.code`)
  - `fiat_currency` (varchar(3), FK -> `fiat_currencies.code`)
  - `operation_side` (varchar(10)) — `'buy'`, `'sell'`, `'all'`
  - `exchange_code` (varchar(50), nullable)
  - `payment_method_id` (uuid, nullable, FK -> `payment_methods.id`)
  - `fee_type` (varchar(20)) — `'percentage'`, `'fixed'`, `'percentage_and_fixed'`
  - `percentage` (numeric(6, 4), default 0.0000)
  - `fixed_fee` (numeric(15, 2), default 0.00)
  - `priority` (integer, default 1)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

---

### 1.6 Operaciones P2P
- **`p2p_operations`**:
  - `id` (uuid, PK, default gen_random_uuid())
  - `workspace_id` (uuid, FK -> `workspaces.id`)
  - `country_code` (varchar(2), FK -> `countries.code`)
  - `exchange_code` (varchar(50))
  - `operation_side` (varchar(10)) — `'buy'`, `'sell'`
  - `asset_symbol` (varchar(20), FK -> `assets.symbol`)
  - `asset_amount` (numeric(18, 8)) — Mayor a 0
  - `fiat_currency` (varchar(3), FK -> `fiat_currencies.code`)
  - `fiat_amount` (numeric(15, 2)) — Mayor a 0
  - `unit_rate` (numeric(18, 8)) — Calculado: fiat_amount / asset_amount
  - `merchant_fee` (numeric(15, 2), default 0.00)
  - `exchange_fee` (numeric(15, 2), default 0.00)
  - `payment_charge` (numeric(15, 2), default 0.00)
  - `commission_rule_snapshot` (jsonb, nullable) — Instantánea inmutable de la regla aplicada
  - `payment_method_id` (uuid, nullable, FK -> `payment_methods.id`)
  - `bank_id` (uuid, nullable, FK -> `banks.id`)
  - `payment_method_name_snapshot` (varchar(150), nullable) — Conserva nombre si se desactiva
  - `bank_name_snapshot` (varchar(150), nullable)
  - `occurred_at` (timestamptz, default now())
  - `status` (varchar(20), default 'completed') — `'completed'`, `'pending'`, `'cancelled'`
  - `external_reference` (varchar(100), nullable)
  - `counterparty_alias` (varchar(100), nullable)
  - `notes` (text, nullable)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

---

### 1.7 Panel Master: Promociones y Auditoría
- **`promotions`**:
  - `id` (uuid, PK, default gen_random_uuid())
  - `code` (varchar(50), UNIQUE) — Código normalizado (mayúsculas)
  - `description` (text)
  - `discount_type` (varchar(20)) — `'percentage'`, `'fixed'`
  - `discount_value` (numeric(10, 2))
  - `applicable_plans` (jsonb) — Ej: `["business", "enterprise"]`
  - `max_uses` (integer, nullable)
  - `times_used` (integer, default 0)
  - `valid_from` (timestamptz, default now())
  - `valid_until` (timestamptz, nullable)
  - `is_active` (boolean, default true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

- **`promotion_redemptions`**:
  - `id` (uuid, PK, default gen_random_uuid())
  - `promotion_id` (uuid, FK -> `promotions.id`)
  - `user_id` (text, FK -> `users.id`)
  - `workspace_id` (uuid, FK -> `workspaces.id`)
  - `billing_event_id` (uuid, FK -> `billing_events.id`)
  - `original_price` (numeric(10, 2))
  - `discounted_price` (numeric(10, 2))
  - `is_simulated` (boolean, default true)
  - `created_at` (timestamptz, default now())

- **`platform_admin_audit_logs`**:
  - `id` (uuid, PK, default gen_random_uuid())
  - `actor_id` (text, FK -> `users.id`) — Debe tener rol `platform_owner`
  - `action` (varchar(100)) — Ej: `'suspend_client'`, `'reactivate_client'`, `'create_promotion'`, `'change_plan'`
  - `target_type` (varchar(50)) — `'user'`, `'promotion'`, `'subscription'`
  - `target_id` (text)
  - `reason` (text)
  - `diff_payload` (jsonb, nullable) — Datos antes/después
  - `created_at` (timestamptz, default now())
