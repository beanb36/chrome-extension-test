document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("textbox-container");
  const addBtn = document.getElementById("addTextbox");
  const deleteSwitch = document.getElementById("deleteOnSteal");

  // Restore switch state
  chrome.storage.local.get({ deleteOnSteal: false }, (data) => {
    deleteSwitch.checked = data.deleteOnSteal;
  });

  // Save switch state on change
  deleteSwitch.addEventListener("change", () => {
    chrome.storage.local.set({ deleteOnSteal: deleteSwitch.checked });
  });

  function renderStolen() {
    chrome.storage.local.get({ stolen: [] }, (data) => {
      container.innerHTML = "";
      data.stolen.forEach((text, idx) => {
        const wrapper = document.createElement("div");
        wrapper.className = "textbox-wrapper";
        wrapper.innerHTML = `
          <input class="textbox" type="text" value="${text}" readonly>
          <button class="delete-btn" title="Delete">&times;</button>
        `;
        wrapper.querySelector(".delete-btn").onclick = () => {
          data.stolen.splice(idx, 1);
          chrome.storage.local.set({ stolen: data.stolen }, renderStolen);
        };
        container.appendChild(wrapper);
      });
    });
  }

  addBtn.onclick = () => {
    const wrapper = document.createElement("div");
    wrapper.className = "textbox-wrapper";
    wrapper.innerHTML = `
      <input class="textbox" type="text" value="">
      <button class="delete-btn" title="Delete">&times;</button>
    `;
    wrapper.querySelector(".delete-btn").onclick = () => {
      wrapper.remove();
    };
    container.appendChild(wrapper);
  };

  // Listen for stolen text messages
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "stolen") {
      renderStolen();
    }
  });

  renderStolen();
});