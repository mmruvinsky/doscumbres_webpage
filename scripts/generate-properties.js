const fs = require('fs');
const path = require('path');

// Cargar los datos de propiedades
const propertiesData = JSON.parse(fs.readFileSync('properties.json', 'utf8'));

// Leer la plantilla de propiedades
const propertyTemplate = fs.readFileSync('property-template.html', 'utf8');
const indexTemplate = fs.readFileSync('index-template.html', 'utf8');

// Generar las páginas individuales de propiedades
propertiesData.properties.forEach(property => {
  let html = propertyTemplate;
  
  // Reemplazar datos básicos
  html = html.replace(/{{PROPERTY_TITLE}}/g, property.title || '');
  html = html.replace(/{{PROPERTY_TYPE}}/g, property.type || '');
  html = html.replace(/{{PROPERTY_PRICE}}/g, property.price ? property.price.toLocaleString() : '');
  html = html.replace(/{{PROPERTY_CURRENCY}}/g, property.currency || '');
  
  // Comprobar si la propiedad es apta para crédito
  const status = property.creditAvailable ? 
    `${property.type} - Apta para Crédito Hipotecario` : 
    property.type || '';
  html = html.replace(/{{PROPERTY_STATUS}}/g, status);
  
  // Imagen principal
  html = html.replace(/{{PROPERTY_MAIN_IMAGE}}/g, property.mainImage || '');
  
  // Descripción y detalles adicionales
  html = html.replace(/{{PROPERTY_DESCRIPTION}}/g, property.description || '');
  html = html.replace(/{{PROPERTY_ADDITIONAL_INFO}}/g, property.additionalInfo || '');
  
  // Coordenadas para el mapa
  if (property.location && property.location.coordinates) {
    html = html.replace(/{{PROPERTY_LAT}}/g, property.location.coordinates.lat || 0);
    html = html.replace(/{{PROPERTY_LNG}}/g, property.location.coordinates.lng || 0);
    html = html.replace(/{{PROPERTY_ADDRESS}}/g, property.location.address || '');
  } else {
    html = html.replace(/{{PROPERTY_LAT}}/g, 0);
    html = html.replace(/{{PROPERTY_LNG}}/g, 0);
    html = html.replace(/{{PROPERTY_ADDRESS}}/g, '');
  }
  
  // Características de la propiedad
  let featuresHTML = '';
  
  if (property.features) {
    const features = property.features;
    
    // Baños
    if (features.bathrooms) {
      featuresHTML += `<div class="property__feature"><i class='bx bx-bath'></i><span>${features.bathrooms} Baño${features.bathrooms > 1 ? 's' : ''}</span></div>\n`;
    }
    
    // Área total
    if (features.totalArea) {
      featuresHTML += `<div class="property__feature"><i class='bx bx-ruler'></i><span>${features.totalArea} m² (total)</span></div>\n`;
    }
    
    // Área cubierta
    if (features.coveredArea) {
      featuresHTML += `<div class="property__feature"><i class='bx bx-home'></i><span>${features.coveredArea} m² (cubiertos)</span></div>\n`;
    }
    
    // Área semicubierta
    if (features.semicoveredArea) {
      featuresHTML += `<div class="property__feature"><i class='bx bx-ruler'></i><span>${features.semicoveredArea} m² (semicubiertos)</span></div>\n`;
    }
    
    // Habitaciones
    if (features.bedrooms) {
      featuresHTML += `<div class="property__feature"><i class='bx bx-bed'></i><span>${features.bedrooms} Habitacion${features.bedrooms > 1 ? 'es' : ''}</span></div>\n`;
    }
    
    // Oficinas
    if (features.offices) {
      featuresHTML += `<div class="property__feature"><i class='bx bxs-briefcase-alt'></i><span>${features.offices} Oficina${features.offices > 1 ? 's' : ''}</span></div>\n`;
    }
    
    // Pileta
    if ('pool' in features) {
      featuresHTML += `<div class="property__feature"><i class='bx bx-water'></i><span>Pileta: ${features.pool ? 'Sí' : 'No'}</span></div>\n`;
    }
    
    // Cochera
    if ('garage' in features) {
      const garageText = typeof features.garage === 'boolean' 
        ? (features.garage ? 'Sí' : 'No')
        : features.garage;
      
      featuresHTML += `<div class="property__feature"><i class='bx bx-car'></i><span>Cochera: ${garageText}</span></div>\n`;
    }
    
    // Características especiales para departamentos
    if (features.departmentA || features.departmentB || features.departmentC) {
      featuresHTML += `<div class="property__feature-group">\n`;
      
      if (features.departmentA) {
        featuresHTML += `<div class="property__feature"><i class='bx bx-home'></i><span>Departamento A: ${features.departmentA}</span></div>\n`;
      }
      
      if (features.departmentB) {
        featuresHTML += `<div class="property__feature"><i class='bx bx-home'></i><span>Departamento B: ${features.departmentB}</span></div>\n`;
      }
      
      if (features.departmentC) {
        featuresHTML += `<div class="property__feature"><i class='bx bx-home'></i><span>Departamento C: ${features.departmentC}</span></div>\n`;
      }
      
      featuresHTML += `</div>\n`;
    }
    
    // Balcón
    if (features.balcony) {
      featuresHTML += `<div class="property__feature"><i class='bx bxs-cloud'></i><span>${features.balcony} Balcon${features.balcony > 1 ? 'es' : ''}</span></div>\n`;
    }
    
    // Espacio común
    if (features.commonSpace) {
      featuresHTML += `<div class="property__feature"><i class='bx bxs-group'></i><span>Espacio común</span></div>\n`;
    }
  }
  
  html = html.replace('{{PROPERTY_FEATURES}}', featuresHTML);
  
  // Generar galería de imágenes
  let imagesHTML = '';
  
  if (property.images && property.images.length > 0) {
    property.images.forEach(image => {
      imagesHTML += `
        <article class="popular__card swiper-slide">
          <img src="${image.src}" alt="" class="popular__img">
          <div class="popular__data">
            <h3 class="popular__title">
              ${image.title || ''}
            </h3>
          </div>
        </article>
      `;
    });
  }
  
  html = html.replace('{{PROPERTY_IMAGES}}', imagesHTML);
  
  // Guardar el archivo HTML
  fs.writeFileSync(`${property.id}.html`, html);
  console.log(`Archivo generado: ${property.id}.html`);
});

