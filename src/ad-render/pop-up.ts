export function createPopup(content: any) {
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
    popupContainer.style.padding = '0 1.5em 1.5em';
    popupContainer.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    popupContainer.style.borderRadius = '8px';
  
    // Criar o botão de fechar
    const headerPopUp = document.createElement('div');
    headerPopUp.style.width = '100%';
    headerPopUp.style.display = 'table';
    headerPopUp.style.height = '24px';
    headerPopUp.style.backgroundColor = '#fff';

    const closeButton = document.createElement('button');
    closeButton.innerHTML = 'X';
    closeButton.style.float = 'right';
    closeButton.style.padding = '12px 10px';
    closeButton.style.color = '#aaa';
    closeButton.style.fontSize = '16px';
    closeButton.style.fontWeight = 'bold';

    // Criar o conteúdo do popup
    const popupContent = document.createElement('div');
    popupContent.innerHTML = content;
    
  
    // Função para fechar o popup e a camada de fundo
    closeButton.onclick = () => {
      overlay.hidden = true;
  
      // Intervalo para Pop-Up aparecer novamente
      setTimeout(() => {
        overlay.hidden = false;
      }, 30000);
    };
  
    // Adicionar as Tags em hierarquia
    headerPopUp.appendChild(closeButton);
    popupContainer.appendChild(headerPopUp);
    popupContainer.appendChild(popupContent);
    overlay.appendChild(popupContainer);
  
    // Adicionar a camada de fundo e o popup ao body do documento
    document.body.appendChild(overlay);
}