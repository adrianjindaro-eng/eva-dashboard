const PLACEHOLDERS = [
  {
    title: 'Email Summary',
    description: 'Resumen automático de correos del día y pendientes con clientes.',
  },
  {
    title: 'Invoice Generator',
    description: 'Genera facturas profesionales con un clic desde cada orden.',
  },
  {
    title: 'Clientes & Orders',
    description: 'Directorio de clientes, historial de pedidos y notas de instalación.',
  },
  {
    title: 'Asistente Ejecutiva',
    description: 'Tu copiloto para agenda, recordatorios y seguimiento de proyectos.',
  },
  {
    title: 'Nuevo Proyecto',
    description: 'Inicia un nuevo trabajo con cliente.',
  },
  {
    title: 'CRM de Clientes',
    description: 'Directorio de clientes, historial y seguimiento.',
  },
]

export default function PlaceholderCards() {
  return (
    <section className="placeholders">
      {PLACEHOLDERS.map((p) => (
        <article key={p.title} className="placeholder-card">
          <h3 className="placeholder-title">{p.title}</h3>
          <p className="placeholder-desc">{p.description}</p>
          <span className="badge-soon">Próximamente</span>
        </article>
      ))}
    </section>
  )
}
