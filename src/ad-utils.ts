import { getCachedWebsite, setCachedWebsite } from "./cache";
import { adServerUrl } from "./config";
import { Advertisement } from "./models/advertisement";
import { getWebsiteByURL } from "./website-service";

/** Renders a specific `<div>` for each Ad Type */
export function renderAdDisplayByType(adType: string, ad: Advertisement){
  const content = setAdContentByFormat(ad);
  const contrastColors = setContrastingColors();
  
  switch (adType) {
    case 'classic_banners':
      return `
        <div class="ad-classic-banner">
          ${content}
        </div>`;
      
    case 'native_ads':
      return `
        <div class="native-ads">
          ${content}
        </div>`;

    case 'pop_under':
      createPopup(content);
      return ''; // TODO Remover retorno (Pop Up e Header/Footer terão componente próprio e serão habilitados sem precisar configurar divs)
    case 'header_banner':
      return `
        <div style="position: fixed; top: 0; width: 100%; max-height: 90px; height: 90px; 
          z-index: 1000; display: flex; justify-content: center; align-items: start;
          background-color: ${contrastColors.backgroundColor}; color: ${contrastColors.color}"
        >
        <a href="${ad.url}" target="_blank" style="display: inline-block;">
          <img src="${ad.data}" style="margin: auto; max-height: 90px; object-fit: contain;" alt="${ad.title}">
        </a>
        </div>`;

    case 'sticky_banner':
      return `
        <div style="position: fixed; bottom:0; width:100%; max-height: 90px; height: 90px; 
          z-index: 1000; display: flex; justify-content: center; align-items: end; 
          background-color: ${contrastColors.backgroundColor}; color: ${contrastColors.color}"
        >
          <a href="${ad.url}" target="_blank" style="display: inline-block;">
            <img src="${ad.data}" style="margin: auto; max-height: 90px; object-fit: contain;" alt="${ad.title}">
          </a>
        </div>`;

    default:
      return `<div class="ad-classic-banner"> ${content} </div>`;
  }
}

/** Defines the Ad Content according to the registered format */
export function setAdContentByFormat(ad: Advertisement) { // TODO implement VIDEO and RICH-MEDIA formats
  if (ad.ad_format === "image") {
    return `<a href="${ad.url}" target="_blank" style="display: inline-block;"><img src="${ad.data}" style="margin: auto; height: 100%; object-fit: contain;" alt="${ad.title}"></a>`;
  } else if (ad.ad_format === "rich_media") {
    return `<a href="${ad.url}" target="_blank" style="display: inline-block; padding: 10px; text-decoration: none; color: black; border: 1px solid #ccc; border-radius: 5px;"><h3>${ad.title}</h3><p>${ad.data}</p></a>`;
  } else if (ad.ad_format === "video") {
    return `<video controls style="width: 100%; height: 100%; object-fit: contain;"><source src="${ad.data}" type="video/mp4">Your browser does not support the video tag.</video>`;
  }
  return ``;
}

function createPopup(content: any) {
  const existingOverlay = document.getElementById('convbase-overlay');
  if (existingOverlay) {
    console.log('Já existe um popup ativo. Cancelando a criação de um novo.');
    return; // Cancelar a função se o overlay já existir
  }

  // Criar a camada de fundo (overlay)
  const overlay = document.createElement('div');
  overlay.id = 'convbase-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100vw';
  overlay.style.height = '100vh';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Fundo semitransparente
  overlay.style.zIndex = '8000'; // Z-index menor que o popup

  // Criar o container do popup
  const popupContainer = document.createElement('div');
  popupContainer.id = 'convbase-popup';
  popupContainer.style.position = 'fixed';
  popupContainer.style.top = '50%';
  popupContainer.style.left = '50%';
  popupContainer.style.transform = 'translate(-50%, -50%)';
  popupContainer.style.zIndex = '8000';
  popupContainer.style.backgroundColor = '#fff';
  popupContainer.style.padding = '1.5em';
  popupContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  popupContainer.style.borderRadius = '8px';

  // Criar o conteúdo do popup
  const popupContent = document.createElement('div');
  popupContent.innerHTML = content;
  
  // Criar o botão de fechar
  const closeButton = document.createElement('button');
  closeButton.innerHTML = 'X';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '10px';
  closeButton.style.color = '#aaa';
  closeButton.style.fontSize = '16px';
  closeButton.style.fontWeight = 'bold';

  // Função para fechar o popup e a camada de fundo
  closeButton.onclick = () => {
    overlay.hidden = true;

    // Intervalo para Pop-Up aparecer novamente
    setTimeout(() => {
      overlay.hidden = false;
    }, 30000);
  };

  // Adicionar o conteúdo e o botão ao container do popup
  popupContainer.appendChild(popupContent);
  popupContainer.appendChild(closeButton);
  overlay.appendChild(popupContainer);

  // Adicionar a camada de fundo e o popup ao body do documento
  document.body.appendChild(overlay);
}

function setContrastingColors() {
  const bodyBackground = getComputedStyle(document.body).backgroundColor;
  
  const darkBackground = checkBackgroundDark(bodyBackground);
  
  if (darkBackground) {
    return {backgroundColor: '#f5f5f5', color: '#000000'};
  } else {
    return {backgroundColor: '#1c1c1c', color: '#FFFFFF'};
  }
}

function checkBackgroundDark(color: string): boolean {
  const rgb = color.match(/\d+/g);
  if (!rgb) return false;
  const r = parseInt(rgb[0], 10);
  const g = parseInt(rgb[1], 10);
  const b = parseInt(rgb[2], 10);
  
  // Using the luminance formula to check for brightness
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance < 150; // If luminance is less than 150, consider it dark
}



export function attachAdClickListener(adContainer: Element, ad: Advertisement) {
  // TODO poder aceitar mais que um link, pois vários produtos poderão ser exibidos
  const adLink = adContainer.getElementsByTagName('a')[0];
  if(adLink){
    adLink.addEventListener("click", async (event) => {
      let website = getCachedWebsite(); // Obtenha o website armazenado em cache
      if (!website) {
        const currentUrl = new URL(window.location.href).origin;
        website = await getWebsiteByURL(currentUrl);
        if (website) {
          setCachedWebsite(website); // Armazene o website em cache
        } else {
          console.error("Website not found");
          return;
        }
      }
      try {
        const response = await fetch(
          adServerUrl + "/ad-click",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              ad: ad,
              website_id: website.id,
            }),
          }
        );
        const result = await response.json();
        if (result.error) {
          console.error(`Error updating ad metrics: ${result.error}`);
        }
      } catch (error) {
        console.error("Failed to update ad metrics:", error);
      }
    });
  }
}
