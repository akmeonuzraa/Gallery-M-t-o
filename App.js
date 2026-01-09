import { useState, useEffect } from 'react';
import './App.css';
import { 
  Navbar, Container,
  Button, Form, Spinner,

} from 'react-bootstrap';

function App() {
  const [query, setQuery] = useState('casablanca');
  const [searchQuery, setSearchQuery] = useState('casablanca');
  const [searchTerm, setSearchTerm] = useState('casablanca');
  const [images, setImages] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cur, setcur] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const PIXABAY_API_KEY = '49764344-cc63fcbd3109d4f0d253d8bc7';
  const OPENWEATHER_API_KEY = '187d7b9defd604fbf4454cd84fb23498';
  const IMAGES_PER_PAGE = 6;
  const MAX_VISIBLE_PAGES = 3;

  useEffect(() => {
    if (searchTerm) {
      fetchData();
    }
  }, [searchTerm, cur]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      await Promise.all([
        fetchImages(),
        cur === 1 && fetchWeather()
      ]);
    } catch (err) {
      setError('Erreur! ');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    const response = await fetch(
      `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${encodeURIComponent(searchTerm)}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${IMAGES_PER_PAGE * MAX_VISIBLE_PAGES}`
    );
    const data = await response.json();
    setImages(data.hits || []);
    setTotalPages(Math.min(Math.ceil((data.hits?.length || 0) / IMAGES_PER_PAGE), MAX_VISIBLE_PAGES));
  };

  const fetchWeather = async () => {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(searchTerm)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=fr`
    );
    const data = await response.json();
    
    if (data.cod === 200) {
      setWeather(data);
    } else {
      setWeather(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputValue = e.target.elements.search.value.trim();
    if (inputValue) {
      setSearchTerm(inputValue);
      setcur(1);
    }
  };

  const handlePageChange = (newPage) => {
    setcur(newPage);
  };

  const handleShowDetails = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const getCurrentImages = () => {
    const startIndex = (cur - 1) * IMAGES_PER_PAGE;
    const endIndex = startIndex + IMAGES_PER_PAGE;
    return images.slice(startIndex, endIndex);
  };

  return (
    <div className="app">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand">Gallery & Météo</span>
          <span className="text-light">
            Page {cur}/{totalPages}
          </span>
        </div>
      </nav>
      
      <div className="container mt-4">
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="input-group">
            <input
              type="search"
              name="search"
              className="form-control"
              placeholder="Rechercher une ville..."
              defaultValue={searchTerm}
              required
            />
            <button type="submit" className="btn btn-primary">
              Rechercher
            </button>
          </div>
        </form>

        {loading && <div className="text-center">Chargement...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {weather && cur === 1 && (
          <div className="weather-card mb-4">
            <div className="row align-items-center">
              <div className="col-md-6">
                <h2>{weather.name}, {weather.sys?.country}</h2>
                <h1>{Math.round(weather.main.temp)}°C</h1>
                <p className="lead text-capitalize">{weather.weather[0]?.description}</p>
              </div>
              <div className="col-md-6 text-end">
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0]?.icon}@2x.png`}
                  alt={weather.weather[0]?.main}
                  className="weather-icon"
                />
                <div className="mt-3">
                  <p>Humidité: {weather.main?.humidity}%</p>
                  <p>Vent: {Math.round(weather.wind?.speed * 3.6)} km/h</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="gallery-container">
          {getCurrentImages().length > 0 ? (
            getCurrentImages().map((image) => (
              <div key={image.id} className="image-card">
                <img
                  src={image.webformatURL}
                  alt={image.tags}
                  loading="lazy"
                />
                <div className="image-details">
                  <p>{image.tags}</p>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleShowDetails(image)}
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            ))
          ) : (
            !loading && <p className="text-center w-100">Aucune image trouvée</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <button 
              className="btn btn-outline-primary"
              onClick={() => handlePageChange(cur - 1)}
              disabled={cur === 1}
            >
              &laquo; Précédent
            </button>
            
            <span className="page-info">
               {cur} / {totalPages}
            </span>
            
            <button 
              className="btn btn-outline-primary"
              onClick={() => handlePageChange(cur + 1)}
              disabled={cur === totalPages}
            >
              Suivant &raquo;
            </button>
          </div>
        )}

        {showModal && selectedImage && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h5 className="modal-title">Détails de l'image</h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <div className="modal-body">
                <img 
                  src={selectedImage.webformatURL} 
                  alt={selectedImage.tags} 
                  className="img-fluid mb-3"
                />
                <div className="image-info">
                  <p><strong>Tags:</strong> {selectedImage.tags}</p>
                  <p><strong>Dimensions:</strong> {selectedImage.webformatWidth} x {selectedImage.webformatHeight} pixels</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-success" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
         </div>
        )}
      </div>
    </div>
  );
}

export default App;