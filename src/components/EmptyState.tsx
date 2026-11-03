interface Props {
  status: string;
}

export function EmptyState({ status }: Props) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: 40,
    }}>
      <div style={{ fontSize: 64, opacity: 0.3 }}>🍳</div>
      <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-secondary)' }}>
        {status === 'error' ? 'Erro de conexão' : 'Nenhum pedido no momento'}
      </h2>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', maxWidth: 340 }}>
        {status === 'error'
          ? 'Verifique sua conexão e as credenciais da API Takeat.'
          : 'Os pedidos aparecerão aqui assim que forem lançados no PDV, delivery ou pelas mesas.'}
      </p>
    </div>
  );
}
