function createAutoComplete({ root, input, renderOption, inputValue, fetchData, onOptionSelect }) {
  const dropdown = document.createElement("div");
  dropdown.classList.add("dropdown");
  root.appendChild(dropdown);

  const resultsWrapper = document.createElement("div");
  dropdown.appendChild(resultsWrapper);

  input.addEventListener("input", debounce(async () => {
    const items = await fetchData(input.value);
    resultsWrapper.innerHTML = "";

    if (!items.length) {
      dropdown.style.display = "none";
      return;
    }

    dropdown.style.display = "block";

    items.forEach(item => {
      const option = document.createElement("div");
      option.classList.add("dropdown-item");
      option.innerHTML = renderOption(item);
      option.addEventListener("click", () => {
        input.value = inputValue(item);
        dropdown.style.display = "none";
        onOptionSelect(item);
      });
      resultsWrapper.appendChild(option);
    });
  }, 500));

  document.addEventListener("click", event => {
    if (!root.contains(event.target)) {
      dropdown.style.display = "none";
    }
  });
}
