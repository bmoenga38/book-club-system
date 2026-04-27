/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as audit from "../audit.js";
import type * as books from "../books.js";
import type * as borrowings from "../borrowings.js";
import type * as churches from "../churches.js";
import type * as crons from "../crons.js";
import type * as otp from "../otp.js";
import type * as penalties from "../penalties.js";
import type * as reports from "../reports.js";
import type * as seed from "../seed.js";
import type * as smsActions from "../smsActions.js";
import type * as users from "../users.js";
import type * as xpEvents from "../xpEvents.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  audit: typeof audit;
  books: typeof books;
  borrowings: typeof borrowings;
  churches: typeof churches;
  crons: typeof crons;
  otp: typeof otp;
  penalties: typeof penalties;
  reports: typeof reports;
  seed: typeof seed;
  smsActions: typeof smsActions;
  users: typeof users;
  xpEvents: typeof xpEvents;
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
