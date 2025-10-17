// Mock for @cyoda/http-api-react
// This will be replaced with the actual package once it's available

const axios = {
  get: async (url: string) => {
    console.log('Mock GET:', url);
    return { data: [], status: 200 };
  },
  post: async (url: string, data: any) => {
    console.log('Mock POST:', url, data);
    return { data, status: 200 };
  },
  put: async (url: string, data: any) => {
    console.log('Mock PUT:', url, data);
    return { data, status: 200 };
  },
  delete: async (url: string) => {
    console.log('Mock DELETE:', url);
    return { data: null, status: 200 };
  },
};

export default axios;

