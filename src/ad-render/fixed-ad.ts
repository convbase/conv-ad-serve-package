export function createFixedAd(position: 'top' | 'bottom', content: any): void {
    const existingHeader = document.getElementById('convbase-header');
    const existingFooter = document.getElementById('convbase-footer');
    if ((existingHeader && position == 'top') || (existingFooter && position == 'bottom')){
        console.log(`Já existe um AdFixed no ${position}. Cancelando a criação de um novo`);
        return; // Cancelar a função se AdFixed já existir
    }

    // Cria o banner
    const fixedAd = document.createElement('div');
    fixedAd.style.position = 'fixed';
    fixedAd.style.height = '90px';
    fixedAd.style.width = '100%';
    fixedAd.style.backgroundColor = '#fff'; // Exemplo de cor de fundo
    fixedAd.style.display = 'block';
    fixedAd.style.alignItems = 'center';
    fixedAd.style.justifyContent = 'space-between';
    fixedAd.style.padding = '0 20px';
    fixedAd.style.boxSizing = 'border-box';
    fixedAd.style.fontFamily = 'Arial, sans-serif';
    fixedAd.style.zIndex = '7000'; // Garante que o banner fique acima de outros elementos

    // Posiciona o banner no topo ou no bottom
    if (position === 'top') {
        fixedAd.style.top = '0';
        fixedAd.id = 'convbase-header';
        // Cria o botão de fechar
        var closeButton = document.createElement('button');
        closeButton.innerText = 'X';
        closeButton.style.display = 'block';
        closeButton.style.width = '80px';
        closeButton.style.position = 'absolute';
        closeButton.style.bottom= '-24px';
        closeButton.style.left = '0';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '0 0 16px 16px';
        closeButton.style.backgroundColor = '#fff';
        closeButton.style.fontSize = '16px';
        closeButton.style.cursor = 'pointer';
    } else {
        fixedAd.style.bottom = '0';
        fixedAd.id = 'convbase-footer';
        // Cria o botão de fechar
        var closeButton = document.createElement('button');
        closeButton.innerText = 'X';
        closeButton.style.display = 'block';
        closeButton.style.width = '80px';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '-24px';
        closeButton.style.left = '0';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '16px 16px 0 0';
        closeButton.style.backgroundColor = '#fff';
        closeButton.style.fontSize = '16px';
        closeButton.style.cursor = 'pointer';
    }
    closeButton.onclick = () => {
        fixedAd.style.display = 'none';
    };

    // Cria o conteúdo do banner
    const adContent = document.createElement('span');
    adContent.innerHTML = content;
    
    fixedAd.appendChild(adContent);
    fixedAd.appendChild(closeButton);

    // Adiciona o banner no body da página
    document.body.appendChild(fixedAd);
}