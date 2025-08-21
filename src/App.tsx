
import './App.css'
import { useState } from 'react';

function App() {
  const [dish, setDish] = useState('');
  const [servings, setServings] = useState(1);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function estimate() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dish, servings }) });
      if (!res.ok) {
        const text = await res.text();
        console.error('Backend error:', text);
        throw new Error(`Backend error (${res.status}): ${text}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function estimateImage() {
    if (!imageFile) {
      setError('Please select an image file.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('servings', String(servings));
      const res = await fetch('/api/estimate/image', { method: 'POST', body: formData });
      if (!res.ok) {
        const text = await res.text();
        console.error('Backend error:', text);
        throw new Error(`Backend error (${res.status}): ${text}`);
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  const formatCarbonValue = (value: number | null) => {
    if (value === null || value === undefined) return 'N/A';
    return `${value.toFixed(3)} kg CO2e`;
  };

  const getCarbonIntensity = (carbonKg: number) => {
    if (carbonKg < 0.1) return 'Very Low';
    if (carbonKg < 0.5) return 'Low';
    if (carbonKg < 2.0) return 'Medium';
    if (carbonKg < 10.0) return 'High';
    return 'Very High';
  };

  const getCarbonColor = (carbonKg: number) => {
    if (carbonKg < 0.1) return '#4CAF50'; // Green
    if (carbonKg < 0.5) return '#8BC34A'; // Light Green
    if (carbonKg < 2.0) return '#FFC107'; // Yellow
    if (carbonKg < 10.0) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🌱 Carbon Foodprint Estimator</h1>
        <p>Calculate the environmental impact of your meals</p>
      </header>

      <main className="app-main">
        <section className="input-section">
          <h2>🍽️ Estimate by Dish Name</h2>
          <div className="input-group">
            <input
              type="text"
              value={dish}
              onChange={(e) => setDish(e.target.value)}
              placeholder="Enter dish name (e.g., Chicken Biryani, Paneer Curry)"
              className="dish-input"
            />
            <div className="servings-group">
              <label htmlFor="servings">Servings:</label>
              <input
                id="servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(Math.max(1, Math.min(25, parseInt(e.target.value) || 1)))}
                min="1"
                max="25"
                className="servings-input"
              />
            </div>
            <button onClick={estimate} disabled={loading || !dish.trim()} className="estimate-btn">
              {loading ? '🌱 Calculating...' : '🌱 Estimate Carbon Footprint'}
            </button>
          </div>
        </section>

        <section className="input-section">
          <h2>📸 Estimate by Image</h2>
          <div className="input-group">
            <div className="file-input-group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                className="file-input"
              />
              <span className="file-label">
                {imageFile ? imageFile.name : 'Choose an image file'}
              </span>
            </div>
            <div className="servings-group">
              <label htmlFor="servings-image">Servings:</label>
              <input
                id="servings-image"
                type="number"
                value={servings}
                onChange={(e) => setServings(Math.max(1, Math.min(25, parseInt(e.target.value) || 1)))}
                min="1"
                max="25"
                className="servings-input"
              />
            </div>
            <button onClick={estimateImage} disabled={loading || !imageFile} className="estimate-btn">
              {loading ? '🔍 Analyzing Image...' : '🔍 Analyze Image'}
            </button>
          </div>
        </section>

        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        {result && !result.error && (
          <section className="results-section">
            <div className="results-header">
              <h2>📊 Carbon Footprint Results</h2>
              <div className="dish-info">
                <span className="dish-name">{result.dish}</span>
                <span className="servings-info">({result.servings} serving{result.servings > 1 ? 's' : ''})</span>
              </div>
            </div>

            <div className="total-carbon">
              <div className="carbon-value">
                <span className="carbon-number">{formatCarbonValue(result.estimated_carbon_kg)}</span>
                <span className="carbon-label">Total Carbon Footprint</span>
              </div>
              <div className="carbon-impact">
                <span className="impact-label">Environmental Impact:</span>
                <span className="impact-value" style={{ color: getCarbonColor(result.estimated_carbon_kg || 0) }}>
                  {getCarbonIntensity(result.estimated_carbon_kg || 0)}
                </span>
              </div>
            </div>

            <div className="ingredients-breakdown">
              <h3>🥗 Ingredients Breakdown</h3>
              <div className="ingredients-grid">
                {result.ingredients?.map((ingredient: any, index: number) => (
                  <div key={index} className="ingredient-card" style={{ borderLeftColor: getCarbonColor(ingredient.carbon_kg || 0) }}>
                    <div className="ingredient-name">{ingredient.name}</div>
                    <div className="ingredient-carbon">
                      <span className="carbon-amount">{formatCarbonValue(ingredient.carbon_kg)}</span>
                      <span className="carbon-intensity" style={{ color: getCarbonColor(ingredient.carbon_kg || 0) }}>
                        {getCarbonIntensity(ingredient.carbon_kg || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="carbon-context">
              <h3>🌍 Environmental Context</h3>
              <div className="context-grid">
                <div className="context-item">
                  <span className="context-icon">🚗</span>
                  <span className="context-text">
                    Equivalent to driving {((result.estimated_carbon_kg || 0) * 2.5).toFixed(1)} km
                  </span>
                </div>
                <div className="context-item">
                  <span className="context-icon">💡</span>
                  <span className="context-text">
                    Equivalent to {((result.estimated_carbon_kg || 0) * 0.4).toFixed(1)} hours of electricity use
                  </span>
                </div>
                <div className="context-item">
                  <span className="context-icon">🌳</span>
                  <span className="context-text">
                    Would require {((result.estimated_carbon_kg || 0) * 0.05).toFixed(1)} trees to absorb in a year
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="app-footer">
        <p>🌱 Making sustainable food choices easier, one meal at a time</p>
      </footer>
    </div>
  );
}

export default App;
