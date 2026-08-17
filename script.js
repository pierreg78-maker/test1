$(document).ready(function() {
    // URL du CDN pour PDF.js (nécessaire pour lire le PDF dans le navigateur)
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    $('#pdf-file-input').on('change', async function(e) {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            alert('Veuillez sélectionner un fichier PDF valide.');
            return;
        }

        const fileReader = new FileReader();
        fileReader.onload = async function() {
            const typedarray = new Uint8Array(this.result);

            try {
                // Chargement du document PDF
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                
                // Si le flipbook existe déjà, on le détruit pour le réinitialiser
                if ($('#flipbook').data('turn')) {
                    $('#flipbook').turn('destroy').html('');
                }

                // Parcours de chaque page du PDF
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const scale = 1.5; // Qualité du rendu
                    const viewport = page.getViewport({ scale: scale });

                    // Création d'un canvas pour dessiner la page du PDF
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport: viewport
                    }).promise;

                    // Création de l'élément de page pour turn.js
                    const pageDiv = $('<div class="page"></div>');
                    const img = $('<img>').attr('src', canvas.toDataURL('image/png')).css({
                        'width': '100%',
                        'height': '100%'
                    });
                    
                    pageDiv.append(img);
                    $('#flipbook').append(pageDiv);
                }

                // Initialisation de turn.js une fois toutes les pages ajoutées
                $('#flipbook').turn({
                    width: 800,
                    height: 600,
                    autoCenter: true,
                    gradients: true,
                    elevation: 50
                });

            } catch (error) {
                console.error('Erreur lors du traitement du PDF :', error);
                alert('Une erreur est survenue lors de la lecture du PDF.');
            }
        };

        fileReader.readAsArrayBuffer(file);
    });
});
