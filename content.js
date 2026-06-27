function initExtension() {
  if (document.getElementById('htx-floating-critter')) return;

  const container = document.createElement('div');
  container.id = 'htx-floating-critter';
  container.innerHTML = `
    <div id="status-text">INITIALIZING...</div>
    <div class="face-container">
      <div class="eyes-wrapper">
        <div id="left-eye" class="eye"><div class="pupil"></div></div>
        <div id="right-eye" class="eye"><div class="pupil"></div></div>
      </div>
      <div id="critter-mouth" class="critter-mouth"></div>
    </div>
  `;
  
  (document.body || document.documentElement).appendChild(container);

  const pupils = container.querySelectorAll('.pupil');
  const leftEye = container.querySelector('#left-eye');
  const rightEye = container.querySelector('#right-eye');
  const statusText = container.querySelector('#status-text');
  const critterMouth = container.querySelector('#critter-mouth');

  let mouseX = 0, mouseY = 0;
  let currentX = new Array(0, 0);
  let currentY = new Array(0, 0); 

  // Eye tracking engine
  function animatePupils() {
    pupils.forEach((pupil, index) => {
      const rect = pupil.parentElement.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;

      const angle = Math.atan2(mouseX - eyeX, mouseY - eyeY);
      const distance = Math.min(6, Math.hypot(mouseX - eyeX, mouseY - eyeY) / 15);

      const targetX = Math.sin(angle) * distance;
      const targetY = Math.cos(angle) * distance;

      currentX[index] += (targetX - currentX[index]) * 0.08;
      currentY[index] += (targetY - currentY[index]) * 0.08;

      pupil.style.transform = `translate(${currentX[index]}px, ${currentY[index]}px)`;
    });
    requestAnimationFrame(animatePupils);
  }
  animatePupils();

  // Smart dodge mechanics
  let hoverTimer = null;
  let isDodging = false;
  
  const dodgePaths = [
    { x: '0px', y: '120px' },     
    { x: '-120px', y: '0px' },    
    { x: '-100px', y: '100px' },  
    { x: '-50px', y: '150px' }    
  ];

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const rect = container.getBoundingClientRect();
    const isNearX = mouseX > (rect.left - 40) && mouseX < (rect.right + 40);
    const isNearY = mouseY > (rect.top - 40) && mouseY < (rect.bottom + 40);

    if (isNearX && isNearY) {
      if (!hoverTimer && !isDodging) {
        hoverTimer = setTimeout(() => {
          const randomPath = dodgePaths[Math.floor(Math.random() * dodgePaths.length)];
          container.style.setProperty('--dodge-x', randomPath.x);
          container.style.setProperty('--dodge-y', randomPath.y);
          container.classList.add('zooop-dodge');
          isDodging = true;
        }, 500); 
      }
    } else {
      if (hoverTimer && !isDodging) {
        clearTimeout(hoverTimer);
        hoverTimer = null;
      }
    }

    if (isDodging) {
      const windowWidth = window.innerWidth;
      const escapeZoneClear = mouseX < (windowWidth - 250) || mouseY > 250;
      if (escapeZoneClear) {
        container.classList.remove('zooop-dodge');
        isDodging = false;
        hoverTimer = null;
      }
    }
  });

  // REALTIME CONNECTION WATCHER
  function evaluateNetworkSpeed() {
    // If browser says we are completely offline, trigger frustration instantly
    if (!navigator.onLine) {
      setFrustrated();
      return;
    }

    const perf = window.performance.timing;
    // Calculate page load latency overhead duration
    const speedDelta = Date.now() - perf.navigationStart;

    if (document.readyState !== "complete") {
      if (speedDelta > 2000) {
        setWaiting(); // Stays in blue waiting mode if lagging past 2 seconds
      } else {
        // Initial quick load processing placeholder
        setWaiting(); 
      }
    } else {
      // If fully loaded, check total time spent
      const totalLoadTime = perf.loadEventEnd - perf.navigationStart;
      if (totalLoadTime > 4000) {
        setFrustrated(); // Mad because it took way too long to finish
      } else {
        setHappy(); // Fast loading performance
      }
    }
  }

  // Monitor loading process intervals
  const trackingInterval = setInterval(() => {
    evaluateNetworkSpeed();
    if (document.readyState === "complete") {
      clearInterval(trackingInterval);
      // Run final check to set status profile
      evaluateNetworkSpeed(); 
    }
  }, 300);

  // Fallback structural safety event hooks
  window.addEventListener('load', evaluateNetworkSpeed);
  window.addEventListener('offline', setFrustrated);

  // Mouth Reveal Engine: 2 minutes countdown handler
  setTimeout(() => {
    critterMouth.classList.add('reveal');
  }, 120000);

  function setHappy() {
    statusText.innerText = "SYSTEM_OPTIMAL // 100%";
    statusText.style.color = "#00ffcc";
    leftEye.className = "eye happy";
    rightEye.className = "eye happy";
    critterMouth.className = "critter-mouth happy-smile";
    if (critterMouth.classList.contains('reveal')) critterMouth.classList.add('reveal');
    setTimeout(() => { if(!isDodging) container.style.opacity = '0.3'; }, 4000);
  }

  function setWaiting() {
    container.style.opacity = '1';
    statusText.innerText = "LOADING_SEQUENCE...";
    statusText.style.color = "#00a2ff";
    leftEye.className = "eye waiting";
    rightEye.className = "eye waiting";
    critterMouth.className = "critter-mouth waiting-straight";
    if (critterMouth.classList.contains('reveal')) critterMouth.classList.add('reveal');
  }

  function setFrustrated() {
    container.style.opacity = '1';
    statusText.innerText = "LATENCY_CRITICAL // ERR";
    statusText.style.color = "#ff3366";
    leftEye.className = "eye frustrated";
    rightEye.className = "eye frustrated";
    critterMouth.className = "critter-mouth frustrated-sad";
    if (critterMouth.classList.contains('reveal')) critterMouth.classList.add('reveal');
  }

  container.addEventListener('mouseenter', () => container.style.opacity = '1');
  container.addEventListener('mouseleave', () => {
    if (document.readyState === "complete" && !isDodging) container.style.opacity = '0.3';
  });
}

if (document.body) {
  initExtension();
} else {
  document.addEventListener('DOMContentLoaded', initExtension);
}
