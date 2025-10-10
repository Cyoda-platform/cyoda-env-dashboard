import "../../../../src/helpers/ConsoleLogHelper.js";

describe('ConsoleLogHelper tests', () => {
  it('should replace console.warn function correctly', () => {
    const originalConsoleWarn = console.warn;
    console.warn = vi.fn();

    console.warn('test message');
    expect(console.warn).toHaveBeenCalledWith('test message');

    console.warn = originalConsoleWarn;
  });

  it('should throw an error if the message contains "Ignoring non-existent input"', () => {
    expect(() => {
      console.warn('Ignoring non-existent input');
    }).toThrow(new Error('Ignoring non-existent input'));
  });

  it('should not throw an error if the message does not contain "Ignoring non-existent input"', () => {
    expect(() => {
      console.warn('Some other input');
    }).not.toThrow();
  });
});
