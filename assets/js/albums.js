let originAlbumList = [];
let globalTagList = [];
const timeLineBox = document.getElementById("timeLineBox");
const searchInput = document.getElementById("albumSearchInput");
const tagItems = document.querySelectorAll(".tag-item");
function getYearAndMonth(dateStr) {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return { year: 2099, month: 1 };
  const startPart = dateStr.split("~")[0];
  const arr = startPart.split(".");
  const year = parseInt(arr[0]) || 2099;
  const month = parseInt(arr[1]) || 1;
  return { year, month };
}
function renderAlbumList(filterKeyword = "") {
  let renderList = [...originAlbumList];
  const kw = filterKeyword.trim().toLowerCase();
  if (kw !== "") {
    const hitTagIds = globalTagList.filter(tag => tag.name.toLowerCase().includes(kw)).map(tag => tag.id);
    renderList = renderList.filter(album => {
      const matchName = album.na.toLowerCase().includes(kw);
      const matchDate = album.da.includes(kw);
      const matchTag = Array.isArray(album.ta) && hitTagIds.some(id => album.ta.includes(id));
      return matchName || matchDate || matchTag;
    });
  }
  timeLineBox.innerHTML = "";
  if (renderList.length === 0) {
    timeLineBox.innerHTML = `<div class="empty-search">未找到匹配的回忆记录，请更换关键词重试</div>`;
    return;
  }
  const groupByTerm = {};
  renderList.forEach(album => {
    if (album.id === "000") return;
    const { year, month } = getYearAndMonth(album.da);
    if (year === 2099) return;
    const yearKey = String(year);
    const term = month >= 8 ? "下半年 · 秋季学期" : "上半年 · 春季学期";
    const fullKey = `${yearKey}-${term}`;
    if (!groupByTerm[yearKey]) groupByTerm[yearKey] = {};
    if (!groupByTerm[yearKey][fullKey]) groupByTerm[yearKey][fullKey] = [];
    groupByTerm[yearKey][fullKey].push(album);
  });
  const sortYears = Object.keys(groupByTerm).sort((a, b) => b - a);
  sortYears.forEach(year => {
    const yearBlock = document.createElement("div");
    yearBlock.className = "year-group";
    yearBlock.innerHTML = `<h3 class="year-title">${year}年</h3><div class="year-inner"></div>`;
    const yearInner = yearBlock.querySelector(".year-inner");
    const termOrder = [`${year}-上半年 · 春季学期`, `${year}-下半年 · 秋季学期`];
    termOrder.forEach(termKey => {
      const termList = groupByTerm[year][termKey];
      if (!termList || termList.length === 0) return;
      const termTitle = document.createElement("div");
      termTitle.className = "term-title";
      termTitle.textContent = termKey.replace(`${year}-`, "");
      yearInner.appendChild(termTitle);
      termList.forEach(item => {
        const introHtml = (item.io && item.io.trim() !== "") ? `<p class="item-intro">${item.io}</p>` : "";
        yearInner.innerHTML += `<a href="album.html?album=${item.id}" class="album-item"><div class="item-cover"><img src="album/${item.id}.webp" alt="${item.na}" loading="lazy"></div><div class="item-info"><h4 class="item-name">${item.na}</h4><p class="item-date">${item.da}</p><p class="item-meta">照片${item.ph}张 · 视频${item.vd}条 | ${item.lc}</p>${introHtml}</div></a>`;
      });
    });
    timeLineBox.appendChild(yearBlock);
  });
}
Promise.all([fetch("assets/meta/tag-data.json").then(res => res.json()), fetch("assets/meta/all-albums.json").then(res => res.json())])
.then(([tagData, albumData]) => {
  globalTagList = tagData.tags;
  originAlbumList = albumData.albums;
  renderAlbumList();
})
.catch(err => {
  console.error("加载错误：", err);
  timeLineBox.innerHTML = `<p style="text-align:center;color:var(--text-secondary);opacity:0.5;">相册内容加载异常</p>`;
});
searchInput.addEventListener("input", e => renderAlbumList(e.target.value));
tagItems.forEach(tag => {
  tag.addEventListener("click", function () {
    const tagText = this.dataset.tag;
    searchInput.value = tagText;
    renderAlbumList(tagText);
    searchInput.focus();
  });
});