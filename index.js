createAutoComplete({
  root: document.querySelector(".autocomplete"),
  input: document.querySelector("#titleInput"),
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" 
      ? "https://via.placeholder.com/50x70?text=No+Image" 
      : movie.Poster;
    return `
      <img src="${imgSrc}" alt="Poster" />
      <span>${movie.Title} (${movie.Year})</span>
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const genre = document.querySelector("#genreSelect").value;
    const year = document.querySelector("#yearInput").value;

    if (!searchTerm) return [];

    const params = {
      apikey: "87b5f1b8",
      s: searchTerm,
      type: "movie"
    };

    if (year) params.y = year;

    const response = await axios.get("https://www.omdbapi.com/", { params });
    if (response.data.Error) return [];

    let movies = response.data.Search;

    if (genre) {
      const detailedMovies = await Promise.all(
        movies.map(movie =>
          axios.get("https://www.omdbapi.com/", {
            params: { apikey: "87b5f1b8", i: movie.imdbID }
          }).then(res => res.data)
        )
      );

      movies = detailedMovies.filter(m => m.Genre.includes(genre));
    }

    return movies;
  },
  onOptionSelect(movie) {
    onMovieSelect(movie);
  }
});

const onMovieSelect = async (movie) => {
  const response = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "87b5f1b8",
      i: movie.imdbID,
      plot: "full"
    }
  });

  document.querySelector("#summary").innerHTML = movieTemplate(response.data);
};

const movieTemplate = (movie) => {
  const ratings = movie.Ratings
    ? movie.Ratings.map(r => `<p><strong>${r.Source}:</strong> ${r.Value}</p>`).join("")
    : "N/A";

  const poster = movie.Poster === "N/A"
    ? "https://via.placeholder.com/150x220?text=No+Image"
    : movie.Poster;

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image is-128x192">
          <img src="${poster}" alt="${movie.Title}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movie.Title} (${movie.Year})</h1>
          <h4><strong>Genre:</strong> ${movie.Genre}</h4>
          <h4><strong>Director:</strong> ${movie.Director}</h4>
          <h4><strong>Actors:</strong> ${movie.Actors}</h4>
          <p>${movie.Plot}</p>
          <div><strong>Ratings:</strong>${ratings}</div>
        </div>
      </div>
    </article>

    <article class="notification is-primary">
      <p class="title">${movie.Awards || "N/A"}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article class="notification is-primary">
      <p class="title">${movie.BoxOffice || "N/A"}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article class="notification is-primary">
      <p class="title">${movie.Metascore || "N/A"}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article class="notification is-primary">
      <p class="title">${movie.imdbRating || "N/A"}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article class="notification is-primary">
      <p class="title">${movie.imdbVotes || "N/A"}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};

// Function to perform search and display results in #summary
const performSearch = async () => {
  const searchTerm = document.querySelector("#titleInput").value.trim();
  const genre = document.querySelector("#genreSelect").value;
  const year = document.querySelector("#yearInput").value;

  if (!searchTerm) {
    document.querySelector("#summary").innerHTML = `<p>Please enter a movie title to search.</p>`;
    return;
  }

  try {
    const params = {
      apikey: "87b5f1b8",
      s: searchTerm,
      type: "movie"
    };
    if (year) params.y = year;

    const response = await axios.get("https://www.omdbapi.com/", { params });

    if (response.data.Error) {
      document.querySelector("#summary").innerHTML = `<p>No results found.</p>`;
      return;
    }

    let movies = response.data.Search;

    if (genre) {
      const detailedMovies = await Promise.all(
        movies.map(movie =>
          axios.get("https://www.omdbapi.com/", {
            params: { apikey: "87b5f1b8", i: movie.imdbID }
          }).then(res => res.data)
        )
      );

      movies = detailedMovies.filter(m => m.Genre.includes(genre));
    }

    if (movies.length === 0) {
      document.querySelector("#summary").innerHTML = `<p>No movies match the selected genre.</p>`;
      return;
    }

    
onMovieSelect(movies[0]);
    
  } catch (error) {
    document.querySelector("#summary").innerHTML = `<p>Error fetching data. Please try again later.</p>`;
    console.error(error);
  }
};

document.querySelector("#searchButton").addEventListener("click", performSearch);
