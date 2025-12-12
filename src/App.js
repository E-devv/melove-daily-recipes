import React, { useState, useEffect } from 'react';
import './App.css';
import { Search, Heart, Home, ChefHat, X, Clock, Users, Flame, ExternalLink } from 'lucide-react';
const RecipeApp = () => {
const [activeTab, setActiveTab] = useState('home');
const [dailyRecipe, setDailyRecipe] = useState(null);
const [favorites, setFavorites] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [selectedRecipe, setSelectedRecipe] = useState(null);
const [loading, setLoading] = useState(false);
useEffect(() => {
const savedFavs = localStorage.getItem('melove_favorites');
if (savedFavs) {
setFavorites(JSON.parse(savedFavs));
}
fetchDailyRecipe();
}, []);
useEffect(() => {
localStorage.setItem('melove_favorites', JSON.stringify(favorites));
}, [favorites]);
const fetchDailyRecipe = async () => {
setLoading(true);
try {
const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
const data = await response.json();
setDailyRecipe(data.meals[0]);
} catch (error) {
console.error("Error cargando receta diaria", error);
}
setLoading(false);
};
const searchRecipes = async (e) => {
e.preventDefault();
if (!searchQuery) return;
setLoading(true);
try {
const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
const data = await response.json();
setSearchResults(data.meals || []);
setActiveTab('search');
} catch (error) {
console.error("Error buscando", error);
}
setLoading(false);
};
const toggleFavorite = (recipe, e) => {
e.stopPropagation();
const isFav = favorites.some(fav => fav.idMeal === recipe.idMeal);
if (isFav) {
setFavorites(favorites.filter(fav => fav.idMeal !== recipe.idMeal));
} else {
setFavorites([...favorites, recipe]);
}
};
const RecipeCard = ({ recipe, isFeatured = false }) => {
const isFav = favorites.some(fav => fav.idMeal === recipe.idMeal);
return (
<div onClick={() => setSelectedRecipe(recipe)} className={`recipe-card ${isFeatured ? 'featured' : ''}`}>
<img src={recipe.strMealThumb} alt={recipe.strMeal} />
<div className="recipe-card-info">
<span className="recipe-card-category">{recipe.strCategory}</span>
<h3 className="recipe-card-title">{recipe.strMeal}</h3>
<div className="recipe-card-meta">
<span><Clock size={14} style={{marginRight:'4px'}}/> 30 min</span>
<button onClick={(e) => toggleFavorite(recipe, e)} className={`fav-btn ${isFav ? 'active' : ''}`}>
<Heart size={18} fill={isFav ? "currentColor" : "none"} />
</button>
</div>
</div>
</div>
);
};
const RecipeModal = ({ recipe, onClose }) => {
if (!recipe) return null;
const isFav = favorites.some(fav => fav.idMeal === recipe.idMeal);
const ingredients = [];
for (let i = 1; i <= 20; i++) {
if (recipe[`strIngredient${i}`]) {
ingredients.push({
name: recipe[`strIngredient${i}`],
measure: recipe[`strMeasure${i}`]
});
}
}
return (
  <div className="modal-backdrop">
    <div className="modal-container">
      <button onClick={onClose} className="modal-close"><X size={24} /></button>
      <div className="modal-hero"><img src={recipe.strMealThumb} alt={recipe.strMeal} /></div>
      <div className="modal-content">
        <div className="modal-header">
          <div><span className="modal-subtitle">{recipe.strCategory} • {recipe.strArea}</span><h2 className="modal-title">{recipe.strMeal}</h2></div>
          <button onClick={(e) => toggleFavorite(recipe, e)} className={`modal-fav-btn ${isFav ? 'active' : ''}`}><Heart size={24} fill={isFav ? "currentColor" : "none"} /></button>
        </div>
        <div className="stats-grid">
          <div className="stat-box orange"><Flame className="stat-icon" /><span>Calorías</span><p>~450</p></div>
          <div className="stat-box blue"><Clock className="stat-icon" /><span>Tiempo</span><p>30m</p></div>
          <div className="stat-box purple"><Users className="stat-icon" /><span>Porciones</span><p>2-4</p></div>
        </div>
        <h3>Ingredientes</h3>
        <ul className="ingredients-list">{ingredients.map((ing, idx) => (<li key={idx}><span className="bullet"></span><strong>{ing.measure}</strong> {ing.name}</li>))}</ul>
        <h3>Instrucciones</h3>
        <p className="instructions">{recipe.strInstructions}</p>
        {recipe.strSource && (<a href={recipe.strSource} target="_blank" rel="noreferrer" className="source-link"><ExternalLink size={18} /> Ver Receta Original</a>)}
      </div>
    </div>
  </div>
);

};
return (
<div className="container">
<header className="app-header">
<div className="app-logo">
<img src={`${process.env.PUBLIC_URL}/melove-logo.png`} alt="Melove Logo" className="app-logo-img" onError={(e) => {e.target.style.display='none';}} />
<h1>Melove</h1>
</div>
<form onSubmit={searchRecipes} className="search-bar">
<button type="submit"><Search size={20} /></button>
<input type="text" placeholder="Buscar recetas..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
</form>
</header>
<main className="app-content">
{activeTab === 'home' && (
<div className="home-tab">
<div className="daily-recipe-card">
<div className="daily-recipe-text">
<h2>Recomendación del Día</h2>
<p>Descubre sabores nuevos cada día.</p>
<button onClick={fetchDailyRecipe} className="refresh-btn">Nueva sugerencia</button>
</div>
{dailyRecipe ? <RecipeCard recipe={dailyRecipe} isFeatured={true} /> : <p>Cargando receta del día...</p>}
</div>
{favorites.length > 0 && (<div className="favorites-preview"><h3>Tus Favoritos Recientes</h3><div className="recipe-grid">{favorites.slice(0, 4).map(recipe => (<RecipeCard key={recipe.idMeal} recipe={recipe} />))}</div></div>)}
</div>
)}
{activeTab === 'search' && (
<div className="search-tab">
<form onSubmit={searchRecipes} className="search-bar-input">
<Search size={20} />
<input type="text" placeholder="Buscar ingrediente (ej. Chicken)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
</form>
<h2>{searchResults.length > 0 ? `Resultados: "${searchQuery}"` : 'Explora'}</h2>
<div className="recipe-grid">{loading ? <p>Buscando...</p> : searchResults.length > 0 ? searchResults.map(recipe => (<RecipeCard key={recipe.idMeal} recipe={recipe} />)) : <p>Busca ingredientes en inglés (ej. "Chicken", "Pie")</p>}</div>
</div>
)}
{activeTab === 'favorites' && (
<div className="favorites-tab">
<h2>Tus Recetas Guardadas</h2>
{favorites.length > 0 ? <div className="recipe-grid">{favorites.map(recipe => (<RecipeCard key={recipe.idMeal} recipe={recipe} />))}</div> : <div className="empty-state"><h3>Aún no tienes favoritos</h3><p>Guarda recetas para verlas aquí.</p><button onClick={() => setActiveTab('home')} className="action-btn">Explorar</button></div>}
</div>
)}
</main>
{selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
<nav className="bottom-nav">
<button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'active' : ''}><Home size={24} />Inicio</button>
<button onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'active' : ''}><Search size={24} />Buscar</button>
<button onClick={() => setActiveTab('favorites')} className={activeTab === 'favorites' ? 'active' : ''}><Heart size={24} fill={activeTab === 'favorites' ? "currentColor" : "none"} />Favoritos</button>
</nav>
</div>
);
};
export default RecipeApp;