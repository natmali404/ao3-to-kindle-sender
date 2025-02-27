import "./InfoBox.css";
import PropTypes from "prop-types";

//to add: save the info about closing the box in cache or local storage
function InfoBox({ onClose }) {
  function copyToClipboard() {
    const copyText = document.getElementById("copy-email").textContent;
    navigator.clipboard.writeText(copyText);
  }

  return (
    <div className="info-box-container">
      <span className="exclamation">!</span>
      <button className="close-button" onClick={onClose}>
        x
      </button>
      <p className="info-box-big-text">
        To use our services, please{" "}
        <a
          className="highlighted-text"
          href="https://www.amazon.com/hz/mycd/myx#/home/settings/payment"
        >
          authorize us in your Kindle Preferences
        </a>
        !
      </p>
      <p className="info-box-medium-text">
        Manage Your Content and Devices {">"} Preferences {">"} Personal
        Document Settings
      </p>
      <p className="info-box-medium-text">
        {">"} Add “
        <span
          id="copy-email"
          className="highlighted-text"
          onClick={copyToClipboard}
        >
          aoootokindlesender@gmail.com
        </span>
        ”{" "}
        <span style={{ fontStyle: "italic" }}>
          (click to copy to clipboard)
        </span>
        .
      </p>
      <ul>
        <li>This is necessary due to the Amazon spam prevention mechanism!</li>
        <li>
          You can revoke the access at any given moment - and we promise not to
          send you any stuff ʕ•ᴥ•ʔ
        </li>
        <li>We do not store ANY of your data.</li>
      </ul>
    </div>
  );
}

InfoBox.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default InfoBox;
