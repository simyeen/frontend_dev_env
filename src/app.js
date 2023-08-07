import * as math from "./math.js";
import "./app.css";
import nyancat from "./nyancat.jpeg";
import Axios from "axios";

document.addEventListener("DOMContentLoaded", async () => {
  // document.body.innerHTML = `<img src="${nyancat}"/>`;
  const res = await Axios.get("/api/users");
  console.log(res);

  document.body.innerHTML = (res.data || [])
    .map((user) => {
      return `<div> ${user.id}: ${user.name} </div>`;
    })
    .join(" ");
});

console.log(process.env.NODE_ENV);
if (module.hot) {
  console.log("핫 모듈 켜짐");
}
