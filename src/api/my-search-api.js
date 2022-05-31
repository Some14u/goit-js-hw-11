const axios = require('axios').default;
import cardListTemplate from "../templates/card-list.hbs";

export default class MySearchApi {

  baseUrl;
  queryParams = {
    image_type: "photo",
    orientation: "horizontal",
    safesearch: true,
  };
  totalPossible = 0;

  constructor (baseUrl, gallerySelector = ".gallery", key) {
    if (!baseUrl) throw console.error("A baseUrl argument is required");
    this.gallery = document.querySelector(gallerySelector);
    if (!this.gallery) throw console.error(`Gallery container element with selector "${this.gallerySelector}" not found`);

    this.baseUrl = baseUrl;
    this.queryParams.key = key;
    this.currentPage = 1;
  }

  // This would advance search to the next page if searchString isn't specified
  async searchQuery(searchString) {
    if (searchString) {
      this.queryParams.q = searchString;
      this.currentPage = 1;
      this.totalPossible = 0;
    } else {
      this.currentPage++;
    }
    const {data} = await axios.get(this.baseUrl, { params: this.queryParams });
    this.totalPossible = data.totalHits;
    return data;
  }

  buildCardList(data) {
    if (this.queryParams.page > 1) {
      this.gallery.innerHTML = this.gallery.innerHTML + cardListTemplate(data);
    } else {
      this.gallery.innerHTML = cardListTemplate(data);
    }
  }

  isNextPagePossible() {
    return this.currentQuery && this.queryParams.page * this.queryParams.per_page < this.totalPossible;
  }

  get currentQuery() {
    return this.queryParams.q;
  }

  /** @param {String} query */
  set currentQuery(query) {
    this.queryParams.q = query;
  }

  get pageSize() {
    return this.queryParams.per_page;
  }

  /** @param {Number} size */
  set pageSize(size) {
    this.queryParams.per_page = size;
  }

  get currentPage() {
    return this.queryParams.page;
  }

  /** @param {Number} page */
  set currentPage(page) {
    this.queryParams.page = page;
  }

}