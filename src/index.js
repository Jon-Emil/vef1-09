/**
 * Gefið efni fyrir verkefni 9, ekki er krafa að nota nákvæmlega þetta en nota
 * verður gefnar staðsetningar.
 */

import { el, empty } from "./lib/elements.js";
import { weatherSearch } from "./lib/weather.js";

/**
 * @typedef {Object} SearchLocation
 * @property {string} title
 * @property {number} lat
 * @property {number} lng
 */

/**
 * Allar staðsetning sem hægt er að fá veður fyrir.
 * @type Array<SearchLocation>
 */
const locations = [
  {
    title: "Mín staðsetning",
    lat: 0,
    lng: 0,
  },
  {
    title: "Reykjavík",
    lat: 64.1355,
    lng: -21.8954,
  },
  {
    title: "Akureyri",
    lat: 65.6835,
    lng: -18.0878,
  },
  {
    title: "New York",
    lat: 40.7128,
    lng: -74.006,
  },
  {
    title: "Tokyo",
    lat: 35.6764,
    lng: 139.65,
  },
  {
    title: "Sydney",
    lat: 33.8688,
    lng: 151.2093,
  },
];

/**
 * Hreinsar fyrri niðurstöður, passar að niðurstöður séu birtar og birtir element.
 * @param {Element} element
 */
function renderIntoResultsContent(element) {
  const outputElement = document.querySelector(".output");

  if (!outputElement) {
    console.warn("fann ekki .output");
    return;
  }

  empty(outputElement);

  outputElement.appendChild(element);
}

/**
 * Birtir niðurstöður í viðmóti.
 * @param {SearchLocation} location
 * @param {Array<import('./lib/weather.js').Forecast>} results
 */
function renderResults(location, results) {
  const header = el(
    "tr",
    {},
    el("th", {}, "Klukkutími"),
    el("th", {}, "Hiti (°C)"),
    el("th", {}, "Úrkoma (mm)")
  );
  const body = el("tbody", {});

  results.forEach((result) => {
    const row = el(
      "tr",
      {},
      el("td", {}, result.time.slice(11)),
      el("td", {}, result.temperature + ""),
      el("td", {}, result.precipitation + "")
    );
    body.appendChild(row);
  });

  const resultsTable = el("table", { class: "forecast" }, header, body);

  renderIntoResultsContent(
    el(
      "section",
      {},
      el("h2", {}, `Leitarniðurstöður fyrir: ${location.title}`),
      resultsTable
    )
  );
}

/**
 * Birta biðstöðu í viðmóti.
 */
function renderLoading() {
  renderIntoResultsContent(el("p", {}, "Leita..."));
}

function renderNoLocation() {
  renderIntoResultsContent(el("p", {}, "Gat ekki sótt staðsetningu"));
}

function renderNoWeatherInfo() {
  renderIntoResultsContent(el("p", {}, "Gat ekki sótt veður upplýsingar"));
}

/**
 * Framkvæmir leit að veðri fyrir gefna staðsetningu.
 * Birtir biðstöðu, villu eða niðurstöður í viðmóti.
 * @param {SearchLocation} location Staðsetning sem á að leita eftir.
 */
async function onSearch(location) {
  renderLoading();

  let results;
  try {
    results = await weatherSearch(location.lat, location.lng);
  } catch {
    renderNoWeatherInfo();
    return;
  }

  renderResults(location, results ?? []);
}

/**
 * Framkvæmir leit að veðri fyrir núverandi staðsetningu.
 * Biður notanda um leyfi gegnum vafra.
 */
function onSearchMyLocation(location) {
  renderLoading();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      location.lat = position.coords.latitude;
      location.lng = position.coords.longitude;

      try {
        const results = await weatherSearch(location.lat, location.lng);
        renderResults(location, results ?? []);
      } catch {
        renderNoWeatherInfo();
      }
    },
    () => {
      renderNoLocation();
    }
  );
}

/**
 * Býr til takka fyrir staðsetningu.
 * @param {string} locationTitle
 * @param {() => void} onSearch
 * @returns {HTMLElement}
 */
function renderLocationButton(locationTitle, onSearch, onSearchMyLocation) {
  // Notum `el` fallið til að búa til element og spara okkur nokkur skref.
  const locationElement = el(
    "li",
    { class: "locations__location" },
    el(
      "button",
      {
        class: "locations__button",
        click:
          locationTitle === "Mín staðsetning" ? onSearchMyLocation : onSearch,
      },
      locationTitle
    )
  );

  /* Til smanburðar við el fallið ef við myndum nota DOM aðgerðir
  const locationElement = document.createElement('li');
  locationElement.classList.add('locations__location');
  const locationButton = document.createElement('button');
  locationButton.appendChild(document.createTextNode(locationTitle));
  locationButton.addEventListener('click', onSearch);
  locationElement.appendChild(locationButton);
  */

  return locationElement;
}

/**
 * Býr til grunnviðmót: haus og lýsingu, lista af staðsetningum og niðurstöður (falið í byrjun).
 * @param {Element} container HTML element sem inniheldur allt.
 * @param {Array<SearchLocation>} locations Staðsetningar sem hægt er að fá veður fyrir.
 * @param {(location: SearchLocation) => void} onSearch
 * @param {() => void} onSearchMyLocation
 */
function render(container, locations, onSearch, onSearchMyLocation) {
  // Búum til <main> og setjum `weather` class
  const parentElement = document.createElement("main");
  parentElement.classList.add("weather");

  // Búum til <header> með beinum DOM aðgerðum
  const headerElement = document.createElement("header");
  const heading = document.createElement("h1");
  heading.appendChild(document.createTextNode("Veðrið"));
  headerElement.appendChild(heading);
  parentElement.appendChild(headerElement);

  const intro = document.createElement("p");
  intro.appendChild(
    document.createTextNode("Veldu stað til að sjá hita- og úrkomuspá.")
  );
  parentElement.appendChild(intro);

  const locationHeading = document.createElement("h2");
  locationHeading.appendChild(document.createTextNode("Staðsetningar"));
  parentElement.appendChild(locationHeading);

  // Búa til <div class="loctions">
  const locationsElement = document.createElement("div");
  locationsElement.classList.add("locations");

  // Búa til <ul class="locations__list">
  const locationsListElement = document.createElement("ul");
  locationsListElement.classList.add("locations__list");

  // <div class="loctions"><ul class="locations__list"></ul></div>
  locationsElement.appendChild(locationsListElement);

  // <div class="loctions"><ul class="locations__list"><li><li><li></ul></div>
  for (const location of locations) {
    const liButtonElement = renderLocationButton(
      location.title,
      () => onSearch(location),
      () => onSearchMyLocation(location)
    );
    locationsListElement.appendChild(liButtonElement);
  }

  parentElement.appendChild(locationsElement);

  const outputElement = document.createElement("div");
  outputElement.classList.add("output");
  parentElement.appendChild(outputElement);

  container.appendChild(parentElement);
}

// Þetta fall býr til grunnviðmót og setur það í `document.body`
render(document.body, locations, onSearch, onSearchMyLocation);
