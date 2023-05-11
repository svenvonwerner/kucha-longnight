import axios from "axios";

export function getGames() {
  return axios({
    url: "https://kucha.saw-leipzig.de/resource?getGames",
    method: "GET",
    headers: {
      "Content-Type": "application/json; utf-8",
    },
  });
}
