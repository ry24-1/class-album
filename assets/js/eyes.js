fetch('assets/meta/all-author.json')
.then(res => {
    if (!res.ok) throw new Error(`文件请求失败，状态码：${res.status}`);
    return res.json();
})
.then(data => {
    const wrap = document.getElementById('authorBox');
    wrap.innerHTML = '';
    data.authors.forEach((item, idx) => {
		if (item.id === 'X') return ;
        const sideClass = idx % 2 === 0 ? 'right-side' : 'left-side';
        const validDev = item.dev.filter(d => d && d.trim() !== '');
        const devText = validDev.length > 0 ? validDev.join('、') : '未填写设备';
        const avatarHtml = `<img class="square-avatar" src="assets/avatar/${item.id}.webp" alt="${item.name}" onerror="this.style.display='none'">`;
        let lineMsgHtml = '';
        if (item.message?.trim()) { lineMsgHtml = `<div class="line"></div><p class="message">${item.message}</p>`; }
        const tpl = `
            <div class="author-item ${sideClass}">
                ${avatarHtml}
                <div class="eye-card">
                    <h2>${item.name}</h2>
                    <p class="device">拍摄设备：${devText}</p>
                    <p class="intro">${item.intro}</p>
                    ${lineMsgHtml}
                </div>
            </div>
        `;
        wrap.innerHTML += tpl;
    });
})
//Drone Sd-card Camra Module
.catch(err => {
    console.error('档案加载异常：', err);
    document.getElementById('authorBox').innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:40px 0;">记录者档案加载失败</p>';
});