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
  const isFavorite = currentUser?.checkIfFavorite(story);
  const isOwnStory = currentUser?.checkIfOwnStory(story);

  return $(`
      <li id="${story.storyId}">
      ${isOwnStory ? '<i class="trash bi bi-trash"></i>' : ""}
      <i class="star bi bi-star${isFavorite ? "-fill" : ""}
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

$("#new-story-form").on("submit", async function (evt) {
  evt.preventDefault();
  await getFormDataAndDisplayStory();
  $("#new-story-submit").trigger("reset");
});


/**putFavoritesOnPage: clears the ul of favorites, checks if currentUser has favorites,
 * if they do, generate markup for each and append to the favorites list
 */

function putFavoritesOnPage() {
  $(".list-of-favorites").empty();
  $("#no-favorites").hide();

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

function putMyStoriesOnPage() {
  $(".my-stories-list").empty();
  $("#no-my-stories").hide();

  const currentUserOwnStories = currentUser.ownStories;
  if (currentUserOwnStories.length === 0) {
    $("#no-my-stories").show();
    return;
  }

  for (let ownStory of currentUserOwnStories) {
    const $storyMarkup = generateStoryMarkup(ownStory);
    $(".my-stories-list").append($storyMarkup);
  }
}



/**
 * handleStarClick: called when a star is clicked to determine whether the
 * star needs to be filled or not, and updates the favorite list by removing or
 * adding favorite
 *
 */

async function handleStarClick(evt) {
  $(evt.target).toggleClass("bi-star bi-star-fill");

  const storyId = $(evt.target).parent().attr("id");
  const clickedStory = await Story.getStoryById(storyId);

  if ($(evt.target).hasClass("bi-star")) {
    await currentUser.removeFavorite(clickedStory);
  } else {
    await currentUser.addFavorite(clickedStory);
  }
}

async function handleTrashClick(evt) {
  const storyId = $(evt.target).parent().attr("id");
  const clickedStory = await Story.getStoryById(storyId);
  $(evt.target).parent().remove();

  await currentUser.removeOwnStory(clickedStory);

  if (currentUser.ownStories.length === 0) {
    $("#no-my-stories").show();
  }

}

$(".stories-container").on("click", ".star", handleStarClick);
$(".stories-container").on("click", ".trash", handleTrashClick);
