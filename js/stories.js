"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      <i class="star bi bi-star${currentUser?.favorites.includes(story) ? "-fill": ""}
        ${currentUser ? "" : "hidden"}"></i>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** getFormDataAndDisplayStory: Get input values from new story form, update API
 *  with new story, and display new story to DOM
 *
 */

async function getFormDataAndDisplayStory() {
  const author = $("#author-input").val();
  const title = $("#title-input").val();
  const url = $("#url-input").val();

  const newStory = await storyList.addStory(currentUser, { author, title, url });

  const $storyMarkup = generateStoryMarkup(newStory);

  $allStoriesList.prepend($storyMarkup);
}

$("#new-story-form").on("submit", function (evt) {
  evt.preventDefault();
  getFormDataAndDisplayStory();

  $("#new-story-submit").trigger("reset");
});


function putUserFavoritesOnPage() {
  const currentUserFavorites = currentUser.favorites;
  if (currentUserFavorites.length === 0) {
    $("#no-favorites").show();
    return;
  }

  for (let favorite of currentUserFavorites) {
    const $favoriteMarkup = generateStoryMarkup(favorite);
    $(".list-of-favorites").append($favoriteMarkup);
  }
}



/** displayFavorite: takes in a story instance, creates markup, and appends
 * to the LIST OF FAVORITES
 */

function displayFavorite(story) {
  const $favoriteMarkup = generateStoryMarkup(story);
  $(".list-of-favorites").append($favoriteMarkup);
}

/** removeFavorites: takes in a story instance, and REMOVES the specific story with
 * the storyId from the LIST OF FAVORITES
 */

function removeFavoriteFromUI(story) {
  $(".list-of-favorites").find(`#${story.storyId}`).remove();
}



async function updateFavorite() {

  // need to check if story is already favorited, add if not
  // - shouldn't be able to add a story to favorites if it's already favorited
  // add and remove stories from display on favorites page
  // make sure the "No favorites yet" message shows when the favorites is empty/
  // becomes empty


  // saveFavoritesInLocalStorage();

}

// make sure that stars stay colored in on favorites page and stories list



// FAV STAR EVENT LISTENER!

$(".stories-container").on("click", ".star", async function (evt) {
  $(evt.target).toggleClass("bi-star bi-star-fill");

  const storyId = $(evt.target).parent().attr("id");

  const clickedStory = Story.getStoryById(storyId);
  console.log("storyId is", storyId);
  let userObj;

  if ($(evt.target).hasClass("bi-star")) {
    userObj = await currentUser.removeFavorite(clickedStory);
    removeFavoriteFromUI(clickedStory);
  } else {
    userObj = await currentUser.addFavorite(clickedStory);
    displayFavorite(clickedStory);
  }
  //   // if you spam click a story IN the fav tab, it keeps re-adding it
    // if (!$(evt.target).closest("div").hasClass("favorites-list")) {
    // }


  // console.log(userObj);
});
