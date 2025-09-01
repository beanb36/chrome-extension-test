(function () {
  if (document.getElementById("copper-golem")) return; //If the element found is copper-golem, return

  const golem = document.createElement("img");//Creates image element golem
  golem.src = chrome.runtime.getURL("copper-golem.gif");
  golem.id = "copper-golem";
  golem.style.position = "fixed";
  golem.style.bottom = "120px";
  golem.style.right = "-150px"; // start off-screen to the right
  golem.style.zIndex = 999999;
  golem.style.height = "180px"; 
  document.body.appendChild(golem);

  let pos = window.innerWidth;
  golem.style.left = pos + "px";

  const moveSpeed = 5;
  const moveInterval = 50; // ms
  let interval;
  let hasStolen = false;

  function startMoving() {
    golem.src = chrome.runtime.getURL("copper-golem.gif");
    hasStolen = false;
    interval = setInterval(() => {
      pos -= moveSpeed;
      golem.style.left = pos + "px";
      if (pos < -200) {
        clearInterval(interval);
        golem.remove();
      }
    }, moveInterval);

    setTimeout(() => {
      stopMovingAndWork();
    }, 9000); // Move for 9 seconds
  }

  function stopMovingAndWork() {
    clearInterval(interval);
    golem.src = chrome.runtime.getURL("copper-golem-work.gif");

    // Only steal once per cycle
    if (!hasStolen) {
      const selection = window.getSelection();
      const stolenText = selection && selection.toString().trim();
      if (stolenText) {
        // Remove text from page
        selection.deleteFromDocument();
        selection.removeAllRanges();

        // Save to storage and then continue moving
        chrome.storage.local.get({ stolen: [] }, (data) => {
          const updated = data.stolen.concat(stolenText);
          chrome.storage.local.set({ stolen: updated }, () => {
            chrome.runtime.sendMessage({ type: "stolen", text: stolenText });
            hasStolen = true;
            setTimeout(() => {
              startMoving();
            }, 2000);
          });
        });
        return; // Wait for async storage before restarting movement
      }
      hasStolen = true;
    }

    setTimeout(() => {
      startMoving();
    }, 2000); // Show work gif for 2 seconds
  }

  startMoving();
})();