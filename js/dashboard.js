// Verificar autenticación
if (localStorage.getItem('nexus_admin_logged') !== 'true') {
    window.location.href = 'login.html';
}

// Variables globales
let projects = [];
let quotes = [];
let draftQuotes = []; // Borradores de cotizaciones
let contacts = [];

// Tasas de cambio
const exchangeRates = {
    USD: 1,
    EUR: 0.92,
    HNL: 24.85
};

// Cargar datos
function loadData() {
    projects = JSON.parse(localStorage.getItem('nexus_projects') || '[]');
    quotes = JSON.parse(localStorage.getItem('nexus_quotes') || '[]');
    draftQuotes = JSON.parse(localStorage.getItem('nexus_draft_quotes') || '[]');
    contacts = JSON.parse(localStorage.getItem('nexus_contacts') || '[]');
    
    renderProjectsTable();
    renderDraftsTable();
    updateStats();
}

// Renderizar tabla de proyectos
function renderProjectsTable() {
    const tbody = document.getElementById('projectsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = projects.map(project => `
        <tr>
            <td>${project.id}</td>
            <td><img src="${project.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"></td>
            <td>${escapeHtml(project.title)}</td>
            <td>${escapeHtml(project.description.substring(0, 60))}...</td>
            <td>
                <button class="btn-edit" onclick="editProject(${project.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="deleteProject(${project.id})"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// Renderizar tabla de borradores
function renderDraftsTable() {
    const tbody = document.getElementById('draftsTableBody');
    if (!tbody) return;
    
    if (draftQuotes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay cotizaciones en borrador</td></tr>';
        return;
    }
    
    tbody.innerHTML = draftQuotes.map(quote => {
        const total = (quote.unitPrice * quote.quantity * exchangeRates[quote.currency]).toFixed(2);
        const symbol = quote.currency === 'USD' ? '$' : (quote.currency === 'EUR' ? '€' : 'L');
        return `
            <tr>
                <td>${quote.id}</td>
                <td>${escapeHtml(quote.client || 'Sin cliente')}</td>
                <td>${escapeHtml(quote.serviceName)}</td>
                <td>${quote.quantity}</td>
                <td>${symbol} ${total}</td>
                <td><span class="quote-status status-draft">Borrador</span></td>
                <td>
                    <button class="btn-edit-draft" onclick="editDraft(${quote.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-pdf" onclick="generatePDFFromDraft(${quote.id})"><i class="fas fa-file-pdf"></i></button>
                    <button class="btn-delete" onclick="deleteDraft(${quote.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

// Guardar borrador
function saveDraft(quoteData) {
    const newId = Date.now();
    const draft = {
        id: newId,
        ...quoteData,
        createdAt: new Date().toISOString()
    };
    draftQuotes.push(draft);
    localStorage.setItem('nexus_draft_quotes', JSON.stringify(draftQuotes));
    loadData(); // Recargar
    return draft;
}

// Actualizar borrador
function updateDraft(id, updatedData) {
    const index = draftQuotes.findIndex(q => q.id == id);
    if (index !== -1) {
        draftQuotes[index] = { ...draftQuotes[index], ...updatedData };
        localStorage.setItem('nexus_draft_quotes', JSON.stringify(draftQuotes));
        loadData();
        return true;
    }
    return false;
}

// Eliminar borrador
window.deleteDraft = (id) => {
    if (confirm('¿Eliminar esta cotización borrador?')) {
        draftQuotes = draftQuotes.filter(q => q.id != id);
        localStorage.setItem('nexus_draft_quotes', JSON.stringify(draftQuotes));
        loadData();
    }
};

// Editar borrador
window.editDraft = (id) => {
    const draft = draftQuotes.find(q => q.id == id);
    if (draft) {
        document.getElementById('editDraftId').value = draft.id;
        document.getElementById('editServiceName').value = draft.serviceName;
        document.getElementById('editUnitPrice').value = draft.unitPrice;
        document.getElementById('editQuantity').value = draft.quantity;
        document.getElementById('editCurrency').value = draft.currency;
        document.getElementById('editDescription').value = draft.description || '';
        document.getElementById('editClient').value = draft.client || '';
        document.getElementById('editClientEmail').value = draft.clientEmail || '';
        document.getElementById('editDraftModal').style.display = 'flex';
    }
};

// Generar PDF desde borrador
window.generatePDFFromDraft = async (id) => {
    const draft = draftQuotes.find(q => q.id == id);
    if (draft) {
        await generatePDF(draft);
    }
};

// Generar PDF
async function generatePDF(quoteData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const total = (quoteData.unitPrice * quoteData.quantity * exchangeRates[quoteData.currency]).toFixed(2);
    const symbol = quoteData.currency === 'USD' ? '$' : (quoteData.currency === 'EUR' ? '€' : 'L');
    
    // Diseño del PDF
    doc.setFillColor(10, 37, 64);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('NEXUS MARKETING', 20, 25);
    
    doc.setTextColor(0, 210, 127);
    doc.setFontSize(12);
    doc.text('Cotización Oficial', 20, 35);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 150, 20);
    doc.text(`Cotización #: ${quoteData.id}`, 150, 28);
    
    // Información del cliente
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Información del Cliente:', 20, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Nombre: ${quoteData.client || 'No especificado'}`, 20, 70);
    doc.text(`Email: ${quoteData.clientEmail || 'No especificado'}`, 20, 78);
    
    // Detalles del servicio
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Servicio:', 20, 95);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Servicio: ${quoteData.serviceName}`, 20, 105);
    doc.text(`Cantidad: ${quoteData.quantity}`, 20, 113);
    doc.text(`Precio unitario: ${symbol} ${quoteData.unitPrice}`, 20, 121);
    doc.text(`Moneda: ${quoteData.currency}`, 20, 129);
    
    if (quoteData.description) {
        doc.text(`Descripción: ${quoteData.description}`, 20, 137);
    }
    
    // Total
    doc.setFillColor(0, 210, 127);
    doc.rect(20, 155, 170, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL: ${symbol} ${total}`, 20, 166);
    
    // Términos
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('* Esta cotización es válida por 30 días.', 20, 190);
    doc.text('* Para más información contacte a ventas@nexusmarketing.com', 20, 198);
    
    // Guardar PDF
    doc.save(`cotizacion_${quoteData.id}.pdf`);
}

// Estadísticas
function updateStats() {
    const statsGrid = document.getElementById('statsGrid');
    if (statsGrid) {
        statsGrid.innerHTML = `
            <div class="stat-card"><i class="fas fa-tasks"></i><h3>${projects.length}</h3><p>Proyectos</p></div>
            <div class="stat-card"><i class="fas fa-file-invoice-dollar"></i><h3>${quotes.length}</h3><p>Cotizaciones Finalizadas</p></div>
            <div class="stat-card"><i class="fas fa-pencil-alt"></i><h3>${draftQuotes.length}</h3><p>Borradores</p></div>
            <div class="stat-card"><i class="fas fa-envelope"></i><h3>${contacts.length}</h3><p>Contactos</p></div>
        `;
    }
}

// Agregar/Editar proyecto
let editingId = null;
const modal = document.getElementById('projectModal');
const addBtn = document.getElementById('addProjectBtn');
const closeModal = document.getElementById('closeModal');
const projectForm = document.getElementById('projectForm');

if (addBtn) {
    addBtn.addEventListener('click', () => {
        editingId = null;
        document.getElementById('modalTitle').textContent = 'Agregar Proyecto';
        document.getElementById('projectForm').reset();
        document.getElementById('projectId').value = '';
        modal.style.display = 'flex';
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

window.editProject = (id) => {
    const project = projects.find(p => p.id === id);
    if (project) {
        editingId = id;
        document.getElementById('modalTitle').textContent = 'Editar Proyecto';
        document.getElementById('projectId').value = project.id;
        document.getElementById('projectTitle').value = project.title;
        document.getElementById('projectDesc').value = project.description;
        document.getElementById('projectImage').value = project.image;
        modal.style.display = 'flex';
    }
};

window.deleteProject = (id) => {
    if (confirm('¿Eliminar este proyecto permanentemente?')) {
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem('nexus_projects', JSON.stringify(projects));
        loadData();
    }
};

if (projectForm) {
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('projectId').value;
        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDesc').value;
        const image = document.getElementById('projectImage').value;
        
        if (id) {
            const index = projects.findIndex(p => p.id == id);
            if (index !== -1) {
                projects[index] = { ...projects[index], title, description, image };
            }
        } else {
            const newId = Date.now();
            projects.push({ id: newId, title, description, image });
        }
        
        localStorage.setItem('nexus_projects', JSON.stringify(projects));
        modal.style.display = 'none';
        loadData();
    });
}

// Manejar el formulario de cotización
const quoteForm = document.getElementById('quoteGeneratorForm');
const saveQuoteBtn = document.getElementById('saveQuoteBtn');
const generatePDFBtn = document.getElementById('generatePDFBtn');

if (saveQuoteBtn) {
    saveQuoteBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const serviceName = document.getElementById('quoteServiceName').value;
        const unitPrice = parseFloat(document.getElementById('quoteUnitPrice').value);
        const quantity = parseInt(document.getElementById('quoteQuantity').value);
        const currency = document.getElementById('quoteCurrency').value;
        const description = document.getElementById('quoteDescription').value;
        const client = document.getElementById('quoteClient').value;
        const clientEmail = document.getElementById('quoteClientEmail').value;
        
        if (!serviceName || !unitPrice || !quantity) {
            alert('Por favor completa los campos requeridos');
            return;
        }
        
        const quoteData = {
            serviceName,
            unitPrice,
            quantity,
            currency,
            description,
            client,
            clientEmail
        };
        
        saveDraft(quoteData);
        alert('Cotización guardada como borrador');
        
        // Limpiar formulario
        document.getElementById('quoteGeneratorForm').reset();
        document.getElementById('quoteQuantity').value = 1;
    });
}

if (generatePDFBtn) {
    generatePDFBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const serviceName = document.getElementById('quoteServiceName').value;
        const unitPrice = parseFloat(document.getElementById('quoteUnitPrice').value);
        const quantity = parseInt(document.getElementById('quoteQuantity').value);
        const currency = document.getElementById('quoteCurrency').value;
        const description = document.getElementById('quoteDescription').value;
        const client = document.getElementById('quoteClient').value;
        const clientEmail = document.getElementById('quoteClientEmail').value;
        
        if (!serviceName || !unitPrice || !quantity) {
            alert('Por favor completa los campos requeridos');
            return;
        }
        
        const quoteData = {
            id: Date.now(),
            serviceName,
            unitPrice,
            quantity,
            currency,
            description,
            client,
            clientEmail
        };
        
        await generatePDF(quoteData);
        
        // Opcional: guardar también como cotización finalizada
        const finalizedQuote = {
            ...quoteData,
            total: (unitPrice * quantity * exchangeRates[currency]).toFixed(2),
            date: new Date().toISOString()
        };
        quotes.push(finalizedQuote);
        localStorage.setItem('nexus_quotes', JSON.stringify(quotes));
        
        alert('PDF generado y cotización guardada');
    });
}

// Manejar edición de borrador
const editDraftForm = document.getElementById('editDraftForm');
const closeEditModal = document.getElementById('closeEditModal');

if (editDraftForm) {
    editDraftForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('editDraftId').value);
        const serviceName = document.getElementById('editServiceName').value;
        const unitPrice = parseFloat(document.getElementById('editUnitPrice').value);
        const quantity = parseInt(document.getElementById('editQuantity').value);
        const currency = document.getElementById('editCurrency').value;
        const description = document.getElementById('editDescription').value;
        const client = document.getElementById('editClient').value;
        const clientEmail = document.getElementById('editClientEmail').value;
        
        if (!serviceName || !unitPrice || !quantity) {
            alert('Por favor completa los campos requeridos');
            return;
        }
        
        updateDraft(id, {
            serviceName,
            unitPrice,
            quantity,
            currency,
            description,
            client,
            clientEmail
        });
        
        document.getElementById('editDraftModal').style.display = 'none';
        alert('Borrador actualizado');
    });
}

if (closeEditModal) {
    closeEditModal.addEventListener('click', () => {
        document.getElementById('editDraftModal').style.display = 'none';
    });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('nexus_admin_logged');
        window.location.href = 'login.html';
    });
}

// Cerrar modales al hacer clic fuera
window.onclick = function(event) {
    const projectModal = document.getElementById('projectModal');
    const editModal = document.getElementById('editDraftModal');
    if (event.target === projectModal) {
        projectModal.style.display = 'none';
    }
    if (event.target === editModal) {
        editModal.style.display = 'none';
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Inicializar
loadData();