import { useReducer, useCallback } from 'react';

const httpReducer = (httpState, action) => {
  switch (action.type) {
    case 'SEND':
      return { ...httpState, loading: true, data: null };
    case 'RESPONSE':
      return { ...httpState, loading: false, data: action.responseData };
    case 'ERROR':
      return { loading: false, error: action.errorMessage };
    case 'CLEAR':
      return { ...httpState, error: null };
    default:
      throw new Error('Should not get there');
  }
};

const useHttp = () => {
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
    data: null,
  });

  const sendRequest = useCallback((url, method, body) => {
    dispatchHttp({ type: 'SEND' });

    fetch(url, {
      method: method,
      body: body,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((resData) => {
        dispatchHttp({ type: 'RESPONSE', responseData: resData });
      })
      .catch((error) => {
        dispatchHttp({ type: 'ERROR', errorMessage: 'omething went wrong!' });
      });
  }, []);

  return {
    isLoading: httpState.loading,
    data: httpState.data,
    error: httpState.error,
    sendRequest,
  };
};

export default useHttp;
