const isValidDate = require('../isValidDate');

describe("isValidDate.js", () => {
  it("should return true when date-string passed down", () => {
    expect(isValidDate('1988-03-21')).toBe(true);
  })

  it('should return false when random string like `foo` is passed down', () => {
    expect(isValidDate('foo')).toBe(false);
  });

  it('should return false when undefined is passed down', () => {
    expect(isValidDate(undefined)).toBe(false);
  });

  it('should return true when ISO 8061 format is passed down', () => {
    expect(isValidDate('2020-03-19T12:00:00Z')).toBe(true);
  });

  it('should return true when timestamp is passed down', () => {
    // Arrange
    const now = new Date();
    const nowTime = now.getTime();

    expect(isValidDate(nowTime)).toBe(true);
  });
});