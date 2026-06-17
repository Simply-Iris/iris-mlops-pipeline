export default function DashboardLinks() {
    const links = [
        { name: 'MLflow', url: 'http://localhost:5001', emoji: '📊', desc: 'Experiment tracking' },
        { name: 'Grafana', url: 'http://localhost:3000', emoji: '📈', desc: 'Live dashboards' },
        { name: 'Prometheus', url: 'http://localhost:9090', emoji: '🔍', desc: 'Raw metrics' },
    ];

    return (
        <div className="dashboard-links">
            <h2>🚀 Dashboards</h2>
            <div className="link-grid">
                {links.map((link) => (
                    <a key={link.name} href={link.url} target="_blank" rel="noreferrer" className="link-card">
                        <span className="link-emoji">{link.emoji}</span>
                        <h3>{link.name}</h3>
                        <p>{link.desc}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}