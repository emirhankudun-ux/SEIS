import { artworks } from "../content/artworks.js";

export function initArtworkGallery() {
  const grid = document.querySelector("[data-artwork-grid]");
  const filters = Array.from(document.querySelectorAll("[data-artwork-filter]"));
  if (!grid) return;

  let activeFilter = "all";

  const render = () => {
    const visibleArtworks = artworks.filter(artwork => {
      return activeFilter === "all" || artwork.category === activeFilter;
    });

    grid.replaceChildren(...visibleArtworks.map(createArtworkCard));
  };

  filters.forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.artworkFilter || "all";
      filters.forEach(item => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
      render();
    });
  });

  render();
}

function createArtworkCard(artwork) {
  const article = document.createElement("article");
  article.className = "artwork-card";
  article.setAttribute("data-depth-card", "");
  article.setAttribute("data-reveal", "");

  const image = document.createElement("img");
  image.src = artwork.src;
  image.alt = artwork.alt;
  image.width = artwork.width;
  image.height = artwork.height;
  image.loading = "lazy";
  image.decoding = "async";

  const media = document.createElement("div");
  media.className = "artwork-card__media";
  media.append(image);

  const meta = document.createElement("div");
  meta.className = "artwork-card__meta";

  const title = document.createElement("h3");
  title.textContent = artwork.title;

  const category = document.createElement("p");
  category.textContent = artwork.category === "karakalem" ? "Karakalem archive" : "Color archive";

  meta.append(title, category);
  article.append(media, meta);
  return article;
}

