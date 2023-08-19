"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  evt.preventDefault();
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  evt.preventDefault();
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** navSubmitClick: When user clicks submit nav button, reveal new story form */

function navSubmitClick(evt) {
  evt.preventDefault();
  hidePageComponents();
  $allStoriesList.show();
  $("#new-story-form").toggle();
}

/** navSubmitClick: When user clicks "favorites" button, show user's favorites
 * list
 */

function navFavoritesClick(evt) {
  evt.preventDefault();
  hidePageComponents();
  putFavoritesOnPage();
  $favoritesList.show();
}

function navMyStoriesClick(evt) {
  evt.preventDefault();
  hidePageComponents();
  putMyStoriesOnPage();
  $myStoriesList.show();
}


$("#nav-new-story").on("click", navSubmitClick);
$("#nav-favorites").on("click", navFavoritesClick);
$("#nav-my-stories").on("click", navMyStoriesClick);
