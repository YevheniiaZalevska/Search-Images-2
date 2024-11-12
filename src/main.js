import { getData } from "./js/pixabay-api";
import { formResults, list } from "./js/render-functions";

import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const searchForm = document.querySelector(".search-form");
const inputText = document.querySelector(".search-form input");
const loader = document.querySelector(".loader");
const loadMore = document.querySelector(".load-more");
let lightbox;
let page = 1;
let totalHits = 0;
let loadedHits = 0;
let query = "";

loadMore.style.display = "none";

searchForm.addEventListener("submit", handleForm);
loadMore.addEventListener("click", loadMoreImg);

async function handleForm(event) {
    event.preventDefault();

    const inputValue = inputText.value.trim();
    list.innerHTML = "";

    if (inputValue === "") {
        return iziToast.info({
            position: 'topRight',
            title: 'Помилка',
            message: 'Заповніть поле запиту',
        });
    }

    loadMore.style.display = "none";
    query = inputValue;
    page = 1;
    totalHits = 0;
    loadedHits = 0;
    list.innerHTML = "";

    showLoader();
    await loadData(query, page);
    hideLoader();
    searchForm.reset();
}

async function loadData(query, page) {
    try {
        const data = await getData(query, page);

        if (data.hits.length === 0) {
            loadMore.style.display = "none";
            iziToast.info({
                message: 'По вашому запиту нічого не знайдено!',
                position: 'topRight'
            });
            return;
        }

        totalHits = data.totalHits;
        loadedHits += data.hits.length;

        formResults(data.hits);
        setupLightbox();

        if (page > 1) {
            scrollPage();
        }
        showLoadMoreBtn();

    } catch (error) {
        iziToast.error({
            position: "topLeft",
            message: "Упс...помилка"
        });
    }
}

async function loadMoreImg() {
    page++;
    loadMore.disabled = true;
    showLoader();
    await loadData(query, page);
    hideLoader();
}

function showLoader() {
    loader.style.display = "block";
}

function hideLoader() {
    loader.style.display = "none";
}

function showLoadMoreBtn() {
    if (loadedHits >= totalHits) {
        loadMore.style.display = "none";
        iziToast.error({
            message: "Закінчились результати пошуку.",
            position: 'topRight',
        });
    } else {
        loadMore.style.display = "block";
        loadMore.disabled = false;
    }
}

function setupLightbox() {
    if (lightbox) {
        lightbox.refresh();
    } else {
        lightbox = new SimpleLightbox('.gallery-item a', {
            captionsData: 'alt',
            captionDelay: 250,
        });
    }
}

function scrollPage() {
    const galleryItem = document.querySelector(".gallery-item");
    if (galleryItem) {
        const { height } = galleryItem.getBoundingClientRect();
        window.scrollBy({
            top: height * 2,
            behavior: "smooth"
        });
    }
}