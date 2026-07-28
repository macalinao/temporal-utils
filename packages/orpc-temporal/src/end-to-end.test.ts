import type { RouterClient } from "@orpc/server";
import { beforeAll, describe, expect, test } from "bun:test";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { os } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { Temporal } from "temporal-polyfill";
import { temporalRPCSerializers } from "./temporal-rpc-serializers.js";

interface Payload {
  instant: Temporal.Instant;
  zonedDateTime: Temporal.ZonedDateTime;
  plainDate: Temporal.PlainDate;
  plainTime: Temporal.PlainTime;
  plainDateTime: Temporal.PlainDateTime;
  plainYearMonth: Temporal.PlainYearMonth;
  plainMonthDay: Temporal.PlainMonthDay;
  duration: Temporal.Duration;
}

const router = {
  /** Returns its input unchanged, exercising both request and response paths. */
  echo: os.handler(({ input }) => input as Payload),
  /** Proves the server received real Temporal instances, not strings. */
  addDay: os.handler(({ input }) =>
    (input as Temporal.PlainDate).add({ days: 1 }),
  ),
};

type Client = RouterClient<typeof router>;

/** Wires an RPCLink straight into an RPCHandler, skipping the network. */
const createClient = (): Client => {
  const handler = new RPCHandler(router, {
    customJsonSerializers: temporalRPCSerializers,
  });

  const link = new RPCLink({
    url: "http://localhost/rpc",
    customJsonSerializers: temporalRPCSerializers,
    fetch: async (request) => {
      const { matched, response } = await handler.handle(request, {
        prefix: "/rpc",
      });
      if (!matched) {
        throw new Error("no procedure matched");
      }
      return response;
    },
  });

  return createORPCClient(link);
};

describe("end-to-end over RPCHandler and RPCLink", () => {
  let client: Client;
  let sent: Payload;

  beforeAll(() => {
    client = createClient();
    const zoned = Temporal.ZonedDateTime.from(
      "2022-01-28T19:53+01:00[Europe/Berlin]",
    );
    sent = {
      instant: Temporal.Instant.from("2022-01-28T18:53:00.123456789Z"),
      zonedDateTime: zoned,
      plainDate: Temporal.PlainDate.from("2024-02-29"),
      plainTime: Temporal.PlainTime.from("01:02:03.123456789"),
      plainDateTime: Temporal.PlainDateTime.from("2024-02-29T01:02:03.000009"),
      plainYearMonth: Temporal.PlainYearMonth.from("2024-02"),
      plainMonthDay: Temporal.PlainMonthDay.from("02-29"),
      duration: Temporal.Duration.from("-P1Y2M3DT4H5M6.789S"),
    };
  });

  test("every Temporal type survives a real request and response", async () => {
    const received = await client.echo(sent);

    expect(received.instant).toBeInstanceOf(Temporal.Instant);
    expect(received.zonedDateTime).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(received.plainDate).toBeInstanceOf(Temporal.PlainDate);
    expect(received.plainTime).toBeInstanceOf(Temporal.PlainTime);
    expect(received.plainDateTime).toBeInstanceOf(Temporal.PlainDateTime);
    expect(received.plainYearMonth).toBeInstanceOf(Temporal.PlainYearMonth);
    expect(received.plainMonthDay).toBeInstanceOf(Temporal.PlainMonthDay);
    expect(received.duration).toBeInstanceOf(Temporal.Duration);

    expect(received.instant.equals(sent.instant)).toBe(true);
    expect(received.zonedDateTime.equals(sent.zonedDateTime)).toBe(true);
    expect(received.zonedDateTime.timeZoneId).toEqual("Europe/Berlin");
    expect(received.plainDate.equals(sent.plainDate)).toBe(true);
    expect(received.plainTime.equals(sent.plainTime)).toBe(true);
    expect(received.plainDateTime.equals(sent.plainDateTime)).toBe(true);
    expect(received.plainYearMonth.equals(sent.plainYearMonth)).toBe(true);
    expect(received.plainMonthDay.equals(sent.plainMonthDay)).toBe(true);
    expect(received.duration.toString()).toEqual(sent.duration.toString());
  });

  test("the server operates on a real Temporal instance", async () => {
    const result = await client.addDay(Temporal.PlainDate.from("2024-02-28"));

    expect(result).toBeInstanceOf(Temporal.PlainDate);
    expect(result.toString()).toEqual("2024-02-29");
  });

  test("a non-ISO calendar survives the trip", async () => {
    const received = await client.echo({
      ...sent,
      plainDate: Temporal.PlainDate.from("2024-02-29").withCalendar("hebrew"),
    });

    expect(received.plainDate.calendarId).toEqual("hebrew");
  });
});
