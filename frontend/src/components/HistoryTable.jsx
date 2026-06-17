import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8000';

export default function HistoryTable() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch(`${API_URL}/history`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to load history');
                return res.json();
            })
            .then((data) => setHistory(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="status-text">Loading history... 🌸</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="history-table">
            <h2>📜 Prediction History</h2>
            {history.length === 0 ? (
                <p className="status-text">No predictions yet — go make one!! 🌷</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Prediction</th>
                            <th>Confidence</th>
                            <th>Cached</th>
                            <th>Sepal L/W</th>
                            <th>Petal L/W</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((r) => (
                            <tr key={r.id}>
                                <td>{r.prediction}</td>
                                <td>{(r.confidence * 100).toFixed(1)}%</td>
                                <td>{r.cached ? '⚡' : '🌱'}</td>
                                <td>{r.features.sepal_length} / {r.features.sepal_width}</td>
                                <td>{r.features.petal_length} / {r.features.petal_width}</td>
                                <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}