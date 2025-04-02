import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { addComment, deleteComment } from './store/commentSlice';
import './App.css';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

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
        const response = await axios.get('https://jsonfakery.com/movies/random/1');
        setMovie(response.data[0]);
        setError(null);
      } catch (err) {
        console.error('API Error:', err);
        setError('Erreur lors du chargement du film');
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

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Chargement...</span>
      </Spinner>
    </Container>
  );

  return (
    <Container>
      {movie && (
        <Card className="mb-4">
          {error && <Alert variant="warning">Remarque: {error} (Données de secours affichées)</Alert>}
          <Row>
            {movie.poster_path && (
              <Col md={4}>
                <Card.Img
                  variant="top"
                  src={movie.poster_path.replace(/\\/g, '')}
                  alt={movie.original_title}
                  className="poster-image"
                />
              </Col>
            )}
            <Col md={movie.poster_path ? 8 : 12}>
              <Card.Body>
                <Card.Title>{movie.original_title}</Card.Title>
                <Card.Text>{movie.overview}</Card.Text>
                <Card.Text>Sortie le: {movie.release_date}</Card.Text>
                <Card.Text>Note moyenne: {movie.vote_average} /10 ({movie.vote_count || 0} votes)</Card.Text>
                {movie.casts && movie.casts.length > 0 && (
                  <div>
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
              </Card.Body>
            </Col>
          </Row>
        </Card>
      )}

      <Card>
        <Card.Body>
          <h2>Commentaires</h2>
          {comments.length === 0 ? (
            <Alert variant="info">Aucun commentaire pour le moment.</Alert>
          ) : (
            <div>
              {comments.map(comment => (
                <Card key={comment.id} className="mb-2">
                  <Card.Body>
                    <Card.Text>
                      <span className="comment-date">{comment.createdAt}</span>
                      <span className="comment-rating">Note: {comment.note}/5</span>
                    </Card.Text>
                    <Card.Text>{comment.comment}</Card.Text>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(comment.id)}>
                      Supprimer
                    </Button>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          <h3>Ajouter un commentaire</h3>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="comment">
              <Form.Label>Commentaire</Form.Label>
              <Form.Control as="textarea" rows="4" {...register("comment")} />
              {errors.comment && <Form.Text className="text-danger">{errors.comment.message}</Form.Text>}
            </Form.Group>

            <Form.Group controlId="note">
              <Form.Label>Note</Form.Label>
              <Form.Control as="select" {...register("note")}>
                <option value="">Sélectionnez une note</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </Form.Control>
              {errors.note && <Form.Text className="text-danger">{errors.note.message}</Form.Text>}
            </Form.Group>

            <Form.Group controlId="acceptConditions">
              <Form.Check
                type="checkbox"
                label="J'accepte les conditions générales"
                {...register("acceptConditions")}
              />
              {errors.acceptConditions && <Form.Text className="text-danger">{errors.acceptConditions.message}</Form.Text>}
            </Form.Group>

            <Button type="submit" variant="primary">Ajouter</Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default App;