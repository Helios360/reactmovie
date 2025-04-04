import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
    .typeError('Veuillez sélectionner une note')
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
        const response = await fetch('https://jsonfakery.com/movies/random/1');
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setMovie(data[0]);
      } catch (err) {
        console.error('API Error:', err);
        setError('Erreur lors du chargement du film');
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

  if (error) return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Alert variant="danger">
            <Alert.Heading>Erreur</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Col>
      </Row>
    </Container>
  );

  return (
    <Container>
      {movie && (
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="mb-4">
              {movie.poster_path && (
                <Card.Img
                  variant="top"
                  src={movie.poster_path.replace(/\\/g, '')}
                  alt={movie.original_title}
                  className="poster-image"
                />
              )}
              <Card.Body className='p-4'>
                <Card.Title>{movie.original_title}</Card.Title>
                <Card.Text>Sortie le: {movie.release_date}</Card.Text>
                <Card.Text>{movie.overview}</Card.Text>
                <Card.Text>Note moyenne: {movie.vote_average} /10 ({movie.vote_count || 0} votes)</Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row className="justify-content-center">
        <Col md={6}>
          <h2>Commentaires</h2>
          
          <Form onSubmit={handleSubmit(onSubmit)} className='mb-5'>
            <Form.Group controlId="comment" className="mb-3">
              <Form.Label>Commentaire</Form.Label>
              <Form.Control 
                as="textarea" 
                rows="4" 
                {...register("comment")} 
                isInvalid={!!errors.comment}
              />
              {errors.comment && <Form.Control.Feedback type="invalid">{errors.comment.message}</Form.Control.Feedback>}
            </Form.Group>

            <Form.Group controlId="note" className="mb-3">
              <Form.Label>Note</Form.Label>
              <Form.Select 
                {...register("note")} 
                isInvalid={!!errors.note}
              >
                <option value="">Sélectionnez une note</option>
                {[1, 2, 3, 4, 5].map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </Form.Select>
              {errors.note && <Form.Control.Feedback type="invalid">{errors.note.message}</Form.Control.Feedback>}
            </Form.Group>

            <Form.Group controlId="acceptConditions" className="mb-3">
              <Form.Check
                type="checkbox"
                label="J'accepte les conditions générales"
                {...register("acceptConditions")}
                isInvalid={!!errors.acceptConditions}
                feedback={errors.acceptConditions?.message}
                feedbackType="invalid"
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="mt-2">Ajouter</Button>
          </Form>
          
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
        </Col>
      </Row>
    </Container>
  );
}

export default App;