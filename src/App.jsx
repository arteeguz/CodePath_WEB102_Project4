import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // ###### Make a static API call using async/await and save the results to a state variable
  const [cats, setCats] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [bannedAttributes, setBannedAttributes] = useState([]);

  const apiKey = import.meta.env.VITE_APP_CAT_API_KEY;
  const baseUrl = 'https://api.thecatapi.com/v1/images/search?limit=10';

  const fetchCats = async () => {
    setLoading(true);
    setError(null);
    try {
      // ###### Be able to add and edit query parameters for API calls
      const response = await fetch(baseUrl, {
        headers: {
          'x-api-key': apiKey,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      let data = await response.json();
      
      // Filter out any cats with unknown or banned attributes
      // ###### Parse JSON data from an unfamiliar API
      data = data.filter(cat => cat.breeds.length > 0 &&
        cat.breeds[0].name !== 'Unknown Breed' &&
        cat.breeds[0].origin !== 'Unknown Origin' &&
        cat.breeds[0].life_span !== 'Unknown Lifespan' &&
        !bannedAttributes.includes(cat.breeds[0].origin) &&
        !bannedAttributes.includes(cat.breeds[0].life_span));

      setCats(data);
      setIndex(0);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCats();
  }, [bannedAttributes]); // Refetch cats when banList changes

  // ###### Clicking a button creates a new API fetch request and displays at least three attributes from the returned JSON data
  const handleNextCat = () => {
    let nextIndex = index + 1;
    if (nextIndex < cats.length) {
      setIndex(nextIndex);
      // ###### Users can see a stored history of their previously viewed items from this session
      setHistory([...history, cats[nextIndex]]);
    } else {
      fetchCats();
    }
  };

  // ###### Clicking on a displayed value for one attribute adds it to a displayed ban list
  const banAttribute = (attribute) => {
    if (!bannedAttributes.includes(attribute)) {
      setBannedAttributes([...bannedAttributes, attribute]);
    }
  };

  return (
    <div className="app">
      <h1>Trippin' on Cats</h1>
      <p>Discover cats from your wildest dreams!</p>
      <p>(reload the website if image does not show up)</p>
      <div className="cat-card-container">
        <div className="history-panel">
          <h3>Viewed Cats</h3>
          <ul>
            {history.map((cat, idx) => (
              <li key={idx}>{cat.breeds.length > 0 ? cat.breeds[0].name : 'Unknown Breed'}</li>
            ))}
          </ul>
        </div>
        <div className="cat-card">
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error}</p>}
          {cats.length > 0 && (
            <div>
              <h2>{cats[index].breeds[0].name}</h2>
              {/* ###### Attributes on the ban list prevent further images/API results with that attribute from being displayed */}
              <p className="attribute" onClick={() => banAttribute(cats[index].breeds[0].origin)}>
                Origin: {cats[index].breeds[0].origin}
              </p>
              <p className="attribute" onClick={() => banAttribute(cats[index].breeds[0].life_span)}>
                Lifespan: {cats[index].breeds[0].life_span}
              </p>
              {/* ###### At least one image is displayed per API call */}
              <img src={cats[index].url} alt="A cute cat" style={{ maxWidth: '300px', margin: '20px' }} />
              <button onClick={handleNextCat}>🔀 Discover!</button>
            </div>
          )}
        </div>
        <div className="ban-list-panel">
          <h3>Banned Attributes</h3>
          <ul>
            {/* ###### Multiple types of attributes can be added to the ban list */}
            {bannedAttributes.map((attr, idx) => (
              <li key={idx}>{attr}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
