const menu = document.querySelector('.menu');
const nav = document.querySelector('.nav');
menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); }));
const swatches = document.querySelectorAll('.swatch');
swatches.forEach(button => button.addEventListener('click', () => { swatches.forEach(item => {item.classList.remove('selected');item.setAttribute('aria-pressed','false');});button.classList.add('selected');button.setAttribute('aria-pressed','true');document.querySelector('.selection strong').textContent = button.dataset.color;}));
document.getElementById('year').textContent = new Date().getFullYear();
