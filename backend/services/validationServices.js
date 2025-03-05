const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@kindle\.com$/;
  if (!emailRegex.test(email)) {
    throw new Error(
      "Invalid email format. Email is required and must end with @kindle.com."
    );
  }
};

const validateLink = (link) => {
  const linkRegex =
    /^https:\/\/archiveofourown\.org\/works\/\d+(\/chapters\/\d+)?\/?$/;
  if (!linkRegex.test(link)) {
    throw new Error(
      "Invalid AO3 link format. At least one link is required. Must be a valid work link."
    );
  }
};

export { validateEmail, validateLink };
