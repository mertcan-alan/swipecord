# Privacy Policy for Swipecord

**Effective Date:** 2026-05-27

Swipecord is an open-source, local desktop application designed to help users manage their Discord server list. This Privacy Policy outlines how your data is handled.

## 1. Local Application
Swipecord operates entirely on your local machine. We do not operate any backend servers, nor do we collect, process, or transmit your personal data to any third-party services (excluding Discord's official APIs).

## 2. Discord Token Handling
To function, Swipecord requires your personal Discord Authorization Token.
- **No Remote Storage:** Your token is never stored on a remote server.
- **No Local Persistence:** Your token is never saved to your hard drive, local storage, or any file. It is held strictly in system memory (RAM) only while the application is running.
- **Direct Communication:** Your token is used exclusively to make direct HTTPS requests to Discord's official API endpoints (`discord.com/api`).
- **Data Deletion:** The moment you close Swipecord or click the "Logout" button, your token is completely wiped from memory.

## 3. Data Collection
We collect **zero** telemetry, analytics, or crash reports. Your usage of the app is completely private.

## 4. Security
We take security seriously. The application runs with strict Electron security configurations:
- `nodeIntegration` is disabled in the renderer process.
- `contextIsolation` is enabled to prevent malicious script injection.
- A strict Content Security Policy (CSP) is enforced, allowing connections only to Discord's official domains.

## 5. User Responsibility
By using Swipecord, you acknowledge that you are responsible for keeping your Discord token secure. Never share your token with anyone or paste it into untrusted applications. Using self-botting tools is technically against Discord's Terms of Service; Swipecord is provided "as is," and we are not responsible for any actions taken against your account.

---

# Swipecord Gizlilik Politikası

**Yürürlük Tarihi:** 27.05.2026

Swipecord, kullanıcıların Discord sunucu listelerini yönetmelerine yardımcı olan açık kaynaklı, yerel bir masaüstü uygulamasıdır. Bu Gizlilik Politikası, verilerinizin nasıl işlendiğini özetler.

## 1. Yerel Uygulama
Swipecord tamamen yerel bilgisayarınızda çalışır. Herhangi bir arka uç (backend) sunucumuz yoktur ve kişisel verilerinizi toplamaz, işlemez veya üçüncü taraf hizmetlere iletmeyiz (Discord'un resmi API'leri hariç).

## 2. Discord Token Kullanımı
Swipecord'un çalışabilmesi için kişisel Discord Yetkilendirme Token'ınıza ihtiyacı vardır.
- **Uzaktan Depolama Yoktur:** Token'ınız asla uzak bir sunucuya gönderilmez.
- **Yerel Kalıcılık Yoktur:** Token'ınız sabit diskinize, yerel depolamanıza (local storage) veya herhangi bir dosyaya kaydedilmez. Sadece uygulama çalışırken sistem belleğinde (RAM) tutulur.
- **Doğrudan İletişim:** Token'ınız yalnızca Discord'un resmi API uç noktalarına (`discord.com/api`) doğrudan HTTPS istekleri yapmak için kullanılır.
- **Veri Silinmesi:** Swipecord'u kapattığınızda veya "Çıkış Yap" butonuna tıkladığınızda, token'ınız bellekten tamamen silinir.

## 3. Veri Toplama
Uygulama üzerinden **hiçbir** telemetri, analiz veya çökme raporu toplamıyoruz. Uygulamayı kullanımınız tamamen gizlidir.

## 4. Güvenlik
Güvenliği ciddiye alıyoruz. Uygulama, sıkı Electron güvenlik yapılandırmalarıyla çalışır:
- Renderer sürecinde `nodeIntegration` devre dışı bırakılmıştır.
- Kötü niyetli komut dosyası enjeksiyonunu önlemek için `contextIsolation` etkinleştirilmiştir.
- Sadece Discord'un resmi alan adlarına bağlantı kurulmasına izin veren katı bir İçerik Güvenliği Politikası (CSP) uygulanmaktadır.

## 5. Kullanıcı Sorumluluğu
Swipecord'u kullanarak, Discord token'ınızı güvende tutmaktan sorumlu olduğunuzu kabul edersiniz. Token'ınızı asla kimseyle paylaşmayın veya güvenilmeyen uygulamalara yapıştırmayın. Kendi hesabınızla bot işlemleri (self-botting) yapmak teknik olarak Discord'un Hizmet Şartlarına aykırıdır; Swipecord "olduğu gibi" sağlanır ve hesabınıza karşı alınabilecek herhangi bir işlemden sorumlu değiliz.
