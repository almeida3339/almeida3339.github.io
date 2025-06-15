// v2.4 atualizado em 15/06/2025
// v2.3 fix duplicate markup – 15/06/2025
// v2.2 atualizado em 15/06/2025
// v2.1 atualizado em 15/06/2025
// Atualização de acessibilidade detectável – Junho 2025
document.addEventListener("DOMContentLoaded",()=>{function e(){if("function"==typeof t)return;let e=document.createElement("script");function t(){dataLayer.push(arguments)}e.async=!0,e.src="https://www.googletagmanager.com/gtag/js?id=G-VC716PNSD2",document.head.appendChild(e),window.dataLayer=window.dataLayer||[],t("js",new Date),t("config","G-VC716PNSD2"),window.gtag=t,console.log("Cookie consent aceito. Google Analytics inicializado.")}"undefined"!=typeof CookieConsent&&CookieConsent.run({guiOptions:{consentModal:{layout:"box",position:"bottom left"},preferencesModal:{layout:"box",position:"right"}},categories:{necessary:{readOnly:!0},analytics:{autoClear:{cookies:[{name:/^_ga/}]}}},language:{default:"pt",translations:{pt:{consentModal:{title:"Este site usa cookies",description:"N\xf3s usamos cookies e tecnologias de an\xe1lise para entender melhor nosso p\xfablico e otimizar nosso conte\xfado. Ao aceitar, voc\xea nos ajuda a criar uma experi\xeancia melhor.",acceptAllBtn:"Aceitar todos",acceptNecessaryBtn:"Rejeitar todos",showPreferencesBtn:"Gerenciar prefer\xeancias",footer:'<a href="/politica-de-privacidade.html">Pol\xedtica de Privacidade</a>'},preferencesModal:{title:"Prefer\xeancias de Consentimento",acceptAllBtn:"Aceitar todos",acceptNecessaryBtn:"Rejeitar todos",savePreferencesBtn:"Salvar prefer\xeancias",closeIconLabel:"Fechar modal",sections:[{title:"Uso de Cookies",description:"Utilizamos cookies para garantir a funcionalidade b\xe1sica do website e para melhorar a sua experi\xeancia online."},{title:'Cookies de An\xe1lise (Google Analytics) <span class="pm__badge">Opcional</span>',description:"Estes cookies coletam informa\xe7\xf5es sobre como voc\xea usa o nosso site. Todos os dados s\xe3o anonimizados e n\xe3o podem ser usados para identific\xe1-lo.",linkedCategory:"analytics"},{title:"Mais informa\xe7\xf5es",description:'Para qualquer d\xfavida, por favor <a class="cc__link" href="/politica-de-privacidade.html">leia nossa pol\xedtica de privacidade</a>.'}]}}}},onAccept(t){t.categories.includes("analytics")&&e()},onChange(t){t.categories.includes("analytics")&&e()}});let t=document.getElementById("search-button"),a=document.getElementById("product-number"),n=document.getElementById("gallery-container"),i=document.getElementById("loader"),o=document.getElementById("search-result-container"),r={},s=[],c=0,d=!1,l={"@context":"https://schema.org","@type":"ItemList",itemListElement:[]},u;function m(e){return e?e.replace(/[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26ff]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff]/g,"").trim():""}function p(e){let t=document.getElementById("item-list-schema");t||((t=document.createElement("script")).type="application/ld+json",t.id="item-list-schema",document.head.appendChild(t)),e.forEach(e=>{let t=l.itemListElement.length+1;l.itemListElement.push({"@type":"ListItem",position:t,item:{"@type":"Product",name:m(e.product.name),image:`https://cozinha-criativpromo.netlify.app/${e.product.image}`,url:e.product.link,sku:e.key}})}),t.textContent=JSON.stringify(l)}function f(){n.innerHTML="",i.textContent="Carregando mais...",fetch("/products.json").then(e=>{if(!e.ok)throw Error(`Erro de rede: ${e.statusText}`);return e.json()}).then(e=>{if(s=Object.keys(r=e).reverse(),c=0,l.itemListElement=[],s.length>0){let t=s[0],a=r[t];if(a&&a.image){let n=document.createElement("link");n.rel="preload",n.as="image",n.href=a.image,document.head.appendChild(n)}}h(),i&&!u&&(u=new IntersectionObserver(g,{rootMargin:"200px"})).observe(i)}).catch(e=>{console.error("Erro ao carregar ou processar o arquivo de produtos:",e),n.innerHTML=`<div class="error-message"><p>Falha ao carregar os achados. Verifique sua conex\xe3o.</p><button id="retry-button" class="search-button">Tentar Novamente</button></div>`,document.getElementById("retry-button").addEventListener("click",f)})}function g(e){e[0].isIntersecting&&!d&&h()}function h(){if(d)return;let e=12*c;if(e>=s.length){i.textContent="Fim dos resultados :)",u&&u.unobserve(i);return}d=!0;let t=s.slice(e,e+12),a=[];t.forEach(e=>{let t=r[e],i=y(e,t);n.appendChild(i),a.push({key:e,product:t})}),p(a),c++,d=!1}function y(key, product) {
    const li = document.createElement("li");
    li.className = "gallery-item";

    const a = document.createElement("a");
    a.href = product.link;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("data-id", key);
    a.setAttribute("data-name", product.name);

    const cleanName = m(product.name);
    a.innerHTML = `
            <img src="${product.image}" alt="${cleanName}" class="gallery-image" loading="lazy" decoding="async" width="280" height="280">
            <div class="gallery-title">${key}. ${product.name}</div>
        `;

    li.appendChild(a);
    return li;
}
function $(e){o.innerHTML="";let t=document.getElementById("product-schema-search");if(t&&t.remove(),e.length>0){let a=e[0],n=r[a],i=m(n.name),s=document.createElement("script");s.type="application/ld+json",s.id="product-schema-search",s.text=JSON.stringify({"@context":"https://schema.org","@type":"Product",name:i,image:`https://cozinha-criativpromo.netlify.app/${n.image}`,description:`Achado de cozinha: ${i}`,sku:a,offers:{"@type":"Offer",url:n.link,availability:"https://schema.org/InStock"}}),document.head.appendChild(s),e.forEach(e=>{let t=r[e],a=document.createElement("div");a.className="product-card-result";let n=m(t.name);a.innerHTML=`
                    <img src="${t.image}" alt="${n}" class="product-image" loading="lazy" decoding="async">
                    <a href="${t.link}" target="_blank" rel="noopener noreferrer" class="link-button" data-id="${e}" data-name="${t.name}">${t.name}</a>
                `,o.appendChild(a)}),o.classList.remove("hidden")}else o.innerHTML='<p class="error-message">Nenhum produto encontrado.</p>',o.classList.remove("hidden")}function b(){let e=a.value.trim().toLowerCase();if(o.classList.add("hidden"),!e){o.innerHTML="";return}let t=[],n=e.replace("#","");r[n]?t.push(n):t=s.filter(t=>r[t].name.toLowerCase().includes(e)),$(t),"function"==typeof gtag&&gtag("event","search",{search_term:e})}f();
    i.addEventListener("click",()=>{!d&&h()});
    t.addEventListener("click",b),a.addEventListener("keyup",e=>{"Enter"===e.key&&b()}),a.addEventListener("input",()=>{if(""===a.value.trim()){o.innerHTML="",o.classList.add("hidden");let e=document.getElementById("product-schema-search");e&&e.remove()}});let v=(e,t)=>{e.addEventListener("click",e=>{let a=e.target.closest(".gallery-item, .product-card-result");if(a){let n=a.querySelector(".link-button")||a,i=n.getAttribute("data-id"),o=n.getAttribute("data-name");i&&o&&"function"==typeof gtag&&gtag("event","select_item",{item_id:i,item_name:o,item_list_name:t})}})};v(n,"Gallery"),v(o,"Search Result")});

// 🧹 Força a remoção de qualquer Service Worker antigo
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister().then(success => {
        if (success) console.log("SW antigo removido.");
      });
    }
  });
}
