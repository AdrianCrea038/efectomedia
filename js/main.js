// Inicializar AOS
AOS.init({
    duration: 800,
    once: true,
    offset: 100
});

// ========== NAVBAR SCROLL EFFECT ==========
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (header) {
        if (window.scrollY > 50) {
            header.style.background = 'rgba(255,255,255,0.98)';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'rgba(255,255,255,0.95)';
            header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
        }
    }
});

// ========== HAMBURGER MENU ==========
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Cerrar menú al hacer click en un enlace
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ========== PROYECTOS DINÁMICOS ==========
let projectsData = [];

// Cargar proyectos desde localStorage o usar datos por defecto
function loadProjects() {
    const stored = localStorage.getItem('nexus_projects');
    if (stored) {
        projectsData = JSON.parse(stored);
    } else {
        // Datos iniciales
        projectsData = [
            {
                id: 1,
                title: "E-commerce Revolution",
                description: "Aumento de ventas del 320% para tienda online de moda.",
                image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
            },
            {
                id: 2,
                title: "Branding Corporativo",
                description: "Rediseño de identidad para empresa tecnológica líder.",
                image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop"
            },
            {
                id: 3,
                title: "Campaña Viral TikTok",
                description: "+2M de reproducciones en menos de 30 días.",
                image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&h=400&fit=crop"
            }
        ];
        saveProjects();
    }
    renderProjects();
}

function saveProjects() {
    localStorage.setItem('nexus_projects', JSON.stringify(projectsData));
}

function renderProjects() {
    const container = document.getElementById('projectsContainer');
    if (!container) {
        console.log('No se encontró projectsContainer');
        return;
    }

    if (projectsData.length === 0) {
        container.innerHTML = '<p style="text-align: center;">No hay proyectos disponibles</p>';
        return;
    }

    container.innerHTML = projectsData.map(project => `
        <div class="project-card" data-aos="fade-up">
            <div class="project-image" style="background-image: url('${project.image}')">
                <div class="project-overlay">
                    <i class="fas fa-search-plus" style="color: white; font-size: 2rem;"></i>
                </div>
            </div>
            <div class="project-info">
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.description.substring(0, 100))}${project.description.length > 100 ? '...' : ''}</p>
            </div>
        </div>
    `).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== FORMULARIO DE CONTACTO ==========
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contactName');
        const email = document.getElementById('contactEmail');
        const message = document.getElementById('contactMessage');
        
        if (!name || !email || !message) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        const nameValue = name.value;
        const emailValue = email.value;
        const messageValue = message.value;
        
        if (!nameValue || !emailValue || !messageValue) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        // Guardar mensaje de contacto
        const contacts = JSON.parse(localStorage.getItem('nexus_contacts') || '[]');
        contacts.push({
            id: Date.now(),
            name: nameValue,
            email: emailValue,
            message: messageValue,
            date: new Date().toISOString()
        });
        localStorage.setItem('nexus_contacts', JSON.stringify(contacts));
        
        alert('¡Mensaje enviado! Nos pondremos en contacto contigo pronto.');
        contactForm.reset();
    });
}

// Newsletter
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector('input');
        if (input) {
            alert(`¡Gracias por suscribirte con ${input.value}! Recibirás nuestras novedades.`);
            newsletterForm.reset();
        }
    });
}

// ========== ANIMACIONES SCROLL ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.about-card, .project-card, .contact-form').forEach(el => {
    if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    }
});

// Escuchar cambios en localStorage para actualizar proyectos automáticamente
window.addEventListener('storage', (e) => {
    if (e.key === 'nexus_projects') {
        loadProjects();
    }
});

// Inicializar al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
});