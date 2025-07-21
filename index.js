createAutoComplete({
  root: document.querySelector(".autocomplete"),
  renderOption(movie) {
    const imgSrc = movie.Poster === "N/A" ? "https://via.placeholder.com/50x70?text=No+Image" : movie.Poster;
    return `
      <img src="${imgSrc}" />
      ${movie.Title} (${movie.Year})
    `;
  },
  onOptionSelect(movie) {
    onMovieSelect(movie);
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm, year) {
    const params = {
      apikey: "87b5f1b8",
      s: searchTerm,
      type: "movie",
    };
    if (year) {
      params.y = year;
    }

    const response = await axios.get("https://www.omdbapi.com/", { params });

    if (response.data.Error) {
      return [];
    }
    return response.data.Search;
  },
});

const onMovieSelect = async (movie) => {
  const response = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "87b5f1b8",
      i: movie.imdbID,
      plot: "full",
    },
  });

  document.querySelector("#summary").innerHTML = movieTemplate(response.data);
};

const movieTemplate = (movieDetail) => {
  // Build ratings string
  const ratings = movieDetail.Ratings
    ? movieDetail.Ratings.map(
        (rating) => `<p>${rating.Source}: ${rating.Value}</p>`
      ).join("")
    : "N/A";

  const posterSrc =
    movieDetail.Poster === "N/A"
      ? "https://via.placeholder.com/150x220?text=No+Image"
      : movieDetail.Poster;

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image is-128x128">
          <img src="${posterSrc}" alt="Poster of ${movieDetail.Title}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>Genre: ${movieDetail.Genre}</h4>
          <h4>Director: ${movieDetail.Director}</h4>
          <h4>Actors: ${movieDetail.Actors}</h4>
          <p>${movieDetail.Plot}</p>
          <div><strong>Ratings:</strong> ${ratings}</div>
        </div>
      </div>
    </article>
    <article class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};
