import { useEffect, useState, useCallback, useMemo } from 'react';
import { createRecipe, getRecipes, deleteRecipe, updateRecipe } from '../services/recipeService';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaUtensils, FaEdit, FaSpinner, FaSearch, FaFilter, FaSort, FaSave, FaStar, FaRegStar, FaStarHalfAlt, FaFire, FaClock, FaCalendarAlt, FaShare, FaBookmark, FaPrint, FaList, FaChartLine, FaLink, FaFacebook, FaTwitter, FaWhatsapp, FaPinterest, FaEnvelope, FaCopy, FaInstagram, FaQrcode, FaLinkedin, FaReddit, FaTelegram, FaDownload, FaInfoCircle, FaCircle } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

const RECIPE_CATEGORIES = {
  meals: {
    label: 'Meals',
    options: [
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'brunch', label: 'Brunch' }
    ]
  },
  courses: {
    label: 'Courses',
    options: [
      { value: 'appetizer', label: 'Appetizer' },
      { value: 'main-course', label: 'Main Course' },
      { value: 'side-dish', label: 'Side Dish' },
      { value: 'soup', label: 'Soup' },
      { value: 'salad', label: 'Salad' }
    ]
  },
  desserts: {
    label: 'Desserts & Snacks',
    options: [
      { value: 'dessert', label: 'Dessert' },
      { value: 'snack', label: 'Snack' },
      { value: 'baked-goods', label: 'Baked Goods' },
      { value: 'ice-cream', label: 'Ice Cream' }
    ]
  },
  dietary: {
    label: 'Dietary',
    options: [
      { value: 'vegetarian', label: 'Vegetarian' },
      { value: 'vegan', label: 'Vegan' },
      { value: 'gluten-free', label: 'Gluten Free' },
      { value: 'dairy-free', label: 'Dairy Free' }
    ]
  }
};

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular', icon: '⭐' },
  { value: 'recent', label: 'Recently Added', icon: '🕒' },
  { value: 'prepTime', label: 'Quickest to Make', icon: '⏱️' },
  { value: 'title', label: 'Alphabetical', icon: '🔤' }
];

