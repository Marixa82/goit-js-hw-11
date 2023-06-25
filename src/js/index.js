
import Notiflix from 'notiflix';
import { getData } from "./api";

import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    btn: document.querySelector('.load-more'),
    input: document.querySelector('input'),
};

let currentPage = 1;
let inputValue = '';

refs.form.addEventListener('submit', handleSubmit);

const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
    disableScroll: false,
});

refs.btn.addEventListener('click', handleLoadMore);
hideLoadMoreBtn();
async function handleSubmit(event) {
    event.preventDefault();
    inputValue = event.target.elements.searchQuery.value;
    console.log(inputValue);
    refs.gallery.innerHTML = '';

    if (inputValue === '') {
        showError();
        hideLoadMoreBtn();
        return;
    }

    try {
        const result = await getData(inputValue, (currentPage = 1));
        if (result.hits.length === 0) {
            showError();
            return;
        }

        createGallery(result.hits);
        lightbox.refresh();
        refs.input.value = '';

        checkLoadMoreOption(result);
        currentPage++;
    } catch (error) {
        showError();
    }
}

function checkLoadMoreOption(result) {
    if (result.totalHits > currentPage * 40) {
        showLoadMoreBtn();
    } else {
        hideLoadMoreBtn();
        Notiflix.Notify.info(
            "We're sorry, but you've reached the end of search results."
        );
    }
}

function handleLoadMore() {
    getData(inputValue, currentPage)
        .then(result => {
            if (result.hits.length === 0) {
                showError();
                return;
            }
            createGallery(result.hits);

            lightbox.refresh();

            if (result.totalHits > currentPage * 40) {
                showLoadMoreBtn();
            } else {
                hideLoadMoreBtn();
                Notiflix.Notify.info(
                    "We're sorry, but you've reached the end of search results."
                );
            }

            currentPage++;
            Notiflix.Notify.success(`Hooray! We found ${result.totalHits} images.`);

            const { height: cardHeight } = document
                .querySelector('.gallery')
                .firstElementChild.getBoundingClientRect();

            window.scrollBy({
                top: cardHeight * 2,
                behavior: 'smooth',
            });
        })
        .catch(error => {
            Notiflix.Notify.failure(
                'An error occurred while fetching the images. Please try again.'
            );
        });
}



function createGallery(result) {
    let markup = result
        .map(
            ({
                webformatURL,
                largeImageURL,
                tags,
                likes,
                views,
                comments,
                downloads,
            }) => {
                return `<div class="gallery-item">
        <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" class="gallery-image"/></a>
        <div class="info">
          <p class="info-item">
            <b>Likes ${likes}</b>
          </p>
                <p class="info-item">
                  <b>Views ${views}</b>
                </p>
                <p class="info-item">
                  <b>Comments ${comments}</b>
                </p>
                <p class="info-item">
                  <b>Downloads ${downloads}</b>
          </p>
        </div>
      </div>`;
            }
        )
        .join('');

    refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function showError() {
    Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
    );
}
function showLoadMoreBtn() {
    refs.btn.style.display = 'block';
}

function hideLoadMoreBtn() {
    refs.btn.style.display = 'none';
}