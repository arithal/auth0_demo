// URL mapping, from hash to a function that responds to that URL action
const router = {
  "/": () => showContent("content-home"),
  "/profile": () =>
    requireAuth(() => showContent("content-profile"), "/profile"),
  "/login": () => login(),
};

//Declare helper functions

/**
 * Iterates over the elements matching 'selector' and passes them
 * to 'fn'
 * @param {*} selector The CSS selector to find
 * @param {*} fn The function to execute for every element
 */
const eachElement = (selector, fn) => {
  for (let e of document.querySelectorAll(selector)) {
    fn(e);
  }
};

/**
 * Tries to display a content panel that is referenced
 * by the specified route URL. These are matched using the
 * router, defined above.
 * @param {*} url The route URL
 */
const showContentFromUrl = (url) => {
  if (router[url]) {
    router[url]();
    return true;
  }

  return false;
};

/**
 * Returns true if `element` is a hyperlink that can be considered a link to another SPA route
 * @param {*} element The element to check
 */
const isRouteLink = (element) =>
  element.tagName === "A" && element.classList.contains("route-link");

/**
 * Displays a content panel specified by the given element id.
 * All the panels that participate in this flow should have the 'page' class applied,
 * so that it can be correctly hidden before the requested content is shown.
 * @param {*} id The id of the content to show
 */
const showContent = (id) => {
  eachElement(".page", (p) => p.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
};

// Deliverable 3 - Link accounts
const refreshLinkedAccounts = (profile, supressEventSubscription = false) => {
  const {
    user_id: primaryUserId,
    identities,
    email_verified,
    email = "",
  } = profile;
  const el = (selector) => document.querySelector(selector);

  el("table.accounts tbody").remove();
  const tbody = el("table.accounts").appendChild(
    document.createElement("tbody")
  );

  const showInfoMessage = (msg) => {
    const info = el("div.linking-message");
    info.innerText = msg;
  };

  //Deliverable 4 - Error for unverified
  if (!email_verified) {
    // don't offer linking for unverified emails.
    showInfoMessage(
      `The email ${email} is not verified. Account linking is only allowed for verified emails.`
    );
    el("button.btn-linkaccount").classList.add("hidden");
    eachElement(".user-unverified", (e) => (e.innerText = `The user email has not been verified`));
    return;
  }

  const primary = (identity) =>
    identity.provider !== primaryUserId.split("|")[0] ||
    identity.user_id !== primaryUserId.split("|")[1];
  console.log("Primary User Id: "+primaryUserId)
  const displayable = (identity) => ({
    connection: identity.connection,
    isSocial: identity.isSocial,
    provider: identity.provider,
    user_id: identity.user_id,
    profileData: JSON.stringify(identity.profileData, null, 2),
  });

  //Refreshes linked account ui
  const refresh = async () => {
    showInfoMessage("");
    const updatedProfile = await getUserProfile(primaryUserId);
    refreshLinkedAccounts(updatedProfile, true);
  };
  // Deliverable 4 - If found more than one identity then iterates through list and adds to table with unlink button generation
  if (identities.length > 1) {
    identities
      .filter(primary)
      .map(displayable)
      .forEach((identity) => {
        const row = tbody.insertRow();
        for (key in identity) {
          const cell = row.insertCell();
          cell.appendChild(document.createTextNode(identity[key]));
        }
        const actionCell = row.insertCell();
        const unlinkButton = document.createElement("button");
        unlinkButton.className = "btn btn-danger btn-unlinkaccount";
        unlinkButton.innerText = "Unlink";
        actionCell.appendChild(unlinkButton);
        unlinkButton.addEventListener("click", async ({ target }) => {
          try {
            target.classList.add("disabled");
            //unlink event
            await unlinkAccount(identity);
            refresh();
          } finally {
            target.classList.remove("disabled");
          }
        });
      });
  }
  if (supressEventSubscription) return;
  const linkButton = el("button.btn-linkaccount");
  linkButton.addEventListener("click", async () => {
    try {
      await linkAccount();
      refresh();
    } catch ({ message }) {
      showInfoMessage(message);
    }
  });
};

const updateUI = async () => {
  try {
    const isAuthenticated = await auth0.isAuthenticated();
    if (isAuthenticated) {
      //Pulls user object from Auth0 class
      const { sub: userId, ...user } = await auth0.getUser();
      const profile = await getUserProfile(userId);
      if (profile) refreshLinkedAccounts(profile);

      this.user = await auth0.getUser();
      console.log(this.user);

      // extract provider/user_id from primary identity
      const primaryIdentity =
        profile &&
        profile.identities &&
        profile.identities.find(
          (id) => `${id.provider}|${id.user_id}` === userId
        );

      document.getElementById("profile-data").innerText = JSON.stringify(
        { ...primaryIdentity, ...user },
        null,
        2
      );

      document.querySelectorAll("pre code").forEach(hljs.highlightBlock);

      const { connection: primaryConnection = "" } = primaryIdentity;
      const { name = "", picture, email = "" } = user;
      //sets custom user values
      eachElement(".profile-image", (e) => (e.src = picture));
      eachElement(".user-name", (e) => (e.innerText = name));
      //Deliverable 5, Deliverable 6 - sets custom rule user country
      //Works by adding custom rule https://manage.auth0.com/dashboard/us/dev-hrp397r7/rules via the auth0 dashboard for "Add country to the user profile"
      eachElement(".user-flag", (e) => (e.src = getCountryCode(user["https://example.com/country"])));

      eachElement(".user-email", (e) => (e.innerText = `${email}(${primaryConnection})`));

      eachElement(".auth-invisible", (e) => e.classList.add("hidden"));
      eachElement(".auth-visible", (e) => e.classList.remove("hidden"));
    } else {
      eachElement(".auth-invisible", (e) => e.classList.remove("hidden"));
      eachElement(".auth-visible", (e) => e.classList.add("hidden"));
    }
  } catch (err) {
    console.log("Error updating UI!", err);
    return;
  }
};

var countrycodedict = {
  'United States': 'us'
  // ... fill in
};
//Deliverable 5 - open source flag generator via country code
function getCountryCode(countryName) {
  return 'https://lipis.github.io/flag-icon-css/flags/4x3/'+countrycodedict[countryName]+'.svg';
}

window.onpopstate = (e) => {
  if (e.state && e.state.url && router[e.state.url]) {
    showContentFromUrl(e.state.url);
  }
};
