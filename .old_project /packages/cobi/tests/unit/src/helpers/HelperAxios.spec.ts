import HelperAxios from "../../../../src/helpers/HelperAxios";
import MockAdapter from "axios-mock-adapter";
import axios from "@cyoda/ui-lib/src/plugins/axios";

const mock = new MockAdapter(axios);
describe("HelperAxios.ts", () => {
  it("should return the same promise for the same URL", () => {
    const url = "/test";
    const response = { data: "test data" };

    mock.onGet(url).reply(200, response);

    const promise1 = HelperAxios.getStaticData(url);
    const promise2 = HelperAxios.getStaticData(url);

    expect(promise1).toEqual(promise2);
  });

  it("should make a GET request and return data", async () => {
    const url = "/test2";
    const response = "test data";

    mock.onGet(url).reply(200, response);

    const result = await HelperAxios.getStaticData(url);

    expect(result.data).toEqual(response);
  });

  it("should handle request errors", async () => {
    const url = "/test3";

    mock.onGet(url).networkError();

    await expect(HelperAxios.getStaticData(url)).rejects.toThrow();
  });
});
