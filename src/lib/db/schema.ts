import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  uuid,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* =========================================================================
   1. Autenticación y Cuentas (Compatibilidad con Better Auth)
   ========================================================================= */

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    role: varchar("role", { length: 50 }).default("merchant").notNull(), // 'merchant' | 'platform_owner'
    accountStatus: varchar("account_status", { length: 50 }).default("active").notNull(), // 'active' | 'suspended' | 'deactivated'
    statusReason: text("status_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("users_role_idx").on(table.role),
    index("users_status_idx").on(table.accountStatus),
  ]
);

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  password: text("password"),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* =========================================================================
   2. Espacios de Trabajo (Multi-Tenancy)
   ========================================================================= */

export const workspaces = pgTable(
  "workspaces",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").default("Mi Espacio P2P").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" })
      .unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("workspaces_owner_idx").on(table.ownerId)]
);

export const workspaceSettings = pgTable("workspace_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspaceId: uuid("workspace_id")
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" })
    .unique(),
  primaryCountry: varchar("primary_country", { length: 2 }).default("VE").notNull(),
  timezone: text("timezone").default("America/Caracas").notNull(),
  enabledFiatCurrencies: jsonb("enabled_fiat_currencies")
    .$type<string[]>()
    .default(["VES", "USD"])
    .notNull(),
  initialCryptoBalances: jsonb("initial_crypto_balances")
    .$type<Record<string, string>>()
    .default({ USDT: "0.00" })
    .notNull(),
  initialFiatBalances: jsonb("initial_fiat_balances")
    .$type<Record<string, string>>()
    .default({ VES: "0.00", USD: "0.00" })
    .notNull(),
  taxId: text("tax_id"),
  businessName: text("business_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* =========================================================================
   3. Planes y Facturación Simulada (Demo Billing)
   ========================================================================= */

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(), // 'free_trial' | 'business' | 'enterprise'
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  features: jsonb("features").$type<string[]>().default([]).notNull(),
  trialDays: integer("trial_days").default(0).notNull(),
  demoPriceUsd: numeric("demo_price_usd", { precision: 10, scale: 2 }).default("0.00").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 50 }).default("trialing").notNull(), // 'trialing' | 'active' | 'expired' | 'cancelled'
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    provider: varchar("provider", { length: 50 }).default("demo").notNull(),
    isSimulated: boolean("is_simulated").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("subscriptions_workspace_idx").on(table.workspaceId),
    index("subscriptions_status_idx").on(table.status),
  ]
);

export const billingEvents = pgTable(
  "billing_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    planId: uuid("plan_id")
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    promotionId: uuid("promotion_id"),
    amountDisplayed: numeric("amount_displayed", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    outcome: varchar("outcome", { length: 50 }).notNull(), // 'approved' | 'pending' | 'failed'
    demoReference: varchar("demo_reference", { length: 100 }).notNull(),
    isSimulated: boolean("is_simulated").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("billing_events_workspace_idx").on(table.workspaceId)]
);

/* =========================================================================
   4. Catálogos Globales (Países, Monedas, Activos, Exchanges)
   ========================================================================= */

