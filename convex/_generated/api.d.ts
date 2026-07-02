/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as advisor from "../advisor.js";
import type * as advisorChat from "../advisorChat.js";
import type * as advisorChatInternal from "../advisorChatInternal.js";
import type * as advisorChatPublic from "../advisorChatPublic.js";
import type * as advisorJournal from "../advisorJournal.js";
import type * as advisorStats from "../advisorStats.js";
import type * as advisorV2 from "../advisorV2.js";
import type * as advisorV2Internal from "../advisorV2Internal.js";
import type * as advisorV2Public from "../advisorV2Public.js";
import type * as affiliates from "../affiliates.js";
import type * as commissions from "../commissions.js";
import type * as crons from "../crons.js";
import type * as deals from "../deals.js";
import type * as invoices from "../invoices.js";
import type * as leads from "../leads.js";
import type * as lib_advisorCrypto from "../lib/advisorCrypto.js";
import type * as lib_advisorPii from "../lib/advisorPii.js";
import type * as lib_advisorProviders from "../lib/advisorProviders.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_callMethodology from "../lib/callMethodology.js";
import type * as lib_tierConfig from "../lib/tierConfig.js";
import type * as marketing from "../marketing.js";
import type * as orders from "../orders.js";
import type * as products from "../products.js";
import type * as resources from "../resources.js";
import type * as support from "../support.js";
import type * as training from "../training.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  advisor: typeof advisor;
  advisorChat: typeof advisorChat;
  advisorChatInternal: typeof advisorChatInternal;
  advisorChatPublic: typeof advisorChatPublic;
  advisorJournal: typeof advisorJournal;
  advisorStats: typeof advisorStats;
  advisorV2: typeof advisorV2;
  advisorV2Internal: typeof advisorV2Internal;
  advisorV2Public: typeof advisorV2Public;
  affiliates: typeof affiliates;
  commissions: typeof commissions;
  crons: typeof crons;
  deals: typeof deals;
  invoices: typeof invoices;
  leads: typeof leads;
  "lib/advisorCrypto": typeof lib_advisorCrypto;
  "lib/advisorPii": typeof lib_advisorPii;
  "lib/advisorProviders": typeof lib_advisorProviders;
  "lib/auth": typeof lib_auth;
  "lib/callMethodology": typeof lib_callMethodology;
  "lib/tierConfig": typeof lib_tierConfig;
  marketing: typeof marketing;
  orders: typeof orders;
  products: typeof products;
  resources: typeof resources;
  support: typeof support;
  training: typeof training;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
