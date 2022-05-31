import 'dotenv/config';
import './sass/main.scss';
import MySearchApi from "./api/my-search-api";
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

Notify.init({
  fontFamily: "San Francisco Pro Display Medium",
  fontSize: "1em",
  width: "300px",
  plainText: false,
  messageMaxLength: 400,
});

const BASE_URL = "https://pixabay.com/api/";
const PER_PAGE = 40;

const myApi = new MySearchApi(BASE_URL, ".gallery", process.env.PIXABAY_KEY);
myApi.pageSize = PER_PAGE;

const lbGallery = new SimpleLightbox(
  ".gallery a",
  {
    captions: true,
    captionsData: "alt",
    captionDelay: 300,
    loop: false,
  }
);

const searchForm = document.getElementById("search-form");
searchForm.addEventListener("submit", onSearchSubmit);

const loadMoreBtn = document.querySelector(".load-more");
loadMoreBtn.addEventListener("click", e => doSearch()); // Should be wrapped with arrow fn to prevent event argument

const scrollSwitch = document.getElementById("changeScrollBehaviour");
scrollSwitch.addEventListener("change", changeScrollBehaviour)
var endlessScrollEnabled = scrollSwitch.checked;


window.addEventListener('scroll', searchOnScroll);




async function onSearchSubmit(event) {
  event.preventDefault();

  const searchString = event.currentTarget.elements.searchQuery.value.trim();
  if (!searchString) return;

  await doSearch(searchString);

  window.scrollTo({ top: 0, behavior: "instant" });
}


async function doSearch(searchString) {
  const data = await myApi.searchQuery(searchString);
  if (myApi.totalPossible === 0) Notify.failure("Sorry, there are no images matching your search query. Please try again.")
    else if (searchString) Notify.success(`Hooray! We found ${myApi.totalPossible} images.`);

  myApi.buildCardList(data.hits);

  ajustLoadMoreBtnVisibility();
  lbGallery.refresh();
}


function searchOnScroll() {
  if (!endlessScrollEnabled) return;

  const scrollMax = document.body.scrollHeight - window.innerHeight;
  if (window.scrollY != scrollMax) return;

  if (myApi.isNextPagePossible()) {
    doSearch();
  } else {
    Notify.failure("We're sorry, but you've reached the end of search results.");
  }
};


function changeScrollBehaviour({target:{checked}}) {
  endlessScrollEnabled = checked;
  ajustLoadMoreBtnVisibility();
}

function ajustLoadMoreBtnVisibility() {
  loadMoreBtn.hidden = endlessScrollEnabled || !myApi.isNextPagePossible();
}