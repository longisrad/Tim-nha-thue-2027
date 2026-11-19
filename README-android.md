# Tìm nhà thuê – bản app Android (Capacitor)

Dữ liệu (link Web app, mã truy cập, cache) nằm trong vùng lưu trữ riêng của app, không dùng chung với Chrome.
Gỡ app mới mất cache; dữ liệu thật vẫn ở Google Sheet / Drive.

## Cách 1: build bằng GitHub (không cần cài gì trên máy)
1. Chép vào GỐC repo `Tim-nha-thue-2027` (cạnh `index.html`): `package.json`, `capacitor.config.json`, `.gitignore`, thư mục `.github/` và thư mục `assets/` (icon + splash neon).
2. Đẩy lên GitHub. Vào tab **Actions** -> **Build Android APK** -> **Run workflow**.
3. Chờ khoảng 5–8 phút, mở lần chạy đó, tải **tim-nha-thue-apk** ở mục Artifacts, giải nén ra `app-debug.apk`.
4. Chép APK vào điện thoại, mở file để cài (cho phép "cài ứng dụng không rõ nguồn gốc" nếu máy hỏi).

## Để cập nhật cài đè được (nên làm một lần)
Mỗi lần build, GitHub tạo một khóa ký debug mới, nên APK mới không cài đè được lên bản cũ (phải gỡ rồi cài lại, mất cache trong app, không mất dữ liệu thật). Cách khắc phục: dùng một khóa cố định.
1. Trên máy có Java, chạy:
   `keytool -genkey -v -keystore debug.keystore -storepass android -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Android Debug,O=Android,C=US"`
2. Mã hóa file: `base64 -w0 debug.keystore` (macOS: `base64 -i debug.keystore`).
3. Trong repo GitHub: Settings -> Secrets and variables -> Actions -> New repository secret, tên `DEBUG_KEYSTORE_B64`, dán chuỗi vừa tạo.
4. Từ đó mọi APK build ra đều cùng chữ ký, cài đè được và giữ nguyên dữ liệu trong app. Đừng đưa file `debug.keystore` lên repo.

## Cách 2: build trên máy
```
npm install
npm run prepare-www
npx cap add android
npx cap sync android
npx cap open android      # mở Android Studio, bấm Run hoặc Build > Build APK
```

## Đã tối ưu cho Android
- **Tải file sao lưu:** nút "Tải file về máy" mở hộp chia sẻ của Android để chọn nơi lưu (Drive, Tệp...).
- **Nút Back:** đóng ảnh phóng to / hộp thoại trên cùng, rồi thoát checklist, về tab Danh sách, cuối cùng mới thoát app.
- **Service worker:** không đăng ký trong app (file web đã nằm sẵn trong APK).
- **Icon + splash neon:** `assets/` được `capacitor-assets` biến thành icon launcher (có cả bản adaptive) và màn hình chờ.
- **Thanh trạng thái:** đổi màu theo giao diện sáng / tối.
- Mục "Lưu thêm vào thư mục trên máy" tự ẩn trong app vì WebView không hỗ trợ.

## Ghi chú
- Link Web app: dán vào `API_URL` trong `index.html` để khỏi phải nhập trong app. Mã truy cập thì nhập một lần trong app (đừng dán vào code công khai).
- iPhone: cần Mac + tài khoản Apple Developer, nên bản này chỉ làm cho Android.
