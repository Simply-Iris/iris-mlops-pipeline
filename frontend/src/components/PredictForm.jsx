import { useState } from 'react';

const API_URL = 'http://localhost:8000';

export default function PredictForm() {
    const [features, setFeatures] = useState({
        sepal_length: '',
        sepal_width: '',
        petal_length: '',
        petal_width: '',
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [varyMode, setVaryMode] = useState(false);

    const handleChange = (e) => {
        setFeatures({ ...features, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(`${API_URL}/predict`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sepal_length: parseFloat(features.sepal_length),
                    sepal_width: parseFloat(features.sepal_width),
                    petal_length: parseFloat(features.petal_length),
                    petal_width: parseFloat(features.petal_width),
                }),
            });

            if (!response.ok) throw new Error('Prediction failed');

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const presets = [
        { name: 'Setosa 🌷', values: { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2 } },
        { name: 'Versicolor 🌿', values: { sepal_length: 6.0, sepal_width: 2.7, petal_length: 4.2, petal_width: 1.3 } },
        { name: 'Virginica 🌺', values: { sepal_length: 6.5, sepal_width: 3.0, petal_length: 5.5, petal_width: 2.0 } },
    ];

    const fillPreset = (values) => {
        const jitter = (val) => {
            if (!varyMode) return val.toString();
            const noise = (Math.random() - 0.5) * 0.6; // ±0.3 range
            return Math.max(0.1, val + noise).toFixed(2);
        };

        setFeatures({
            sepal_length: jitter(values.sepal_length),
            sepal_width: jitter(values.sepal_width),
            petal_length: jitter(values.petal_length),
            petal_width: jitter(values.petal_width),
        });
    };

    return (
        <div className="predict-form">
            <h2>🌸 Iris Predictor</h2>

            <div className="presets-row">
                <div className="presets">
                    {presets.map((p) => (
                        <button key={p.name} type="button" className="preset-btn" onClick={() => fillPreset(p.values)}>
                            {p.name}
                        </button>
                    ))}
                </div>

                <label className="randomizer-bubble">
                    <span className="switch">
                        <input
                            type="checkbox"
                            checked={varyMode}
                            onChange={(e) => setVaryMode(e.target.checked)}
                        />
                        <span className="slider"></span>
                    </span>
                    <span className="randomizer-tag">randomizer</span>
                </label>
            </div>

            <form onSubmit={handleSubmit}>
                {Object.keys(features).map((key) => (
                    <div key={key} className="form-field">
                        <label>{key.replace('_', ' ')}</label>
                        <input
                            type="number"
                            step="0.1"
                            name={key}
                            value={features[key]}
                            onChange={handleChange}
                            required
                        />
                    </div>
                ))}
                <button type="submit" disabled={loading}>
                    {loading ? 'Predicting...' : 'Predict 🌷'}
                </button>
            </form>

            {error && <p className="error">{error}</p>}

            {result && (
                <div className="result">
                    <p><strong>{result.prediction}</strong></p>
                    <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
                    <p>{result.cached ? '⚡ from cache' : '🌱 fresh prediction'}</p>
                </div>
            )}
        </div>
    );
}