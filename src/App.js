import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import useMovies from "./useMovies";
import useLocalStorage from "./useLocalStorage";
const KEY = "f84fc31d";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
// const KEY = "c945051";

export default function App() {
  const [query, setQuery] = useState("inception");

  const { watched, setWatched } = useLocalStorage();
  const { movies, isLoading, error } = useMovies(query);
  const [selectedId, setSelectedId] = useState(null);

  function handleDeleteMovie(id) {
    setWatched((watched) => watched.filter((item) => item.imdbID !== id));
  }
  function handleSelectedId(id) {
    setSelectedId(id === selectedId ? null : id);
  }
  function handleClose() {
    setSelectedId(null);
  }
  return (
    <>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {error && <ErrorShow error={error}></ErrorShow>}
          {!error && isLoading && <Loading></Loading>}
          {!error && !isLoading && (
            <MovieList
              movies={movies}
              handleSelectedId={handleSelectedId}
            ></MovieList>
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleClose={handleClose}
              setWatched={setWatched}
              watched={watched}
            ></MovieDetails>
          ) : (
            <>
              <WatchedSummary watched={watched}></WatchedSummary>
              <WatchedMovieList
                watched={watched}
                onDeletdHandle={handleDeleteMovie}
              ></WatchedMovieList>
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function MovieDetails({ selectedId, handleClose, setWatched, watched }) {
  const [movie, setMovie] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [starRating, setStarRating] = useState(0);
  function handleAdd() {
    const data = {
      imdbID: movie.imdbID,
      Title: movie.Title,
      Year: movie.Year,
      Poster: movie.Poster,
      imdbRating: Number(movie.imdbRating),
      runtime: Number(movie.Runtime.split(" ").at(0)),
      userRating: starRating,
    };
    handleClose();
    setWatched((watched) => {
      return [...watched, data];
    });
  }

  useEffect(
    function () {
      document.title = `title | ${movie.Title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [movie.Title]
  );
  useEffect(
    function () {
      async function param() {
        setIsLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
        );
        const data = await res.json();
        setMovie(data);
        setIsLoading(false);
      }
      param();
    },
    [selectedId]
  );
  return isLoading ? (
    <Loading></Loading>
  ) : (
    <div className="details">
      <header>
        <button className="btn-back" onClick={handleClose}>
          &larr;
        </button>
        <img
          className="img"
          src={movie.Poster}
          alt={`poster of movie ${movie.Title}`}
        />
        <div className="details-overview">
          <h2>{movie.Title}</h2>
          <p>
            {movie.Released} &bull; {movie.Runtime}
          </p>
          <p>{movie.Genre}</p>
          <p>⭐️ {movie.imdbRating} IMDB Rating</p>
        </div>
      </header>
      <section>
        {watched.map((item) => item.imdbID).includes(selectedId) ? (
          <div></div>
        ) : (
          <div className="rating">
            <StarRating
              maxRating={10}
              size={24}
              rating={starRating}
              setRating={setStarRating}
            ></StarRating>
            <button className="btn-add" onClick={handleAdd}>
              {" "}
              + Add to list
            </button>
          </div>
        )}
        <p>
          <em>{movie.Plot}</em>
        </p>
      </section>
    </div>
  );
}
function Loading() {
  return <p className="loader">Loading...</p>;
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🎬</span>
      <h1>moviePedia</h1>
    </div>
  );
}
function Search({ query, setQuery }) {
  const inputEl = useRef(null);
  useEffect(
    function () {
      inputEl.current.focus();
      function callBack(e) {
        if (document.activeElement === inputEl.current) {
          return;
        }
        if (e.code === "Enter") {
          inputEl.current.focus();
          setQuery("");
        }
      }
      document.addEventListener("keypress", callBack);
    },
    [setQuery]
  );
  return (
    <input
      ref={inputEl}
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => {
        return setQuery(e.target.value);
      }}
    />
  );
}
function ErrorShow({ error }) {
  return <div className="error">{error}</div>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
function MovieList({ movies, handleSelectedId }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} handleSelectedId={handleSelectedId}></Movie>
      ))}
    </ul>
  );
}
function Movie({ movie, handleSelectedId }) {
  return (
    <li key={movie.imdbID} onClick={() => handleSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, onDeletdHandle }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} onDeletdHandle={onDeletdHandle} />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, onDeletdHandle }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <button
        className="btn-delete"
        onClick={() => onDeletdHandle(movie.imdbID)}
      >
        x
      </button>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
      </div>
    </li>
  );
}
