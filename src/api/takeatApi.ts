const BASE_URL = 'https://public-api.takeat.app';

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  restaurantId: number;
  apiKey: string;
}

export interface KDSItem {
  id: number;
  name: string;
  qty: number;
  obs?: string;
  complements: Array<{
    category: string;
    name: string;
    qty: number;
  }>;
}

export interface KDSOrder {
  id: string | number;
  sessionId?: number;
  orderKey?: string;
  tableNumber?: string | number;
  tableLabel: string;
  type: 'table' | 'delivery' | 'balcao';
  status: string;
  createdAt: string;
  brandName?: string;
  clientName?: string;
  items: KDSItem[];
  isNew: boolean;
}

const STORAGE_KEY = 'takeat_kds_auth_v1';

export function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as StoredAuth : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(STORAGE_KEY);
}

async function postOAuthForm(params: Record<string, string>): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const body = new URLSearchParams(params);
  const resp = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!resp.ok) {
    const errText = await resp.text();
    let msg = `Falha na autenticação (${resp.status})`;
    try {
      const json = JSON.parse(errText) as { error_description?: string; message?: string; error?: string };
      msg = json.error_description || json.message || json.error || msg;
    } catch {
      if (errText) msg = `${msg} — ${errText}`;
    }
    throw new Error(msg);
  }

  return resp.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}

export async function exchangeApiKey(apiKey: string, restaurantId: number): Promise<StoredAuth> {
  const cleanKey = apiKey.trim();
  const data = await postOAuthForm({
    grant_type: 'api_key',
    api_key: cleanKey,
  });

  const auth: StoredAuth = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000,
    restaurantId,
    apiKey: cleanKey,
  };
  saveAuth(auth);
  return auth;
}

export async function refreshToken(auth: StoredAuth): Promise<StoredAuth | null> {
  try {
    const data = await postOAuthForm({
      grant_type: 'refresh_token',
      refresh_token: auth.refreshToken,
    });

    const updated: StoredAuth = {
      ...auth,
      accessToken: data.access_token,
      refreshToken: data.refresh_token ?? auth.refreshToken,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000,
    };
    saveAuth(updated);
    return updated;
  } catch {
    return null;
  }
}

async function apiFetch(path: string, auth: StoredAuth, retried = false): Promise<unknown> {
  const resp = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (resp.status === 401 && !retried) {
    const refreshed = await refreshToken(auth);
    if (refreshed) return apiFetch(path, refreshed, true);
    throw new Error('UNAUTHORIZED');
  }

  if (!resp.ok) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`HTTP ${resp.status}: ${path} — ${errText.slice(0, 120)}`);
  }

  return resp.json();
}

function parseOrderItems(rawOrders: Record<string, unknown>[]): KDSItem[] {
  return rawOrders.map((ord, idx) => {
    const product = ord.product as Record<string, unknown> | undefined;
    const name = String(product?.name ?? ord.name ?? ord.product_name ?? 'Item');
    const qty = Number(ord.amount ?? ord.qty ?? ord.quantity ?? 1);
    const obs = ord.details ? String(ord.details) : ord.observation ? String(ord.observation) : ord.obs ? String(ord.obs) : undefined;

    const complements: KDSItem['complements'] = [];

    // Parse complement_categories (Takeat official schema)
    const complementCategories = (ord.complement_categories ?? []) as Record<string, unknown>[];
    if (Array.isArray(complementCategories)) {
      complementCategories.forEach((catWrapper) => {
        const catInfo = (catWrapper.complement_category ?? catWrapper) as Record<string, unknown>;
        const catName = String(catInfo.name ?? catInfo.category ?? 'Complemento');

        // Check order_complements (standard in Takeat)
        const orderComplements = (catWrapper.order_complements ?? catWrapper.items ?? catWrapper.complements ?? []) as Record<string, unknown>[];
        if (Array.isArray(orderComplements)) {
          orderComplements.forEach((compWrapper) => {
            const comp = (compWrapper.complement ?? compWrapper) as Record<string, unknown>;
            const compName = String(comp.name ?? comp.complement_name ?? '');
            if (compName) {
              complements.push({
                category: catName,
                name: compName,
                qty: Number(compWrapper.amount ?? compWrapper.qty ?? 1),
              });
            }
          });
        }
      });
    }

    return {
      id: Number(ord.id ?? idx),
      name,
      qty,
      obs: obs?.trim() ? obs.trim() : undefined,
      complements,
    };
  });
}

