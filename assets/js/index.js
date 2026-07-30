const imageTextList = [
{ date: "2025年01月15日", place: "经开区 · 一班 · 春季合影", slogan: "春风为伴，奔赴下一程山海" },
{ date: "2025年03月22日", place: "经开区 · 一班 · 运动会", slogan: "少年意气，挥汗不负韶华" },
{ date: "2025年05月06日", place: "经开区 · 一班 · 晚自习留念", slogan: "灯火长夜，皆是追梦足迹" },
{ date: "2025年06月10日", place: "经开区 · 一班 · 考前打气", slogan: "提笔从容自信，合笔如愿以偿" },
{ date: "2025年06月15日", place: "经开区 · 一班 · 毕业聚餐", slogan: "此去繁花似锦，再相逢依旧如故" },
{ date: "2025年07月02日", place: "经开区 · 一班 · 校园最后一瞥", slogan: "聚是一团火，散是满天星" },
{ date: "2025年07月12日", place: "经开区 · 一班 · 操场落日", slogan: "落日归山海，青春藏心底" },
{ date: "2025年07月15日", place: "经开区 · 一班 · 完整毕业纪念", slogan: "那一年，我们一起走过的夏天" }
];
const randomIndex = Math.floor(Math.random() * 6);
const imgPath = `selected/${randomIndex}.webp`;
document.getElementById('randomBgImg').src = imgPath;
const preloadImg = new Image();
preloadImg.src = imgPath;
const currentText = imageTextList[randomIndex];
document.querySelector('.info-date').innerText = currentText.date;
document.querySelector('.info-place').innerText = currentText.place;
document.querySelector('.info-slogan').innerText = currentText.slogan;

fetch("assets/meta/all-albums.json")
.then(res => res.json())
.then(data => {
const albums = data.albums;
let idx1, idx2;
do { idx1 = Math.floor(Math.random() * albums.length); } while (idx1 === 0);
do { idx2 = Math.floor(Math.random() * albums.length); } while (idx2 === idx1 || idx2 === 0);
const d1 = albums[0], d2 = albums[idx1], d3 = albums[idx2];
document.getElementById('card1').href = `viewer.html?id=${d1.id}`;
	document.getElementById('bg1').style.backgroundImage = `url(album/${d1.id}.webp)`;
		document.getElementById('name1').textContent = d1.na;
			document.getElementById('meta1').textContent = `图片${d1.ph}张 | ${d1.da}`;
				document.getElementById('loc1').textContent = d1.lc;
document.getElementById('card2').href = `viewer.html?id=${d2.id}`;
	document.getElementById('bg2').style.backgroundImage = `url(album/${d2.id}.webp)`;
		document.getElementById('name2').textContent = d2.na;
			document.getElementById('meta2').textContent = `图片${d2.ph}张 · 视频${d2.vd}条 | ${d2.da}`;
				document.getElementById('loc2').textContent = d2.lc;
document.getElementById('card3').href = `viewer.html?id=${d3.id}`;
	document.getElementById('bg3').style.backgroundImage = `url(album/${d3.id}.webp)`;
		document.getElementById('name3').textContent = d3.na;
			document.getElementById('meta3').textContent = `图片${d3.ph}张 · 视频${d3.vd}条 | ${d3.da}`;
				document.getElementById('loc3').textContent = d3.lc;
})
.catch(err => {
	console.error('相册JSON加载失败：', err);
});