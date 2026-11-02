import test from "node:test";
import assert from "node:assert/strict";
import { QueryClient } from "@tanstack/react-query";
import {
  SUPPORT_QUERY_KEYS,
  SUPPORT_CACHE_CONFIG,
} from "../src/features/support/constants/index.js";

test("Support Tickets React Query Caching Suite", async (t) => {
  await t.test("1. Query Keys: isolated strictly per company/tenant", () => {
    const keyA = SUPPORT_QUERY_KEYS.companyRequests("company-123", { limit: 100, sortOrder: "desc" });
    const keyB = SUPPORT_QUERY_KEYS.companyRequests("company-456", { limit: 100, sortOrder: "desc" });

    assert.notDeepStrictEqual(keyA, keyB, "Different companies must produce distinct cache keys");
    assert.deepStrictEqual(
      keyA,
      ["support-tickets", "company", "company-123", "requests", { limit: 100, sortOrder: "desc" }],
      "Query key structure must match specification"
    );
  });

  await t.test("2. Freshness & Stale Timing Configuration", () => {
    assert.strictEqual(SUPPORT_CACHE_CONFIG.STALE_TIME, 60000, "staleTime must be exactly 60 seconds");
    assert.strictEqual(SUPPORT_CACHE_CONFIG.GC_TIME, 600000, "gcTime must be 10 minutes");
  });

  await t.test("3. React Query Client: serves cached data within 60s without refetching", async () => {
    let networkCalls = 0;
    const queryClient = new QueryClient();

    const fetchTickets = async () => {
      networkCalls++;
      return {
        items: [{ id: "ticket-1", subject: "Printer broken", status: "OPEN" }],
        total: 1,
      };
    };

    const queryKey = SUPPORT_QUERY_KEYS.companyRequests("facebook-co", { limit: 100, sortOrder: "desc" });

    // First visit: fetch data
    const firstResult = await queryClient.fetchQuery({
      queryKey,
      queryFn: fetchTickets,
      staleTime: SUPPORT_CACHE_CONFIG.STALE_TIME,
    });

    assert.strictEqual(networkCalls, 1, "First visit must make 1 API request");
    assert.strictEqual(firstResult.items.length, 1);

    // Verify query is fresh (not stale)
    const query = queryClient.getQueryCache().find({ queryKey });
    assert.ok(query, "Query must exist in QueryCache");
    assert.strictEqual(query.isStale(), false, "Query must NOT be stale within 60s");

    // Second visit within 60s: read from cache
    const secondResult = await queryClient.fetchQuery({
      queryKey,
      queryFn: fetchTickets,
      staleTime: SUPPORT_CACHE_CONFIG.STALE_TIME,
    });

    assert.strictEqual(networkCalls, 1, "Second visit within 60s must NOT make another API request");
    assert.strictEqual(secondResult.items[0].subject, "Printer broken");
  });

  await t.test("4. Status update mutation updates and invalidates cache", async () => {
    const queryClient = new QueryClient();
    const queryKey = SUPPORT_QUERY_KEYS.companyRequests("company-1", { limit: 100, sortOrder: "desc" });

    queryClient.setQueryData(queryKey, {
      items: [
        { id: "ticket-1", subject: "Issue 1", status: "OPEN" },
        { id: "ticket-2", subject: "Issue 2", status: "OPEN" },
      ],
      total: 2,
    });

    // Simulate status change update
    queryClient.setQueriesData(
      { queryKey: SUPPORT_QUERY_KEYS.company("company-1") },
      (old) => ({
        ...old,
        items: old.items.map((i) => (i.id === "ticket-1" ? { ...i, status: "IN_PROGRESS" } : i)),
      })
    );

    const updated = queryClient.getQueryData(queryKey);
    assert.strictEqual(updated.items[0].status, "IN_PROGRESS", "Ticket 1 status must be IN_PROGRESS");
    assert.strictEqual(updated.items[1].status, "OPEN", "Ticket 2 status must remain OPEN");

    // Invalidate company queries
    await queryClient.invalidateQueries({
      queryKey: SUPPORT_QUERY_KEYS.company("company-1"),
    });

    const query = queryClient.getQueryCache().find({ queryKey });
    assert.strictEqual(query.isStale(), true, "Invalidated query must be marked as stale for background refetch");
  });

  await t.test("5. Reply mutation marks ticket RESOLVED and attaches reply", async () => {
    const queryClient = new QueryClient();
    const queryKey = SUPPORT_QUERY_KEYS.companyRequests("company-1", { limit: 100, sortOrder: "desc" });

    queryClient.setQueryData(queryKey, {
      items: [{ id: "ticket-1", subject: "Need access", status: "OPEN" }],
      total: 1,
    });

    // Simulate reply mutation logic
    const replyText = "Access granted. Please check your email.";
    const nowIso = new Date().toISOString();

    queryClient.setQueriesData(
      { queryKey: SUPPORT_QUERY_KEYS.company("company-1") },
      (old) => ({
        ...old,
        items: old.items.map((i) =>
          i.id === "ticket-1"
            ? { ...i, adminReply: replyText, repliedAt: nowIso, status: "RESOLVED" }
            : i
        ),
      })
    );

    const data = queryClient.getQueryData(queryKey);
    assert.strictEqual(data.items[0].status, "RESOLVED", "Ticket must be marked RESOLVED");
    assert.strictEqual(data.items[0].adminReply, replyText, "Ticket must store the reply text");
    assert.strictEqual(data.items[0].repliedAt, nowIso, "Ticket must store the reply timestamp");
  });

  await t.test("6. Multi-tenant company switching: Company B cannot access Company A's cache", async () => {
    const queryClient = new QueryClient();

    const keyCompanyA = SUPPORT_QUERY_KEYS.companyRequests("company-A", { limit: 100, sortOrder: "desc" });
    const keyCompanyB = SUPPORT_QUERY_KEYS.companyRequests("company-B", { limit: 100, sortOrder: "desc" });

    queryClient.setQueryData(keyCompanyA, {
      items: [{ id: "ticket-A", subject: "Secret Company A ticket" }],
      total: 1,
    });

    const dataA = queryClient.getQueryData(keyCompanyA);
    const dataB = queryClient.getQueryData(keyCompanyB);

    assert.ok(dataA, "Company A must have its cached data");
    assert.strictEqual(dataB, undefined, "Company B must NOT have Company A's cached data");
  });

  await t.test("7. Logout clears the entire query cache", () => {
    const queryClient = new QueryClient();

    queryClient.setQueryData(
      SUPPORT_QUERY_KEYS.companyRequests("company-1", { limit: 100, sortOrder: "desc" }),
      { items: [{ id: "t1" }] }
    );
    queryClient.setQueryData(
      SUPPORT_QUERY_KEYS.companyRequests("company-2", { limit: 100, sortOrder: "desc" }),
      { items: [{ id: "t2" }] }
    );

    assert.strictEqual(queryClient.getQueryCache().getAll().length, 2);

    // Logout: purge all queries
    queryClient.clear();

    assert.strictEqual(queryClient.getQueryCache().getAll().length, 0, "Query cache must be empty after clear()");
  });
});