export const countries = pgTable("countries", {
  code: varchar("code", { length: 2 }).primaryKey(), // 'VE', 'CO', 'BR', 'AR', 'EC', 'PE', 'CL'
  name: varchar("name", { length: 100 }).notNull(),
  defaultFiat: varchar("default_fiat", { length: 3 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const fiatCurrencies = pgTable("fiat_currencies", {
  code: varchar("code", { length: 3 }).primaryKey(), // 'VES', 'COP', 'BRL', 'ARS', 'USD', 'PEN', 'CLP'
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  decimals: integer("decimals").default(2).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const assets = pgTable("assets", {
  symbol: varchar("symbol", { length: 20 }).primaryKey(), // 'USDT', 'USDC', 'BTC', 'ETH', 'SOL', 'BNB'
  name: varchar("name", { length: 100 }).notNull(),
  decimals: integer("decimals").default(8).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const exchanges = pgTable("exchanges", {
  code: varchar("code", { length: 50 }).primaryKey(), // 'binance', 'bybit', 'bitget', 'custom'
  name: varchar("name", { length: 100 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

/* =========================================================================
   5. Catálogos Privados del Comerciante (Bancos y Métodos de Pago)
   ========================================================================= */

export const banks = pgTable(
  "banks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .references(() => countries.code, { onDelete: "restrict" }),
    name: varchar("name", { length: 150 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("banks_workspace_country_idx").on(table.workspaceId, table.countryCode)]
);

export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 }).references(() => countries.code, {
      onDelete: "restrict",
    }),
    name: varchar("name", { length: 150 }).notNull(),
    requiresBank: boolean("requires_bank").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("payment_methods_workspace_idx").on(table.workspaceId)]
);

/* =========================================================================
   6. Perfiles de Comisiones por País
   ========================================================================= */

export const commissionProfiles = pgTable(
  "commission_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .references(() => countries.code, { onDelete: "restrict" }),
    fiatCurrency: varchar("fiat_currency", { length: 3 })
      .notNull()
      .references(() => fiatCurrencies.code, { onDelete: "restrict" }),
    operationSide: varchar("operation_side", { length: 10 }).default("all").notNull(), // 'buy' | 'sell' | 'all'
    exchangeCode: varchar("exchange_code", { length: 50 }),
    paymentMethodId: uuid("payment_method_id").references(() => paymentMethods.id, {
      onDelete: "set null",
    }),
    feeType: varchar("fee_type", { length: 20 }).default("percentage").notNull(), // 'percentage' | 'fixed' | 'percentage_and_fixed'
    percentage: numeric("percentage", { precision: 6, scale: 4 }).default("0.0000").notNull(),
    fixedFee: numeric("fixed_fee", { precision: 15, scale: 2 }).default("0.00").notNull(),
    priority: integer("priority").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("commission_profiles_workspace_country_idx").on(
      table.workspaceId,
      table.countryCode,
      table.operationSide
    ),
  ]
);

/* =========================================================================
   7. Bitácora de Operaciones P2P
   ========================================================================= */

export const p2pOperations = pgTable(
  "p2p_operations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    countryCode: varchar("country_code", { length: 2 })
      .notNull()
      .references(() => countries.code, { onDelete: "restrict" }),
    exchangeCode: varchar("exchange_code", { length: 50 }).notNull(),
    operationSide: varchar("operation_side", { length: 10 }).notNull(), // 'buy' | 'sell'
    assetSymbol: varchar("asset_symbol", { length: 20 })
      .notNull()
      .references(() => assets.symbol, { onDelete: "restrict" }),
    assetAmount: numeric("asset_amount", { precision: 18, scale: 8 }).notNull(),
    fiatCurrency: varchar("fiat_currency", { length: 3 })
      .notNull()
      .references(() => fiatCurrencies.code, { onDelete: "restrict" }),
    fiatAmount: numeric("fiat_amount", { precision: 15, scale: 2 }).notNull(),
    unitRate: numeric("unit_rate", { precision: 18, scale: 8 }).notNull(), // fiat_amount / asset_amount
    merchantFee: numeric("merchant_fee", { precision: 15, scale: 2 }).default("0.00").notNull(),
    exchangeFee: numeric("exchange_fee", { precision: 15, scale: 2 }).default("0.00").notNull(),
    paymentCharge: numeric("payment_charge", { precision: 15, scale: 2 }).default("0.00").notNull(),
    commissionRuleSnapshot: jsonb("commission_rule_snapshot"), // Instantánea inmutable
    paymentMethodId: uuid("payment_method_id").references(() => paymentMethods.id, {
      onDelete: "set null",
    }),
    bankId: uuid("bank_id").references(() => banks.id, { onDelete: "set null" }),
    paymentMethodNameSnapshot: varchar("payment_method_name_snapshot", { length: 150 }),
    bankNameSnapshot: varchar("bank_name_snapshot", { length: 150 }),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).defaultNow().notNull(),
    status: varchar("status", { length: 20 }).default("completed").notNull(), // 'completed' | 'pending' | 'cancelled'
    externalReference: varchar("external_reference", { length: 100 }),
    counterpartyAlias: varchar("counterparty_alias", { length: 100 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("p2p_operations_workspace_occurred_idx").on(table.workspaceId, table.occurredAt),
    index("p2p_operations_workspace_status_idx").on(table.workspaceId, table.status),
    index("p2p_operations_workspace_fiat_idx").on(table.workspaceId, table.fiatCurrency),
    index("p2p_operations_workspace_asset_idx").on(table.workspaceId, table.assetSymbol),
  ]
);

/* =========================================================================
   8. Panel Master: Promociones, Redenciones y Auditoría Global
   ========================================================================= */

export const promotions = pgTable(
  "promotions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    description: text("description"),
    discountType: varchar("discount_type", { length: 20 }).default("percentage").notNull(), // 'percentage' | 'fixed'
    discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
    applicablePlans: jsonb("applicable_plans").$type<string[]>().default(["business", "enterprise"]).notNull(),
    maxUses: integer("max_uses"),
    timesUsed: integer("times_used").default(0).notNull(),
    validFrom: timestamp("valid_from", { withTimezone: true }).defaultNow().notNull(),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("promotions_code_idx").on(table.code)]
);

export const promotionRedemptions = pgTable(
  "promotion_redemptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    promotionId: uuid("promotion_id")
      .notNull()
      .references(() => promotions.id, { onDelete: "restrict" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    workspaceId: uuid("workspace_id")
      .notNull()
      .references(() => workspaces.id, { onDelete: "cascade" }),
    billingEventId: uuid("billing_event_id")
      .notNull()
      .references(() => billingEvents.id, { onDelete: "cascade" }),
    originalPrice: numeric("original_price", { precision: 10, scale: 2 }).notNull(),
    discountedPrice: numeric("discounted_price", { precision: 10, scale: 2 }).notNull(),
    isSimulated: boolean("is_simulated").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("promo_redemptions_workspace_idx").on(table.workspaceId),
    index("promo_redemptions_promo_idx").on(table.promotionId),
  ]
);

export const platformAdminAuditLogs = pgTable(
  "platform_admin_audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    action: varchar("action", { length: 100 }).notNull(), // 'SUSPEND_CLIENT' | 'REACTIVATE_CLIENT' | 'CREATE_PROMOTION'
    targetType: varchar("target_type", { length: 50 }).notNull(), // 'user' | 'promotion' | 'subscription'
    targetId: text("target_id").notNull(),
    reason: text("reason").notNull(),
    diffPayload: jsonb("diff_payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("audit_logs_actor_idx").on(table.actorId),
    index("audit_logs_created_idx").on(table.createdAt),
  ]
);

/* =========================================================================
   Relaciones de Drizzle (Relations)
   ========================================================================= */

export const usersRelations = relations(users, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [users.id],
    references: [workspaces.ownerId],
  }),
  sessions: many(sessions),
  accounts: many(accounts),
  auditLogs: many(platformAdminAuditLogs),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  settings: one(workspaceSettings, {
    fields: [workspaces.id],
    references: [workspaceSettings.workspaceId],
  }),
  subscriptions: many(subscriptions),
  banks: many(banks),
  paymentMethods: many(paymentMethods),
  commissionProfiles: many(commissionProfiles),
  p2pOperations: many(p2pOperations),
}));

export const workspaceSettingsRelations = relations(workspaceSettings, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceSettings.workspaceId],
    references: [workspaces.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [subscriptions.workspaceId],
    references: [workspaces.id],
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
  billingEvents: many(billingEvents),
}));

export const banksRelations = relations(banks, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [banks.workspaceId],
    references: [workspaces.id],
  }),
  operations: many(p2pOperations),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [paymentMethods.workspaceId],
    references: [workspaces.id],
  }),
  operations: many(p2pOperations),
}));

export const countriesRelations = relations(countries, ({ many }) => ({
  operations: many(p2pOperations),
}));

export const fiatCurrenciesRelations = relations(fiatCurrencies, ({ many }) => ({
  operations: many(p2pOperations),
}));

export const assetsRelations = relations(assets, ({ many }) => ({
  operations: many(p2pOperations),
}));

export const p2pOperationsRelations = relations(p2pOperations, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [p2pOperations.workspaceId],
    references: [workspaces.id],
  }),
  country: one(countries, {
    fields: [p2pOperations.countryCode],
    references: [countries.code],
  }),
  fiat: one(fiatCurrencies, {
    fields: [p2pOperations.fiatCurrency],
    references: [fiatCurrencies.code],
  }),
  asset: one(assets, {
    fields: [p2pOperations.assetSymbol],
    references: [assets.symbol],
  }),
  bank: one(banks, {
    fields: [p2pOperations.bankId],
    references: [banks.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [p2pOperations.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

export const platformAdminAuditLogsRelations = relations(
  platformAdminAuditLogs,
  ({ one }) => ({
    actor: one(users, {
      fields: [platformAdminAuditLogs.actorId],
      references: [users.id],
    }),
  })
);