export async function fetchOrders(auth: StoredAuth): Promise<KDSOrder[]> {
  const now = new Date();
  // Fetch up to last 24h of sessions (API V1 accepts up to 3 days)
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const end = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

  const query = new URLSearchParams({
    restaurant_id: String(auth.restaurantId),
    start_date: start,
    end_date: end,
  });

  const raw = await apiFetch(`/v1/table-sessions?${query.toString()}`, auth) as unknown;

  const sessions: Record<string, unknown>[] = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : Array.isArray((raw as Record<string, unknown>)?.data)
      ? ((raw as Record<string, unknown>).data as Record<string, unknown>[])
      : [];

  const orders: KDSOrder[] = [];

  for (const session of sessions) {
    const status = String(session.status ?? '').toLowerCase();
    if (status === 'canceled' || status === 'cancelled') continue;

    const sessionId = Number(session.id);
    const sessionNumber = session.session_number ?? session.id;
    const tableObj = session.table as Record<string, unknown> | undefined;
    const tableNumber = tableObj?.table_number ?? session.table_number;
    const tableType = String(tableObj?.table_type ?? '').toLowerCase();
    const isDelivery = Boolean(session.is_delivery || tableType === 'delivery' || String(session.sales_channel ?? '').toUpperCase().includes('IFOOD'));
    const isBalcao = Boolean(session.with_withdrawal || tableType === 'takeaway' || tableType === 'balcao' || (!isDelivery && (!tableNumber || Number(tableNumber) < 0)));

    let orderType: KDSOrder['type'] = 'table';
    let tableLabel = `Mesa ${String(tableNumber ?? session.name ?? '?')}`;

    const buyer = session.buyer as Record<string, unknown> | undefined;
    const clientName = buyer?.name ? String(buyer.name) : undefined;
    const attendancePassword = session.attendance_password ? String(session.attendance_password) : undefined;

    if (isDelivery) {
      orderType = 'delivery';
      const channel = String(session.sales_channel ?? 'Delivery');
      tableLabel = `${channel} #${String(sessionNumber)}${clientName ? ` · ${clientName}` : ''}`;
    } else if (isBalcao) {
      orderType = 'balcao';
      const pass = attendancePassword ? `Senha ${attendancePassword}` : `#${String(sessionNumber)}`;
      tableLabel = `Balcão ${pass}${clientName ? ` · ${clientName}` : ''}`;
    }

    const brandName = session.brand_name ? String(session.brand_name) : undefined;
    const createdAt = String(session.start_time ?? session.created_at ?? now.toISOString());

    // Extract items across bills and order_baskets
    const rawItemsToParse: Record<string, unknown>[] = [];

    const bills = (session.bills ?? []) as Record<string, unknown>[];
    if (Array.isArray(bills) && bills.length > 0) {
      for (const bill of bills) {
        const baskets = (bill.order_baskets ?? []) as Record<string, unknown>[];
        for (const basket of baskets) {
          if (basket.canceled_at) continue;
          const bOrders = (basket.orders ?? []) as Record<string, unknown>[];
          rawItemsToParse.push(...bOrders);
        }
      }
    } else if (Array.isArray(session.order_baskets)) {
      for (const basket of session.order_baskets as Record<string, unknown>[]) {
        if (basket.canceled_at) continue;
        const bOrders = (basket.orders ?? []) as Record<string, unknown>[];
        rawItemsToParse.push(...bOrders);
      }
    } else if (Array.isArray(session.orders)) {
      rawItemsToParse.push(...(session.orders as Record<string, unknown>[]));
    }

    const items = parseOrderItems(rawItemsToParse);

    orders.push({
      id: sessionId,
      sessionId,
      orderKey: String(sessionNumber),
      tableNumber: tableNumber ? String(tableNumber) : undefined,
      tableLabel,
      type: orderType,
      status: String(session.status ?? 'open'),
      createdAt,
      brandName,
      clientName,
      items,
      isNew: false,
    });
  }

  // Filter: prefer active sessions (not ended) if any exist
  const activeOnly = orders.filter(o => {
    const s = o.status.toLowerCase();
    return s === 'open' || s === 'closing' || s === 'pending' || s === 'in_production' || s === 'accepted' || s === 'waiting';
  });

  // If there are currently active orders, return them. Otherwise return recent ones so screen isn't empty when testing.
  return (activeOnly.length > 0 ? activeOnly : orders).slice(0, 30);
}