// Generar el index.html con las tarjetas de propiedades
let propertiesCardsHTML = '';

// Ordenar propiedades por el campo 'order' si existe
const sortedProperties = [...propertiesData.properties].sort((a, b) => {
  const orderA = a.order || 999;
  const orderB = b.order || 999;
  return orderA - orderB;
});

sortedProperties.forEach(property => {
  // Determinar si es venta o alquiler para el formato del precio
  const isRent = property.type && property.type.toLowerCase() === 'alquiler';
  const priceDisplay = isRent 
    ? `<span>•</span>Alquiler` 
    : `<span>$</span>${property.price ? property.price.toLocaleString() : '0'}`;
  
  const address = property.location && property.location.address ? property.location.address : '';
  
  propertiesCardsHTML += `
    <article class="popular__card swiper-slide">
      <img src="${property.mainImage || ''}" alt="${property.title || ''}" class="popular__img">

      <div class="popular__data">
        <h2 class="popular__price">
          ${priceDisplay}
        </h2>
        <h3 class="popular__title">
          ${property.title || ''}
        </h3>
        <p class="popular__description">
          ${address}
        </p>
        <a href="${property.id}.html" class="button">Ver Detalle</a>
      </div>
    </article>
  `;
});

// Reemplazar el marcador de posición en la plantilla
const indexHTML = indexTemplate.replace('{{PROPERTY_CARDS}}', propertiesCardsHTML);

// Guardar el nuevo index.html
fs.writeFileSync('index.html', indexHTML);
console.log('Archivo index.html generado correctamente');