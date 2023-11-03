const INITIAL_RESPONSE_PROPS = {
  data: null,
  success: null,
  status: null,
};

export const responseFormatter = (data, success, status) => {
  return {
    ...INITIAL_RESPONSE_PROPS,
    data,
    success,
    status,
  };
};
