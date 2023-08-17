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

  const hostName = story.getHostName.call(story);
  return $(`
      <li id="${story.storyId}">
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
//TODO: update StoryList.stories instance property? (which I guess would `storyList`?)
//TODO: call generate story to get markup, then store that and APPEND that to DOM
console.log(`author`, author);
console.log(`title`, title);
console.log(`url`, url);
console.log(`current user`, currentUser);



  const newStory = await storyList.addStory(currentUser, { author, title, url });

  console.log(`newStory:`, newStory);
  console.log(`storyList:`, storyList);

  storyList.stories.unshift(newStory);
  const $storyMarkup = generateStoryMarkup(newStory);
  $allStoriesList.append($storyMarkup);

  // storyList = await StoryList.getStories();

  // putStoriesOnPage();
}

$("#new-story-form").on("submit", function (evt) {
  evt.preventDefault();
  getFormDataAndDisplayStory();

  $("#new-story-submit").trigger("reset");
});
