function showAlert(message, type = 'danger') {
  const alertPlaceholder = document.getElementById('alert-placeholder');
  alertPlaceholder.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show mt-3" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}
