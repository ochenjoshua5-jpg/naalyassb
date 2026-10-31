import { test } from "node:test";
import assert from "node:assert/strict";
import { REDACTED, scrubEvent, scrubText, scrubValue } from "../../lib/observability/scrub.ts";

test("emails are redacted wherever they appear in text", () => {
  assert.equal(scrubText("Contact jane.doe@example.com today"), `Contact ${REDACTED} today`);
});

test("Ugandan and international phone numbers are redacted", () => {
  for (const phone of ["+256 772 345 678", "0772345678", "+256-772-345-678", "772 345 678"]) {
    assert.equal(scrubText(`call ${phone} now`), `call ${REDACTED} now`, phone);
  }
});

test("fields that carry personal names, phone and email are replaced whatever their value", () => {
  const out = scrubValue({
    parentName: "Grace Nakato",
    guardian_name: "Moses Ssali",
    childName: "Brian",
    phone: "0700000000",
    email: "x@y.ug",
    status: "new",
    enquiryId: "enq_123",
  });
  assert.equal(out.parentName, REDACTED);
  assert.equal(out.guardian_name, REDACTED);
  assert.equal(out.childName, REDACTED);
  assert.equal(out.phone, REDACTED);
  assert.equal(out.email, REDACTED);
  assert.equal(out.status, "new", "non-personal fields are kept");
  assert.equal(out.enquiryId, "enq_123");
});

test("nested objects and arrays are scrubbed deeply", () => {
  const out = scrubValue({ extra: { items: [{ message: "reach me at a@b.co" }, { firstName: "Asha" }] } });
  assert.equal(out.extra.items[0].message, `reach me at ${REDACTED}`);
  assert.equal(out.extra.items[1].firstName, REDACTED);
});

test("circular references do not crash the scrubber", () => {
  const a = { name: "x", note: "ok" };
  a.self = a;
  const out = scrubValue(a);
  assert.equal(out.self, REDACTED);
});

test("beforeSend removes user, cookies, headers and query string", () => {
  const event = {
    message: "Failed for parent@example.com",
    user: { ip_address: "1.2.3.4", email: "p@example.com" },
    request: { url: "https://naalyaschools.ac.ug/x", cookies: { a: "b" }, headers: { cookie: "a=b" }, query_string: "q=1" },
  };
  const out = scrubEvent(event);
  assert.equal(out.user, undefined);
  assert.equal(out.request.cookies, undefined);
  assert.equal(out.request.headers, undefined);
  assert.equal(out.request.query_string, undefined);
  assert.equal(out.request.url, "https://naalyaschools.ac.ug/x");
  assert.equal(out.message, `Failed for ${REDACTED}`);
});
