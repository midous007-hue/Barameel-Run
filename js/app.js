(() => {
  const art = document.getElementById('screenArt');
  const tap = document.getElementById('tapLayer');
  const toast = document.getElementById('toast');
  const characterModal = document.getElementById('characterModal');
  const characterGrid = document.getElementById('characterGrid');
  const characterChoose = document.getElementById('characterChoose');
  const characterOverlay = document.getElementById('characterOverlay');
  const cameraLayer = document.getElementById('cameraLayer');
  const camera = document.getElementById('camera');
  const demoScan = document.getElementById('demoScan');
  const closeCamera = document.getElementById('closeCamera');
  const stage = document.getElementById('stage');

  const screens = Array.from({length:12}, (_,i)=>`assets/screens/screen-${String(i+1).padStart(2,'0')}.jpg`);
  const chars = [
    ['rookie','THE ROOKIE'],['skater','THE SKATER'],['brona','BRONA'],
    ['racer','THE RACER'],['chiller','THE CHILLER'],['dreamer','THE DREAMER']
  ];
  const state = {
    screen: Number(localStorage.getItem('barameelRunScreen') || 1),
    character: localStorage.getItem('barameelRunCharacter') || 'brona',
    points: Number(localStorage.getItem('barameelRunPoints') || 0),
    marks: Number(localStorage.getItem('barameelRunMarks') || 0),
    lastCheckpoint: Number(localStorage.getItem('barameelRunLastCheckpoint') || 0)
  };
  const COOLDOWN = 24*60*60*1000;
  const REWARD = 100000;
  const MARK_RATE = 1000;
  const audio = {};
  ['select','click','scan','reward','error','whoosh'].forEach(n => audio[n] = new Audio(`assets/audio/${n}.wav`));
  audio.ambient = new Audio('assets/audio/run-ambient-loop.wav');
  audio.ambient.loop = true; audio.ambient.volume = .18;
  Object.values(audio).forEach(a => { try { a.preload='auto'; } catch(e){} });

  function sfx(name){ try{ const a=audio[name]; if(!a)return; a.currentTime=0; a.volume=name==='reward'?0.8:.65; a.play().catch(()=>{});}catch(e){} }
  function speak(text){ try{ if('speechSynthesis' in window){ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.rate=.86; u.pitch=.8; u.volume=.75; speechSynthesis.speak(u); } }catch(e){} }
  function startAmbient(){ try{audio.ambient.play().catch(()=>{});}catch(e){} }
  function save(){
    localStorage.setItem('barameelRunScreen',state.screen);
    localStorage.setItem('barameelRunCharacter',state.character);
    localStorage.setItem('barameelRunPoints',state.points);
    localStorage.setItem('barameelRunMarks',state.marks);
    localStorage.setItem('barameelRunLastCheckpoint',state.lastCheckpoint);
  }
  function toastMsg(msg,ms=1700){toast.textContent=msg;toast.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove('show'),ms)}
  function go(n,{sound='whoosh',saveState=true}={}){
    n=Math.max(1,Math.min(12,n));
    if(sound)sfx(sound);
    art.classList.add('transition');
    setTimeout(()=>{
      art.src=screens[n-1];
      art.onload=()=>art.classList.remove('transition');
    },80);
    state.screen=n;
    if(saveState)save();
    updateOverlay();
  }
  function updateOverlay(){
    characterOverlay.classList.add('hidden');
    characterOverlay.innerHTML='';
    if(state.screen===3 || state.screen===4){
      const img=document.createElement('img');
      img.src=`assets/characters/${state.character}.png`;
      img.alt=state.character;
      characterOverlay.appendChild(img);
      characterOverlay.classList.remove('hidden');
    }
  }
  function openCharacterPicker(){
    characterGrid.innerHTML='';
    chars.forEach(([id,label])=>{
      const b=document.createElement('button'); b.className='character-card'+(state.character===id?' selected':'');
      b.innerHTML=`<img src="assets/characters/${id}.png" alt="${label}"><span>${label}</span>`;
      b.onclick=()=>{state.character=id; sfx('select'); document.querySelectorAll('.character-card').forEach(x=>x.classList.remove('selected')); b.classList.add('selected');};
      characterGrid.appendChild(b);
    });
    characterModal.classList.remove('hidden');
  }
  characterChoose.onclick=()=>{ characterModal.classList.add('hidden'); save(); sfx('click'); go(3); speak(state.character==='brona'?'Brona':'Runner selected'); };

  async function openScanner(){
    cameraLayer.classList.remove('hidden'); sfx('click'); startAmbient();
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
      camera.srcObject=stream;
      if('BarcodeDetector' in window){
        const detector=new BarcodeDetector({formats:['qr_code']});
        const loop=async()=>{
          if(cameraLayer.classList.contains('hidden')) return;
          try{
            const codes=await detector.detect(camera);
            if(codes.some(c=>String(c.rawValue||'').includes('BARAMEEL-RUN'))){ handleScan(); return; }
          }catch(e){}
          requestAnimationFrame(loop);
        }; loop();
      }
    }catch(e){ toastMsg('CAMERA UNAVAILABLE — USE DEMO SCAN'); }
  }
  function closeScanner(){
    const stream=camera.srcObject; if(stream) stream.getTracks().forEach(t=>t.stop()); camera.srcObject=null; cameraLayer.classList.add('hidden');
  }
  function handleScan(){
    closeScanner(); sfx('scan');
    setTimeout(()=>{
      const elapsed=Date.now()-state.lastCheckpoint;
      if(state.lastCheckpoint && elapsed < COOLDOWN){ sfx('error'); go(11); toastMsg('ALREADY COLLECTED'); return; }
      go(6,{sound:null});
      setTimeout(()=>{ sfx('scan'); go(7,{sound:null}); },650);
      setTimeout(()=>{
        state.points += REWARD;
        state.marks += Math.floor(REWARD/MARK_RATE);
        state.lastCheckpoint=Date.now(); save();
        sfx('reward'); speak('Barameel Run. Reward collected.');
      },1200);
    },200);
  }
  demoScan.onclick=()=>handleScan();
  closeCamera.onclick=closeScanner;

  function screenClick(e){
    const r=stage.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
    const n=state.screen;
    // Invisible interaction zones aligned to the artwork buttons.
    if(n===1){
      if(y>.78){ startAmbient(); speak('Barameel Run'); go(2,{sound:'click'}); return; }
    }
    if(n===2){
      if(y>.78){ openCharacterPicker(); return; }
      if(y<.72 && x>.08 && x<.92){ openCharacterPicker(); return; }
    }
    if(n===3){ if(y>.78){go(4,{sound:'click'}); return;} }
    if(n===4){
      if(y>.45 && y<.68){ openScanner(); return; }
      if(y>.68 && x<.38){ go(9); return; }
      if(y>.68 && x>.38 && x<.70){ go(12); return; }
    }
    if(n===5){ openScanner(); return; }
    if(n===6){ if(y>.78){go(7,{sound:'click'});return;} }
    if(n===7){ if(y>.72){go(8,{sound:'click'});return;} }
    if(n===8){ if(y>.68 && x<.82){ window.open('https://www.google.com/maps/dir/?api=1&destination=BARAMEEL%20Alexandria%20Egypt&travelmode=walking','_blank'); sfx('click'); return;} if(y>.55){go(9,{sound:'click'});return;} }
    if(n===9){ if(y>.72){ state.marks=Math.floor(state.points/MARK_RATE); save(); go(10,{sound:'click'}); return;} }
    if(n===10){ if(y>.72){go(4,{sound:'reward'}); return;} }
    if(n===11){ if(y>.76){go(4,{sound:'click'}); return;} }
    if(n===12){ if(y>.80){go(1,{sound:'click'}); return;} }
  }
  tap.addEventListener('click',screenClick);

  // Keyboard navigation for desktop testing.
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeScanner();characterModal.classList.add('hidden');return;}
    if(e.key==='ArrowRight') go(Math.min(12,state.screen+1));
    if(e.key==='ArrowLeft') go(Math.max(1,state.screen-1));
    if(e.key.toLowerCase()==='s' && state.screen===5) handleScan();
  });

  // Resume on the saved screen, but keep first launch clean.
  if(state.screen<1 || state.screen>12) state.screen=1;
  art.src=screens[state.screen-1];
  updateOverlay();
  // Tap anywhere once to unlock game audio on browsers that require a gesture.
  const unlock=()=>{startAmbient();document.removeEventListener('pointerdown',unlock);};
  document.addEventListener('pointerdown',unlock,{once:true});
})();
