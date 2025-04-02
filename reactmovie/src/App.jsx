import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { addComment, deleteComment } from './store/commentSlice';
import './App.css';
// Form validation schema
const schema = yup.object({
  comment: yup.string()
    .required('Le commentaire est obligatoire')
    .max(500, 'Le commentaire ne doit pas dépasser 500 caractères'),
  note: yup.number()
    .required('La note est obligatoire')
    .min(1, 'La note doit être entre 1 et 5')
    .max(5, 'La note doit être entre 1 et 5'),
  acceptConditions: yup.boolean()
    .oneOf([true], 'Vous devez accepter les conditions générales')
});

function App() {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const comments = useSelector(state => state.comments);
  const dispatch = useDispatch();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const response = await axios.get('https://jsonfakery.com/movies/random/1');
        // The API returns an array with one movie object
        setMovie(response.data[0]);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        setError('Erreur lors du chargement du film');
        
        // Fallback data in case the API fails
        setMovie({
          id: "fallback-movie",
          original_title: "The Honey Games",
          overview: "When an overenthusiastic Maya accidentally embarrasses the Empress of Buzztropolis, she is forced to unite with a team of misfit bugs and compete in the Honey Games for a chance to save her hive.",
          release_date: "03/02/2018",
          vote_average: 6.6,
          poster_path: "",
          casts: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, []);

  const onSubmit = (data) => {
    const newComment = {
      id: Date.now().toString(),
      comment: data.comment,
      note: Number(data.note),
      createdAt: new Date().toLocaleDateString()
    };
    
    dispatch(addComment(newComment));
    reset();
  };

  const handleDelete = (id) => {
    dispatch(deleteComment(id));
  };

  if (loading) return <div className="container">Chargement...</div>;

  return (
    <div className="container">
      {movie && (
        <div className="movie-header">
          {error && <div className="error-banner">Remarque: {error} (Données de secours affichées)</div>}
          <div className="movie-info">
            {movie.poster_path && (
              <div className="movie-poster">
                <img 
                  src={movie.poster_path.replace(/\\/g, '')} 
                  alt={movie.original_title} 
                  className="poster-image"
                />
              </div>
            )}
            <div className="movie-details">
              <h1 className="movie-title">{movie.original_title}</h1>
              <p className="movie-description">{movie.overview}</p>
              <p className="movie-release">Sortie le: {movie.release_date}</p>
              <p className="movie-rating">Note moyenne: {movie.vote_average} /10 ({movie.vote_count || 0} votes)</p>
              
              {movie.casts && movie.casts.length > 0 && (
                <div className="movie-cast">
                  <h3>Distribution</h3>
                  <ul className="cast-list">
                    {movie.casts.slice(0, 5).map(cast => (
                      <li key={cast.id} className="cast-item">
                        {cast.name} ({cast.character})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="comments-section">
        <h2>Commentaires</h2>
        
        {comments.length === 0 ? (
          <div className="no-comments">
            Aucun commentaire pour le moment.
          </div>
        ) : (
          <div className="comment-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-date">{comment.createdAt}</span>
                  <span className="comment-rating">Note: {comment.note}/5</span>
                </div>
                <p className="comment-text">{comment.comment}</p>
                <button 
                  className="delete-btn" 
                  onClick={() => handleDelete(comment.id)}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="comment-form">
          <h3>Ajouter un commentaire</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="comment">Commentaire</label>
              <textarea 
                id="comment"
                className="form-control" 
                {...register("comment")}
                rows="4"
              ></textarea>
              {errors.comment && <p className="error-message">{errors.comment.message}</p>}
            </div>
            
            <div className="form-group">
              <label htmlFor="note">Note</label>
              <select 
                id="note"
                className="form-control" 
                {...register("note")}
              >
                <option value="">Sélectionnez une note</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
              {errors.note && <p className="error-message">{errors.note.message}</p>}
            </div>
            
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="acceptConditions" 
                {...register("acceptConditions")} 
              />
              <label htmlFor="acceptConditions">J'accepte les conditions générales</label>
            </div>
            {errors.acceptConditions && (
              <p className="error-message">{errors.acceptConditions.message}</p>
            )}
            
            <button type="submit" className="submit-btn">Ajouter</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;