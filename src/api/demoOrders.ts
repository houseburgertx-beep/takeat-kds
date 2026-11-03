import type { KDSOrder } from './takeatApi';

export function createDemoOrders(): KDSOrder[] {
  const now = Date.now();

  return [
    {
      id: 'demo-70',
      sessionId: 70,
      orderNumber: '#70',
      externalNumber: 'Nº #494-5812',
      orderKey: 'demo-70',
      tableLabel: 'Retirada',
      type: 'balcao',
      typeLabel: 'Retirada',
      channel: 'BALCÃO',
      status: 'new',
      // 81 segundos atrás -> exibe exatamente 01:21 no timer como na foto física da Takeat!
      createdAt: new Date(now - 81 * 1000).toISOString(),
      brandName: 'House Food Park',
      clientName: 'Cliente Balcão',
      isNew: false,
      items: [
        {
          id: 701,
          name: 'Fritas P tradicional',
          qty: 1,
          prepTimeMinutes: 20,
          complements: [],
        },
        {
          id: 702,
          name: 'Sukita lata laranja 350ml',
          qty: 1,
          prepTimeMinutes: 20,
          complements: [],
        },
      ],
    },
    {
      id: 'demo-1584',
      sessionId: 1584,
      orderNumber: '#1584',
      externalNumber: 'Nº #494-5813',
      orderKey: 'demo-1584',
      tableLabel: 'iFood #1584',
      type: 'delivery',
      typeLabel: 'iFood',
      channel: 'IFOOD',
      status: 'new',
      createdAt: new Date(now - 6 * 60 * 1000).toISOString(),
      brandName: 'House Food Park',
      clientName: 'Danilo Galvão',
      isNew: false,
      items: [
        {
          id: 15841,
          name: 'Pizza Metade Calabresa / Frango com Catupiry',
          qty: 1,
          prepTimeMinutes: 25,
          obs: 'Massa fina, bem assada',
          complements: [
            { category: 'Borda', name: 'Borda de Catupiry Original', qty: 1 },
            { category: 'Adicionais', name: 'Bacon crocante', qty: 1 },
          ],
        },
        {
          id: 15842,
          name: 'Coca-Cola 2L',
          qty: 1,
          prepTimeMinutes: 5,
          complements: [],
        },
      ],
    },
    {
      id: 'demo-12',
      sessionId: 12,
      orderNumber: 'Mesa 12',
      externalNumber: 'Nº #494-5814',
      orderKey: 'demo-12',
      tableNumber: '12',
      tableLabel: 'Mesa 12',
      type: 'table',
      typeLabel: 'Mesa 12',
      channel: 'MESA',
      status: 'new',
      createdAt: new Date(now - 14 * 60 * 1000).toISOString(),
      clientName: 'Mesa Salão',
      isNew: false,
      items: [
        {
          id: 121,
          name: 'House Burger Smash Duplo',
          qty: 2,
          prepTimeMinutes: 20,
          obs: 'Ponto da carne: Ao Ponto. Sem picles!',
          complements: [
            { category: 'Adicionais', name: 'Maionese da Casa extra', qty: 2 },
            { category: 'Ponto', name: 'Carne ao ponto', qty: 2 },
          ],
        },
        {
          id: 122,
          name: 'Batata Rústica com Alecrim (G)',
          qty: 1,
          prepTimeMinutes: 15,
          complements: [
            { category: 'Molho', name: 'Barbecue defumado', qty: 1 },
          ],
        },
      ],
    },
  ];
}
