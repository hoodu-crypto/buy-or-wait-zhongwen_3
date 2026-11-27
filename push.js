(() => {
  const key = "BJMBnd05BYw_MqZK49AubyQHWfm1mgUpA0Bd3RgVi1Z9WRp2dUts7h8KUgPU64tIaKEW7XCbhtsit1EeuvPXOd8";
  const copy = {
    ko: ["알림 설정","아이폰은 Safari에서 홈 화면에 추가한 뒤 그 아이콘으로 열어 주세요.","로그인 후 다시 시도해 주세요.","알림 권한을 허용해 주세요.","이 기기에서 알림을 받을 수 있어요."],
    zh: ["通知设置","iPhone 请先在 Safari 添加到主屏幕，再从图标打开。","请先登录。","请允许系统通知。","这台设备已开启通知。"],
    en: ["Notifications","On iPhone, add to Home Screen in Safari and open that icon.","Sign in first.","Allow notifications on this device.","Notifications enabled on this device."]
  };
  const button = document.getElementById("bowPush");
  const labels = () => copy[currentLang] || copy.ko;
  const refresh = () => { button.textContent = labels()[0]; };
  refresh();
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
  button.onclick = async () => {
    const msg = labels();
    if (!currentUser) return notify(msg[2]);
    if (!("serviceWorker" in navigator && "PushManager" in window && "Notification" in window)) return notify(msg[1]);
    button.disabled = true;
    try {
      if (await Notification.requestPermission() !== "granted") return notify(msg[3]);
      await navigator.serviceWorker.register("./sw.js");
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (sub && localStorage.getItem("bowPushOwner") !== currentUser.id) {
        await sub.unsubscribe();
        sub = null;
      }
      sub ||= await reg.pushManager.subscribe({userVisibleOnly:true, applicationServerKey:key});
      const {endpoint,keys} = sub.toJSON();
      const {error} = await supabaseClient.from("bow_push_devices").upsert({
        endpoint,keys,user_id:currentUser.id,lang:currentLang
      },{onConflict:"endpoint"});
      if (error) throw error;
      localStorage.setItem("bowPushOwner",currentUser.id);
      notify(msg[4]);
    } catch (err) { notify(msg[0]+" · "+err.message); }
    finally { button.disabled = false; }
  };
  document.getElementById("bowLogout").addEventListener("click",async () => {
    if (!("serviceWorker" in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration("./");
    const sub = await reg?.pushManager?.getSubscription();
    if (sub) await sub.unsubscribe();
    localStorage.removeItem("bowPushOwner");
  },true);
})();
