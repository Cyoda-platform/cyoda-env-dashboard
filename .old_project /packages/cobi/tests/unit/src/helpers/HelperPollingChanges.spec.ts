import HelperPollingChanges from "../../../../src/helpers/HelperPollingChanges";
import {createLocalVue} from "@vue/test-utils";
import * as process from "node:process";

vi.mock("element-ui", () => ({
  Notification: {
    info: vi.fn(() => ({close: vi.fn()})),
  },
}));

describe("HelperPollingChanges", () => {
  const loadFnMock = vi.fn();
  const converterToUiFnMock = vi.fn();
  const convertToBackendFnMock = vi.fn();
  const dataMock = {lastUpdated: 12345};
  beforeEach(() => {
    // Mount a Vue instance to use as vue property
    vi.useFakeTimers();
  });

  it("should start polling changes", () => {
    loadFnMock.mockResolvedValue({data: {lastUpdated: 54321}});
    new HelperPollingChanges({
      loadFn: loadFnMock,
      id: "someId",
      data: dataMock,
      convertToBackendFn: convertToBackendFnMock,
      configsCompareDialogPollingRef: null
    });
    vi.advanceTimersByTime(31 * 1000);
    expect(loadFnMock).toHaveBeenCalled();
  });
});
