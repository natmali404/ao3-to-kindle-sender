import { useEffect, useState } from "react";

function useLocalStorageState(name, defaultValue = "") {
  //init
  const [state, setState] = useState(() => {
    try {
      const localValue = window.localStorage.getItem(name);

      return localValue == null ? defaultValue : JSON.parse(localValue);
    } catch (error) {
      console.error("Oops! Error with parsing local value to JSON: ", error);

      return defaultValue;
    }
  });

  //usage
  useEffect(() => {
    try {
      window.localStorage.setItem(name, JSON.stringify(state));
    } catch (error) {
      console.error("Oops! Error with parsing JSON to local value: ", error);

      //window.localStorage.setItem(name, JSON.stringify(defaultValue)) ?
    }
  }, [name, state]); //is this enough for setItem to occur only when the state changes? will it occur if it's set to the same value?

  return [state, setState];
}

export default useLocalStorageState;
