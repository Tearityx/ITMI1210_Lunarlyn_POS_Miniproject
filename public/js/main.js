// Auto-hide alerts after 4 seconds
document.addEventListener('DOMContentLoaded', function() {
  const alerts = document.querySelectorAll('.alert')
  alerts.forEach(a => {
    setTimeout(() => {
      a.style.transition = 'opacity 0.5s'
      a.style.opacity = '0'
      setTimeout(() => a.remove(), 500)
    }, 4000)
  })
})

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('overlay')
  if (sidebar) sidebar.classList.toggle('open')
  if (overlay) overlay.classList.toggle('show')
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar')
  const overlay = document.getElementById('overlay')
  if (sidebar) sidebar.classList.remove('open')
  if (overlay) overlay.classList.remove('show')
}
