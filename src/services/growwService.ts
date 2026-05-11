import {
  API_CONFIG,
  GrowwClosePositionResponse,
  GrowwFuturesPosition,
  FuturesWebhookRequest,
  FuturesWebhookResponse,
} from '../config/api';

async function errorMessageFromResponse(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (body && typeof body.detail === 'string') return body.detail;
    if (body && typeof body.message === 'string') return body.message;
  } catch {
    /* ignore parse errors */
  }
  return `Request failed (${response.status})`;
}

export async function getGrowwFuturesPositions(params?: {
  userId?: number;
  limit?: number;
}): Promise<GrowwFuturesPosition[]> {
  const qs = new URLSearchParams();
  if (params?.userId != null && params.userId > 0) {
    qs.set('user_id', String(params.userId));
  }
  if (params?.limit != null && params.limit > 0) {
    qs.set('limit', String(params.limit));
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const url = `${API_CONFIG.NEW_BASE_URL}${API_CONFIG.ENDPOINTS.GROWW_FUTURES_USER_TRANSACTIONS}${suffix}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await errorMessageFromResponse(response));
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error('Invalid response from GROW positions API');
  }
  return data as GrowwFuturesPosition[];
}

export async function closeGrowwPosition(
  transactionId: string,
  sellingPrice?: number
): Promise<GrowwClosePositionResponse> {
  const qs = new URLSearchParams();
  if (sellingPrice != null && !Number.isNaN(sellingPrice)) {
    qs.set('selling_price', String(sellingPrice));
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const url = `${API_CONFIG.NEW_BASE_URL}${API_CONFIG.ENDPOINTS.GROWW_FUTURES_CLOSE_POSITION}/${transactionId}${suffix}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(await errorMessageFromResponse(response));
  }
  return response.json();
}

/** Same broker flow as the main dashboard: POST /api/futures/webhook */
export async function sendFuturesWebhook(
  webhookData: FuturesWebhookRequest
): Promise<FuturesWebhookResponse> {
  const response = await fetch(
    `${API_CONFIG.NEW_BASE_URL}${API_CONFIG.ENDPOINTS.FUTURES_WEBHOOK}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookData),
    }
  );
  if (!response.ok) {
    throw new Error(await errorMessageFromResponse(response));
  }
  const data: FuturesWebhookResponse = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Failed to send futures webhook');
  }
  return data;
}
