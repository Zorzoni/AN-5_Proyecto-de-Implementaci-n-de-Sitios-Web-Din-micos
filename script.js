// ===== VARIABLES GLOBALES =====
const form = document.getElementById('foodOrderForm');
const themeToggle = document.getElementById('themeToggle');
const fileInput = document.getElementById('fotoComida');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const fileName = document.getElementById('fileName');
const fondoURLInput = document.getElementById('fondoURL');
const otraComidaCheckbox = document.querySelector('input[name="tipoComida"][value="otra"]');
const otraComidaContainer = document.getElementById('otraComidaContainer');

// Audio para envío del formulario
const successSound = new Audio('https://assets.codepen.io/1491102/success-sound.mp3');

// Tooltips para los campos (descripciones)
const tooltips = {
    'nombre': 'Introduzca su nombre completo para identificación',
    'email': 'Usaremos este email para enviarle confirmaciones de pedido',
    'telefono': 'Número de contacto para comunicaciones sobre su pedido',
    'fecha': 'Seleccione la fecha en que desea recibir su pedido',
    'pedidosDiarios': 'Cantidad de pedidos que realiza habitualmente',
    'horarioAlmuerzo': 'Franja horaria en que suele almorzar',
    'metodoDevolucion': 'Método preferido para recibir devoluciones o reembolsos',
    'anticipacion': 'Cuánto tiempo antes suele realizar sus pedidos de comida',
    'restricciones': 'Indique alergias, intolerancias o preferencias alimentarias'
};

// Contadores para animación
let submissionCounter = 0;
let visitCounter = 0;

// ===== FUNCIONES DE INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    initFormValidation();
    initThemeToggle();
    initFileUpload();
    initBackgroundChange();
    initConditionalRules();
    createTooltips();
    initCounters();
    updateResponses();
    
    // Incrementar contador de visitas
    visitCounter++;
    updateCounterDisplay();
});

// ===== VALIDACIÓN DEL FORMULARIO =====
function initFormValidation() {
    // Validación de campos en tiempo real
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Validación al perder el foco
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
        // Validación en tiempo real para algunos campos específicos
        if (input.id === 'email' || input.id === 'telefono') {
            input.addEventListener('input', () => {
                validateField(input);
            });
        }
    });
    
    // Validación al enviar el formulario
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        
        let isValid = true;
        inputs.forEach(input => {
            if (input.hasAttribute('required')) {
                const fieldValid = validateField(input);
                isValid = isValid && fieldValid;
            }
        });
        
        if (isValid) {
            simulateFormSubmission();
        } else {
            showFormError();
        }
    });
}

