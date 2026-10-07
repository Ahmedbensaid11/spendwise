import axios from 'axios'

export function getApiError(error: unknown) {
  if (!axios.isAxiosError(error)) return 'Something went wrong. Please try again.'
  return error.response?.data?.detail ?? error.response?.data?.message ?? 'Please check your details and try again.'
}
