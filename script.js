document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('surveyForm');
    const successMessage = document.getElementById('successMessage');
    const submitBtn = document.getElementById('submitBtn');
    
    const surveyTitleArea = document.querySelector('.survey-title-area');
    const btnContinuar = document.getElementById('btnContinuar');
    
    let anioNacimientoValido = "";

    // ============================================================
    // CONFIGURACIÓN (Tu URL de Cloudflare Worker)
    // ============================================================
    const WORKER_URL = 'https://encuesta-app.analistasindependientes2020.workers.dev'; 
    // ============================================================

    // 1. VALIDACIÓN DEL PASO 1 (Edad y Barrio)
    btnContinuar.addEventListener('click', (e) => {
        e.preventDefault();
        
        const anioInput = document.getElementById('anio_nacimiento');
        const barrioInput = document.getElementById('barrio');
        const anio = parseInt(anioInput.value);
        const barrio = barrioInput.value.trim();

        if (isNaN(anio)) {
            alert('Por favor, ingresa un año de nacimiento válido.');
            return;
        }

        if (anio >= 2011) {
            alert('Lo sentimos, debes haber nacido en 2010 o antes para participar en esta encuesta.');
            anioInput.value = ''; 
            return;
        }

        if (barrio === "") {
            alert('Por favor, ingresa tu barrio.');
            return;
        }

        anioNacimientoValido = anio.toString();
        
        let hiddenAnio = document.getElementById('hidden_anio_nacimiento');
        if (!hiddenAnio) {
            hiddenAnio = document.createElement('input');
            hiddenAnio.type = 'hidden';
            hiddenAnio.id = 'hidden_anio_nacimiento';
            hiddenAnio.name = 'anio_nacimiento'; 
            form.appendChild(hiddenAnio);
        }
        hiddenAnio.value = anioNacimientoValido;

        nextStep(2);
    });

    // 2. NAVEGACIÓN
    window.nextStep = function(step) {
        if (step > 1 && !validateStep(step - 1)) return;
        document.getElementById('step-' + (step - 1)).style.display = 'none';
        document.getElementById('step-' + step).style.display = 'block';
    };

    window.prevStep = function(step) {
        document.getElementById('step-' + (step + 1)).style.display = 'none';
        document.getElementById('step-' + step).style.display = 'block';
    };

    // 3. VALIDACIÓN
    function validateStep(stepNumber) {
        const currentStepDiv = document.getElementById('step-' + stepNumber);
        const requiredFields = currentStepDiv.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (field.type === 'radio') {
                const groupName = field.name;
                const checked = currentStepDiv.querySelector(`input[name="${groupName}"]:checked`);
                if (!checked) {
                    isValid = false;
                    field.closest('.matrix-row').style.backgroundColor = '#ffe6e6';
                } else {
                    field.closest('.matrix-row').style.backgroundColor = 'transparent';
                }
            } else if (!field.value.trim()) {
                isValid = false;
                field.style.borderColor = 'red';
            } else {
                field.style.borderColor = 'var(--border-color)';
            }
        });

        if (!isValid) alert('Por favor, completá todos los campos obligatorios antes de continuar.');
        return isValid;
    }

    // 4. ENVÍO A CLOUDFLARE
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateStep(3)) return;
        if (document.getElementById('website').value !== '') return; 

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        const formData = new FormData(form);
        formData.delete('website'); 

        fetch(WORKER_URL, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if(data.result === 'success') {
                surveyTitleArea.style.display = 'none';
                form.style.display = 'none';
                successMessage.style.display = 'block';
                localStorage.setItem('encuesta_vm_respondida', 'true');
            } else {
                throw new Error(data.message || 'Error en el servidor');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Hubo un problema al enviar tus respuestas. Por favor, intenta de nuevo.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar Encuesta 🚀';
        });
    });

    // 5. BLOQUEO POR SI YA RESPONDIÓ
    if (localStorage.getItem('encuesta_vm_respondida') === 'true') {
        surveyTitleArea.style.display = 'none';
        form.style.display = 'none';
        successMessage.style.display = 'block';
    }
});
