const overlay = document.getElementById('overlay');
const closeBtn = document.getElementById('closeBtn');
const bigImg = document.getElementById('bigImg');
const bigVid = document.getElementById('bigVid');
const panWrap = document.getElementById('panWrap');
const canvasWrap = document.querySelector('.viewer-canvas-wrap');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const infoPanel = document.getElementById('infoPanel');
const infoAuthorDom = infoPanel.querySelector('.info-author');
const infoSectionDom = infoPanel.querySelector('.info-section');
const infoTimeDom = infoPanel.querySelector('.info-time');
const infoNoteDom = infoPanel.querySelector('.info-note');
const albumSrc = "albums";
//相册地址
let currentScale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let currentMediaSrc = "";
let currentMediaMeta = null;
let mediaList = [];
let currentIndex = -1;
let albumSections = [];
let authorList = [];
let tagData = null;
let isVideoActive = false;
function updateTransform() {panWrap.style.transform = `translate(${offsetX}px,${offsetY}px) scale(${currentScale})`;}
function resetZoom() {
	currentScale = 1;
	offsetX = 0;
	offsetY = 0;
	updateTransform();
	canvasWrap.scrollTo(0,0);
}
zoomInBtn.addEventListener('click', () => {
	if(isVideoActive) return;
	if(currentScale < 3) {
		currentScale += 0.25;
		updateTransform();
	}
})
zoomOutBtn.addEventListener('click', () => {
	if(isVideoActive) return;
	if(currentScale > 0.5) {
		currentScale -= 0.25;
		updateTransform();
	}
})
zoomResetBtn.addEventListener('click', resetZoom);
canvasWrap.addEventListener('wheel', e => {
	if(isVideoActive) return;
	e.preventDefault();
	const rect = canvasWrap.getBoundingClientRect();
	const mouseX = e.clientX - rect.left;
	const mouseY = e.clientY - rect.top;
	const delta = e.deltaY > 0 ? -0.1 : 0.1;
	const newScale = Math.max(0.5, Math.min(3, currentScale + delta));
	const scaleDiff = newScale - currentScale;
	offsetX -= (mouseX - canvasWrap.clientWidth / 2) * scaleDiff;
	offsetY -= (mouseY - canvasWrap.clientHeight / 2) * scaleDiff;
	currentScale = newScale;
	updateTransform();
})
panWrap.addEventListener('mousedown', e => {
	if(isVideoActive) return;
	isDragging = true;
	dragStartX = e.clientX - offsetX;
	dragStartY = e.clientY - offsetY;
})
document.addEventListener('mousemove', e => {
	if(!isDragging) return;
	offsetX = e.clientX - dragStartX;
	offsetY = e.clientY - dragStartY;
	updateTransform();
})
document.addEventListener('mouseup', () => isDragging = false)
downloadBtn.addEventListener('click', () => {
	if(!currentMediaSrc) return;
	const a = document.createElement('a');
	a.href = currentMediaSrc;
	a.download = currentMediaSrc.split('/').pop();
	document.body.appendChild(a);
	a.click();
	a.remove();
})
function refreshNavButtonState(){
	prevBtn.disabled = currentIndex <= 0;
	nextBtn.disabled = currentIndex >= mediaList.length - 1;
}
function openViewer(src, type, meta, idx) {
	currentMediaSrc = src;
	currentMediaMeta = meta;
	currentIndex = idx;
	isVideoActive = (type === 'mp4');
	resetZoom();
	bigImg.style.display = 'none';
	bigVid.style.display = 'none';
	bigVid.pause();
	bigVid.src = '';
	bigImg.src = '';
	if (type === 'mp4') {
		bigVid.src = src, bigVid.load();
		bigVid.muted = false, bigVid.volume = 1;
		bigVid.style.display = 'block';
	} else { bigImg.src = src, bigImg.style.display = 'block'; }
	if(currentMediaMeta){
		const authObj = authorList.find(a => String(a.id) === String(currentMediaMeta.fi.charAt(0)));
		const authName = authObj ? authObj.name : "未知";
		infoAuthorDom.textContent = "作者：" + authName;
		const secObj = albumSections.find(s=>s.si === currentMediaMeta.fs);
		const secName = secObj ? secObj.ft : "未分类";
		infoSectionDom.textContent = "段落：" + secName;
		infoTimeDom.textContent = currentMediaMeta.ft || "";
		infoNoteDom.textContent = currentMediaMeta.fm || "";
	}else{
		infoAuthorDom.textContent = "";
		infoSectionDom.textContent = "";
		infoTimeDom.textContent = "";
		infoNoteDom.textContent = "";
	}
	refreshNavButtonState();
	overlay.classList.add('show');
	document.body.style.overflow = 'hidden';
}
function closeViewer() {
	overlay.classList.remove('show');
	document.body.style.overflow = '';
	setTimeout(() => {
		bigImg.src = '';
		bigVid.pause();
		bigVid.src = '';
		currentMediaSrc = "";
		currentMediaMeta = null;
		currentIndex = -1;
		infoAuthorDom.textContent = "";
		infoSectionDom.textContent = "";
		infoTimeDom.textContent = "";
		infoNoteDom.textContent = "";
	}, 200);
}
closeBtn.addEventListener('click', closeViewer);
overlay.addEventListener('click', e => {
	if (e.target === overlay) closeViewer();
});
function prevMedia(){
	if(currentIndex <= 0) return;
	const prev = mediaList[currentIndex - 1];
	openViewer(prev.src, prev.type, prev.meta, currentIndex - 1);
}
function nextMedia(){
	if(currentIndex >= mediaList.length - 1) return;
	const next = mediaList[currentIndex + 1];
	openViewer(next.src, next.type, next.meta, currentIndex + 1);
}
prevBtn.onclick = prevMedia;
nextBtn.onclick = nextMedia;
document.addEventListener('keydown', e => {
	if (!overlay.classList.contains('show')) return;
	if (e.key === 'Escape') closeViewer();
	if (e.key === 'ArrowLeft') prevMedia();
	if (e.key === 'ArrowRight') nextMedia();
});
function getUrlParam(key) {
	const params = new URLSearchParams(location.search);
	return params.get(key);
}
const albumId = getUrlParam('id');
if (!albumId) {
	document.body.innerHTML = `<div style="text-align:center;padding:120px 20px;color:var(--text-secondary)">未指定相册ID，请<a href="album.html">返回相册列表</a></div>`;
}
let albumBaseInfo = null;
let albumFileData = null;
Promise.all([
	fetch('assets/meta/all-albums.json').then(res => res.json()),
	fetch('assets/meta/all-author.json').then(res => res.json()),
	fetch('assets/meta/tag-data.json').then(res => res.json()),
	fetch(`${albumSrc}/${albumId}/all-file.min.json`).then(res => res.json())
])
.then(([albumAll, authorData, tagJson, fileData]) => {
	albumBaseInfo = albumAll.albums.find(item => item.id === albumId);
	if (!albumBaseInfo) throw new Error("目标相册不存在");
	authorList = authorData.authors;
	tagData = tagJson;
	albumSections = fileData.sections || [];
	albumFileData = fileData;
	renderCover();
	renderSideInfo();
	renderSectionNav();
	renderMediaContent();
})
.catch(err => {
	console.error("页面加载失败：", err);
	document.getElementById('contentBox').innerHTML = `<p style="text-align:center;padding:80px 0;color:var(--text-secondary)">相册数据读取异常，请检查文件路径</p>`;
});
function renderCover() {
	const coverUrl = `assets/cover/${albumId}.webp`;
	document.getElementById('albumCover').src = coverUrl;
	document.getElementById('coverBox').onclick = () => openViewer(coverUrl, 'webp', null, -1);
}
function renderSideInfo() {
	document.getElementById('albumName').innerText = albumBaseInfo.na;
	document.getElementById('albumDate').innerText = albumBaseInfo.da;
	document.getElementById('albumLoc').innerText = albumBaseInfo.lc;
	document.getElementById('albumIntro').innerText = albumBaseInfo.io;
	document.getElementById('mediaCount').innerText = `${albumBaseInfo.ph}张图片 · ${albumBaseInfo.vd}条视频`;
	const tagBox = document.getElementById('tagBox');
	tagBox.innerHTML = '';
	if(tagData && tagData.tags && albumBaseInfo.ta){
		albumBaseInfo.ta.forEach(tagId => {
			const tag = tagData.tags.find(t => t.id === tagId);
			if (!tag) return;
			tagBox.innerHTML += `<span class="tag-item">${tag.name}</span>`;
		});
	}
	const authorIds = [...new Set(albumFileData.files.map(f => f.fi.charAt(0)))];
	const authorBox = document.getElementById('authorBox');
	authorBox.innerHTML = '';
	authorIds.forEach(aId => {
		const auth = authorList.find(a => String(a.id) === String(aId));
		const name = auth ? auth.name : "未知";
		authorBox.innerHTML += `<div class="author-item">${name}</div>`;
	});
}
function renderSectionNav() {
	const navWrap = document.getElementById('navList');
	const navBox = document.getElementById('sectionNav');
	navWrap.innerHTML = '';
	const sections = albumFileData.sections || [];
	if (sections.length === 0) {
		navBox.style.display = 'none';
		return;
	}
	sections.forEach(sec => navWrap.innerHTML += `<a href="#sec-${sec.si}">${sec.ft}</a>`);
}
function renderMediaContent() {
	const box = document.getElementById('contentBox');
	box.innerHTML = '';
	mediaList = [];
	const sections = albumFileData.sections || [];
	const allFiles = albumFileData.files;
	if (sections.length === 0) {
		renderSingleBlock("", "未分类", allFiles, box);
		return;
	}
	sections.forEach(sec => {
		const secFiles = allFiles.filter(f => f.fs === sec.si);
		renderSingleBlock(sec.si, sec.ft, secFiles, box);
	});
	const unClassified = allFiles.filter(f => !f.fs || f.fs.trim() === "");
	if (unClassified.length > 0) renderSingleBlock("", "未分类", unClassified, box);
}
function renderSingleBlock(secId, secTitle, fileList, boxDom) {
	let html = `<div class="section-block" id="sec-${secId}">`;
	html += `<h3 class="section-title">${secTitle}</h3>`;
	const groupMap = {};
	fileList.forEach(file => {
		const aid = file.fi.charAt(0);
		if (!groupMap[aid]) groupMap[aid] = [];
		groupMap[aid].push(file);
	});
	Object.keys(groupMap).forEach(aId => {
		const auth = authorList.find(a => String(a.id) === String(aId));
		const authName = auth ? auth.name : "未知拍摄者";
		const mediaListGroup = groupMap[aId];
		html += `<div class="media-group"><p class="author-subtitle">By:${authName}<div class="media-grid">`;
		mediaListGroup.forEach(item => {
			const preview = `${albumSrc}/${albumId}/pre/${item.fi}.webp`;
			const original = `${albumSrc}/${albumId}/src/${item.fi}.${item.ff}`;
			const descHtml = item.fm ? `<p class="media-desc">${item.fm}</p>` : "";
			const idx = mediaList.length;
			mediaList.push({ src: original, type: item.ff, meta: item });
			if (item.ff === "mp4") {
			    html += `<div class="media-card" data-idx="${idx}" data-src="${original}" data-type="mp4" data-meta='${JSON.stringify(item)}'>
			        <video preload="none" poster="${preview}"></video>
			        <span class="video-badge"></span>
			        ${descHtml}
			    </div>`;
			} else {
			    html += `<div class="media-card" data-idx="${idx}" data-src="${original}" data-type="webp" data-meta='${JSON.stringify(item)}'>
			        <img src="${preview}" loading="lazy" alt="${item.fi}" onerror="this.parentElement.style.background:#111">
			        ${descHtml}
			    </div>`;
			}
		});
		html += `</div></div>`;
	});
	html += `</div>`;
	boxDom.innerHTML += html;
	document.querySelectorAll('.media-card').forEach(card => {
		card.onclick = () => {
			const meta = JSON.parse(card.dataset.meta);
			const idx = Number(card.dataset.idx);
			openViewer(card.dataset.src, card.dataset.type, meta, idx);
		}
	});
}