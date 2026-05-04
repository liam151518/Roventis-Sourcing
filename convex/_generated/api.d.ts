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
import type * as affiliates from "../affiliates.js";
import type * as commissions from "../commissions.js";
import type * as crons from "../crons.js";
import type * as deals from "../deals.js";
import type * as leads from "../leads.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_tierConfig from "../lib/tierConfig.js";
import type * as marketing from "../marketing.js";
import type * as orders from "../orders.js";
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
  affiliates: typeof affiliates;
  commissions: typeof commissions;
  crons: typeof crons;
  deals: typeof deals;
  leads: typeof leads;
  "lib/auth": typeof lib_auth;
  "lib/tierConfig": typeof lib_tierConfig;
  marketing: typeof marketing;
  orders: typeof orders;
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
