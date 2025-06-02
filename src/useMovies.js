import { useEffect, useState } from "react";
const KEY = "f84fc31d";
export default function useMovies(query) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError("");
          const data = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          // console.log(data);
          if (!data.ok) {
            throw new Error("Can't fetch data");
          }
          const res = await data.json();

          if (res.Response === "False") {
            throw new Error(res.Error);
          }
          setMovies(res.Search ? res.Search : res);
          setIsLoading(false);
        } catch (err) {
          if (err.name !== "AbortError") {
            console.log(err);
            setError(err.message);
          }
        } finally {
          setIsLoading(false);
        }
      }
      fetchMovies();
      //   handleClose();
      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return { movies, isLoading, error };
}