function validateField(input) {
    let isValid = true;
    const errorElement = document.getElementById(`${input.id}-error`);
    
    // Quitar clases previas
    input.classList.remove('error', 'success');
    
    // Campos vacíos requeridos
    if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        input.classList.add('error');
        if (errorElement) {
            errorElement.style.display = 'block';
        }
        return false;
    }
    
    // Validaciones específicas por tipo de campo
    switch(input.id) {
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                isValid = false;
                if (errorElement) {
                    errorElement.textContent = 'Por favor, introduzca un email válido.';
                    errorElement.style.display = 'block';
                }
            }
            break;
            
        case 'telefono':
            const telefonoRegex = /^\d{9,15}$/;
            if (!telefonoRegex.test(input.value)) {
                isValid = false;
                if (errorElement) {
                    errorElement.textContent = 'El teléfono debe tener entre 9 y 15 dígitos.';
                    errorElement.style.display = 'block';
                }
            }
            break;
            
        case 'fecha':
            const selectedDate = new Date(input.value);
            const today = new Date();
            if (selectedDate <= today) {
                isValid = false;
                if (errorElement) {
                    errorElement.textContent = 'La fecha debe ser posterior a hoy.';
                    errorElement.style.display = 'block';
                }
            }
            break;
    }
    
    // Radio buttons grupales
    if (input.type === 'radio' && input.checked) {
        const groupName = input.name;
        const errorElement = document.getElementById(`${groupName}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    // Mostrar estado de validación
    if (isValid) {
        if (input.value.trim()) {  // Solo marcar como éxito si tiene valor
            input.classList.add('success');
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        return true;
    } else {
        input.classList.add('error');
        return false;
    }
}

// ===== SIMULACION DE ENVÍO =====
function simulateFormSubmission() {
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    
    // Mostrar estado de carga
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Enviando...</span>';
    submitBtn.disabled = true;
    
    // Reproducir sonido (opcional)
    try {
        successSound.play();
    } catch (error) {
        console.log('Error al reproducir sonido:', error);
    }
    
    // Simular demora de red
    setTimeout(() => {
        // Mostrar éxito
        submitBtn.innerHTML = '<span class="btn-icon">✅</span><span class="btn-text">¡Enviado con éxito!</span>';
        submitBtn.style.backgroundColor = 'var(--success)';
        
        // Incrementar contador de envíos
        submissionCounter++;
        updateCounterDisplay();
        
        // Mostrar respuestas
        updateResponses();
        
        // Restaurar botón después de un tiempo
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '';
            
            // Opcional: Mostrar modal o alerta de éxito
            alert('¡Formulario enviado con éxito! Gracias por tu pedido.');
            
            // Opcional: Resetear formulario
            // form.reset();
        }, 3000);
    }, 2000);
}

function showFormError() {
    // Desplazarse al primer error
    const firstError = form.querySelector('.error');
    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
    }
    
    // Sacudir levemente el formulario para feedback visual
    form.classList.add('shake-animation');
    setTimeout(() => {
        form.classList.remove('shake-animation');
    }, 500);
}

// ===== CAMBIO DE TEMA =====
function initThemeToggle() {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        const isDarkMode = document.body.classList.contains('dark-mode');
        themeToggle.querySelector('.toggle-text').textContent = isDarkMode ? 'Modo Claro' : 'Modo Oscuro';
        
        // Guardar preferencia en localStorage
        localStorage.setItem('darkMode', isDarkMode);
    });
    
    // Recuperar preferencia guardada
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('.toggle-text').textContent = 'Modo Claro';
    }
}

// ===== CARGA DE ARCHIVOS =====
function initFileUpload() {
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        
        if (file) {
            fileName.textContent = file.name;
            
            // Validar tipo de archivo
            if (!file.type.match('image.*')) {
                alert('Por favor, seleccione una imagen.');
                fileInput.value = '';
                fileName.textContent = 'Ningún archivo seleccionado';
                imagePreview.style.display = 'none';
                return;
            }
            
            // Mostrar vista previa
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            fileName.textContent = 'Ningún archivo seleccionado';
            imagePreview.style.display = 'none';
        }
    });
}


// ===== REGLAS CONDICIONALES =====
function initConditionalRules() {
    // Mostrar campo para especifiscar otro tipo de comida
    otraComidaCheckbox.addEventListener('change', () => {
        otraComidaContainer.style.display = otraComidaCheckbox.checked ? 'block' : 'none';
    });
    
    // Actualizar respuestas al cambiar selecciones
    const pedidosDiarios = document.getElementById('pedidosDiarios');
    const horarioAlmuerzo = document.getElementsByName('horarioAlmuerzo');
    const metodoDevolucion = document.getElementsByName('metodoDevolucion');
    const anticipacion = document.getElementById('anticipacion');
    
    pedidosDiarios.addEventListener('change', updateResponses);
    anticipacion.addEventListener('change', updateResponses);
    
    horarioAlmuerzo.forEach(radio => {
        radio.addEventListener('change', updateResponses);
    });
    
    metodoDevolucion.forEach(radio => {
        radio.addEventListener('change', updateResponses);
    });
}

// ===== ACTUALIZAR RESPUESTAS =====
function updateResponses() {
    const pedidos = document.getElementById('pedidosDiarios').value;
    let horario = '';
    document.getElementsByName('horarioAlmuerzo').forEach(radio => {
        if (radio.checked) horario = radio.value;
    });
    
    let metodo = '';
    document.getElementsByName('metodoDevolucion').forEach(radio => {
        if (radio.checked) metodo = radio.value;
    });
    
    const anticipacion = document.getElementById('anticipacion').value;
    
    // Actualizar texto de respuestas
    if (pedidos) {
        document.getElementById('respuestaPedidos').textContent = `Suele realizar ${pedidos === '4+' ? '4 o más' : pedidos} pedidos al día.`;
    }
    
    if (horario) {
        document.getElementById('respuestaHorario').textContent = `Su horario de almuerzo es: ${horario}.`;
    }
    
    if (metodo) {
        let metodoDev = '';
        switch(metodo) {
            case 'efectivo': metodoDev = 'en efectivo'; break;
            case 'tarjeta': metodoDev = 'con tarjeta'; break;
            case 'transferencia': metodoDev = 'por transferencia bancaria'; break;
            case 'app': metodoDev = 'a través de aplicación móvil'; break;
        }
        document.getElementById('respuestaDevolucion').textContent = `Prefiere devoluciones ${metodoDev}.`;
    }
    
    if (anticipacion) {
        let anticipacionText = '';
        switch(anticipacion) {
            case 'inmediato': anticipacionText = 'inmediatamente (0-15 min)'; break;
            case 'corto': anticipacionText = 'con poco tiempo (15-30 min)'; break;
            case 'medio': anticipacionText = 'con tiempo medio (30-60 min)'; break;
            case 'anticipado': anticipacionText = 'con anticipación (1-2 horas)'; break;
            case 'planificado': anticipacionText = 'de forma planificada (más de 2 horas)'; break;
        }
        document.getElementById('respuestaAnticipacion').textContent = `Suele pedir su comida ${anticipacionText}.`;
    }
}

// ===== TOOLTIPS =====
function createTooltips() {
    for (const fieldId in tooltips) {
        const field = document.getElementById(fieldId);
        const fieldLabel = field ? field.closest('.form-group').querySelector('label') : null;
        
        if (fieldLabel) {
            // Crear elemento tooltip
            const tooltipSpan = document.createElement('span');
            tooltipSpan.className = 'tooltip-icon';
            tooltipSpan.innerHTML = ' ℹ️';
            tooltipSpan.title = tooltips[fieldId];
            
            // Añadir tooltip al label
            fieldLabel.appendChild(tooltipSpan);
            
            // Añadir estilos para tooltips
            const style = document.createElement('style');
            style.textContent = `
                .tooltip-icon {
                    cursor: help;
                    position: relative;
                    font-size: 14px;
                }
                
                .tooltip-icon:hover::after {
                    content: attr(title);
                    position: absolute;
                    left: 24px;
                    top: -2px;
                    min-width: 150px;
                    border: 1px solid var(--gray-medium);
                    border-radius: var(--border-radius-sm);
                    padding: 5px;
                    background-color: var(--white);
                    color: var(--black);
                    font-size: 12px;
                    z-index: 1;
                    animation: fadeIn 0.3s;
                }
                
                body.dark-mode .tooltip-icon:hover::after {
                    background-color: var(--dark-container);
                    color: var(--dark-text);
                    border-color: var(--dark-border);
                }
                
                @keyframes shake-animation {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                
                .shake-animation {
                    animation: shake-animation 0.5s;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// ===== CONTADORES =====
function initCounters() {
    // Crear elemento para mostrar contador
    const counterContainer = document.createElement('div');
    counterContainer.className = 'counter-container';
    counterContainer.innerHTML = `
        <div class="visit-counter">Visitas: <span id="visit-count">0</span></div>
        <div class="submission-counter">Envíos: <span id="submission-count">0</span></div>
    `;
    
    // Añadir al DOM
    document.querySelector('.container').appendChild(counterContainer);
    
    // Añadir estilos
    const style = document.createElement('style');
    style.textContent = `
        .counter-container {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed var(--gray-medium);
            font-size: 14px;
            color: var(--gray-dark);
        }
        
        body.dark-mode .counter-container {
            color: var(--gray-medium);
            border-top-color: var(--dark-border);
        }
        
        .visit-counter, .submission-counter {
            padding: 5px 10px;
            border-radius: var(--border-radius-sm);
            background-color: var(--gray-light);
        }
        
        body.dark-mode .visit-counter,
        body.dark-mode .submission-counter {
            background-color: var(--dark-input);
        }
        
        #visit-count, #submission-count {
            font-weight: bold;
            color: var(--primary);
        }
    `;
    document.head.appendChild(style);
    
    // Recuperar contadores de localStorage
    const savedVisits = parseInt(localStorage.getItem('visitCounter') || '0');
    const savedSubmissions = parseInt(localStorage.getItem('submissionCounter') || '0');
    
    visitCounter = savedVisits + 1; // Incrementar en esta visita
    submissionCounter = savedSubmissions;
    
    // Guardar en localStorage
    localStorage.setItem('visitCounter', visitCounter);
    
    updateCounterDisplay();
}

function updateCounterDisplay() {
    document.getElementById('visit-count').textContent = visitCounter;
    document.getElementById('submission-count').textContent = submissionCounter;
    
    // Guardar contador de envíos en localStorage
    localStorage.setItem('submissionCounter', submissionCounter);
}