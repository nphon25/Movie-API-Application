// AUTOCOMPLETE SETUP 
createAutoComplete({
  root: document.querySelector(".autocomplete"),
  input: document.querySelector("#titleInput"),

  // Display dropdown option
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" 
      ? "https://via.placeholder.com/50x70?text=No+Image" 
      : movie.Poster;
    return `<img src="${imgSrc}" alt="Poster" />
            <span>${movie.Title} (${movie.Year})</span>`;
  },

  // Set input value from selected movie
  inputValue(movie) {
    return movie.Title;
  },

  // Fetch autocomplete suggestions
  async fetchData(searchTerm) {
    const genre = document.querySelector("#genreSelect").value;
    const year = document.querySelector("#yearInput").value;
    if (!searchTerm) return [];

    const params = {
      apikey: "87b5f1b8",
      s: searchTerm,
      type: "movie",
      ...(year && { y: year })
    };

    const res = await axios.get("https://www.omdbapi.com/", { params });
    if (res.data.Error) return [];

    let movies = res.data.Search;

    // Filter by genre
    if (genre) {
      const detailed = await Promise.all(
        movies.map(m =>
          axios.get("https://www.omdbapi.com/", {
            params: { apikey: "87b5f1b8", i: m.imdbID }
          }).then(res => res.data)
        )
      );
      movies = detailed.filter(m => m.Genre.includes(genre));
    }

    return movies;
  },

  // Handle selection from dropdown
  onOptionSelect(movie) {
    onMovieSelect(movie);
  }
});

//  DISPLAY SELECTED MOVIE 
const onMovieSelect = async (movie) => {
  const res = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "87b5f1b8",
      i: movie.imdbID,
      plot: "full"
    }
  });

  document.querySelector("#summary").innerHTML += movieTemplate(res.data);
};

// movie html template 
const movieTemplate = (movie) => {
  const ratings = movie.Ratings?.map(r =>
    `<p><strong>${r.Source}:</strong> ${r.Value}</p>`).join("") || "N/A";

  const poster = movie.Poster === "N/A"
    ? "https://via.placeholder.com/150x220?text=No+Image"
    : movie.Poster;

  const infoBox = (title, subtitle) => `
    <article class="notification is-primary">
      <p class="title">${title || "N/A"}</p>
      <p class="subtitle">${subtitle}</p>
    </article>`;

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
    ${infoBox(movie.Awards, "Awards")}
    ${infoBox(movie.BoxOffice, "Box Office")}
    ${infoBox(movie.Metascore, "Metascore")}
    ${infoBox(movie.imdbRating, "IMDB Rating")}
    ${infoBox(movie.imdbVotes, "IMDB Votes")}
  `;
};

// manual search handler 
const performSearch = async () => {
  const searchTerm = document.querySelector("#titleInput").value.trim();
  const genre = document.querySelector("#genreSelect").value;
  const year = document.querySelector("#yearInput").value;
  const summaryEl = document.querySelector("#summary");

  if (!searchTerm) {
    summaryEl.innerHTML = `<p>Please enter a movie title to search.</p>`;
    return;
  }

  try {
    const params = {
      apikey: "87b5f1b8",
      s: searchTerm,
      type: "movie",
      ...(year && { y: year })
    };

    const res = await axios.get("https://www.omdbapi.com/", { params });

    if (res.data.Error) {
      summaryEl.innerHTML = `<p>No results found.</p>`;
      return;
    }

    let movies = res.data.Search;

    if (genre) {
      const detailed = await Promise.all(
        movies.map(m =>
          axios.get("https://www.omdbapi.com/", {
            params: { apikey: "87b5f1b8", i: m.imdbID }
          }).then(res => res.data)
        )
      );
      movies = detailed.filter(m => m.Genre.includes(genre));
    }

    if (!movies.length) {
      summaryEl.innerHTML = `<p>No movies match the selected genre.</p>`;
      return;
    }

    summaryEl.innerHTML = ""; // Clear previous results
    for (let movie of movies) {
      await onMovieSelect(movie);
    }
  } catch (err) {
    summaryEl.innerHTML = `<p>Error fetching data.</p>`;
    console.error(err);
  }
};

// Event Listener
document.querySelector("#searchButton").addEventListener("click", performSearch);
