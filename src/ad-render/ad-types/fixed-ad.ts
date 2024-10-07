import { Advertisement } from "../../models/advertisement";
import { attachAdClickListener, setContrastingColors } from "../ad-utils";

export function createFixedAd(position: 'top' | 'bottom', ad: Advertisement): void {
    const existingHeader = document.getElementById('convbase-header');
    const existingFooter = document.getElementById('convbase-footer');
    if ((existingHeader && position == 'top') || (existingFooter && position == 'bottom')){
        console.log(`Já existe um AdFixed no ${position}. Cancelando a criação de um novo`);
        return; // Cancelar a função se AdFixed já existir
    }

    // Cria o banner
    const fixedAd = document.createElement('div');
    fixedAd.style.position = 'fixed';
    fixedAd.style.width = '100%';
    fixedAd.style.display = 'block';
    fixedAd.style.alignItems = 'center';
    fixedAd.style.justifyContent = 'space-between';
    fixedAd.style.padding = '0 20px';
    fixedAd.style.boxSizing = 'border-box';
    fixedAd.style.fontFamily = 'Arial, sans-serif';
    fixedAd.style.zIndex = '7000'; // Garante que o banner fique acima de outros elementos
    setContrastingColors(fixedAd);

    // Posiciona o banner no topo ou no bottom
    var closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.style.display = 'block';
    closeButton.style.width = '60px';
    closeButton.style.position = 'absolute';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    setContrastingColors(closeButton);

    if (position === 'top') {
        fixedAd.style.top = '0';
        fixedAd.id = 'convbase-header';
        // Cria o botão de fechar
        closeButton.style.bottom= '-24px';
        closeButton.style.left = '0';
        closeButton.style.borderRadius = '0 0 16px 16px';
    } else {
        fixedAd.style.bottom = '0';
        fixedAd.id = 'convbase-footer';
        // Cria o botão de fechar
        closeButton.style.top = '-24px';
        closeButton.style.left = '0';
        closeButton.style.borderRadius = '16px 16px 0 0';
        
    }
    closeButton.onclick = () => {
        fixedAd.style.display = 'none';

        // Intervalo para aparecer novamente
        setTimeout(() => {
            fixedAd.style.display = 'block';
        }, 30000);
    };

    // Cria o conteúdo do banner
    const adContent = document.createElement('span');
    adContent.style.display = 'block';
    adContent.style.maxHeight = '90px';
    adContent.innerHTML = createContentFixed(ad);
    
    fixedAd.appendChild(adContent);
    fixedAd.appendChild(closeButton);

    // Adiciona o banner no body da página
    document.body.appendChild(fixedAd);

    addFixedListeners(fixedAd, ad);
}

/** Cria o conteúdo exclusivo para os Ads do tipo Fixed */
function createContentFixed(ad: Advertisement){
    if (ad.ad_format === "image") {
        return `<a href="${ad.url}" target="_blank" style="display: contents;">
            <img src="${ad.data}" style="margin: auto; padding: 5px 0; height: 100%; 
             min-height: 50px; max-height: 90px; object-fit: contain;" alt="${ad.title}"
            >
        </a>`;
    } else if (ad.ad_format === "rich_media") {
        return `<a href="${ad.url}" target="_blank" style="display: contents; padding: 10px;
         text-decoration: none; color: black; border: 1px solid #ccc; border-radius: 5px;">
         <h3>${ad.title}</h3><p>${ad.data}</p>
        </a>`;
    } else if (ad.ad_format === "video") {
        return `<video controls style="width: 100%; height: 100%; object-fit: contain;">
            <source src="${ad.data}" type="video/mp4">
            Your browser does not support the video tag.
        </video>`;
    }

    // Caso não encontre padrão, retorna estilo <iframe> 
    return `<iframe style="margin: auto; width: 100%; height: 100%; min-height: 50px;
        max-height: 90px; object-fit: contain; background: url(${ad.data}) no-repeat center center;"
        onclick="window.open(${ad.url}, '_blank')"
    ></iframe>`
}

/** Adiciona todos os Listeners para o Ad Fixed, sendo exclusivos para o tipo ou não */
function addFixedListeners(fixedAd: HTMLElement, ad: Advertisement){
    attachAdClickListener(fixedAd, ad);
  }