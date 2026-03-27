const BASE_URL = "http://localhost:3001";

async function httpGetJson(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function getCourses() {
  return httpGetJson("/courses");
}
