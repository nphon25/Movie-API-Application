// Autocomplete dropdown component
function createAutoComplete({ root, input, renderOption, inputValue, fetchData, onOptionSelect }) {
  // Create dropdown container
  const dropdown = document.createElement("div");
  dropdown.classList.add("dropdown");
  root.appendChild(dropdown);

  // Container for search results
  const resultsWrapper = document.createElement("div");
  dropdown.appendChild(resultsWrapper);

  // Handle user input with debounce
  input.addEventListener("input", debounce(async () => {
    const items = await fetchData(input.value); // Fetch results
    resultsWrapper.innerHTML = ""; // Clear old results

    if (!items.length) {
      dropdown.style.display = "none"; // Hide if no results
      return;
    }

    dropdown.style.display = "block"; // Show dropdown

    // Render each result
    items.forEach(item => {
      const option = document.createElement("div");
      option.classList.add("dropdown-item");
      option.innerHTML = renderOption(item); // Generate HTML

      // When a result is clicked
      option.addEventListener("click", () => {
        input.value = inputValue(item);     // Fill input with selection
        dropdown.style.display = "none";    // Hide dropdown
        onOptionSelect(item);               // Trigger custom behavior
      });

      resultsWrapper.appendChild(option);
    });
  }, 500));

  // Hide dropdown when clicking outside
  document.addEventListener("click", event => {
    if (!root.contains(event.target)) {
      dropdown.style.display = "none";
    }
  });
}
