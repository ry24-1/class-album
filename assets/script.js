const body = document.body;
const themeBtn = document.getElementById('themeBtn');
if (localStorage.getItem('albumTheme') === 'dark') { themeBtn.innerText = '暗调蓝黑';}
else { body.classList.add('theme-white'); themeBtn.innerText = '柔光奶白';}
themeBtn.addEventListener('click', () => {
    body.classList.toggle('theme-white');
    if (body.classList.contains('theme-white')) { localStorage.setItem('albumTheme', 'white'); themeBtn.innerText = '柔光奶白'; }
	else { localStorage.setItem('albumTheme', 'dark'); themeBtn.innerText = '暗调蓝黑'; }
})