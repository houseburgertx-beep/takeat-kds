const BASE_URL = 'https://public-api.takeat.app';

export interface StoredAuth {
  authMethod: 'credentials' | 'api_key';
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  restaurantId: number;
  restaurantName?: string;
  email?: string;
  apiKey?: string;
}

export interface KDSItem {
  id: number;
  name: string;
  qty: number;
  prepTimeMinutes?: number;
  obs?: string;
  complements: Array<{
    category: string;
    name: string;
    qty: number;
  }>;
}

export interface KDSOrder {
  id: string | number;
  sessionId: number;
  orderNumber: string; // Ex: "#70" ou "#1584"
  externalNumber: string; // Ex: "Nº #494-5812"
  orderKey: string;
  tableNumber?: string | number;
  tableLabel: string;
  type: 'table' | 'delivery' | 'balcao';
  typeLabel: string; // "Retirada" | "Delivery" | "Mesa 1" | "Balcão"
  channel: string; // 'IFOOD' | 'TAKEAT' | 'PDV' | 'MESA' | 'BALCAO'
  status: 'new' | 'preparing' | 'finished' | 'canceled';
  createdAt: string;
  brandName?: string;
  clientName?: string;
  items: KDSItem[];
  isNew: boolean;
  totalPrice?: string;
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

/**
 * Login com E-mail e Senha da Takeat (sessão oficial PDV/Gestor)
 */
export async function loginWithCredentials(email: string, pass: string): Promise<StoredAuth> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !pass) {
    throw new Error('Informe e-mail e senha.');
  }

  const resp = await fetch('https://webhook.takeat.app/public/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: cleanEmail, password: pass }),
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    if (resp.status === 401) {
      throw new Error('E-mail ou senha incorretos na Takeat.');
    }
    throw new Error(`Não foi possível entrar na Takeat (HTTP ${resp.status}).`);
  }

  const id = Number(data.restaurant?.id);
  if (typeof data.token !== 'string' || !data.token || !id) {
    throw new Error('Resposta de login inválida: sessão não confirmada pela Takeat.');
  }

  const restaurantName = data.restaurant?.fantasy_name || data.restaurant?.name || `Restaurante #${id}`;

  const auth: StoredAuth = {
    authMethod: 'credentials',
    accessToken: data.token,
    expiresAt: Date.now() + 15 * 86400000,
    restaurantId: id,
    restaurantName,
    email: cleanEmail,
  };

  saveAuth(auth);
  return auth;
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
    authMethod: 'api_key',
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
  if (auth.authMethod === 'credentials') {
    return auth;
  }

  if (!auth.refreshToken) return null;

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
  let url: string;
  if (auth.authMethod === 'credentials') {
    url = `https://webhook.takeat.app/api${path}`;
  } else {
    url = `${BASE_URL}${path}`;
  }

  const resp = await fetch(url, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (resp.status === 401 && !retried && auth.authMethod === 'api_key') {
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

    const complementCategories = (ord.complement_categories ?? []) as Record<string, unknown>[];
    if (Array.isArray(complementCategories)) {
      complementCategories.forEach((catWrapper) => {
        const catInfo = (catWrapper.complement_category ?? catWrapper) as Record<string, unknown>;
        const catName = String(catInfo.name ?? catInfo.category ?? 'Complemento');

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
      prepTimeMinutes: 20, // Tempo de preparo padrão visível no KDS
      obs: obs?.trim() ? obs.trim() : undefined,
      complements,
    };
  });
}

/**
 * Busca pedidos em aberto na Takeat
 */
export async function fetchOrders(auth: StoredAuth): Promise<KDSOrder[]> {
  const now = new Date();
  const start = new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString();
  const end = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

  const queryParams: Record<string, string> = {
    start_date: start,
    end_date: end,
  };

  if (auth.authMethod === 'api_key') {
    queryParams.restaurant_id = String(auth.restaurantId);
  }

  const query = new URLSearchParams(queryParams);
  const raw = await apiFetch(`/v1/table-sessions?${query.toString()}`, auth) as unknown;

  const sessions: Record<string, unknown>[] = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : Array.isArray((raw as Record<string, unknown>)?.data)
      ? ((raw as Record<string, unknown>).data as Record<string, unknown>[])
      : [];

  const activeOrders: KDSOrder[] = [];

  for (const session of sessions) {
    const rawStatus = String(session.status ?? '').toLowerCase().trim();

    // Filtro rigoroso: descarta pedidos encerrados ou cancelados de ontem
    const isClosedOrCompleted = Boolean(
      session.end_time ||
      session.completed_at ||
      session.canceled_at ||
      rawStatus === 'completed' ||
      rawStatus === 'closed' ||
      rawStatus === 'canceled' ||
      rawStatus === 'cancelled' ||
      rawStatus === 'finished' ||
      rawStatus === 'finalizado' ||
      rawStatus === 'encerrado'
    );

    if (isClosedOrCompleted) {
      continue;
    }

    const sessionId = Number(session.id);
    const createdAtStr = String(session.start_time ?? session.created_at ?? now.toISOString());
    const createdAtDate = new Date(createdAtStr);
    const ageMinutes = (now.getTime() - createdAtDate.getTime()) / (60 * 1000);

    // REGRA DE OURO: Descarta sessões fantasmas/antigas (com mais de 4 horas sem movimentação)
    // Isso elimina pedidos de ontem com 1000+ minutos atrasados
    if (ageMinutes > 240) {
      continue;
    }
    const tableObj = session.table as Record<string, unknown> | undefined;
    const tableNumber = tableObj?.table_number ?? session.table_number;
    const tableType = String(tableObj?.table_type ?? '').toLowerCase();
    const rawChannel = String(session.sales_channel ?? '').toUpperCase();
    const isDelivery = Boolean(session.is_delivery || tableType === 'delivery' || rawChannel.includes('IFOOD'));
    const isBalcao = Boolean(session.with_withdrawal || tableType === 'takeaway' || tableType === 'balcao' || (!isDelivery && (!tableNumber || Number(tableNumber) < 0)));

    let orderType: KDSOrder['type'] = 'table';
    let typeLabel = 'Mesa';
    let channel = 'MESA';
    let orderNumber = '';

    const buyer = session.buyer as Record<string, unknown> | undefined;
    const clientName = buyer?.name ? String(buyer.name).trim() : undefined;
    const attendancePassword = session.attendance_password ? String(session.attendance_password) : undefined;
    const sessionNum = session.session_number ? String(session.session_number) : undefined;

    // Extrair itens
    const rawItemsToParse: Record<string, unknown>[] = [];
    let basketId = '';

    const bills = (session.bills ?? []) as Record<string, unknown>[];
    if (Array.isArray(bills) && bills.length > 0) {
      for (const bill of bills) {
        const baskets = (bill.order_baskets ?? []) as Record<string, unknown>[];
        for (const basket of baskets) {
          if (basket.canceled_at) continue;
          if (basket.basket_id && !basketId) basketId = String(basket.basket_id);
          const bOrders = (basket.orders ?? []) as Record<string, unknown>[];
          rawItemsToParse.push(...bOrders);
        }
      }
    } else if (Array.isArray(session.order_baskets)) {
      for (const basket of session.order_baskets as Record<string, unknown>[]) {
        if (basket.canceled_at) continue;
        if (basket.basket_id && !basketId) basketId = String(basket.basket_id);
        const bOrders = (basket.orders ?? []) as Record<string, unknown>[];
        rawItemsToParse.push(...bOrders);
      }
    } else if (Array.isArray(session.orders)) {
      rawItemsToParse.push(...(session.orders as Record<string, unknown>[]));
    }

    const items = parseOrderItems(rawItemsToParse);

    // Número do pedido no formato do KDS oficial (ex: #70)
    if (attendancePassword) {
      orderNumber = `#${attendancePassword}`;
    } else if (sessionNum) {
      orderNumber = `#${sessionNum}`;
    } else if (tableNumber && Number(tableNumber) > 0) {
      orderNumber = `#${tableNumber}`;
    } else {
      orderNumber = `#${String(sessionId).slice(-2)}`;
    }

    // Código completo (ex: Nº #494-5812)
    const externalNumber = sessionNum && basketId
      ? `Nº #${sessionNum}-${basketId}`
      : `Nº #${String(sessionId).slice(-6)}`;

    // Rótulo do tipo (ex: Retirada, Delivery, Mesa 1)
    if (session.with_withdrawal) {
      orderType = 'balcao';
      typeLabel = 'Retirada';
      channel = 'BALCÃO';
    } else if (isDelivery) {
      orderType = 'delivery';
      typeLabel = rawChannel.includes('IFOOD') ? 'iFood' : 'Delivery';
      channel = rawChannel.includes('IFOOD') ? 'IFOOD' : 'TAKEAT';
    } else if (isBalcao) {
      orderType = 'balcao';
      typeLabel = 'Balcão';
      channel = 'BALCÃO';
    } else {
      orderType = 'table';
      typeLabel = `Mesa ${String(tableNumber ?? session.name ?? '1')}`;
      channel = 'MESA';
    }

    const brandName = session.brand_name ? String(session.brand_name) : undefined;
    const createdAt = String(session.start_time ?? session.created_at ?? now.toISOString());

    activeOrders.push({
      id: sessionId,
      sessionId,
      orderNumber,
      externalNumber,
      orderKey: String(sessionId),
      tableNumber: tableNumber ? String(tableNumber) : undefined,
      tableLabel: typeLabel,
      type: orderType,
      typeLabel,
      channel,
      status: 'new',
      createdAt,
      brandName,
      clientName,
      items,
      isNew: false,
      totalPrice: session.total_price ? String(session.total_price) : undefined,
    });
  }

  return activeOrders;
}
