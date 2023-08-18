"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    const url = new URL(this.url);
    return url.hostname;
  }

  /** getStoryById: calls API to get a specific story from the input storyId
   * Returns a new story instance of that storyData object
   */

  static async getStoryById(storyId) {
    const response = await fetch(`${BASE_URL}/stories/${storyId}`, {
      method: "GET",
    });

    const storyData = await response.json();

    return new Story(storyData.story);
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?

    // query the /stories endpoint (no auth required)
    const response = await fetch(`${BASE_URL}/stories`, {
      method: "GET",
    });
    const storiesData = await response.json();

    // turn plain old story objects from API into instances of Story class
    const stories = storiesData.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, { author, title, url }) {
    const response = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      body: JSON.stringify({
        token: user.loginToken,
        story: { author, title, url }
      }),
      headers: { "Content-Type": "application/json" }
    });

    const { story } = await response.json();

    const newStoryInstance = new Story(story);

    this.stories.unshift(newStoryInstance);

    return newStoryInstance;
  }
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
    username,
    name,
    createdAt,
    favorites = [],
    ownStories = []
  },
    token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password, name } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      body: JSON.stringify({ user: { username, password } }),
      headers: {
        "content-type": "application/json",
      }
    });
    const userData = await response.json();
    const { user } = userData;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      userData.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const tokenParams = new URLSearchParams({ token });

      const response = await fetch(
        `${BASE_URL}/users/${username}?${tokenParams}`,
        {
          method: "GET"
        }
      );
      const userData = await response.json();
      const { user } = userData;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
  
  /**
   * checkIfFavorite: Takes in a story instance, detrmines if the current user
   * instance has this story on their favorites list, return true if so.
   */

  checkIfFavorite(story) {
    return this.favorites.some(fav => fav.storyId === story.storyId);
  }

  /** addFavorite: takes in a story instance, pushes to user instance favorites
   * array prop, calls API to POST the new fav story. returns user object with
   * favorite story added
   */

  async addFavorite(story) {
    const favData = this.fetchFavorite(story, "POST");

    this.favorites.push(story);

    return favData;
  }

  /** removeFavorite: removes story object from this.favorites, then calls API to
   * delete story from server, returns user object with favorite story deleted
   */

  async removeFavorite(story) {
    const favData = await this.fetchFavorite(story, "DELETE");

    this.favorites = this.favorites.filter(fav => fav.storyId !== story.storyId);

    return favData;
  }


  /** fetchFavorite: takes in a story instance and an HTTP method, makes API call
   * to favorites endpoint with provided method and returns the JSON response.
    */

  async fetchFavorite(story, method) {
    const response = await fetch(
      `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      {
        method,
        body: JSON.stringify({
          token: this.loginToken,
        }),
        header: {
          "Content-Type": "application/json"
        }
      }
    );

    const favData = response.json();
    return favData;
  }
}
