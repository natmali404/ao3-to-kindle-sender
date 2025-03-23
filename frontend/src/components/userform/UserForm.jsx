import { useState } from "react";
import "./UserForm.css";
import PropTypes from "prop-types"; //necessary for vscode

function UserForm({ onSubmit }) {
  const [kindleEmail, setKindleEmail] = useState("");
  const [links, setLinks] = useState([""]);
  const [emailError, setEmailError] = useState(null);
  const [linkError, setLinkError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  //validation: proper kindle e-mai + at least one proper ao3 link
  //without it the button is not active. button disabled after clicking and processing, until it returns a success message.

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@kindle\.com$/;
    if (!emailRegex.test(email)) {
      setEmailError(
        "Invalid email format. Email is required and must end with @kindle.com."
      );
    } else {
      setEmailError(null);
    }
  };

  const validateLink = (link) => {
    const linkRegex =
      /^https:\/\/archiveofourown\.org\/works\/\d+(\/chapters\/\d+)?\/?$/;
    if (!linkRegex.test(link)) {
      setLinkError(
        "Invalid AO3 link format. At least one link is required. Must be a valid work link."
      );
    } else {
      setLinkError(null);
    }
  };

  const handleEmailChange = (event) => {
    const email = event.target.value;
    setKindleEmail(email);
    validateEmail(email);
  };

  const handleLinkChange = (event, index) => {
    const link = event.target.value;
    validateLink(link);

    setLinks((links) => {
      const copyLinks = [...links];
      copyLinks[index] = event.target.value;
      return copyLinks;
    });
  };

  function addInput() {
    setLinks([...links, ""]);
  }

  function removeInput(index) {
    if (index === 0) return;
    const newLinks = [...links];
    newLinks.splice(index, 1);
    setLinks(newLinks);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLinks([...new Set(links)]);
    if (!emailError && !linkError) {
      setIsProcessing(true);
      console.log("IS PROCESSING = TRUE");
      try {
        await onSubmit(kindleEmail, links);
      } finally {
        setIsProcessing(false);
        console.log("IS PROCESSING = FALSE");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-content-container">
        <p>
          Your <b>Kindle</b> e-mail:
        </p>
        <input
          type="text"
          placeholder="john_smith_pSbNDS@kindle.com"
          onChange={handleEmailChange}
        />
        <p>
          Links to <b>AO3 fics</b>:
        </p>
        <div className="fic-links-container">
          {links.map((link, index) => (
            <div className="input-container" key={index}>
              <input
                value={link}
                type="text"
                onChange={(event) => handleLinkChange(event, index)}
                placeholder="https://archiveofourown.org/works/61755115/chapters/157874314"
              />
              <button
                disabled={index === 0}
                type="button"
                className="remove-input-button"
                onClick={() => removeInput(index)}
              >
                x
              </button>
            </div>
          ))}
        </div>
        <div className="add-input-button-container">
          <button
            disabled={links.length >= 10}
            type="button"
            className="add-input-button"
            onClick={() => addInput()}
          >
            +
          </button>
        </div>
        <button
          disabled={emailError || linkError || isProcessing}
          type="submit"
          className="main-button"
        >
          {isProcessing ? "Processing..." : "Process links"}
        </button>
        <p className="error-status">
          {emailError} {linkError}
        </p>
      </div>
    </form>
  );
}

UserForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default UserForm;
