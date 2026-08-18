document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('pdf-file-input');
    const bookEl = document.getElementById('book');
    const loadingMessage = document.getElementById('loading-message');
    const navContainer = document.getElementById('nav-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const downloadBtn = document.getElementById('download-btn');
    const pageIndicator = document.getElementById('page-indicator');

    let pageFlip = null;
    let currentImages = [];
    let currentWidth = 500;
    let currentHeight = 700;

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

                currentImages = images;
                currentWidth = Math.min(baseWidth, 500);
                currentHeight = Math.min(baseHeight, 700);

                pageFlip = createBook(bookEl, currentImages, currentWidth, currentHeight, pageIndicator);

                navContainer.classList.remove('hidden');

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

    downloadBtn.addEventListener('click', function () {
        if (!currentImages.length) return;
        exportFlipbook(currentImages, currentWidth, currentHeight);
    });

    // Crée et initialise un livre StPageFlip dans un conteneur donné,
    // et branche l'indicateur de page fourni.
    function createBook(container, images, width, height, indicator) {
        const flip = new St.PageFlip(container, {
            width: width,
            height: height,
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

        flip.loadFromImages(images);

        function updateIndicator() {
            const current = flip.getCurrentPageIndex() + 1;
            const total = flip.getPageCount();
            indicator.textContent = current + ' / ' + total;
        }

        flip.on('flip', updateIndicator);
        updateIndicator();

        return flip;
    }

    // Génère un fichier HTML autonome (images + librairie StPageFlip intégrées)
    // et déclenche son téléchargement. Réouvrable n'importe où, même hors-ligne.
    function exportFlipbook(images, width, height) {
        const libSource = document.getElementById('pageflip-lib').textContent;

        const styleBlock = `
            body, html { margin:0; padding:0; width:100%; height:100%; background:#f0f0f0;
                display:flex; flex-direction:column; justify-content:center; align-items:center; font-family:sans-serif; }
            #flipbook-container { width:90vw; max-width:800px; height:70vh; max-height:600px;
                background:#fff; box-shadow:0 4px 10px rgba(0,0,0,0.1); display:flex; justify-content:center; align-items:center; }
            #book { width:100%; height:100%; }
            #nav-container { margin-top:20px; display:flex; align-items:center; gap:20px; }
            .nav-btn { background:#007bff; color:#fff; border:none; width:50px; height:50px; border-radius:50%;
                font-size:20px; cursor:pointer; }
            .nav-btn:hover { background:#0056b3; }
            #page-indicator { font-weight:bold; min-width:60px; text-align:center; }
        `;

        const appScript = `
            const images = ${JSON.stringify(images)};
            const container = document.getElementById('book');
            const flip = new St.PageFlip(container, {
                width: ${width}, height: ${height}, size: 'stretch',
                minWidth: 300, maxWidth: 1000, minHeight: 400, maxHeight: 1400,
                showCover: true, drawShadow: true, flippingTime: 700,
                maxShadowOpacity: 0.5, mobileScrollSupport: false
            });
            flip.loadFromImages(images);
            const indicator = document.getElementById('page-indicator');
            function updateIndicator() {
                indicator.textContent = (flip.getCurrentPageIndex() + 1) + ' / ' + flip.getPageCount();
            }
            flip.on('flip', updateIndicator);
            updateIndicator();
            document.getElementById('prev-btn').addEventListener('click', () => flip.flipPrev());
            document.getElementById('next-btn').addEventListener('click', () => flip.flipNext());
        `;

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mon Flipbook</title>
<link rel="icon" href="data:,">
<style>${styleBlock}</style>
<script id="pageflip-lib">${libSource}</script>
</head>
<body>
<div id="flipbook-container"><div id="book"></div></div>
<div id="nav-container">
<button id="prev-btn" class="nav-btn" aria-label="Page précédente">&#10094;</button>
<span id="page-indicator">- / -</span>
<button id="next-btn" class="nav-btn" aria-label="Page suivante">&#10095;</button>
</div>
<script>${appScript}</script>
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'flipbook.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
