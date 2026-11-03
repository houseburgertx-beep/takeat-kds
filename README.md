# Takeat KDS — Kitchen Display System

PWA de cozinha para a Takeat, otimizado para tablets em modo paisagem.

## Funcionalidades
- 🍽️ Cards de pedido com tipo (Mesa / Delivery / Balcão)
- ⏱️ Timer cromático (verde → amarelo → vermelho)
- 🔔 Notificação sonora em novos pedidos
- 📱 PWA installável no tablet
- 🌙 Wake Lock — tela nunca dorme durante operação
- 🔄 Polling automático a cada 20s

## Setup
```sh
npm install
npm run dev
```

## Deploy
```sh
npm run build
# Serve a pasta dist/ com qualquer servidor estático
```

## GitHub Pages
```sh
npm run deploy
```

## Configuração
Ao abrir o app, informe:
- **API Key** da Takeat (em Configurações → Integrações → API)
- **ID do Restaurante** (número visível na URL do painel Takeat)

## Timers
- Verde: menos de 8 minutos
- Amarelo: 8–15 minutos
- Vermelho: mais de 15 minutos ⚠ ATRASADO
