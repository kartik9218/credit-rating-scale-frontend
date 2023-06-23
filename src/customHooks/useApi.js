import { useEffect, useRef, useReducer } from 'react'
import { HTTP_CLIENT, APIFY } from "helpers/Api";


export const useApi = (api, body = {}) => {
  const cacheData = useRef({});
  const initialState = {
    status: 'idle state',
    error: null,
    data: [],
  };
  
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'FETCHING':
        return { ...initialState, status: 'started fetching' }
      case 'FETCHED':
        return { ...initialState, status: 'data fetched', data: action.payload }
      case 'FETCH_ERROR':
        return { ...initialState, status: 'error', error: action.payload }
      default:
        return state
    }
  }, initialState);

  useEffect(() => {
    let revokeRequest = false
    if (!api || !api.trim()) return
    (async function(){
      dispatch({ type: 'FETCHING' })
      if (cacheData.current[api]) {
        const data = cacheData.current[api]
        dispatch({ type: 'FETCHED', payload: data })
      } else { 
        try {
          const response = await HTTP_CLIENT(APIFY(api),body);
          cacheData.current[api] = response
          if (revokeRequest) return
          dispatch({ type: 'FETCHED', payload: response })
        } catch (error) {
          if (revokeRequest) return
          dispatch({ type: 'FETCH_ERROR', payload: error.message })
        }
      }
    }())
    return () => {
      revokeRequest = true
    }
  }, [api])
  return state
}