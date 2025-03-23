import Popup from "reactjs-popup";
import "reactjs-popup/dist/index.css";
import PropTypes from "prop-types";

import "./HistoryPopUp.css";

function HistoryPopUp({ linkHistory, clearHistory }) {
  return (
    <div>
      <Popup
        trigger={
          <button onClick={() => console.log(linkHistory)}>
            {" "}
            Link history{" "}
          </button>
        }
        modal
        nested
      >
        {(close) => (
          <div className="modal">
            <div className="content">
              User link history:
              <div className="scrollable-panel">
                <ul>
                  {linkHistory.map((link, index) => (
                    <li key={index}>{link}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <button onClick={() => close()}>X</button>
              <button onClick={() => clearHistory()}>Clear history</button>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
}

HistoryPopUp.propTypes = {
  linkHistory: PropTypes.array.isRequired,
  clearHistory: PropTypes.func.isRequired,
};

export default HistoryPopUp;
