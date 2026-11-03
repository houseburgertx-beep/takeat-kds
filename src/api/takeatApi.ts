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
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${path}`);
  return resp.json();
}

export async function exchangeApiKey(apiKey: string, restaurantId: number): Promise<StoredAuth> {
  const resp = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grant_type: 'api_key', api_key: apiKey }),
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Falha na autenticação: ${resp.status} — ${err}`);
  }
  const data = await resp.json() as { access_token: string; refresh_token: string; expires_in: number };
  const auth: StoredAuth = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 - 60_000,
    restaurantId,
    apiKey,
  };
  saveAuth(auth);
  return auth;
}

export async function refreshToken(auth: StoredAuth): Promise<StoredAuth | null> {
  try {
    const resp = await fetch(`${BASE_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: auth.refreshToken }),
    });
    if (!resp.ok) return null;
    const data = await resp.json() as { access_token: string; refresh_token: string; expires_in: number };
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

function inferOrderType(order: Record<string, unknown>): KDSOrder['type'] {
  const t = String(order.type ?? order.order_type ?? '').toLowerCase();
  if (t.includes('delivery') || t.includes('ifood')) return 'delivery';
  if (t.includes('balcao') || t.includes('balcão') || t.includes('counter')) return 'balcao';
  return 'table';
}

function parseItems(raw: unknown): KDSItem[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Record<string, unknown>[]).map((item, idx) => {
    const complements: KDSItem['complements'] = [];
    const rawComplements = (item.complements ?? item.complement_categories ?? []) as unknown;
    if (Array.isArray(rawComplements)) {
      (rawComplements as Record<string, unknown>[]).forEach((cat) => {
        const catName = String(cat.name ?? cat.category ?? 'Adicional');
        const catItems = Array.isArray(cat.itens) ? cat.itens : Array.isArray(cat.items) ? cat.items : [cat];
        (catItems as Record<string, unknown>[]).forEach((c) => {
          complements.push({
            category: catName,
            name: String(c.name ?? c.complement ?? ''),
            qty: Number(c.qty ?? c.quantity ?? c.amount ?? 1),
          });
        });
      });
    }
    return {
      id: Number(item.id ?? idx),
      name: String(item.name ?? item.product_name ?? item.product ?? 'Item'),
      qty: Number(item.qty ?? item.quantity ?? item.amount ?? 1),
      obs: item.obs ? String(item.obs) : item.observation ? String(item.observation) : undefined,
      complements,
    };
  });
}

export async function fetchOrders(auth: StoredAuth): Promise<KDSOrder[]> {
  const data = await apiFetch(
    `/v1/table-sessions?restaurant_id=${auth.restaurantId}`,
    auth
  ) as unknown;

  const sessions: Record<string, unknown>[] = Array.isArray(data)
    ? data as Record<string, unknown>[]
    : Array.isArray((data as Record<string, unknown>).data)
      ? ((data as Record<string, unknown>).data as Record<string, unknown>[])
      : [];

  const orders: KDSOrder[] = [];

  for (const session of sessions) {
    const sessionId = Number(session.id);
    const tableNumber = session.table_number ?? session.table ?? session.name;
    const sessionOrders: Record<string, unknown>[] = Array.isArray(session.orders)
      ? session.orders as Record<string, unknown>[]
      : [];

    for (const order of sessionOrders) {
      const type = inferOrderType(order);
      const createdAt = String(order.created_at ?? session.created_at ?? new Date().toISOString());

      let items: KDSItem[] = [];
      if (Array.isArray(order.baskets)) {
        items = parseItems(order.baskets);
      } else if (Array.isArray(order.items)) {
        items = parseItems(order.items);
      }

      orders.push({
        id: (order.id as string | number) ?? `${sessionId}-${Math.random()}`,
        sessionId,
        orderKey: String(order.key ?? order.order_key ?? order.id ?? ''),
        tableNumber: tableNumber ? String(tableNumber) : undefined,
        tableLabel: tableNumber ? `Mesa ${String(tableNumber)}` : type === 'delivery' ? 'Delivery' : 'Balcão',
        type,
        status: String(order.status ?? 'pending'),
        createdAt,
        brandName: session.brand_name ? String(session.brand_name) : undefined,
        items,
        isNew: false,
      });
    }
  }

  return orders;
}
