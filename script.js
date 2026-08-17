document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('pdf-file-input');
    const bookEl = document.getElementById('book');
    const loadingMessage = document.getElementById('loading-message');
    const navContainer = document.getElementById('nav-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageIndicator = document.getElementById('page-indicator');

    let pageFlip = null;

    fileInput.addEventListener('change', async function (e) {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Veuillez sélectionner un fichier PDF valide.');
            return;
        }

        loadingMessage.classList.remove('hidden');
        navContainer.classList.add('hidden');

        const fileReader = new FileReader();
        fileReader.onload = async function () {
            const typedarray = new Uint8Array(this.result);

            try {
                // Chargement du document PDF
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const images = [];
                let baseWidth = 800;
                let baseHeight = 600;

                // Parcours de chaque page du PDF et rendu sur un canvas
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const scale = 1.5; // Qualité du rendu
                    const viewport = page.getViewport({ scale: scale });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;

                    if (i === 1) {
                        // On calcule le ratio de la première page pour dimensionner le livre
                        baseWidth = viewport.width;
                        baseHeight = viewport.height;
                    }

                    images.push(canvas.toDataURL('image/png'));
                }

                // Si un flipbook existe déjà, on le détruit pour repartir de zéro
                if (pageFlip) {
                    pageFlip.destroy();
                    bookEl.innerHTML = '';
                }

                // Initialisation de StPageFlip
                pageFlip = new St.PageFlip(bookEl, {
                    width: Math.min(baseWidth, 500),
                    height: Math.min(baseHeight, 700),
                    size: 'stretch',
                    minWidth: 300,
                    maxWidth: 1000,
                    minHeight: 400,
                    maxHeight: 1400,
                    showCover: true,
                    drawShadow: true,
                    flippingTime: 700,
                    maxShadowOpacity: 0.5,
                    mobileScrollSupport: false
                });

                pageFlip.loadFromImages(images);

                // Navigation
                navContainer.classList.remove('hidden');
                updatePageIndicator();

                pageFlip.on('flip', updatePageIndicator);

            } catch (error) {
                console.error('Erreur lors du traitement du PDF :', error);
                alert('Une erreur est survenue lors de la lecture du PDF.');
            } finally {
                loadingMessage.classList.add('hidden');
            }
        };

        fileReader.readAsArrayBuffer(file);
    });

    prevBtn.addEventListener('click', function () {
        if (pageFlip) pageFlip.flipPrev();
    });

    nextBtn.addEventListener('click', function () {
        if (pageFlip) pageFlip.flipNext();
    });

    function updatePageIndicator() {
        if (!pageFlip) return;
        const current = pageFlip.getCurrentPageIndex() + 1;
        const total = pageFlip.getPageCount();
        pageIndicator.textContent = current + ' / ' + total;
    }
});
