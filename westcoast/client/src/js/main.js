import { getCourses } from "./api.js";
import { renderCourseCard } from "./ui.js";

const grid = document.querySelector("#courseGrid");
const status = document.querySelector("#status");

async function init() {
  status.textContent = "Laddar kurser...";
  try {
    const courses = await getCourses();
    grid.innerHTML = courses.map(renderCourseCard).join("");
    status.textContent = courses.length ? "" : "Inga kurser hittades.";
  } catch (err) {
    console.error(err);
    status.textContent = "Kunde inte hämta kurser. Är API:t igång?";
  }
}

init();
