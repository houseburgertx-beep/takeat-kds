import type { KDSOrder } from './takeatApi';

export function createDemoOrders(): KDSOrder[] {
  const now = Date.now();

  return [
    {
      id: 'demo-1',
      sessionId: 991,
      orderNumber: '#1584',
      orderKey: 'demo-1',
      tableLabel: 'iFood #1584',
      type: 'delivery',
      channel: 'IFOOD',
      status: 'in_production',
      createdAt: new Date(now - 4 * 60 * 1000).toISOString(), // 4 minutos atrás
      brandName: 'House Food Park',
      clientName: 'Danilo Galvão',
      isNew: false,
      items: [
        {
          id: 1,
          name: 'Pizza Metade Calabresa / Frango com Catupiry',
          qty: 1,
          obs: 'Massa fina, bem assada',
          complements: [
            { category: 'Borda', name: 'Borda de Catupiry Original', qty: 1 },
            { category: 'Adicionais', name: 'Bacon crocante', qty: 1 },
          ],
        },
        {
          id: 2,
          name: 'Coca-Cola 2L',
          qty: 1,
          complements: [],
        },
      ],
    },
    {
      id: 'demo-2',
      sessionId: 992,
      orderNumber: 'Mesa 4',
      orderKey: 'demo-2',
      tableNumber: '4',
      tableLabel: 'Mesa 4',
      type: 'table',
      channel: 'MESA',
      status: 'in_production',
      createdAt: new Date(now - 12 * 60 * 1000).toISOString(), // 12 minutos atrás (alerta)
      clientName: 'Mesa Salão',
      isNew: false,
      items: [
        {
          id: 3,
          name: 'House Burger Smash Duplo',
          qty: 2,
          obs: 'Ponto da carne: Ao Ponto. Sem picles!',
          complements: [
            { category: 'Adicionais', name: 'Maionese da Casa extra', qty: 2 },
            { category: 'Ponto', name: 'Carne ao ponto', qty: 2 },
          ],
        },
        {
          id: 4,
          name: 'Batata Rústica com Alecrim (G)',
          qty: 1,
          complements: [
            { category: 'Molho', name: 'Barbecue defumado', qty: 1 },
          ],
        },
        {
          id: 5,
          name: 'Chopp Pilsen 500ml',
          qty: 2,
          complements: [],
        },
      ],
    },
    {
      id: 'demo-3',
      sessionId: 993,
      orderNumber: 'Senha 028',
      orderKey: 'demo-3',
      tableLabel: 'Balcão Senha 028',
      type: 'balcao',
      channel: 'BALCÃO',
      status: 'in_production',
      createdAt: new Date(now - 22 * 60 * 1000).toISOString(), // 22 minutos atrás (atrasado)
      clientName: 'Mariana Souza (Retirada)',
      isNew: false,
      items: [
        {
          id: 6,
          name: 'Esfiha Especial 4 Queijos',
          qty: 4,
          complements: [],
        },
        {
          id: 7,
          name: 'Suco Natural de Laranja 500ml',
          qty: 1,
          obs: 'Sem açúcar e com gelo',
          complements: [],
        },
      ],
    },
  ];
}
