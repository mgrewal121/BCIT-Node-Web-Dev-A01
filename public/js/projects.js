// Fetch and display all projects
async function loadProjects() {
  try {
    const response = await fetch('/api/projects');
    
    if (!response.ok) {
      throw new Error('Failed to fetch projects');
    }
    
    const projects = await response.json();
    renderProjects(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
    document.getElementById('projects-container').innerHTML = 
      '<p class="error-message">Failed to load projects. Please try again later.</p>';
  }
}

// Render project cards to the grid
function renderProjects(projects) {
  const container = document.getElementById('projects-container');
  
  if (projects.length === 0) {
    container.innerHTML = '<p>No projects found.</p>';
    return;
  }
  
  container.innerHTML = projects.map(project => `
    <div class="project-card" onclick="loadProjectDetails('${project.id}')">
      <h3>${project.title}</h3>
      <p>${project.tagline}</p>
      <div class="tags">
        ${project.stack.map(tech => `<span class="tag">${tech}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// Load and display project details
async function loadProjectDetails(projectId) {
  try {
    const response = await fetch(`/api/projects/${projectId}`);
    
    if (!response.ok) {
      throw new Error('Project not found');
    }
    
    const project = await response.json();
    renderProjectDetails(project);
  } catch (error) {
    console.error('Error loading project details:', error);
    alert('Failed to load project details. Please try again.');
  }
}

// CHATGPT: Render project details view
function renderProjectDetails(project) {
  const detailsContent = document.getElementById('details-content');
  const detailsSection = document.getElementById('project-details');
  const projectsContainer = document.getElementById('projects-container');
  
  detailsContent.innerHTML = `
    <h2>${project.title}</h2>
    <p><strong>${project.tagline}</strong></p>
    <p>${project.description}</p>
    
    <h3>Tech Stack</h3>
    <div class="tags">
      ${project.stack.map(tech => `<span class="tag">${tech}</span>`).join('')}
    </div>
    
    <h3>Tags</h3>
    <div class="tags">
      ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
    
    <h3>Images</h3>
    ${project.images.map(img => `
      <div style="margin-bottom: 1.5rem;">
        <img src="${img.path}" alt="${img.alt}" style="max-width: 100%; border-radius: 8px;">
        <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">${img.alt}</p>
      </div>
    `).join('')}
    
    <p style="margin-top: 1.5rem; color: #666; font-size: 0.9rem;">
      Created: ${project.dates.created} | Updated: ${project.dates.updated}
    </p>
  `;
  
  // Show details, hide projects grid
  projectsContainer.style.display = 'none';
  detailsSection.style.display = 'block';
}

// Close details and return to project list
function closeDetails() {
  const detailsSection = document.getElementById('project-details');
  const projectsContainer = document.getElementById('projects-container');
  
  detailsSection.style.display = 'none';
  projectsContainer.style.display = 'grid';
}

// Set up close button event listener
document.getElementById('close-details').addEventListener('click', closeDetails);

// Load projects when page loads
loadProjects();