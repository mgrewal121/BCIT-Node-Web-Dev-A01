const contactForm = document.getElementById('contact_form');
const formResponse = document.getElementById('form_response');

// Handle form submission
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault(); // Reload the page on form submit
  

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value
  };
  
  try {
    // POST Request
    const response = await fetch('/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      formResponse.innerHTML = `
        <div class="success-message">
          ${result.message}
        </div>
      `;
      contactForm.reset();
    } else {
      formResponse.innerHTML = `
        <div class="error-message">
          ${result.message}
        </div>
      `;
    }
  } catch (error) {
    // Note: Likely only network error will happen here
    console.error('Error submitting form:', error);
    formResponse.innerHTML = `
      <div class="error-message">
        Network error. Please check your connection and try again.
      </div>
    `;
  }
});