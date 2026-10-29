import { describe, expect, it } from "vitest";
import { pluralCards } from "./plural";
import { isUuid } from "./validation";

describe("pluralCards", () => {
  it.each([[0, "карток"], [1, "картка"], [2, "картки"], [4, "картки"], [5, "карток"], [11, "карток"], [12, "карток"], [14, "карток"], [21, "картка"], [22, "картки"], [111, "карток"]])("uk %i", (n, w) => {
    expect(pluralCards("uk", n)).toBe(w);
  });
  it.each([[1, "карта"], [3, "карты"], [11, "карт"], [25, "карт"], [101, "карта"]])("ru %i", (n, w) => {
    expect(pluralCards("ru", n)).toBe(w);
  });
  it("en", () => {
    expect(pluralCards("en", 1)).toBe("card");
    expect(pluralCards("en", 2)).toBe("cards");
    expect(pluralCards("en", 0)).toBe("cards");
  });
});

describe("isUuid", () => {
  it("accepts uuids and rejects junk", () => {
    expect(isUuid("11111111-1111-4111-8111-111111111111")).toBe(true);
    expect(isUuid("nope")).toBe(false);
    expect(isUuid(undefined)).toBe(false);
    expect(isUuid("11111111-1111-4111-8111-111111111111'; --")).toBe(false);
  });
});
