import React, { useState, useEffect, useRef } from 'react';

// Movie images - matched to existing data
const movieImageMap = {
  'Inception': '/images/inception.jpg',
  'The Dark Knight': '/images/dark-knight.jpg',
  'Interstellar': '/images/interstellar.jpg',
  'Titanic': '/images/titanic.jpg',
  'The Room': '/images/the-room.jpg',
};

const getFallbackImage = () => {
  return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop';
};

const getMovieImage = (title, poster = null) => {
  if (poster) {
    // If it's just a filename from the backend initial data, prepend /images/
    if (!poster.startsWith('http') && !poster.startsWith('/') && !poster.startsWith('blob:')) {
      return `/images/${poster}`;
    }
    return poster;
  }
  return movieImageMap[title] || getFallbackImage();
};

const MovieManager = React.forwardRef((props, ref) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingMovieId, setDeletingMovieId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [filterRating, setFilterRating] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadedPoster, setUploadedPoster] = useState('');
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    rating: '',
    recommendation: 'Yes'
  });

  // Expose methods to parent
  React.useImperativeHandle(ref, () => ({
    viewTrending: () => {
      setFilterRating('5');
      setSearchTerm('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    viewCollections: () => {
      setFilterRating('');
      setSearchTerm('');
      document.getElementById('movies-grid')?.scrollIntoView({ behavior: 'smooth' });
    },
    showAbout: () => {
      setShowAboutModal(true);
    }
  }));

  useEffect(() => {
    fetchMovies();
  }, [filterRating]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const url = filterRating ? `http://localhost:5000/movies?rating=${filterRating}` : 'http://localhost:5000/movies';
      const response = await fetch(url);
      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error('Error fetching movies:', error);
      alert('Failed to fetch movies');
    }
    setLoading(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('poster', file);

    try {
      const response = await fetch('http://localhost:5000/movies/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();
      if (response.ok) {
        setUploadedPoster(result.path);
        setUploadProgress(100);
        alert('✅ Image uploaded successfully!');
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.genre || !formData.rating) {
      alert('Title, genre, and rating are required');
      return;
    }

    try {
      const submitData = {
        title: formData.title,
        genre: formData.genre,
        rating: parseInt(formData.rating),
        recommendation: formData.recommendation,
        poster: uploadedPoster || null
      };

      if (editingId) {
        const response = await fetch(`http://localhost:5000/movies/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
        const updated = await response.json();
        setMovies(movies.map(m => m.id === editingId ? updated : m));
      } else {
        const response = await fetch('http://localhost:5000/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submitData)
        });
        const newMovie = await response.json();
        setMovies([...movies, newMovie]);
      }
      resetForm();
      fetchMovies();
    } catch (error) {
      console.error('Error saving movie:', error);
      alert('Failed to save movie');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', genre: '', rating: '', recommendation: 'Yes' });
    setPreviewImage(null);
    setUploadedPoster('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (movie) => {
    setFormData(movie);
    setUploadedPoster(movie.poster || '');
    setEditingId(movie.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    console.log('Requesting delete for ID:', id);
    setDeletingMovieId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingMovieId) return;
    try {
      console.log('Confirming delete for ID:', deletingMovieId);
      const response = await fetch(`http://localhost:5000/movies/${deletingMovieId}`, { method: 'DELETE' });
      if (response.ok) {
        console.log('Delete successful on server, updating state...');
        setMovies(movies.filter(m => m.id != deletingMovieId));
        setShowDeleteModal(false);
        setDeletingMovieId(null);
      } else {
        alert('Failed to delete movie from server');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      alert('Failed to delete movie');
    }
  };

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const genreColors = {
    'Sci-Fi': 'from-blue-600 to-cyan-600',
    'Action': 'from-red-600 to-orange-600',
    'Drama': 'from-purple-600 to-pink-600',
    'Comedy': 'from-yellow-600 to-orange-600',
    'Horror': 'from-gray-800 to-red-900',
    'Romance': 'from-pink-600 to-rose-600',
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-400 bg-green-500/20';
    if (rating >= 3) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  return (
    <div className="w-full space-y-12">
      {/* Top Section */}
      <div className="relative mb-20">
        {/* Background glow Decor */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest">
              ✨ Discover Excellence
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
              Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-600">Cinema</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">
              Explore our curated selection of cinematic masterpieces. Rate, review, and organize your personal watch history.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="group relative bg-white text-slate-900 font-black py-5 px-10 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10 flex items-center gap-3 decoration-none group-hover:text-white transition-colors">
              <span className="text-2xl">➕</span>
              <span className="text-lg">Add to Collection</span>
            </span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 p-2 bg-slate-800/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden group">
          <div className="flex-1 relative flex items-center">
            <span className="absolute left-6 text-slate-500 group-focus-within:text-yellow-400 transition-colors">🔍</span>
            <input
              type="text"
              placeholder="Search by title, genre, or director..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none rounded-2xl pl-16 pr-6 py-5 text-white placeholder-slate-500 focus:ring-0 text-lg font-medium"
            />
          </div>
          <div className="h-10 w-px bg-white/10 hidden md:block self-center" />
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="bg-transparent border-none rounded-2xl px-8 py-5 text-white font-bold focus:ring-0 appearance-none cursor-pointer hover:text-yellow-400 transition-colors"
          >
            <option value="" className="bg-slate-900">All Masterpieces</option>
            <option value="5" className="bg-slate-900">⭐⭐⭐⭐⭐ Five Stars</option>
            <option value="4" className="bg-slate-900">⭐⭐⭐⭐ Excellent</option>
            <option value="3" className="bg-slate-900">⭐⭐⭐ Decent</option>
            <option value="2" className="bg-slate-900">⭐⭐ Below Average</option>
            <option value="1" className="bg-slate-900">⭐ Poor</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={resetForm} />
          
          <div className="relative w-full max-w-5xl bg-slate-900/90 rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
              {/* Left Side: Image Preview/Upload */}
              <div className="lg:w-2/5 relative bg-slate-950/50 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
                {previewImage ? (
                  <div className="relative group w-full h-full flex items-center justify-center">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="max-h-[500px] w-full object-cover rounded-3xl shadow-2xl"
                    />
                    <button 
                      onClick={() => { setPreviewImage(null); setUploadedPoster(''); }}
                      className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-3 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-60 rounded-3xl" />
                  </div>
                ) : (
                  <label className="group cursor-pointer w-full h-full min-h-[300px] flex flex-col items-center justify-center border-4 border-dashed border-white/5 rounded-3xl hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all duration-500">
                    <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 text-4xl group-hover:scale-110 group-hover:bg-yellow-500/20 transition-all">
                      🖼️
                    </div>
                    <h4 className="text-xl font-bold text-white mb-2">Upload Poster</h4>
                    <p className="text-slate-500 text-sm px-8">Drag and drop or click to browse</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
                
                {uploading && (
                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="flex justify-between text-xs text-yellow-500 font-bold mb-2 uppercase tracking-widest">
                      <span>Uploading Intelligence</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-yellow-500 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Form Details */}
              <div className="lg:w-3/5 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h3 className="text-3xl font-black text-white tracking-tight">
                      {editingId ? 'Refine Entry' : 'New Masterpiece'}
                    </h3>
                    <p className="text-slate-500 font-medium">Capture the essence of the cinematic experience</p>
                  </div>
                  <button onClick={resetForm} className="text-slate-400 hover:text-white transition-colors text-2xl p-2">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Inception"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all text-xl font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Genre</label>
                      <input
                        type="text"
                        placeholder="Action, Sci-Fi..."
                        value={formData.genre}
                        onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 transition-all font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Rating</label>
                      <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFormData({ ...formData, rating: star })}
                            className={`flex-1 py-3 text-2xl transition-all ${formData.rating >= star ? 'grayscale-0 scale-110' : 'grayscale opacity-30 shadow-none'}`}
                          >
                             ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Recommendation</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((rec) => (
                        <button
                          key={rec}
                          type="button"
                          onClick={() => setFormData({ ...formData, recommendation: rec })}
                          className={`flex-1 py-4 rounded-2xl font-black transition-all ${formData.recommendation === rec 
                            ? (rec === 'Yes' ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]')
                            : 'bg-white/5 text-slate-500 border border-white/5'}`}
                        >
                          {rec === 'Yes' ? '✓ Recommended' : '✕ Skip'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 font-black py-6 rounded-2xl shadow-2xl hover:shadow-yellow-500/20 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 text-xl"
                  >
                    {editingId ? 'Update Record' : 'Publish Entry'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-2xl" onClick={() => setShowAboutModal(false)} />
          <div className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-950 rounded-[3rem] border border-white/10 p-10 shadow-[0_0_100px_rgba(234,179,8,0.1)] text-center animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl rotate-12 group">
              <span className="text-4xl group-hover:scale-125 transition-transform">🎬</span>
            </div>
            <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">CineHub Premium</h3>
            <p className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-xs mb-8">Version 2.1.0 • Gold Edition</p>
            
            <div className="space-y-4 text-slate-400 text-lg leading-relaxed mb-10">
              <p>Welcome to the era of ultra-high-fidelity cinematic archival.</p>
              <p>Experience a platform built for the most demanding collectors, featuring deep glassmorphism architecture and fluid performance indexing.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-10">
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-white font-black text-xl mb-1">4K</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Assets</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-yellow-500/20">
                <div className="text-yellow-500 font-black text-xl mb-1">Active</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Status</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4">
                <div className="text-white font-black text-xl mb-1">∞</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Logic</div>
              </div>
            </div>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full bg-white text-slate-950 font-black py-5 rounded-2xl hover:bg-yellow-400 transition-colors duration-300"
            >
              Acknowledge Entry
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowDeleteModal(false)} />
          <div className="relative w-full max-w-md bg-slate-900 rounded-[2.5rem] border border-red-500/20 p-10 text-center animate-in zoom-in duration-300 shadow-[0_0_100px_rgba(239,68,68,0.1)]">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <span className="text-4xl">⚠️</span>
            </div>
            <h3 className="text-3xl font-black text-white mb-4 tracking-tighter">Discard Record?</h3>
            <p className="text-slate-400 text-lg mb-10">This action will permanently remove this masterpiece from the archive. This cannot be undone.</p>
            
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-white/5 text-white font-bold py-5 rounded-2xl hover:bg-white/10 transition-all border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-2 px-8 bg-red-500 hover:bg-red-600 text-white font-black py-5 rounded-2xl transition-all shadow-lg shadow-red-500/20"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movies Grid */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-[50vh] space-y-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-500/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-yellow-500 animate-spin" />
            <div className="absolute inset-4 rounded-full border-4 border-black/10" />
            <div className="absolute inset-4 rounded-full border-4 border-b-orange-500 animate-[spin_1.5s_linear_infinite_reverse]" />
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] animate-pulse">Syncing Library</p>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="relative overflow-hidden group py-32 bg-slate-800/20 rounded-[3rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center">
          <div className="text-8xl mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">🎬</div>
          <h3 className="text-3xl font-black text-white mb-2">The Archive is Empty</h3>
          <p className="text-slate-500 text-lg">Ready to document your cinematic journey?</p>
          <button onClick={() => setShowForm(true)} className="mt-8 text-yellow-500 font-bold hover:text-yellow-400 underline underline-offset-8">Start Tracking</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              className="group relative flex flex-col h-full bg-slate-800/20 backdrop-blur-xl rounded-[2.5rem] border border-white/5 hover:border-yellow-500/30 transition-all duration-500 shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              {/* Poster Container */}
              <div className="relative h-[420px] overflow-hidden group">
                <img
                  src={getMovieImage(movie.title, movie.poster)}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  onError={(e) => {
                    e.target.src = getFallbackImage();
                  }}
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/10 ${genreColors[movie.genre] ? 'bg-gradient-to-r ' + genreColors[movie.genre] : 'bg-slate-900/50'}`}>
                    {movie.genre}
                  </div>
                </div>
                
                {/* Hover Quick Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-4 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                  <button
                    onClick={() => handleEdit(movie)}
                    className="w-14 h-14 bg-white/10 hover:bg-white text-slate-400 hover:text-slate-900 rounded-2xl flex items-center justify-center transition-all duration-300 border border-white/10 hover:rotate-6 scale-90 group-hover:scale-100"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(movie.id)}
                    className="w-14 h-14 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl flex items-center justify-center transition-all duration-300 border border-red-500/20 hover:-rotate-6 scale-90 group-hover:scale-100"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Title & Info */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h3 className="text-2xl font-black text-white leading-tight group-hover:text-yellow-400 transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex flex-col items-end">
                    <span className="text-yellow-400 text-xl font-black">{(movie.rating || 0).toFixed(1)}</span>
                    <div className="flex text-yellow-400/40 text-[10px]">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < movie.rating ? 'opacity-100' : ''}>★</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${movie.recommendation === 'Yes' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {movie.recommendation === 'Yes' ? 'Highly Recommended' : 'Critic Alert'}
                    </span>
                  </div>
                  {movie.poster && (
                    <span className="text-[10px] font-bold text-yellow-500/50 uppercase italic">Authenticated Poster</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default MovieManager;