const StarRating = ({ rating, onRate, size = '1.2rem', interactive = false }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <FaStar
          key={i}
          style={{ 
            color: '#e67e22',
            fontSize: size,
            cursor: interactive ? 'pointer' : 'default'
          }}
          onClick={() => interactive && onRate(i)}
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <FaStarHalfAlt
          key={i}
          style={{ 
            color: '#e67e22',
            fontSize: size,
            cursor: interactive ? 'pointer' : 'default'
          }}
          onClick={() => interactive && onRate(i - 0.5)}
        />
      );
    } else {
      stars.push(
        <FaRegStar
          key={i}
          style={{ 
            color: '#e67e22',
            fontSize: size,
            cursor: interactive ? 'pointer' : 'default'
          }}
          onClick={() => interactive && onRate(i)}
        />
      );
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.2rem', alignItems: 'center' }}>
      {stars}
      {interactive && (
        <span style={{ 
          marginLeft: '0.5rem', 
          fontSize: '0.9rem',
          color: '#666'
        }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

const RecipeCard = ({ recipe, onSelect, onDelete, onRate }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
    >
      <div style={{ position: 'relative', height: '200px' }}>
        <img
          src={recipe.image}
          alt={recipe.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease'
          }}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backdropFilter: 'blur(4px)'
        }}>
          <FaClock color="#666" />
          <span>{recipe.prepTime} mins</span>
        </div>
      </div>
      <div style={{ padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#333' }}>
          {recipe.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span style={{
            backgroundColor: '#f8f9fa',
            padding: '0.25rem 0.75rem',
            borderRadius: '20px',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            {recipe.category}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <FaStar color="#FFD700" />
            <span>{recipe.popularity}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SharePreview = ({ recipe }) => {
  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '300px'
    }}>
      <div style={{ position: 'relative', height: '150px' }}>
        <img
          src={recipe.image}
          alt={recipe.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{recipe.title}</h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          <FaClock /> {recipe.prepTime} mins
          <span>•</span>
          <FaStar style={{ color: '#e67e22' }} /> {recipe.popularity?.toFixed(1) || '0.0'}
        </div>
      </div>
    </div>
  );
};

const RecipeModal = ({ recipe, onClose, onDelete, onUpdate, onRate, shareOptions, showQRCode, onQRCodeClose, copySuccess }) => {
  const [activeTab, setActiveTab] = useState('ingredients');
  const [showShareOptions, setShowShareOptions] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '2rem',
            height: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1
          }}
        >
          <FaTimes />
        </button>

        <div style={{ position: 'relative', height: '300px' }}>
          <img
            src={recipe.image}
            alt={recipe.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '2rem',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            color: 'white'
          }}>
            <h2 style={{ margin: 0, fontSize: '2rem' }}>{recipe.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaClock />
                <span>{recipe.prepTime} mins</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaStar color="#FFD700" />
                <span>{recipe.popularity}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FaFire color="#FF4500" />
                <span>{recipe.category}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaShare /> Share
            </button>
            <button
              onClick={() => window.print()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <FaPrint /> Print
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={() => setActiveTab('ingredients')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'ingredients' ? '#e67e22' : '#f8f9fa',
                color: activeTab === 'ingredients' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <FaList /> Ingredients
            </button>
            <button
              onClick={() => setActiveTab('instructions')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'instructions' ? '#e67e22' : '#f8f9fa',
                color: activeTab === 'instructions' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <FaUtensils /> Instructions
            </button>
            <button
              onClick={() => setActiveTab('popularity')}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: activeTab === 'popularity' ? '#e67e22' : '#f8f9fa',
                color: activeTab === 'popularity' ? 'white' : '#333',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <FaChartLine /> Popularity
            </button>
          </div>

          {activeTab === 'ingredients' && (
            <div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Ingredients</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {recipe.ingredients.split('\n').map((ingredient, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaCircle size={8} color="#e67e22" />
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Instructions</h3>
              <ol style={{ padding: 0, margin: 0, listStylePosition: 'inside' }}>
                {recipe.instructions.split('\n').map((instruction, index) => (
                  <li key={index} style={{ marginBottom: '1rem', color: '#666' }}>
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {activeTab === 'popularity' && (
            <div>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Popularity</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <FaStar color="#FFD700" size={24} />
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{recipe.popularity}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => onRate(star)}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                      >
                        <FaStar
                          color={star <= recipe.popularity ? '#FFD700' : '#ddd'}
                          size={20}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '2rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#333' }}>Rating Distribution</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ width: '1rem', textAlign: 'right' }}>{rating}</span>
                      <div style={{ flex: 1, height: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${(rating === 5 ? 60 : rating === 4 ? 20 : rating === 3 ? 10 : rating === 2 ? 5 : 5)}%`,
                            height: '100%',
                            backgroundColor: '#e67e22',
                            borderRadius: '0.5rem'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showShareOptions && (
        <div style={{
          position: 'absolute',
          top: '1rem',
          right: '5rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '1rem',
          zIndex: 1001
        }}>
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => {
                option.action();
                setShowShareOptions(false);
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#333',
                textAlign: 'left'
              }}
            >
              {option.icon}
              {option.name}
            </button>
          ))}
        </div>
      )}

      {showQRCode && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Scan QR Code</h3>
            <QRCodeSVG
              value={window.location.href}
              size={200}
              level="H"
              includeMargin
            />
            <p style={{ margin: '1rem 0 0 0', color: '#666' }}>
              Scan this QR code to view the recipe on your mobile device
            </p>
            <button
              onClick={onQRCodeClose}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#e67e22',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  // State management
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState({
    fetch: false,
    create: false,
    update: false,
    delete: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showForm, setShowForm] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    prepTime: '',
    category: '',
    image: ''
  });

  // Fetch recipes on component mount
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(prev => ({ ...prev, fetch: true }));
        const data = await getRecipes();
        setRecipes(data);
      } catch (error) {
        toast.error('Failed to fetch recipes');
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(prev => ({ ...prev, fetch: false }));
      }
    };

    fetchRecipes();
  }, []);

  // Accessibility: Focus management
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && (showForm || selectedRecipe)) {
        setShowForm(false);
        setSelectedRecipe(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm, selectedRecipe]);

  // Performance optimization: Memoize filtered and sorted recipes
  const filteredAndSortedRecipes = useMemo(() => {
    return recipes
      .filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'popular':
            return b.popularity - a.popularity;
          case 'recent':
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'quick':
            return a.prepTime - b.prepTime;
          case 'alpha':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [recipes, searchQuery, selectedCategory, sortBy]);

  // Performance optimization: Debounced search
  const debouncedSearch = useCallback((value) => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(value);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, create: true }));
      const newRecipe = await createRecipe(formData);
      setRecipes(prev => [...prev, newRecipe]);
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        ingredients: '',
        instructions: '',
        prepTime: '',
        category: '',
        image: ''
      });
      toast.success('Recipe created successfully');
    } catch (error) {
      toast.error('Failed to create recipe');
      console.error('Error creating recipe:', error);
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, [formData]);

  // Handle form input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Handle recipe deletion
  const handleDelete = useCallback(async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        setLoading(prev => ({ ...prev, delete: true }));
        await deleteRecipe(recipeId);
        setRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
        toast.success('Recipe deleted successfully');
      } catch (error) {
        toast.error('Failed to delete recipe');
        console.error('Error deleting recipe:', error);
      } finally {
        setLoading(prev => ({ ...prev, delete: false }));
      }
    }
  }, []);

  // Handle recipe update
  const handleUpdate = useCallback(async (recipeId, updatedData) => {
    try {
      setLoading(prev => ({ ...prev, update: true }));
      const updatedRecipe = await updateRecipe(recipeId, updatedData);
      setRecipes(prev => prev.map(recipe => 
        recipe._id === recipeId ? updatedRecipe : recipe
      ));
      setSelectedRecipe(null);
      toast.success('Recipe updated successfully');
    } catch (error) {
      toast.error('Failed to update recipe');
      console.error('Error updating recipe:', error);
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, []);

  // Handle recipe rating
  const handleRateRecipe = useCallback(async (recipeId, rating) => {
    try {
      const updatedRecipe = await updateRecipe(recipeId, { popularity: rating });
      setRecipes(prev => prev.map(recipe => 
        recipe._id === recipeId ? updatedRecipe : recipe
      ));
      toast.success('Rating updated successfully');
    } catch (error) {
      toast.error('Failed to update rating');
      console.error('Error updating rating:', error);
    }
  }, []);

  // Handle image load
  const handleImageLoad = useCallback((e) => {
    e.target.style.opacity = 1;
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
  }, []);

  // Handle sort selection
  const handleSortSelect = useCallback((sort) => {
    setSortBy(sort);
    setShowSortDropdown(false);
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Search and Filter Section */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => debouncedSearch(e.target.value)}
              placeholder="Search recipes..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '1rem'
              }}
              aria-label="Search recipes"
            />
            <FaSearch style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#666'
            }} />
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              aria-expanded={showCategoryDropdown}
              aria-controls="category-dropdown"
            >
              <FaFilter /> Filter
            </button>
            {showCategoryDropdown && (
              <div
                id="category-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '1rem',
                  zIndex: 1000,
                  minWidth: '200px'
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#333' }}>Categories</h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelect(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                    aria-label="Select category"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(RECIPE_CATEGORIES).map(([mainCategory, subCategories]) => (
                      <optgroup key={mainCategory} label={mainCategory}>
                        {subCategories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => handleCategorySelect('all')}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              aria-expanded={showSortDropdown}
              aria-controls="sort-dropdown"
            >
              <FaSort /> Sort
            </button>
            {showSortDropdown && (
              <div
                id="sort-dropdown"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '1rem',
                  zIndex: 1000,
                  minWidth: '200px'
                }}
              >
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortSelect(option.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      backgroundColor: sortBy === option.value ? '#e67e22' : '#f8f9fa',
                      color: sortBy === option.value ? 'white' : '#333',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      marginBottom: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#e67e22',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaPlus /> Add Recipe
          </motion.button>
        </div>
      </div>

      {/* Recipe Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
      }}>
        {loading.fetch ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <FaSpinner className="animate-spin" size={40} color="#e67e22" />
          </div>
        ) : (
          <AnimatePresence>
            {filteredAndSortedRecipes.map(recipe => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onSelect={() => setSelectedRecipe(recipe)}
                onDelete={() => handleDelete(recipe._id)}
                onRate={(rating) => handleRateRecipe(recipe._id, rating)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <RecipeModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onDelete={() => handleDelete(selectedRecipe._id)}
          onUpdate={(updatedData) => handleUpdate(selectedRecipe._id, updatedData)}
          onRate={(rating) => handleRateRecipe(selectedRecipe._id, rating)}
          shareOptions={shareOptions}
          showQRCode={showQRCode}
          onQRCodeClose={() => setShowQRCode(false)}
          copySuccess={copySuccess}
        />
      )}

      {/* Add/Edit Recipe Form */}
      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 1.5rem 0', color: '#333' }}>
              {selectedRecipe ? 'Edit Recipe' : 'Add New Recipe'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '1rem'
                  }}
                />
              </div>
              {/* Add more form fields here */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading.create || loading.update}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e67e22',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    opacity: (loading.create || loading.update) ? 0.7 : 1
                  }}
                >
                  {loading.create || loading.update ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    selectedRecipe ? 'Update Recipe' : 'Add Recipe'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
