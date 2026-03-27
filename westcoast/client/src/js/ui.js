function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderCourseCard(course) {
  const id = encodeURIComponent(course.id);
  const title = escapeHtml(course.title);
  const courseNumber = escapeHtml(course.courseNumber);
  const days = escapeHtml(course.days);
  const start = escapeHtml(course.plannedStartDate);
  const price = escapeHtml(course.priceSek);
  const img = escapeHtml(course.imageUrl || "");
  const modes = Array.isArray(course.deliveryModes) ? course.deliveryModes : [];

  const badges = modes.map(m => `<span class="badge">${escapeHtml(m)}</span>`).join("");

  return `
    <article class="card">
      <img src="${img}" alt="${title}" loading="lazy" />
      <div class="content">
        <div class="title">${title}</div>
        <div class="muted">${courseNumber} • ${days} dagar</div>
        <div class="badges">${badges}</div>
        <div class="muted">Start: ${start} • Pris: ${price} SEK</div>
        <a href="./course.html?id=${id}">Visa kurs</a>
      </div>
    </article>
  `;
}
