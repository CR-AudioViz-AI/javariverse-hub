// Javari AI Widget Embed Script
// Add this to any website: <script src="https://craudiovizai.com/javari-widget.js"></script>

(function() {
  const WIDGET_URL = "https://craudiovizai.com";
  
  // Create widget container
  const container = document.createElement("div");
  container.id = "javari-widget-container";
  document.body.appendChild(container);

  // Create iframe for widget
  const iframe = document.createElement("iframe");
  iframe.id = "javari-widget-iframe";
  iframe.src = WIDGET_URL + "/embed/javari-widget";
  iframe.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    border: none;
    border-radius: 30px;
    z-index: 999999;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  container.appendChild(iframe);

  // Handle messages from iframe
  window.addEventListener("message", function(event) {
    if (event.origin !== WIDGET_URL) return;
    
    const { type, data } = event.data;
    
    if (type === "javari-resize") {
      iframe.style.width = data.width;
      iframe.style.height = data.height;
      iframe.style.borderRadius = data.isOpen ? "16px" : "30px";
    }
    
    if (type === "javari-create-ticket") {
      window.open(WIDGET_URL + "/dashboard/tickets/new", "_blank");
    }
  });
})();
